#!/usr/bin/env node
/**
 * generate-emoji-data.mjs — builds the single-source-of-truth emoji dataset
 * for `@refraction-ui/emoji-picker` (consumed by the picker AND the composer's
 * `:` shortcode resolver AND rich-editor's EMOJI_MAP).
 *
 * Source of truth: `scripts/emoji/emoji-test-16.0.txt`, the canonical Unicode
 * UTS-#51 emoji-test data, checked into the repo. This script parses it OFFLINE
 * (no network at build or runtime) and emits a compact, tree-shakeable data
 * module: `packages/emoji-picker/src/emoji-dataset.generated.ts`.
 *
 * Base set only: `fully-qualified` status, skin-tone modifier variants dropped,
 * so ~1900 base emoji. Skin tones are a render concern, not separate entries.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, '..')
const SRC = path.join(REPO, 'scripts/emoji/emoji-test-16.0.txt')
const OUT = path.join(REPO, 'packages/emoji-picker/src/emoji-dataset.generated.ts')

/** Unicode group name → our EmojiCategory key + display order. */
const GROUP_TO_CATEGORY = {
  'Smileys & Emotion': 'smileys',
  'People & Body': 'people',
  'Animals & Nature': 'nature',
  'Food & Drink': 'food',
  'Travel & Places': 'travel',
  Activities: 'activities',
  Objects: 'objects',
  Symbols: 'symbols',
  Flags: 'flags',
}
const CATEGORY_ORDER = [
  'smileys',
  'people',
  'nature',
  'food',
  'travel',
  'activities',
  'objects',
  'symbols',
  'flags',
]

const SKIN_TONE = /1F3F[B-F]/i
const STOPWORDS = new Set(['with', 'and', 'the', 'of', 'a', 'in', 'on', 'to'])

/**
 * Common search synonyms keyed by subgroup — the CLDR names alone miss the
 * words people actually type (nobody searches "grinning" for a happy face).
 */
const SUBGROUP_KEYWORDS = {
  'face-smiling': ['happy', 'smile', 'joy'],
  'face-affection': ['love', 'happy', 'smile'],
  'face-tongue': ['silly', 'tongue'],
  'face-hand': ['think'],
  'face-neutral-skeptical': ['meh'],
  'face-sleepy': ['tired'],
  'face-unwell': ['sick'],
  'face-hat': ['party'],
  'face-glasses': ['cool'],
  'face-concerned': ['sad', 'worried', 'upset'],
  'face-negative': ['angry', 'mad', 'sad'],
  'face-costume': ['halloween'],
  'cat-face': ['cat'],
  'monkey-face': ['monkey'],
  emotion: ['love', 'heart'],
  'hand-fingers-open': ['hand'],
  'hand-fingers-partial': ['hand'],
  'hand-single-finger': ['point', 'hand'],
  'hand-fingers-closed': ['fist', 'hand'],
  hands: ['hands'],
  'hand-prop': ['hand'],
  'body-parts': ['body'],
}

function codepointsToEmoji(cps) {
  return cps.map((cp) => String.fromCodePoint(parseInt(cp, 16))).join('')
}

/** name → `snake_case` shortcode body (no colons). */
function toShortcode(name) {
  return name
    .toLowerCase()
    .replace(/[’'"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

function keywordsFor(name, subgroup, shortcode) {
  const tokens = `${name} ${subgroup.replace(/-/g, ' ')}`
    .toLowerCase()
    .replace(/[’'"():,.]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w))
  for (const extra of SUBGROUP_KEYWORDS[subgroup] ?? []) tokens.push(extra)
  const unique = Array.from(new Set(tokens))
  // Guarantee at least one keyword (some 1-glyph names tokenise to nothing).
  if (unique.length === 0) unique.push(shortcode)
  return unique
}

const text = fs.readFileSync(SRC, 'utf8')
const lines = text.split('\n')

let group = null
let subgroup = null
let category = null
const entries = []
const usedShortcodes = new Set()

for (const line of lines) {
  const gm = line.match(/^# group:\s*(.+)$/)
  if (gm) {
    group = gm[1].trim()
    category = GROUP_TO_CATEGORY[group] ?? null
    continue
  }
  const sm = line.match(/^# subgroup:\s*(.+)$/)
  if (sm) {
    subgroup = sm[1].trim()
    continue
  }
  if (!line || line.startsWith('#')) continue
  if (!category) continue // Component group etc.

  // `CP CP ; status  # emoji Ex.y name`
  const m = line.match(/^([0-9A-Fa-f ]+);\s*(\S+)\s*#\s*(\S+)\s+E[\d.]+\s+(.+)$/)
  if (!m) continue
  const [, cpField, status, , name] = m
  if (status !== 'fully-qualified') continue
  if (SKIN_TONE.test(cpField)) continue // drop skin-tone variants — base set only

  const cps = cpField.trim().split(/\s+/)
  const emoji = codepointsToEmoji(cps)

  let shortcode = toShortcode(name)
  if (!shortcode) continue
  // Guarantee uniqueness of the derived shortcode.
  if (usedShortcodes.has(shortcode)) {
    let i = 2
    while (usedShortcodes.has(`${shortcode}_${i}`)) i++
    shortcode = `${shortcode}_${i}`
  }
  usedShortcodes.add(shortcode)

  entries.push({
    emoji,
    name: name.trim(),
    category,
    shortcode,
    keywords: keywordsFor(name, subgroup, shortcode),
  })
}

// Sort by category order (preserving CLDR order within a category).
const orderIndex = (c) => CATEGORY_ORDER.indexOf(c)
entries.sort((a, b) => orderIndex(a.category) - orderIndex(b.category))

// Compact tuple encoding keeps the module small + tree-shakeable:
// [emoji, name, categoryIndex, shortcode, keywords(space-joined)]
const tuples = entries.map((e) => [
  e.emoji,
  e.name,
  orderIndex(e.category),
  e.shortcode,
  e.keywords.join(' '),
])

const perCategory = CATEGORY_ORDER.map(
  (c) => `//   ${c}: ${entries.filter((e) => e.category === c).length}`,
).join('\n')

const banner = `/* eslint-disable */
// @ts-nocheck
/**
 * GENERATED FILE — do not edit by hand.
 * Source: scripts/emoji/emoji-test-16.0.txt (Unicode 16.0, UTS #51).
 * Regenerate: \`node scripts/generate-emoji-data.mjs\`.
 *
 * ${entries.length} base emoji (fully-qualified, skin-tone variants excluded).
 * Per category:
${perCategory}
 *
 * Encoding: EMOJI_TUPLES[i] = [emoji, name, categoryIndex, shortcode, keywords]
 * where categoryIndex indexes CATEGORY_ORDER and keywords is space-joined.
 */
`

const body = `export const CATEGORY_ORDER = ${JSON.stringify(CATEGORY_ORDER)} as const

export type EmojiTuple = readonly [
  emoji: string,
  name: string,
  categoryIndex: number,
  shortcode: string,
  keywords: string,
]

export const EMOJI_TUPLES: readonly EmojiTuple[] = [
${tuples.map((t) => '  ' + JSON.stringify(t)).join(',\n')},
]

export const EMOJI_COUNT = ${entries.length}
`

fs.writeFileSync(OUT, banner + '\n' + body)
console.log(`Wrote ${entries.length} emoji to ${path.relative(REPO, OUT)}`)
for (const c of CATEGORY_ORDER) {
  console.log(`  ${c}: ${entries.filter((e) => e.category === c).length}`)
}
