import { describe, it, expect } from 'vitest'
import {
  parseMarkupText,
  groupMarkupTextRuns,
  findMissingMarkupTextTokens,
  normalizeMarkupTextMentions,
  sanitizeMarkupTextHref,
  createMarkupText,
  markupTextVariants,
  markupTextMentionVariants,
  type MarkupTextSegment,
  type MarkupTextMention,
} from '../src/index.js'

const text = (value: string, strong = false): MarkupTextSegment => ({ type: 'text', text: value, strong })
const message = (value: string, mentions?: MarkupTextMention[]) =>
  parseMarkupText(value, { mode: 'message', mentions })

/** Concatenate what a reader would see (tokens shown as their name). */
function visible(segments: MarkupTextSegment[]): string {
  return segments.map((s) => (s.type === 'token' ? `<${s.name}>` : s.text)).join('')
}

describe('parseMarkupText — plain text', () => {
  it('returns an empty list for empty text', () => {
    expect(parseMarkupText('')).toEqual([])
  })

  it('returns one text segment when there is no markup', () => {
    expect(parseMarkupText('Just words.')).toEqual([text('Just words.')])
  })

  it('defaults to markup mode', () => {
    expect(parseMarkupText('{a}')).toEqual([{ type: 'token', name: 'a', strong: false }])
  })
})

describe('parseMarkupText — bold', () => {
  it('parses a bold run in the middle of a sentence', () => {
    expect(parseMarkupText('Open **Settings** now')).toEqual([
      text('Open '),
      text('Settings', true),
      text(' now'),
    ])
  })

  it('parses several bold runs', () => {
    expect(parseMarkupText('**a** and **b**')).toEqual([text('a', true), text(' and '), text('b', true)])
  })

  it('renders an unterminated marker literally', () => {
    expect(parseMarkupText('Press **Save')).toEqual([text('Press **Save')])
  })

  it('pairs left to right and leaves only the trailing odd marker literal', () => {
    expect(parseMarkupText('**a** **b')).toEqual([text('a', true), text(' **b')])
  })

  it('does not nest: an inner marker closes the run', () => {
    expect(parseMarkupText('**a **b** c**')).toEqual([text('a ', true), text('b'), text(' c', true)])
  })

  it('treats an empty pair as literal text', () => {
    expect(parseMarkupText('x****y')).toEqual([text('x****y')])
  })

  it('treats a single asterisk as text', () => {
    expect(parseMarkupText('2 * 3 = 6')).toEqual([text('2 * 3 = 6')])
  })

  it('handles a triple asterisk as a marker plus a literal star', () => {
    expect(parseMarkupText('***x**')).toEqual([text('*x', true)])
  })

  it('keeps bold flags on non-text segments inside a run', () => {
    expect(parseMarkupText('**Press {key}**')).toEqual([
      text('Press ', true),
      { type: 'token', name: 'key', strong: true },
    ])
  })
})

describe('parseMarkupText — tokens (markup mode)', () => {
  it('parses a token between words', () => {
    expect(parseMarkupText('Press {key} to continue')).toEqual([
      text('Press '),
      { type: 'token', name: 'key', strong: false },
      text(' to continue'),
    ])
  })

  it('trims whitespace inside the braces', () => {
    expect(parseMarkupText('{ key }')).toEqual([{ type: 'token', name: 'key', strong: false }])
  })

  it('accepts dots, dashes, underscores and non-Latin letters in names', () => {
    const names = parseMarkupText('{a.b}{c-d}{e_f}{ключ}{キー}')
      .filter((s) => s.type === 'token')
      .map((s) => (s.type === 'token' ? s.name : ''))
    expect(names).toEqual(['a.b', 'c-d', 'e_f', 'ключ', 'キー'])
  })

  it('leaves braces that are not a valid name as literal text', () => {
    expect(parseMarkupText('{} {not a token} {a+b}')).toEqual([text('{} {not a token} {a+b}')])
  })

  it('leaves an unclosed brace as literal text', () => {
    expect(parseMarkupText('open { brace')).toEqual([text('open { brace')])
  })

  it('finds the inner token in doubled braces', () => {
    expect(parseMarkupText('{{a}}')).toEqual([
      text('{'),
      { type: 'token', name: 'a', strong: false },
      text('}'),
    ])
  })
})

describe('parseMarkupText — escapes', () => {
  it('escapes braces so they are literal', () => {
    expect(parseMarkupText('\\{key\\}')).toEqual([text('{key}')])
  })

  it('escapes asterisks so they do not open bold', () => {
    expect(parseMarkupText('\\**not bold**')).toEqual([text('**not bold**')])
  })

  it('escapes backticks and backslashes', () => {
    expect(parseMarkupText('\\`x\\` \\\\')).toEqual([text('`x` \\')])
  })

  it('keeps a backslash before a non-escapable character', () => {
    expect(parseMarkupText('a\\nb \\')).toEqual([text('a\\nb \\')])
  })

  it('in message mode only escapes markup characters, keeping paths intact', () => {
    expect(message('C:\\Users\\{me} \\\\srv \\*x')).toEqual([text('C:\\Users\\{me} \\\\srv *x')])
  })
})

describe('parseMarkupText — inline code', () => {
  it('parses code in both modes', () => {
    const expected = [text('run '), { type: 'code', text: 'pnpm i', strong: false }]
    expect(parseMarkupText('run `pnpm i`')).toEqual(expected)
    expect(message('run `pnpm i`')).toEqual(expected)
  })

  it('keeps markup inside code literal', () => {
    expect(parseMarkupText('`**{x}**`')).toEqual([{ type: 'code', text: '**{x}**', strong: false }])
    expect(message('`https://x.com`')).toEqual([{ type: 'code', text: 'https://x.com', strong: false }])
  })

  it('leaves unterminated and empty fences literal', () => {
    expect(parseMarkupText('a ` b')).toEqual([text('a ` b')])
    expect(parseMarkupText('``')).toEqual([text('``')])
  })
})

describe('parseMarkupText — message mode', () => {
  it('treats braces as literal text', () => {
    expect(message('use {foo}')).toEqual([text('use {foo}')])
  })

  it('does not auto-link in markup mode', () => {
    expect(parseMarkupText('see https://example.com')).toEqual([text('see https://example.com')])
  })

  it('ignores mentions in markup mode', () => {
    expect(parseMarkupText('@ann', { mentions: [{ id: 'u1', start: 0, end: 4 }] })).toEqual([text('@ann')])
  })
})

describe('parseMarkupText — links', () => {
  function links(value: string) {
    return message(value).filter((s) => s.type === 'link')
  }

  it('auto-links an https URL', () => {
    expect(message('see https://example.com/a?b=1#c ok')).toEqual([
      text('see '),
      {
        type: 'link',
        text: 'https://example.com/a?b=1#c',
        href: 'https://example.com/a?b=1#c',
        kind: 'web',
        strong: false,
      },
      text(' ok'),
    ])
  })

  it('auto-links www. with an implicit https scheme', () => {
    expect(links('go to www.example.com')).toEqual([
      { type: 'link', text: 'www.example.com', href: 'https://www.example.com/', kind: 'web', strong: false },
    ])
  })

  it('auto-links mailto: as an email link', () => {
    expect(links('mail mailto:ann@example.com')).toEqual([
      { type: 'link', text: 'mailto:ann@example.com', href: 'mailto:ann@example.com', kind: 'email', strong: false },
    ])
  })

  it.each([
    ['https://example.com.', 'https://example.com'],
    ['https://example.com,', 'https://example.com'],
    ['https://example.com!?', 'https://example.com'],
    ['https://example.com/a:', 'https://example.com/a'],
    ['"https://example.com"', 'https://example.com'],
    ["'https://example.com'", 'https://example.com'],
  ])('strips trailing punctuation from %s', (input, url) => {
    expect(links(input).map((l) => l.text)).toEqual([url])
  })

  it('strips an unbalanced closing paren but keeps a balanced one', () => {
    expect(links('(see https://example.com/x)').map((l) => l.text)).toEqual(['https://example.com/x'])
    expect(links('https://en.wikipedia.org/wiki/Foo_(bar)').map((l) => l.text)).toEqual([
      'https://en.wikipedia.org/wiki/Foo_(bar)',
    ])
    expect(links('(https://en.wikipedia.org/wiki/Foo_(bar)).').map((l) => l.text)).toEqual([
      'https://en.wikipedia.org/wiki/Foo_(bar)',
    ])
  })

  it('keeps the surrounding punctuation as text', () => {
    expect(visible(message('(see https://example.com/x).'))).toBe('(see https://example.com/x).')
  })

  it('stops before a closing bold marker so bold still pairs', () => {
    expect(message('**https://example.com**')).toEqual([
      { type: 'link', text: 'https://example.com', href: 'https://example.com/', kind: 'web', strong: true },
    ])
  })

  it('does not link mid-word', () => {
    expect(links('foohttps://example.com')).toEqual([])
  })

  it('does not link a bare scheme or a bare www.', () => {
    expect(links('https:// and www. and mailto:')).toEqual([])
  })

  it('links several URLs on one line', () => {
    expect(links('a https://a.com b http://b.com').map((l) => l.href)).toEqual(['https://a.com/', 'http://b.com/'])
  })

  it('accepts an upper-case scheme', () => {
    expect(links('HTTPS://EXAMPLE.COM/A').map((l) => l.href)).toEqual(['https://example.com/A'])
  })

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    'ftp://example.com',
  ])('renders %s as plain text', (input) => {
    const segments = message(`click ${input}`)
    expect(segments.every((s) => s.type === 'text')).toBe(true)
    expect(visible(segments)).toBe(`click ${input}`)
  })

  it('keeps unicode in the URL text and percent-encodes the href', () => {
    const [link] = links('see https://例え.jp/パス')
    expect(link).toMatchObject({ type: 'link', text: 'https://例え.jp/パス', kind: 'web' })
    expect(link && link.type === 'link' && link.href).toBe('https://xn--r8jz45g.jp/%E3%83%91%E3%82%B9')
  })
})

describe('sanitizeMarkupTextHref', () => {
  it.each(['https://example.com', 'http://example.com/x', 'mailto:ann@example.com'])('accepts %s', (href) => {
    expect(sanitizeMarkupTextHref(href)).not.toBeNull()
  })

  it.each([
    '',
    'javascript:alert(1)',
    ' javascript:alert(1)',
    'java\nscript:alert(1)',
    'java\tscript:alert(1)',
    'jav\u0000ascript:alert(1)',
    'data:text/html,hi',
    'vbscript:x',
    '//evil.example.com',
    '/relative/path',
    'mailto:',
    'https://exa mple.com',
  ])('rejects %j', (href) => {
    expect(sanitizeMarkupTextHref(href)).toBeNull()
  })
})

describe('mentions', () => {
  const ann: MarkupTextMention = { id: 'u1', start: 3, end: 7, type: 'user' }

  it('renders a mention chip from a structured range', () => {
    expect(message('hi @ann!', [ann])).toEqual([
      text('hi '),
      { type: 'mention', text: '@ann', mention: ann, strong: false },
      text('!'),
    ])
  })

  it('does not turn @-text into a mention without a range', () => {
    expect(message('hi @ann')).toEqual([text('hi @ann')])
  })

  it('takes the chip label from the range, not from a pattern', () => {
    expect(message('ping Ann Lee', [{ id: 'u1', start: 5, end: 12 }])[1]).toMatchObject({
      type: 'mention',
      text: 'Ann Lee',
    })
  })

  it('puts a mention inside a bold run that surrounds it', () => {
    const range = { id: 'u1', start: 5, end: 9 }
    expect(message('**hi @ann**', [range])).toEqual([
      text('hi ', true),
      { type: 'mention', text: '@ann', mention: range, strong: true },
    ])
  })

  it('wins over a bold marker the range overlaps (markup inside a mention is inert)', () => {
    const range = { id: 'u1', start: 0, end: 4 }
    expect(message('@an**n**', [range])).toEqual([
      { type: 'mention', text: '@an*', mention: range, strong: false },
      text('*n**'),
    ])
  })

  it('wins over a URL the range overlaps', () => {
    const range = { id: 'c1', start: 0, end: 8 }
    expect(message('https://x.com', [range])).toEqual([
      { type: 'mention', text: 'https://', mention: range, strong: false },
      text('x.com'),
    ])
  })

  it('keeps the earliest of two overlapping ranges', () => {
    const first = { id: 'a', start: 0, end: 4 }
    const second = { id: 'b', start: 2, end: 6 }
    expect(message('@ann @bo', [second, first]).filter((s) => s.type === 'mention')).toEqual([
      { type: 'mention', text: '@ann', mention: first, strong: false },
    ])
  })

  it('handles adjacent ranges', () => {
    const a = { id: 'a', start: 0, end: 2 }
    const b = { id: 'b', start: 2, end: 4 }
    expect(message('@a@b', [a, b]).map((s) => s.type)).toEqual(['mention', 'mention'])
  })

  it('uses UTF-16 offsets, so an emoji before a mention counts as two units', () => {
    const value = '👋 @ann'
    const range = { id: 'u1', start: 3, end: 7 }
    expect(message(value, [range])).toEqual([
      text('👋 '),
      { type: 'mention', text: '@ann', mention: range, strong: false },
    ])
  })
})

describe('normalizeMarkupTextMentions', () => {
  const value = 'hello world'

  it('sorts by start without mutating the input', () => {
    const input = [
      { id: 'b', start: 6, end: 11 },
      { id: 'a', start: 0, end: 5 },
    ]
    const copy = input.map((m) => ({ ...m }))
    expect(normalizeMarkupTextMentions(value, input).map((m) => m.id)).toEqual(['a', 'b'])
    expect(input).toEqual(copy)
  })

  it('prefers the longer range when two start together', () => {
    const result = normalizeMarkupTextMentions(value, [
      { id: 'short', start: 0, end: 2 },
      { id: 'long', start: 0, end: 5 },
    ])
    expect(result.map((m) => m.id)).toEqual(['long'])
  })

  it.each([
    { id: 'neg', start: -1, end: 2 },
    { id: 'past', start: 6, end: 99 },
    { id: 'empty', start: 3, end: 3 },
    { id: 'reversed', start: 4, end: 2 },
    { id: 'float', start: 0.5, end: 2 },
    { id: 'nan', start: Number.NaN, end: 2 },
  ])('drops the invalid range $id', (range) => {
    expect(normalizeMarkupTextMentions(value, [range])).toEqual([])
  })

  it('drops ranges that split a surrogate pair', () => {
    const emoji = 'a😀b'
    expect(normalizeMarkupTextMentions(emoji, [{ id: 'x', start: 2, end: 4 }])).toEqual([])
    expect(normalizeMarkupTextMentions(emoji, [{ id: 'y', start: 0, end: 2 }])).toEqual([])
    expect(normalizeMarkupTextMentions(emoji, [{ id: 'z', start: 1, end: 3 }])).toHaveLength(1)
  })

  it('returns an empty list when no mentions are given', () => {
    expect(normalizeMarkupTextMentions(value)).toEqual([])
  })
})

describe('unicode', () => {
  it('keeps emoji and combining marks intact around markup', () => {
    expect(parseMarkupText('**café 👩‍💻** {k} né')).toEqual([
      text('café 👩‍💻', true),
      text(' '),
      { type: 'token', name: 'k', strong: false },
      text(' né'),
    ])
  })

  it('keeps right-to-left text intact', () => {
    expect(parseMarkupText('افتح **الإعدادات**')).toEqual([text('افتح '), text('الإعدادات', true)])
  })
})

describe('groupMarkupTextRuns', () => {
  it('groups consecutive segments by weight', () => {
    const runs = groupMarkupTextRuns(parseMarkupText('a **b {k} c** d'))
    expect(runs.map((r) => [r.strong, r.segments.length])).toEqual([
      [false, 1],
      [true, 3],
      [false, 1],
    ])
  })

  it('returns no runs for no segments', () => {
    expect(groupMarkupTextRuns([])).toEqual([])
  })
})

describe('findMissingMarkupTextTokens', () => {
  it('lists unknown token names once, in first-seen order', () => {
    const segments = parseMarkupText('{b} {a} {b} {known}')
    expect(findMissingMarkupTextTokens(segments, (name) => name === 'known')).toEqual(['b', 'a'])
  })

  it('returns nothing when every token has a node', () => {
    expect(findMissingMarkupTextTokens(parseMarkupText('{a}'), () => true)).toEqual([])
  })
})

describe('createMarkupText and styles', () => {
  it('builds root data attributes', () => {
    expect(createMarkupText().dataAttributes).toEqual({ 'data-slot': 'markup-text', 'data-mode': 'markup' })
    expect(createMarkupText({ mode: 'message' }).dataAttributes['data-mode']).toBe('message')
  })

  it('makes the root block-level only when aligned', () => {
    expect(markupTextVariants()).not.toContain('block')
    expect(markupTextVariants({ textAlign: 'center' })).toContain('block text-center')
  })

  it('adds a focus ring only to interactive mentions', () => {
    expect(markupTextMentionVariants({ interactive: 'true' })).toContain('focus-visible:ring-2')
    expect(markupTextMentionVariants()).not.toContain('focus-visible:ring-2')
  })

  it('is deterministic for the same input', () => {
    const input = '**a** {b} `c`'
    expect(parseMarkupText(input)).toEqual(parseMarkupText(input))
  })
})
