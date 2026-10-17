/**
 * MarkupText — a tiny, safe inline-markup parser.
 *
 * Two modes share one scanner:
 *
 * - `markup` (default) — authored copy such as instructions:
 *   `**bold**` runs, `{token}` placeholders, inline `` `code` `` and `\` escapes.
 * - `message` — user-authored chat text: `**bold**`, inline `` `code` ``,
 *   auto-linked `http(s)://`, `www.` and `mailto:` URLs, and mention chips
 *   taken from **structured ranges** (never a regex over display text). Braces
 *   are literal in this mode, so a user typing `{foo}` is just text.
 *
 * The parser returns flat, typed segments; adapters turn them into nodes. It
 * never produces HTML strings, so no adapter needs `dangerouslySetInnerHTML`.
 * It is pure and deterministic: no clocks, no randomness, no globals besides
 * the standard `URL` parser.
 */

/** Which inline syntax the parser recognises. */
export type MarkupTextMode = 'markup' | 'message'

/**
 * A mention placed in the text by UTF-16 offsets (`start` inclusive, `end`
 * exclusive) — the same shape the composer's resolved tokens use, so they can
 * be passed straight through.
 */
export interface MarkupTextMention {
  /** Stable id of the mentioned entity (user, channel, …). */
  id: string
  /** UTF-16 offset of the first character of the mention in `text`. */
  start: number
  /** UTF-16 offset just past the last character of the mention in `text`. */
  end: number
  /** Optional entity kind (e.g. `'user'`, `'channel'`) for styling hooks. */
  type?: string
}

/** What kind of destination an auto-linked URL points at. */
export type MarkupTextLinkKind = 'web' | 'email'

interface SegmentBase {
  /** True when the segment sits inside a `**bold**` run. */
  strong: boolean
}

/** Plain text (markup characters already resolved). */
export interface MarkupTextTextSegment extends SegmentBase {
  type: 'text'
  text: string
}

/** A `{name}` placeholder to be replaced by an adapter-supplied node. */
export interface MarkupTextTokenSegment extends SegmentBase {
  type: 'token'
  name: string
}

/** An inline `` `code` `` span; its content is literal. */
export interface MarkupTextCodeSegment extends SegmentBase {
  type: 'code'
  text: string
}

/** An auto-linked URL. `href` is the normalised, scheme-checked target. */
export interface MarkupTextLinkSegment extends SegmentBase {
  type: 'link'
  /** The URL exactly as written in the source text. */
  text: string
  /** Normalised, safe href (`http:`, `https:` or `mailto:` only). */
  href: string
  kind: MarkupTextLinkKind
}

/** A mention chip covering `mention.start..mention.end` of the source. */
export interface MarkupTextMentionSegment extends SegmentBase {
  type: 'mention'
  /** The source text the range covers (rendered verbatim, markup inert). */
  text: string
  mention: MarkupTextMention
}

export type MarkupTextSegment =
  | MarkupTextTextSegment
  | MarkupTextTokenSegment
  | MarkupTextCodeSegment
  | MarkupTextLinkSegment
  | MarkupTextMentionSegment

/** Consecutive segments sharing the same `strong` flag. */
export interface MarkupTextRun {
  strong: boolean
  segments: MarkupTextSegment[]
}

export interface ParseMarkupTextOptions {
  /** Syntax to recognise. Defaults to `'markup'`. */
  mode?: MarkupTextMode
  /** Mention ranges into the text. Only used in `message` mode. */
  mentions?: readonly MarkupTextMention[]
}

/** `rel` every auto-linked URL must carry. */
export const MARKUP_TEXT_LINK_REL = 'noopener noreferrer nofollow'

/** Protocols an auto-linked URL may resolve to; anything else stays text. */
export const MARKUP_TEXT_SAFE_PROTOCOLS: readonly string[] = ['http:', 'https:', 'mailto:']

const BOLD_MARKER = '**'
const ESCAPE_CHAR = '\\'
const CODE_FENCE = '`'
const TOKEN_OPEN = '{'
const TOKEN_CLOSE = '}'

/** Characters a backslash makes literal, per mode. Message text is
 * user-authored, so only the characters that would otherwise turn into markup
 * are escapable — `C:\\path` must survive untouched. */
const ESCAPABLE: Record<MarkupTextMode, ReadonlySet<string>> = {
  markup: new Set([ESCAPE_CHAR, '*', CODE_FENCE, TOKEN_OPEN, TOKEN_CLOSE]),
  message: new Set(['*', CODE_FENCE]),
}

/** A token name: letters, digits, `_`, `.` or `-` (any script). */
const TOKEN_NAME = /^[\p{L}\p{N}_.-]+$/u

/** Prefixes that start an auto-link, matched case-insensitively. */
const URL_START = /^(?:https?:\/\/|mailto:|www\.)/i
const WWW_PREFIX = /^www\./i
const IMPLICIT_WEB_SCHEME = 'https://'
const MAILTO_PROTOCOL = 'mailto:'

/** Characters that always end a URL candidate. */
const URL_TERMINATOR = /[\s<>"`]/u
/** Trailing punctuation that belongs to the sentence, not the URL. */
const URL_TRAILING_PUNCTUATION = new Set(['.', ',', ':', ';', '!', '?', "'", '"', '*', '_'])
/** Closing brackets trimmed only when unbalanced inside the URL. */
const URL_BRACKET_PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

/** A letter or digit directly before a URL means it is mid-word (`foohttp://`). */
const WORD_CHAR = /[\p{L}\p{N}]/u

const HIGH_SURROGATE_MIN = 0xd800
const HIGH_SURROGATE_MAX = 0xdbff
const LOW_SURROGATE_MIN = 0xdc00
const LOW_SURROGATE_MAX = 0xdfff

// ---------------------------------------------------------------------------
// URL safety
// ---------------------------------------------------------------------------

/**
 * Return a normalised href when `raw` is an absolute `http(s):` URL with a host
 * or a `mailto:` URL with an address; otherwise `null`. Rejects every other
 * scheme (`javascript:`, `data:`, `vbscript:`, `file:`, …), relative and
 * protocol-relative URLs, and anything containing whitespace or control
 * characters (which browsers strip, enabling `java\nscript:` tricks).
 */
export function sanitizeMarkupTextHref(raw: string): string | null {
  if (raw.length === 0 || hasWhitespaceOrControl(raw)) return null

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }

  if (!MARKUP_TEXT_SAFE_PROTOCOLS.includes(url.protocol)) return null
  if (url.protocol === MAILTO_PROTOCOL) {
    return url.pathname.length > 0 ? url.href : null
  }
  return url.hostname.length > 0 ? url.href : null
}

function hasWhitespaceOrControl(value: string): boolean {
  // eslint-disable-next-line no-control-regex -- detecting control chars is the point
  return /[\s\u0000-\u001f\u007f]/u.test(value)
}

// ---------------------------------------------------------------------------
// Mentions
// ---------------------------------------------------------------------------

function isHighSurrogate(code: number): boolean {
  return code >= HIGH_SURROGATE_MIN && code <= HIGH_SURROGATE_MAX
}

function isLowSurrogate(code: number): boolean {
  return code >= LOW_SURROGATE_MIN && code <= LOW_SURROGATE_MAX
}

/** True when `offset` falls between the two halves of a surrogate pair. */
function splitsSurrogatePair(text: string, offset: number): boolean {
  if (offset <= 0 || offset >= text.length) return false
  return isHighSurrogate(text.charCodeAt(offset - 1)) && isLowSurrogate(text.charCodeAt(offset))
}

function isValidRange(text: string, mention: MarkupTextMention): boolean {
  const { start, end } = mention
  if (!Number.isInteger(start) || !Number.isInteger(end)) return false
  if (start < 0 || end > text.length || start >= end) return false
  return !splitsSurrogatePair(text, start) && !splitsSurrogatePair(text, end)
}

/**
 * Validate and order mention ranges against `text`.
 *
 * Drops ranges that are non-integer, empty, out of bounds or that split a
 * surrogate pair (half an emoji). Overlaps resolve deterministically: ranges
 * are ordered by `start` (longer first on a tie) and any range overlapping an
 * already-accepted one is dropped. The input is never mutated.
 */
export function normalizeMarkupTextMentions(
  text: string,
  mentions: readonly MarkupTextMention[] = [],
): MarkupTextMention[] {
  const ordered = mentions
    .filter((mention) => isValidRange(text, mention))
    .sort((a, b) => a.start - b.start || b.end - a.end)

  const accepted: MarkupTextMention[] = []
  let cursor = 0
  for (const mention of ordered) {
    if (mention.start < cursor) continue
    accepted.push(mention)
    cursor = mention.end
  }
  return accepted
}

// ---------------------------------------------------------------------------
// Scanner: text → atoms (bold markers still unpaired)
// ---------------------------------------------------------------------------

type Atom =
  | { kind: 'text'; text: string }
  | { kind: 'marker' }
  | { kind: 'token'; name: string }
  | { kind: 'code'; text: string }
  | { kind: 'link'; text: string; href: string; linkKind: MarkupTextLinkKind }
  | { kind: 'mention'; text: string; mention: MarkupTextMention }

/** One recognised construct at a position, and how many chars it consumed. */
interface Match {
  atom: Atom
  length: number
}

function matchEscape(chunk: string, i: number, mode: MarkupTextMode): Match | null {
  if (chunk[i] !== ESCAPE_CHAR) return null
  const next = chunk[i + 1]
  if (next === undefined || !ESCAPABLE[mode].has(next)) return null
  return { atom: { kind: 'text', text: next }, length: 2 }
}

function matchCode(chunk: string, i: number): Match | null {
  if (chunk[i] !== CODE_FENCE) return null
  const close = chunk.indexOf(CODE_FENCE, i + 1)
  // An unterminated or empty fence is literal text.
  if (close <= i + 1) return null
  return { atom: { kind: 'code', text: chunk.slice(i + 1, close) }, length: close - i + 1 }
}

function matchToken(chunk: string, i: number): Match | null {
  if (chunk[i] !== TOKEN_OPEN) return null
  const close = chunk.indexOf(TOKEN_CLOSE, i + 1)
  if (close === -1) return null
  const name = chunk.slice(i + 1, close).trim()
  if (!TOKEN_NAME.test(name)) return null
  return { atom: { kind: 'token', name }, length: close - i + 1 }
}

function matchMarker(chunk: string, i: number): Match | null {
  if (!chunk.startsWith(BOLD_MARKER, i)) return null
  return { atom: { kind: 'marker' }, length: BOLD_MARKER.length }
}

function countChar(value: string, char: string): number {
  let count = 0
  for (const c of value) if (c === char) count += 1
  return count
}

/** Strip sentence punctuation and unbalanced closing brackets off the end. */
function trimUrlCandidate(candidate: string): string {
  let url = candidate
  for (;;) {
    const last = url[url.length - 1]
    if (last === undefined) return url
    if (URL_TRAILING_PUNCTUATION.has(last)) {
      url = url.slice(0, -1)
      continue
    }
    const open = URL_BRACKET_PAIRS[last]
    if (open !== undefined && countChar(url, last) > countChar(url, open)) {
      url = url.slice(0, -1)
      continue
    }
    return url
  }
}

function urlCandidateEnd(chunk: string, i: number): number {
  let end = i
  while (end < chunk.length && !URL_TERMINATOR.test(chunk[end] as string)) end += 1
  return end
}

function matchUrl(chunk: string, i: number): Match | null {
  const rest = chunk.slice(i)
  const prefix = URL_START.exec(rest)
  if (!prefix) return null
  const previous = chunk[i - 1]
  if (previous !== undefined && WORD_CHAR.test(previous)) return null

  const text = trimUrlCandidate(chunk.slice(i, urlCandidateEnd(chunk, i)))
  if (text.length <= prefix[0].length) return null

  const raw = WWW_PREFIX.test(text) ? `${IMPLICIT_WEB_SCHEME}${text}` : text
  const href = sanitizeMarkupTextHref(raw)
  if (href === null) return null

  const linkKind: MarkupTextLinkKind = href.startsWith(MAILTO_PROTOCOL) ? 'email' : 'web'
  return { atom: { kind: 'link', text, href, linkKind }, length: text.length }
}

/** Try each construct in priority order at position `i`. */
function matchAt(chunk: string, i: number, mode: MarkupTextMode): Match | null {
  return (
    matchEscape(chunk, i, mode) ??
    matchCode(chunk, i) ??
    (mode === 'message' ? matchUrl(chunk, i) : matchToken(chunk, i)) ??
    matchMarker(chunk, i)
  )
}

function pushText(atoms: Atom[], text: string): void {
  const last = atoms[atoms.length - 1]
  if (last?.kind === 'text') {
    last.text += text
    return
  }
  atoms.push({ kind: 'text', text })
}

/** Scan a mention-free chunk of source into atoms. */
function scanChunk(chunk: string, mode: MarkupTextMode, atoms: Atom[]): void {
  let i = 0
  while (i < chunk.length) {
    const match = matchAt(chunk, i, mode)
    if (match) {
      if (match.atom.kind === 'text') pushText(atoms, match.atom.text)
      else atoms.push(match.atom)
      i += match.length
      continue
    }
    pushText(atoms, chunk[i] as string)
    i += 1
  }
}

/** Mentions are atomic: they split the source first, so markup inside a
 * mention range is inert and a construct can never straddle a mention. */
function scan(text: string, mode: MarkupTextMode, mentions: MarkupTextMention[]): Atom[] {
  const atoms: Atom[] = []
  let cursor = 0
  for (const mention of mentions) {
    scanChunk(text.slice(cursor, mention.start), mode, atoms)
    atoms.push({ kind: 'mention', text: text.slice(mention.start, mention.end), mention })
    cursor = mention.end
  }
  scanChunk(text.slice(cursor), mode, atoms)
  return atoms
}

// ---------------------------------------------------------------------------
// Bold pairing: atoms → segments
// ---------------------------------------------------------------------------

/**
 * Pair `**` markers left to right. Bold does not nest: the n-th marker closes
 * the (n-1)-th. A pair with nothing between it (`****`) and a trailing
 * unmatched marker are literal text, so an unterminated `**` is shown as typed
 * rather than swallowing the rest of the line.
 */
function literalMarkerIndexes(atoms: Atom[]): Set<number> {
  const markers: number[] = []
  atoms.forEach((atom, index) => {
    if (atom.kind === 'marker') markers.push(index)
  })

  const literal = new Set<number>()
  for (let p = 0; p + 1 < markers.length; p += 2) {
    const open = markers[p] as number
    const close = markers[p + 1] as number
    if (close === open + 1) {
      literal.add(open)
      literal.add(close)
    }
  }
  if (markers.length % 2 === 1) literal.add(markers[markers.length - 1] as number)
  return literal
}

function toSegment(atom: Exclude<Atom, { kind: 'marker' }>, strong: boolean): MarkupTextSegment {
  switch (atom.kind) {
    case 'text':
      return { type: 'text', text: atom.text, strong }
    case 'token':
      return { type: 'token', name: atom.name, strong }
    case 'code':
      return { type: 'code', text: atom.text, strong }
    case 'link':
      return { type: 'link', text: atom.text, href: atom.href, kind: atom.linkKind, strong }
    case 'mention':
      return { type: 'mention', text: atom.text, mention: atom.mention, strong }
  }
}

function pushSegment(segments: MarkupTextSegment[], segment: MarkupTextSegment): void {
  const last = segments[segments.length - 1]
  if (segment.type === 'text' && last?.type === 'text' && last.strong === segment.strong) {
    last.text += segment.text
    return
  }
  segments.push(segment)
}

function pairBold(atoms: Atom[]): MarkupTextSegment[] {
  const literal = literalMarkerIndexes(atoms)
  const segments: MarkupTextSegment[] = []
  let strong = false

  atoms.forEach((atom, index) => {
    if (atom.kind !== 'marker') {
      pushSegment(segments, toSegment(atom, strong))
      return
    }
    if (literal.has(index)) {
      pushSegment(segments, { type: 'text', text: BOLD_MARKER, strong })
      return
    }
    strong = !strong
  })
  return segments
}

// ---------------------------------------------------------------------------
// Public parser API
// ---------------------------------------------------------------------------

/**
 * Parse `text` into typed segments. Adjacent text with the same weight is
 * merged, so the output is minimal and stable for a given input.
 *
 * `mentions` are honoured only in `message` mode; they are validated with
 * {@link normalizeMarkupTextMentions} first.
 */
export function parseMarkupText(
  text: string,
  options: ParseMarkupTextOptions = {},
): MarkupTextSegment[] {
  const mode = options.mode ?? 'markup'
  const mentions = mode === 'message' ? normalizeMarkupTextMentions(text, options.mentions) : []
  return pairBold(scan(text, mode, mentions))
}

/** Group consecutive segments with the same `strong` flag into runs, so an
 * adapter renders one `<strong>` per bold run instead of one per segment. */
export function groupMarkupTextRuns(segments: readonly MarkupTextSegment[]): MarkupTextRun[] {
  const runs: MarkupTextRun[] = []
  for (const segment of segments) {
    const last = runs[runs.length - 1]
    if (last && last.strong === segment.strong) {
      last.segments.push(segment)
      continue
    }
    runs.push({ strong: segment.strong, segments: [segment] })
  }
  return runs
}

/**
 * Names of `{token}` segments that `hasNode` cannot satisfy, de-duplicated in
 * first-seen order. Adapters report these as development errors and render
 * nothing in their place — a placeholder is never shown raw.
 */
export function findMissingMarkupTextTokens(
  segments: readonly MarkupTextSegment[],
  hasNode: (name: string) => boolean,
): string[] {
  const missing: string[] = []
  for (const segment of segments) {
    if (segment.type !== 'token') continue
    if (hasNode(segment.name) || missing.includes(segment.name)) continue
    missing.push(segment.name)
  }
  return missing
}

/** Framework-agnostic attributes for the root element. */
export interface MarkupTextAPI {
  dataAttributes: Record<string, string>
}

/** Build the root data attributes (`data-slot`, `data-mode`). */
export function createMarkupText(options: { mode?: MarkupTextMode } = {}): MarkupTextAPI {
  return {
    dataAttributes: {
      'data-slot': 'markup-text',
      'data-mode': options.mode ?? 'markup',
    },
  }
}
