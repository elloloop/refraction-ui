/**
 * Headless text-highlighting logic: find where a query (or explicit ranges)
 * falls in a string and split the string into plain / highlighted segments.
 *
 * Every offset in this module is a UTF-16 code-unit index into the ORIGINAL
 * text (the same unit as `String.prototype.slice`), end-exclusive. Matching
 * happens on a folded copy of the text (lower-cased, diacritics stripped), and
 * folding changes lengths ("é" → "e" + U+0301 → "e"), so the folded copy keeps
 * a map back to the original code points rather than assuming 1:1 offsets.
 */

/** A half-open `[start, end)` span of UTF-16 code units in the original text. */
export interface HighlightRange {
  start: number
  end: number
}

/** One piece of the text, either plain or highlighted, with its offsets. */
export interface HighlightSegment {
  text: string
  highlighted: boolean
  start: number
  end: number
}

/**
 * A single phrase, or several terms that are each highlighted independently.
 * Pass `splitHighlightQuery(input)` to highlight every word of a search box.
 */
export type HighlightQuery = string | readonly string[]

export interface HighlightMatchOptions {
  /** Match letter case exactly. Default `false`. */
  caseSensitive?: boolean
  /** Treat "e" and "é" as different letters. Default `false`. */
  diacriticSensitive?: boolean
  /**
   * Only match whole tokens: the match may not be preceded or followed by a
   * letter, number, combining mark or connector (`_`). Default `false`.
   */
  wholeWord?: boolean
}

export interface HighlightOptions extends HighlightMatchOptions {
  /** What to search for. Empty or whitespace-only terms are ignored. */
  query?: HighlightQuery
  /**
   * Explicit spans to highlight (e.g. from a fuzzy scorer). Combined with any
   * `query` matches; out-of-bounds values are clamped and empty spans dropped.
   */
  ranges?: readonly HighlightRange[]
}

/** Combining marks: what diacritic-insensitive matching strips away. */
const COMBINING_MARK = /\p{M}/u
const COMBINING_MARKS = /\p{M}/gu
/** Characters that make up a "token" for whole-word matching. */
const WORD_CHAR = /[\p{L}\p{N}\p{M}\p{Pc}]/u
/** Code points that never start a grapheme in the code-point fallback. */
const GRAPHEME_EXTENDER = /[\p{M}\p{Emoji_Modifier}\u200D]/u
const ZERO_WIDTH_JOINER = '\u200D'
/** Whitespace that separates terms in {@link splitHighlightQuery}. */
const QUERY_TERM_SEPARATOR = /\s+/u

/**
 * Fold one code point for comparison. Decomposition (NFD) always runs so that
 * precomposed "é" and decomposed "e\u0301" compare equal; marks are stripped
 * only when diacritics are ignored. Case folding is `toLowerCase()` (not
 * locale-aware), so the result never depends on the runtime's locale.
 */
function foldCodePoint(codePoint: string, options: HighlightMatchOptions): string {
  let folded = codePoint.normalize('NFD')
  if (!options.caseSensitive) folded = folded.toLowerCase()
  if (!options.diacriticSensitive) folded = folded.replace(COMBINING_MARKS, '')
  return folded
}

interface FoldedText {
  /** The folded string that matching runs against. */
  value: string
  /** For each code unit of `value`, the original code point it came from. */
  origin: HighlightRange[]
}

/** Fold a string code point by code point, remembering where each unit came from. */
function foldText(text: string, options: HighlightMatchOptions): FoldedText {
  let value = ''
  const origin: HighlightRange[] = []
  let offset = 0
  for (const codePoint of text) {
    const source = { start: offset, end: offset + codePoint.length }
    const folded = foldCodePoint(codePoint, options)
    value += folded
    for (let i = 0; i < folded.length; i++) origin.push(source)
    offset = source.end
  }
  return { value, origin }
}

/** Split free-form search input into individual, non-empty terms. */
export function splitHighlightQuery(input: string): string[] {
  return input.split(QUERY_TERM_SEPARATOR).filter((term) => term.length > 0)
}

function normalizeTerms(query: HighlightQuery | undefined): string[] {
  if (query === undefined) return []
  const terms = typeof query === 'string' ? [query] : [...query]
  // Trimmed so a half-typed "new " still highlights "new".
  return terms.map((term) => term.trim()).filter((term) => term.length > 0)
}

/**
 * Grapheme boundaries without `Intl.Segmenter`: a new grapheme starts at every
 * code point except combining marks, emoji modifiers, ZWJ and the code point
 * after a ZWJ. Approximate, but never splits a surrogate pair or a mark.
 */
export function fallbackGraphemeBoundaries(text: string): number[] {
  const boundaries: number[] = []
  let offset = 0
  let previous = ''
  for (const codePoint of text) {
    const continuesGrapheme =
      GRAPHEME_EXTENDER.test(codePoint) || previous === ZERO_WIDTH_JOINER
    if (!continuesGrapheme || offset === 0) boundaries.push(offset)
    previous = codePoint
    offset += codePoint.length
  }
  boundaries.push(text.length)
  return boundaries
}

/** Sorted grapheme-cluster boundaries of `text`, including 0 and `text.length`. */
function graphemeBoundaries(text: string): number[] {
  if (typeof Intl === 'undefined' || typeof Intl.Segmenter !== 'function') {
    return fallbackGraphemeBoundaries(text)
  }
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  const boundaries = Array.from(segmenter.segment(text), (segment) => segment.index)
  boundaries.push(text.length)
  return boundaries
}

/** Largest boundary ≤ offset (boundaries are sorted and start at 0). */
function boundaryAtOrBefore(boundaries: number[], offset: number): number {
  let low = 0
  let high = boundaries.length - 1
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (boundaries[mid] <= offset) low = mid
    else high = mid - 1
  }
  return boundaries[low]
}

/** Smallest boundary ≥ offset (boundaries end at text.length). */
function boundaryAtOrAfter(boundaries: number[], offset: number): number {
  let low = 0
  let high = boundaries.length - 1
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (boundaries[mid] >= offset) high = mid
    else low = mid + 1
  }
  return boundaries[low]
}

/** Widen a range so it never cuts a user-perceived character in half. */
function snapToGraphemes(range: HighlightRange, boundaries: number[]): HighlightRange {
  return {
    start: boundaryAtOrBefore(boundaries, range.start),
    end: boundaryAtOrAfter(boundaries, range.end),
  }
}

const LOW_SURROGATE_MIN = 0xdc00
const LOW_SURROGATE_MAX = 0xdfff

/** The code point that ends just before `offset` (handles surrogate pairs). */
function codePointBefore(text: string, offset: number): string {
  const unit = text.charCodeAt(offset - 1)
  const isLowSurrogate = unit >= LOW_SURROGATE_MIN && unit <= LOW_SURROGATE_MAX
  return text.slice(isLowSurrogate && offset >= 2 ? offset - 2 : offset - 1, offset)
}

function isWordCharBefore(text: string, offset: number): boolean {
  return offset > 0 && WORD_CHAR.test(codePointBefore(text, offset))
}

function isWordCharAt(text: string, offset: number): boolean {
  const codePoint = text.codePointAt(offset)
  return codePoint !== undefined && WORD_CHAR.test(String.fromCodePoint(codePoint))
}

function isWholeWord(text: string, range: HighlightRange): boolean {
  return !isWordCharBefore(text, range.start) && !isWordCharAt(text, range.end)
}

/**
 * Every occurrence of every term in `text`, as ranges into the original
 * string (unmerged, possibly overlapping). Terms are matched literally — no
 * regular expressions — so `.`, `(`, `$` and friends need no escaping.
 */
export function findHighlightRanges(
  text: string,
  query: HighlightQuery | undefined,
  options: HighlightMatchOptions = {},
): HighlightRange[] {
  const terms = normalizeTerms(query)
  if (terms.length === 0 || text.length === 0) return []

  const folded = foldText(text, options)
  const boundaries = graphemeBoundaries(text)
  const ranges: HighlightRange[] = []

  for (const term of terms) {
    const needle = foldText(term, options).value
    if (needle.length === 0) continue
    for (
      let at = folded.value.indexOf(needle);
      at !== -1;
      at = folded.value.indexOf(needle, at + 1)
    ) {
      const after = at + needle.length
      // With diacritics significant, "e" must not match the base of "é":
      // a match that would leave a combining mark dangling is a different letter.
      if (options.diacriticSensitive && COMBINING_MARK.test(folded.value.charAt(after))) continue
      const range = snapToGraphemes(
        { start: folded.origin[at].start, end: folded.origin[after - 1].end },
        boundaries,
      )
      if (options.wholeWord && !isWholeWord(text, range)) continue
      ranges.push(range)
    }
  }
  return ranges
}

/** Clamp a caller-supplied range into `[0, length]`; `null` when it is empty or invalid. */
function clampRange(range: HighlightRange, length: number): HighlightRange | null {
  if (!Number.isFinite(range.start) || !Number.isFinite(range.end)) return null
  const start = Math.max(0, Math.floor(range.start))
  const end = Math.min(length, Math.ceil(range.end))
  return start < end ? { start, end } : null
}

/**
 * Sort, clamp and merge ranges so the result is disjoint and ordered. Touching
 * ranges are merged too, so "ab" matched as "a" + "b" renders as one `<mark>`
 * (and a screen reader announces one highlight, not two).
 */
export function mergeHighlightRanges(
  ranges: readonly HighlightRange[],
  length: number,
): HighlightRange[] {
  const valid = ranges
    .map((range) => clampRange(range, length))
    .filter((range): range is HighlightRange => range !== null)
    .sort((a, b) => a.start - b.start || a.end - b.end)

  const merged: HighlightRange[] = []
  for (const range of valid) {
    const last = merged[merged.length - 1]
    if (last && range.start <= last.end) last.end = Math.max(last.end, range.end)
    else merged.push({ ...range })
  }
  return merged
}

/**
 * Split `text` into ordered segments, marking the parts that match `query`
 * and/or fall inside `ranges`. Concatenating every segment's `text` always
 * reproduces the input exactly. Empty text yields no segments; no matches
 * yields a single plain segment.
 */
export function getHighlightSegments(
  text: string,
  options: HighlightOptions = {},
): HighlightSegment[] {
  if (text.length === 0) return []

  const { query, ranges = [], ...matchOptions } = options
  const boundaries = graphemeBoundaries(text)
  const explicit = ranges
    .map((range) => clampRange(range, text.length))
    .filter((range): range is HighlightRange => range !== null)
    .map((range) => snapToGraphemes(range, boundaries))
  const merged = mergeHighlightRanges(
    [...explicit, ...findHighlightRanges(text, query, matchOptions)],
    text.length,
  )

  const segments: HighlightSegment[] = []
  let cursor = 0
  const push = (start: number, end: number, highlighted: boolean) => {
    if (start < end) segments.push({ text: text.slice(start, end), highlighted, start, end })
  }
  for (const range of merged) {
    push(cursor, range.start, false)
    push(range.start, range.end, true)
    cursor = range.end
  }
  push(cursor, text.length, false)
  return segments
}
