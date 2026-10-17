import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  getHighlightSegments,
  findHighlightRanges,
  mergeHighlightRanges,
  splitHighlightQuery,
  highlightTextMarkClass,
  type HighlightSegment,
} from '../src/index.js'
import { fallbackGraphemeBoundaries } from '../src/highlight-text.js'

/** The highlighted substrings, in order — the most readable assertion. */
const marked = (segments: HighlightSegment[]) =>
  segments.filter((s) => s.highlighted).map((s) => s.text)

const joined = (segments: HighlightSegment[]) => segments.map((s) => s.text).join('')

describe('getHighlightSegments — basics', () => {
  it('returns no segments for empty text', () => {
    expect(getHighlightSegments('', { query: 'a' })).toEqual([])
  })

  it('returns one plain segment when there is no query', () => {
    expect(getHighlightSegments('Hello')).toEqual([
      { text: 'Hello', highlighted: false, start: 0, end: 5 },
    ])
  })

  it.each(['', '   ', '\t\n'])('ignores an empty or whitespace query %j', (query) => {
    const segments = getHighlightSegments('Hello world', { query })
    expect(marked(segments)).toEqual([])
    expect(segments).toHaveLength(1)
  })

  it('splits text around a match with original offsets', () => {
    expect(getHighlightSegments('Open file', { query: 'file' })).toEqual([
      { text: 'Open ', highlighted: false, start: 0, end: 5 },
      { text: 'file', highlighted: true, start: 5, end: 9 },
    ])
  })

  it('highlights every occurrence', () => {
    expect(marked(getHighlightSegments('ab ab ab', { query: 'ab' }))).toEqual(['ab', 'ab', 'ab'])
  })

  it('merges overlapping occurrences of the same term', () => {
    expect(getHighlightSegments('aaaa', { query: 'aa' })).toEqual([
      { text: 'aaaa', highlighted: true, start: 0, end: 4 },
    ])
  })

  it('trims a half-typed query', () => {
    expect(marked(getHighlightSegments('New file', { query: 'new ' }))).toEqual(['New'])
  })

  it('returns no match when the query is longer than the text', () => {
    expect(marked(getHighlightSegments('ab', { query: 'abc' }))).toEqual([])
  })

  it('always reproduces the input when segments are joined', () => {
    const text = 'Crème brûlée, café au lait 👍🏽 and naïve résumés'
    const segments = getHighlightSegments(text, { query: ['e', 'a', 'u'] })
    expect(joined(segments)).toBe(text)
    segments.forEach((s) => expect(text.slice(s.start, s.end)).toBe(s.text))
  })
})

describe('regex-special characters', () => {
  it.each(['.', '(x)', '$', '^a', 'a+b', '[1]', '\\', '*', '?', '|'])(
    'matches %j literally',
    (query) => {
      const text = `before ${query} after`
      expect(marked(getHighlightSegments(text, { query }))).toEqual([query])
    },
  )

  it('does not treat "." as a wildcard', () => {
    expect(marked(getHighlightSegments('abc', { query: '.' }))).toEqual([])
  })
})

describe('case sensitivity', () => {
  it('is case-insensitive by default', () => {
    expect(marked(getHighlightSegments('Hello HELLO hello', { query: 'hello' }))).toEqual([
      'Hello',
      'HELLO',
      'hello',
    ])
  })

  it('matches case exactly when caseSensitive', () => {
    expect(
      marked(getHighlightSegments('Hello HELLO hello', { query: 'hello', caseSensitive: true })),
    ).toEqual(['hello'])
  })

  it('case-folds non-Latin scripts', () => {
    expect(marked(getHighlightSegments('ΑΘΗΝΑ', { query: 'αθηνα' }))).toEqual(['ΑΘΗΝΑ'])
  })
})

describe('diacritic-insensitive matching (default)', () => {
  it('maps "creme" back onto "Crème" in the original string', () => {
    const segments = getHighlightSegments('Crème brûlée', { query: 'creme' })
    expect(segments[0]).toEqual({ text: 'Crème', highlighted: true, start: 0, end: 5 })
  })

  it('maps offsets correctly after an earlier accented character', () => {
    // "brûlée": û (1 unit) folds via NFD to 2 units; offsets after it must not drift.
    const text = 'Crème brûlée'
    const segments = getHighlightSegments(text, { query: 'lee' })
    const hit = segments.find((s) => s.highlighted)
    expect(hit).toEqual({ text: 'lée', highlighted: true, start: 9, end: 12 })
  })

  it('matches an accented query against unaccented text', () => {
    expect(marked(getHighlightSegments('Creme brulee', { query: 'crème' }))).toEqual(['Creme'])
  })

  it('handles decomposed input (base letter + combining mark) without splitting it', () => {
    const text = 'Cre\u0300me' // "Crème" written as e + U+0300
    const segments = getHighlightSegments(text, { query: 'cre' })
    expect(segments[0]).toEqual({ text: 'Cre\u0300', highlighted: true, start: 0, end: 4 })
    expect(joined(segments)).toBe(text)
  })

  it('never ends a match between a letter and its trailing combining marks', () => {
    const text = 'ae\u0301\u0302z'
    expect(marked(getHighlightSegments(text, { query: 'ae' }))).toEqual(['ae\u0301\u0302'])
  })

  it('matches across Vietnamese stacked diacritics', () => {
    expect(marked(getHighlightSegments('Tiếng Việt', { query: 'viet' }))).toEqual(['Việt'])
  })
})

describe('diacriticSensitive', () => {
  it('distinguishes "e" from "é"', () => {
    expect(
      marked(getHighlightSegments('cafe café', { query: 'cafe', diacriticSensitive: true })),
    ).toEqual(['cafe'])
  })

  it('does not match the base letter of a decomposed accented character', () => {
    expect(
      marked(getHighlightSegments('cafe\u0301', { query: 'cafe', diacriticSensitive: true })),
    ).toEqual([])
  })

  it('treats precomposed and decomposed forms as the same letter', () => {
    expect(
      marked(getHighlightSegments('cafe\u0301', { query: 'café', diacriticSensitive: true })),
    ).toEqual(['cafe\u0301'])
    expect(
      marked(getHighlightSegments('café', { query: 'cafe\u0301', diacriticSensitive: true })),
    ).toEqual(['café'])
  })
})

describe('multi-code-unit characters', () => {
  it('keeps surrogate pairs (astral emoji) intact and offsets correct', () => {
    const text = '😀 smile 😀'
    expect(getHighlightSegments(text, { query: 'smile' })).toEqual([
      { text: '😀 ', highlighted: false, start: 0, end: 3 },
      { text: 'smile', highlighted: true, start: 3, end: 8 },
      { text: ' 😀', highlighted: false, start: 8, end: 11 },
    ])
  })

  it('matches an astral character query', () => {
    expect(marked(getHighlightSegments('a 𝒳 b', { query: '𝒳' }))).toEqual(['𝒳'])
  })

  it('widens a match to the whole emoji grapheme (skin tone modifier)', () => {
    expect(marked(getHighlightSegments('ok 👍🏽 thanks', { query: '👍' }))).toEqual(['👍🏽'])
  })

  it('widens a match to a whole ZWJ family emoji', () => {
    const family = '👩\u200D👩\u200D👧'
    expect(marked(getHighlightSegments(`hi ${family}`, { query: '👩' }))).toEqual([family])
  })

  it('handles Hangul, which NFD expands into several jamo', () => {
    const text = '한국어 검색'
    expect(getHighlightSegments(text, { query: '검색' })[1]).toEqual({
      text: '검색',
      highlighted: true,
      start: 4,
      end: 6,
    })
  })
})

describe('wholeWord', () => {
  it('only matches whole tokens', () => {
    expect(
      marked(getHighlightSegments('cat concat cat-like cats', { query: 'cat', wholeWord: true })),
    ).toEqual(['cat', 'cat'])
  })

  it('treats accented letters as word characters', () => {
    expect(marked(getHighlightSegments('café', { query: 'caf', wholeWord: true }))).toEqual([])
  })

  it('treats underscore as a word character', () => {
    expect(marked(getHighlightSegments('file_name', { query: 'file', wholeWord: true }))).toEqual(
      [],
    )
  })

  it('accepts a word that ends in a decomposed accent', () => {
    expect(
      marked(getHighlightSegments('un cafe\u0301 noir', { query: 'cafe', wholeWord: true })),
    ).toEqual(['cafe\u0301'])
  })

  it('treats an astral letter before the match as a word character', () => {
    expect(marked(getHighlightSegments('𝒳cat', { query: 'cat', wholeWord: true }))).toEqual([])
  })

  it('matches at the start and end of the text and next to punctuation', () => {
    expect(
      marked(getHighlightSegments('cat, (cat) cat', { query: 'cat', wholeWord: true })),
    ).toEqual(['cat', 'cat', 'cat'])
  })
})

describe('multiple terms', () => {
  it('highlights each term of an array query', () => {
    expect(marked(getHighlightSegments('New file in folder', { query: ['file', 'new'] }))).toEqual([
      'New',
      'file',
    ])
  })

  it('merges overlapping and touching matches of different terms into one mark', () => {
    expect(getHighlightSegments('foobar', { query: ['foo', 'oba', 'r'] })).toEqual([
      { text: 'foobar', highlighted: true, start: 0, end: 6 },
    ])
  })

  it('treats a string query as one phrase', () => {
    expect(marked(getHighlightSegments('new folder, file new', { query: 'new file' }))).toEqual([])
  })

  it('splitHighlightQuery turns search input into terms', () => {
    expect(splitHighlightQuery('  new   file\tnow ')).toEqual(['new', 'file', 'now'])
    expect(splitHighlightQuery('   ')).toEqual([])
  })
})

describe('explicit ranges', () => {
  it('highlights the given ranges', () => {
    expect(
      marked(
        getHighlightSegments('Command palette', {
          ranges: [
            { start: 0, end: 1 },
            { start: 8, end: 9 },
          ],
        }),
      ),
    ).toEqual(['C', 'p'])
  })

  it('combines ranges with query matches', () => {
    expect(
      marked(getHighlightSegments('alpha beta', { query: 'beta', ranges: [{ start: 0, end: 1 }] })),
    ).toEqual(['a', 'beta'])
  })

  it('clamps out-of-bounds ranges and drops empty / invalid ones', () => {
    const segments = getHighlightSegments('abc', {
      ranges: [
        { start: -5, end: 1 },
        { start: 2, end: 99 },
        { start: 1, end: 1 },
        { start: 2, end: 1 },
        { start: Number.NaN, end: 2 },
      ],
    })
    expect(marked(segments)).toEqual(['a', 'c'])
  })

  it('widens a range that cuts a surrogate pair or grapheme', () => {
    expect(marked(getHighlightSegments('x😀y', { ranges: [{ start: 1, end: 2 }] }))).toEqual(['😀'])
    expect(marked(getHighlightSegments('e\u0301x', { ranges: [{ start: 0, end: 1 }] }))).toEqual([
      'e\u0301',
    ])
  })
})

describe('mergeHighlightRanges', () => {
  it('sorts, merges overlapping and touching ranges', () => {
    expect(
      mergeHighlightRanges(
        [
          { start: 6, end: 8 },
          { start: 0, end: 2 },
          { start: 1, end: 3 },
          { start: 3, end: 4 },
        ],
        10,
      ),
    ).toEqual([
      { start: 0, end: 4 },
      { start: 6, end: 8 },
    ])
  })

  it('keeps a range contained in another', () => {
    expect(
      mergeHighlightRanges(
        [
          { start: 0, end: 10 },
          { start: 2, end: 3 },
        ],
        10,
      ),
    ).toEqual([{ start: 0, end: 10 }])
  })

  it('does not mutate its input', () => {
    const input = [
      { start: 0, end: 2 },
      { start: 1, end: 3 },
    ]
    mergeHighlightRanges(input, 5)
    expect(input).toEqual([
      { start: 0, end: 2 },
      { start: 1, end: 3 },
    ])
  })
})

describe('findHighlightRanges', () => {
  it('returns raw, unmerged ranges', () => {
    expect(findHighlightRanges('aaa', 'aa')).toEqual([
      { start: 0, end: 2 },
      { start: 1, end: 3 },
    ])
  })

  it('returns nothing for an undefined query or empty text', () => {
    expect(findHighlightRanges('abc', undefined)).toEqual([])
    expect(findHighlightRanges('', 'a')).toEqual([])
  })
})

describe('without Intl.Segmenter', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('falls back to code-point boundaries that keep marks and ZWJ sequences whole', () => {
    expect(fallbackGraphemeBoundaries('ae\u0301😀👍🏽')).toEqual([0, 1, 3, 5, 9])
    expect(fallbackGraphemeBoundaries('👩\u200D👧x')).toEqual([0, 5, 6])
    expect(fallbackGraphemeBoundaries('')).toEqual([0])
  })

  it('still produces whole-grapheme matches', () => {
    vi.stubGlobal('Intl', { ...Intl, Segmenter: undefined })
    expect(marked(getHighlightSegments('Cre\u0300me', { query: 'cre' }))).toEqual(['Cre\u0300'])
    expect(marked(getHighlightSegments('ok 👍🏽', { query: '👍' }))).toEqual(['👍🏽'])
  })
})

describe('determinism', () => {
  it('returns identical output for identical input', () => {
    const args = ['Crème brûlée', { query: ['creme', 'brulee'] }] as const
    expect(getHighlightSegments(...args)).toEqual(getHighlightSegments(...args))
  })
})

describe('highlightTextMarkClass', () => {
  it('uses the warning token pair and a non-colour cue', () => {
    expect(highlightTextMarkClass).toContain('bg-warning')
    expect(highlightTextMarkClass).toContain('text-warning-foreground')
    expect(highlightTextMarkClass).toContain('font-semibold')
  })
})
