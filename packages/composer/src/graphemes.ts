/**
 * Grapheme-cluster utilities.
 *
 * Length limits and clamping must never bisect a user-perceived character —
 * a 👨‍👩‍👧‍👦 ZWJ family emoji is 11 UTF-16 units but one cluster. We use
 * `Intl.Segmenter` when available; the fallback treats each code point as a
 * cluster (coarser, but it never splits a surrogate pair).
 */

type GraphemeSegmenter = { segment(input: string): Iterable<{ segment: string; index: number }> }

let cachedSegmenter: GraphemeSegmenter | null | undefined

function getSegmenter(): GraphemeSegmenter | null {
  if (cachedSegmenter === undefined) {
    // Feature-detect once; Intl is the only global the module touches.
    const IntlAny = typeof Intl !== 'undefined' ? (Intl as unknown as Record<string, unknown>) : undefined
    const Segmenter = IntlAny?.Segmenter as
      | (new (locale: undefined, opts: { granularity: 'grapheme' }) => GraphemeSegmenter)
      | undefined
    cachedSegmenter = Segmenter ? new Segmenter(undefined, { granularity: 'grapheme' }) : null
  }
  return cachedSegmenter
}

function isHighSurrogate(code: number): boolean {
  return code >= 0xd800 && code <= 0xdbff
}

function isLowSurrogate(code: number): boolean {
  return code >= 0xdc00 && code <= 0xdfff
}

/** Count of grapheme clusters (code points in the fallback), never UTF-16 units. */
export function graphemeLength(text: string): number {
  if (text === '') return 0
  const segmenter = getSegmenter()
  if (segmenter) {
    let count = 0
    for (const _ of segmenter.segment(text)) count++
    return count
  }
  // Fallback: code points (surrogate pairs count once).
  let count = 0
  for (const _ of text) count++
  return count
}

/**
 * Clamp `text` to at most `max` grapheme clusters. A cluster that would cross
 * the limit is rejected whole — the result is always a valid cluster boundary.
 */
export function clampGraphemes(text: string, max: number): string {
  if (max <= 0) return ''
  const segmenter = getSegmenter()
  if (segmenter) {
    let count = 0
    let endIndex = text.length
    for (const part of segmenter.segment(text)) {
      count++
      if (count > max) {
        endIndex = part.index
        break
      }
    }
    return text.slice(0, endIndex)
  }
  // Fallback: walk code points, never splitting a surrogate pair.
  let count = 0
  let i = 0
  while (i < text.length && count < max) {
    const code = text.charCodeAt(i)
    i += isHighSurrogate(code) && i + 1 < text.length && isLowSurrogate(text.charCodeAt(i + 1)) ? 2 : 1
    count++
  }
  return text.slice(0, i)
}

/** Whether `offset` sits on a grapheme-cluster boundary of `text`. */
export function isGraphemeBoundary(text: string, offset: number): boolean {
  if (offset <= 0 || offset >= text.length) return true
  const segmenter = getSegmenter()
  if (segmenter) {
    for (const part of segmenter.segment(text)) {
      if (part.index === offset) return true
      if (part.index > offset) return false
    }
    return false
  }
  // Fallback: only reject offsets that split a surrogate pair.
  return !(isLowSurrogate(text.charCodeAt(offset)) && isHighSurrogate(text.charCodeAt(offset - 1)))
}
