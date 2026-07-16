/**
 * Emoji data — the single source of truth for the whole library.
 *
 * The full base emoji set (Unicode 16.0, ~1900 emoji) is generated offline into
 * `emoji-dataset.generated.ts` from the canonical `scripts/emoji/emoji-test-16.0.txt`
 * (regenerate with `node scripts/generate-emoji-data.mjs`). This module decodes
 * that compact data and layers on curated `:shortcode:` aliases, search, and
 * resolution helpers. It is consumed by:
 *   - the emoji picker (grid + category tabs + search + recents),
 *   - the composer's `:` shortcode trigger (`createEmojiTrigger`),
 *   - rich-editor's `EMOJI_MAP` (`:shortcode:` → glyph).
 * so the three no longer diverge.
 */
import {
  CATEGORY_ORDER,
  EMOJI_TUPLES,
  EMOJI_COUNT,
} from './emoji-dataset.generated.js'

export type EmojiCategory =
  | 'smileys'
  | 'people'
  | 'nature'
  | 'food'
  | 'travel'
  | 'activities'
  | 'objects'
  | 'symbols'
  | 'flags'

export interface EmojiEntry {
  /** The rendered glyph (native codepoints). */
  emoji: string
  /** CLDR short name, e.g. "face with tears of joy". */
  name: string
  category: EmojiCategory
  /** Search keywords (does not include the name words verbatim-repeated). */
  keywords: string[]
  /** Canonical `snake_case` shortcode body (no surrounding colons). */
  shortcode: string
}

/** Total number of base emoji shipped. */
export const EMOJI_COUNT_TOTAL = EMOJI_COUNT

// ---------------------------------------------------------------------------
// Decode the generated dataset once.
// ---------------------------------------------------------------------------

const ALL_EMOJIS: EmojiEntry[] = EMOJI_TUPLES.map((t) => ({
  emoji: t[0],
  name: t[1],
  category: CATEGORY_ORDER[t[2]] as EmojiCategory,
  shortcode: t[3],
  keywords: t[4] ? t[4].split(' ') : [],
}))

/** All categories in display order. */
export const EMOJI_CATEGORIES: EmojiCategory[] = [...CATEGORY_ORDER]

/** Category display labels. */
export const CATEGORY_LABELS: Record<EmojiCategory, string> = {
  smileys: 'Smileys & Emotion',
  people: 'People & Body',
  nature: 'Animals & Nature',
  food: 'Food & Drink',
  travel: 'Travel & Places',
  activities: 'Activities',
  objects: 'Objects',
  symbols: 'Symbols',
  flags: 'Flags',
}

/** Emojis grouped by category (display order preserved within each group). */
export const EMOJI_DATA: Record<EmojiCategory, EmojiEntry[]> = EMOJI_CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat] = ALL_EMOJIS.filter((e) => e.category === cat)
    return acc
  },
  {} as Record<EmojiCategory, EmojiEntry[]>,
)

/** Get all emojis as a flat array (display order). */
export function getAllEmojis(): EmojiEntry[] {
  return ALL_EMOJIS
}

// ---------------------------------------------------------------------------
// Shortcodes: derived (from names) + curated popular aliases.
// ---------------------------------------------------------------------------

/**
 * Curated popular aliases (`:body:` → glyph) that don't match the derived
 * snake_case name — the short forms people actually type (`:joy:`, `:100:`,
 * `:thumbsup:`). These take precedence over derived shortcodes on lookup.
 * This is the ONE place aliases live (rich-editor consumes it, no duplication).
 */
export const SHORTCODE_ALIASES: Record<string, string> = {
  smile: '\u{1F604}',
  laugh: '\u{1F602}',
  joy: '\u{1F602}',
  grin: '\u{1F601}',
  wink: '\u{1F609}',
  blush: '\u{1F60A}',
  heart_eyes: '\u{1F60D}',
  kissing: '\u{1F617}',
  thinking: '\u{1F914}',
  neutral: '\u{1F610}',
  expressionless: '\u{1F611}',
  unamused: '\u{1F612}',
  sweat: '\u{1F613}',
  pensive: '\u{1F614}',
  confused: '\u{1F615}',
  disappointed: '\u{1F61E}',
  worried: '\u{1F61F}',
  angry: '\u{1F620}',
  rage: '\u{1F621}',
  cry: '\u{1F622}',
  sob: '\u{1F62D}',
  scream: '\u{1F631}',
  fearful: '\u{1F628}',
  cold_sweat: '\u{1F630}',
  relieved: '\u{1F60C}',
  sleepy: '\u{1F62A}',
  sleeping: '\u{1F634}',
  mask: '\u{1F637}',
  sunglasses: '\u{1F60E}',
  nerd: '\u{1F913}',
  heart: '\u{2764}\u{FE0F}',
  broken_heart: '\u{1F494}',
  sparkling_heart: '\u{1F496}',
  two_hearts: '\u{1F495}',
  fire: '\u{1F525}',
  '100': '\u{1F4AF}',
  star: '\u{2B50}',
  star2: '\u{1F31F}',
  sparkles: '\u{2728}',
  thumbsup: '\u{1F44D}',
  thumbsdown: '\u{1F44E}',
  wave: '\u{1F44B}',
  clap: '\u{1F44F}',
  raised_hands: '\u{1F64C}',
  pray: '\u{1F64F}',
  muscle: '\u{1F4AA}',
  point_up: '\u{261D}\u{FE0F}',
  point_down: '\u{1F447}',
  point_left: '\u{1F448}',
  point_right: '\u{1F449}',
  ok_hand: '\u{1F44C}',
  v: '\u{270C}\u{FE0F}',
  eyes: '\u{1F440}',
  tongue: '\u{1F445}',
  lips: '\u{1F444}',
  rocket: '\u{1F680}',
  tada: '\u{1F389}',
  confetti: '\u{1F38A}',
  balloon: '\u{1F388}',
  gift: '\u{1F381}',
  trophy: '\u{1F3C6}',
  medal: '\u{1F3C5}',
  crown: '\u{1F451}',
  gem: '\u{1F48E}',
  bell: '\u{1F514}',
  check: '\u{2705}',
  x: '\u{274C}',
  warning: '\u{26A0}\u{FE0F}',
  no_entry: '\u{26D4}',
  question: '\u{2753}',
  exclamation: '\u{2757}',
  bulb: '\u{1F4A1}',
  book: '\u{1F4D6}',
  memo: '\u{1F4DD}',
  pencil: '\u{270F}\u{FE0F}',
  calendar: '\u{1F4C5}',
  clock: '\u{1F550}',
  hourglass: '\u{231B}',
  lock: '\u{1F512}',
  key: '\u{1F511}',
  hammer: '\u{1F528}',
  wrench: '\u{1F527}',
  link: '\u{1F517}',
  paperclip: '\u{1F4CE}',
  scissors: '\u{2702}\u{FE0F}',
  package: '\u{1F4E6}',
  email: '\u{1F4E7}',
  phone: '\u{1F4DE}',
  computer: '\u{1F4BB}',
  house: '\u{1F3E0}',
  tree: '\u{1F333}',
  sun: '\u{2600}\u{FE0F}',
  moon: '\u{1F319}',
  cloud: '\u{2601}\u{FE0F}',
  rain: '\u{1F327}\u{FE0F}',
  snow: '\u{2744}\u{FE0F}',
  zap: '\u{26A1}',
  rainbow: '\u{1F308}',
  pizza: '\u{1F355}',
  hamburger: '\u{1F354}',
  coffee: '\u{2615}',
  beer: '\u{1F37A}',
  wine: '\u{1F377}',
  cake: '\u{1F370}',
  dog: '\u{1F436}',
  cat: '\u{1F431}',
  poop: '\u{1F4A9}',
  ghost: '\u{1F47B}',
  skull: '\u{1F480}',
  alien: '\u{1F47D}',
  robot: '\u{1F916}',
  handshake: '\u{1F91D}',
  salute: '\u{1FAE1}',
}

/** shortcode body → EmojiEntry, for the derived (name-based) shortcodes. */
const BY_SHORTCODE = new Map<string, EmojiEntry>()
for (const e of ALL_EMOJIS) BY_SHORTCODE.set(e.shortcode, e)
/** glyph → EmojiEntry (for alias resolution back to a full entry). */
const BY_GLYPH = new Map<string, EmojiEntry>()
for (const e of ALL_EMOJIS) if (!BY_GLYPH.has(e.emoji)) BY_GLYPH.set(e.emoji, e)

/**
 * Resolve a `:shortcode:` (with or without surrounding colons) to its glyph.
 * Aliases win over derived shortcodes. Returns `null` when unknown.
 */
export function resolveShortcode(code: string): string | null {
  const body = code.replace(/^:/, '').replace(/:$/, '').toLowerCase()
  if (body in SHORTCODE_ALIASES) return SHORTCODE_ALIASES[body]
  const entry = BY_SHORTCODE.get(body)
  return entry ? entry.emoji : null
}

/**
 * `:body:` → glyph map covering the full derived set plus curated aliases.
 * This is the shared source rich-editor's `EMOJI_MAP` is built from.
 */
export function buildShortcodeMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const e of ALL_EMOJIS) map[`:${e.shortcode}:`] = e.emoji
  for (const [body, glyph] of Object.entries(SHORTCODE_ALIASES)) map[`:${body}:`] = glyph
  return map
}

/**
 * Fuzzy-search emoji by name, keyword, or shortcode. Prefix matches on the
 * shortcode/name rank first. Used by the picker search and the `:` trigger.
 */
export function searchEmojis(query: string, limit = 50): EmojiEntry[] {
  const q = query.toLowerCase().replace(/^:/, '').replace(/:$/, '').trim()
  if (q === '') return ALL_EMOJIS.slice(0, limit)

  const scored: { entry: EmojiEntry; score: number }[] = []
  for (const entry of ALL_EMOJIS) {
    const sc = entry.shortcode
    const name = entry.name.toLowerCase()
    let score = -1
    if (sc === q) score = 100
    else if (sc.startsWith(q)) score = 80
    else if (name.startsWith(q)) score = 70
    else if (sc.includes(q)) score = 50
    else if (name.includes(q)) score = 40
    else if (entry.keywords.some((k) => k.startsWith(q))) score = 30
    else if (entry.keywords.some((k) => k.includes(q))) score = 15
    if (score >= 0) scored.push({ entry, score })
  }
  // Include alias-only matches (e.g. `joy`) that point at a known glyph.
  for (const [body, glyph] of Object.entries(SHORTCODE_ALIASES)) {
    if (!body.includes(q)) continue
    const entry = BY_GLYPH.get(glyph)
    if (!entry) continue
    if (scored.some((s) => s.entry === entry)) continue
    scored.push({ entry, score: body === q ? 95 : body.startsWith(q) ? 60 : 20 })
  }

  scored.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
  return scored.slice(0, limit).map((s) => s.entry)
}
