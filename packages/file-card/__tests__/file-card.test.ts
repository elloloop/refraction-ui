import { describe, it, expect } from 'vitest'
import {
  createFileCard,
  resolveFileCardKind,
  splitFileCardName,
  getFileCardExtension,
  formatFileCardBytes,
  formatFileCardDuration,
  formatFileCardDimensions,
  truncateFileCardName,
  segmentFileCardGraphemes,
  createFileCardNumberFormatter,
  sanitizeFileCardHref,
  resolveFileCardRel,
  resolveFileCardLabels,
  clampFileCardProgress,
  FILE_CARD_KINDS,
  FILE_CARD_DEFAULT_LABELS,
  FILE_CARD_ELLIPSIS,
  type FileKind,
} from '../src/index.js'

const graphemeCount = (text: string) => segmentFileCardGraphemes(text).length

describe('splitFileCardName / getFileCardExtension', () => {
  it.each([
    ['report.pdf', 'report', '.pdf'],
    ['archive.tar.gz', 'archive.tar', '.gz'],
    ['README', 'README', ''],
    ['.gitignore', '.gitignore', ''],
    ['.env.local', '.env', '.local'],
    ['notes.', 'notes.', ''],
    ['', '', ''],
  ])('%s → base %s, extension %s', (name, base, extension) => {
    expect(splitFileCardName(name)).toEqual({ base, extension })
  })

  it('lower-cases the extension and drops the dot', () => {
    expect(getFileCardExtension('PHOTO.JPG')).toBe('jpg')
    expect(getFileCardExtension('.bashrc')).toBe('')
  })
})

describe('resolveFileCardKind', () => {
  it.each<[string, FileKind]>([
    ['image/png', 'image'],
    ['image/svg+xml', 'image'],
    ['video/mp4', 'video'],
    ['audio/mpeg', 'audio'],
    ['application/pdf', 'pdf'],
    ['application/zip', 'archive'],
    ['application/json', 'code'],
    ['text/html', 'code'],
    ['text/csv', 'spreadsheet'],
    ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'spreadsheet'],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'document'],
    ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'presentation'],
    ['text/plain', 'text'],
  ])('MIME %s → %s', (mimeType, kind) => {
    expect(resolveFileCardKind({ mimeType })).toBe(kind)
  })

  it('ignores MIME parameters and case', () => {
    expect(resolveFileCardKind({ mimeType: 'Application/PDF; charset=binary' })).toBe('pdf')
    expect(resolveFileCardKind({ mimeType: 'text/plain; charset=utf-8' })).toBe('text')
  })

  it.each<[string, FileKind]>([
    ['photo.JPEG', 'image'],
    ['clip.mov', 'video'],
    ['voice.m4a', 'audio'],
    ['spec.pdf', 'pdf'],
    ['backup.tar.gz', 'archive'],
    ['main.tsx', 'code'],
    ['budget.xlsx', 'spreadsheet'],
    ['letter.docx', 'document'],
    ['deck.key', 'presentation'],
    ['notes.md', 'text'],
    ['mystery.xyz', 'other'],
    ['Makefile', 'other'],
    ['.gitignore', 'other'],
  ])('extension of %s → %s', (name, kind) => {
    expect(resolveFileCardKind({ name })).toBe(kind)
  })

  it('falls back to the extension for a generic or missing MIME type', () => {
    expect(resolveFileCardKind({ mimeType: 'application/octet-stream', name: 'x.zip' })).toBe('archive')
    expect(resolveFileCardKind({ mimeType: '', name: 'x.mp3' })).toBe('audio')
    expect(resolveFileCardKind({ mimeType: 'application/octet-stream' })).toBe('other')
  })

  it('lets the extension refine a text/* MIME type but not override a specific one', () => {
    expect(resolveFileCardKind({ mimeType: 'text/plain', name: 'index.ts' })).toBe('code')
    expect(resolveFileCardKind({ mimeType: 'text/plain', name: 'readme.unknown' })).toBe('text')
    expect(resolveFileCardKind({ mimeType: 'image/png', name: 'misnamed.pdf' })).toBe('image')
  })

  it('returns other for an unknown MIME type with no extension', () => {
    expect(resolveFileCardKind({ mimeType: 'application/x-made-up', name: 'blob' })).toBe('other')
  })

  it('has a default label for every kind', () => {
    for (const kind of FILE_CARD_KINDS) expect(FILE_CARD_DEFAULT_LABELS.kinds[kind]).toBeTruthy()
  })
})

describe('formatFileCardBytes', () => {
  it.each([
    [0, '0 B'],
    [1, '1 B'],
    [1023, '1,023 B'],
    [1024, '1 KB'],
    [1536, '1.5 KB'],
    [2.4 * 1024 * 1024, '2.4 MB'],
    [5 * 1024 ** 3, '5 GB'],
    [3 * 1024 ** 4, '3 TB'],
  ])('%d → %s', (bytes, text) => {
    expect(formatFileCardBytes(bytes)).toBe(text)
  })

  it('bumps to the next unit instead of showing the base after rounding', () => {
    expect(formatFileCardBytes(1024 * 1024 - 1)).toBe('1 MB')
    expect(formatFileCardBytes(1024 * 1023.94)).toBe('1,023.9 KB')
  })

  it('stays on the largest unit for huge values', () => {
    expect(formatFileCardBytes(2048 * 1024 ** 5)).toBe('2,048 PB')
  })

  it('rounds whole bytes', () => {
    expect(formatFileCardBytes(10.6)).toBe('11 B')
  })

  it('returns an empty string for invalid sizes', () => {
    expect(formatFileCardBytes(-1)).toBe('')
    expect(formatFileCardBytes(Number.NaN)).toBe('')
    expect(formatFileCardBytes(Number.POSITIVE_INFINITY)).toBe('')
  })

  it('formats numbers for the given locale', () => {
    expect(formatFileCardBytes(1536, { locale: 'de-DE' })).toBe('1,5 KB')
  })

  it('uses an injected number formatter and unit names', () => {
    const calls: Array<[number, number]> = []
    const text = formatFileCardBytes(1536, {
      formatNumber: (value, { maximumFractionDigits }) => {
        calls.push([value, maximumFractionDigits])
        return `<${value}>`
      },
      units: ['o', 'Ko', 'Mo'],
    })
    expect(text).toBe('<1.5> Ko')
    expect(calls).toEqual([[1.5, 1]])
  })

  it('supports SI multiples', () => {
    expect(formatFileCardBytes(1500, { base: 1000 })).toBe('1.5 KB')
  })
})

describe('formatFileCardDuration', () => {
  it.each([
    [0, '0:00'],
    [5, '0:05'],
    [65, '1:05'],
    [59.9, '0:59'],
    [600, '10:00'],
    [3600, '1:00:00'],
    [3725, '1:02:05'],
    [36000 + 61, '10:01:01'],
  ])('%d s → %s', (seconds, text) => {
    expect(formatFileCardDuration(seconds)).toBe(text)
  })

  it('returns an empty string for invalid durations', () => {
    expect(formatFileCardDuration(-1)).toBe('')
    expect(formatFileCardDuration(Number.NaN)).toBe('')
  })
})

describe('formatFileCardDimensions', () => {
  it('formats width × height with grouping', () => {
    expect(formatFileCardDimensions({ width: 1920, height: 1080 })).toBe('1,920 × 1,080')
  })

  it('uses the injected formatter', () => {
    expect(
      formatFileCardDimensions({ width: 4000, height: 3000 }, createFileCardNumberFormatter('de-DE')),
    ).toBe('4.000 × 3.000')
  })

  it('returns an empty string unless both sides are positive', () => {
    expect(formatFileCardDimensions({ width: 0, height: 10 })).toBe('')
    expect(formatFileCardDimensions({ width: 10, height: Number.NaN })).toBe('')
  })
})

describe('truncateFileCardName', () => {
  it('leaves names that fit alone', () => {
    expect(truncateFileCardName('report.pdf', 10)).toBe('report.pdf')
    expect(truncateFileCardName('report.pdf')).toBe('report.pdf')
  })

  it('cuts the middle of the base and keeps the extension', () => {
    const out = truncateFileCardName('quarterly-financial-report-final.pdf', 24)
    expect(out).toBe('quarterly-…ort-final.pdf')
    expect(graphemeCount(out)).toBe(24)
  })

  it('keeps one more grapheme at the start when the split is odd', () => {
    expect(truncateFileCardName('abcdefghij.txt', 8)).toBe('ab…j.txt')
  })

  it('middle-truncates a name with no extension', () => {
    const out = truncateFileCardName('a-very-long-name-without-any-extension', 12)
    expect(out).toBe('a-very…nsion')
    expect(graphemeCount(out)).toBe(12)
  })

  it('treats a dotfile as having no extension', () => {
    expect(truncateFileCardName('.gitignore-but-very-long-indeed', 11)).toBe('.giti…ndeed')
  })

  it('falls back to plain middle truncation when the extension is too long', () => {
    const name = 'photo.backup-2024-01-01-and-more'
    const out = truncateFileCardName(name, 12)
    expect(out).toBe('photo.…-more')
    expect(out.endsWith('more')).toBe(true)
  })

  it('keeps an extension that exactly leaves one base grapheme', () => {
    expect(truncateFileCardName('abcdefgh.ext', 6)).toBe('a….ext')
  })

  it('never splits grapheme clusters', () => {
    const family = '👨‍👩‍👧‍👦'
    const name = `${family.repeat(10)}.png`
    const out = truncateFileCardName(name, 8)
    expect(out).toBe(`${family.repeat(2)}${FILE_CARD_ELLIPSIS}${family}.png`)
    expect(graphemeCount(out)).toBe(8)
  })

  it('keeps combining marks with their base letter', () => {
    const e = 'é' // é as e + combining acute
    const out = truncateFileCardName(`${e.repeat(10)}.txt`, 7)
    expect(out).toBe(`${e}${FILE_CARD_ELLIPSIS}${e}.txt`)
  })

  it('works with the code-point fallback segmenter', () => {
    const out = truncateFileCardName('😀😀😀😀😀😀😀😀.txt', 7, { segment: (t) => Array.from(t) })
    expect(out).toBe('😀…😀.txt')
  })

  it('clamps a too-small maxLength to one grapheme each side of the ellipsis', () => {
    expect(truncateFileCardName('abcdefgh.pdf', 0)).toBe('a…f')
    expect(truncateFileCardName('abcdefgh.pdf', 1)).toBe('a…f')
  })

  it('accepts a custom ellipsis and counts it in graphemes', () => {
    expect(truncateFileCardName('abcdefghijkl.txt', 10, { ellipsis: '...' })).toBe('ab...l.txt')
  })

  it('does not truncate for a non-finite maxLength', () => {
    const name = 'x'.repeat(100)
    expect(truncateFileCardName(name, Number.POSITIVE_INFINITY)).toBe(name)
  })
})

describe('sanitizeFileCardHref', () => {
  it.each(['https://files.example.com/a.pdf', 'http://x.test/a', '/files/1', 'files/1?x=1', '#f', 'blob:https://app/123'])(
    'allows %s',
    (href) => {
      expect(sanitizeFileCardHref(href)).toBe(href)
    },
  )

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'data:text/html,<script>',
    'vbscript:msgbox',
    'file:///etc/passwd',
    'java\nscript:alert(1)',
    ' javascript:alert(1)',
    '',
    undefined,
  ])('rejects %j', (href) => {
    expect(sanitizeFileCardHref(href)).toBeUndefined()
  })
})

describe('resolveFileCardRel', () => {
  it('adds noopener noreferrer for new tabs and keeps existing tokens', () => {
    expect(resolveFileCardRel('_blank', undefined)).toBe('noopener noreferrer')
    expect(resolveFileCardRel('_blank', 'nofollow noopener')).toBe('nofollow noopener noreferrer')
  })

  it('passes rel through for same-tab links', () => {
    expect(resolveFileCardRel(undefined, undefined)).toBeUndefined()
    expect(resolveFileCardRel('_self', 'nofollow')).toBe('nofollow')
  })
})

describe('clampFileCardProgress', () => {
  it.each([
    [undefined, null],
    [Number.NaN, null],
    [-5, 0],
    [0, 0],
    [42.4, 42],
    [42.5, 43],
    [100, 100],
    [150, 100],
  ])('%s → %s', (input, output) => {
    expect(clampFileCardProgress(input)).toBe(output)
  })
})

describe('resolveFileCardLabels', () => {
  it('merges overrides, including partial kind names', () => {
    const labels = resolveFileCardLabels({ cancel: 'Abbrechen', kinds: { pdf: 'PDF-Datei' } })
    expect(labels.cancel).toBe('Abbrechen')
    expect(labels.retry).toBe(FILE_CARD_DEFAULT_LABELS.retry)
    expect(labels.kinds.pdf).toBe('PDF-Datei')
    expect(labels.kinds.image).toBe('Image')
  })
})

describe('createFileCard', () => {
  it('describes a finished file', () => {
    const api = createFileCard({ name: 'spec.pdf', mimeType: 'application/pdf', size: 2.4 * 1024 * 1024 })
    expect(api.kind).toBe('pdf')
    expect(api.status).toBe('done')
    expect(api.metaText).toBe('PDF · 2.4 MB')
    expect(api.statusText).toBe('')
    expect(api.progress).toBeNull()
    expect(api.dataAttributes).toEqual({ 'data-state': 'done', 'data-kind': 'pdf' })
  })

  it('adds duration and pixel size when known', () => {
    const api = createFileCard({
      name: 'clip.mp4',
      size: 1024,
      duration: 125,
      dimensions: { width: 1280, height: 720 },
    })
    expect(api.metaText).toBe('Video · 1 KB · 2:05 · 1,280 × 720')
  })

  it('drops invalid metadata instead of rendering blanks', () => {
    expect(createFileCard({ name: 'x.png', size: -1, duration: Number.NaN }).metaText).toBe('Image')
  })

  it('truncates the display name and flags it', () => {
    const api = createFileCard({ name: 'quarterly-financial-report-final.pdf', maxNameLength: 24 })
    expect(api.displayName).toBe('quarterly-…ort-final.pdf')
    expect(api.isTruncated).toBe(true)
    expect(createFileCard({ name: 'a.pdf' }).isTruncated).toBe(false)
  })

  it('exposes determinate progress ARIA while uploading', () => {
    const api = createFileCard({ name: 'a.zip', status: 'uploading', progress: 45.2 })
    expect(api.statusText).toBe('Uploading')
    expect(api.progress).toBe(45)
    expect(api.progressText).toBe('45%')
    expect(api.progressAriaProps).toEqual({
      role: 'progressbar',
      'aria-label': 'Uploading a.zip',
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': 45,
      'aria-valuetext': '45%',
    })
  })

  it('omits aria-valuenow when progress is unknown (indeterminate)', () => {
    const api = createFileCard({ name: 'a.zip', status: 'uploading' })
    expect(api.progress).toBeNull()
    expect(api.progressText).toBe('')
    expect(api.progressAriaProps).not.toHaveProperty('aria-valuenow')
  })

  it('ignores progress when not uploading', () => {
    expect(createFileCard({ name: 'a.zip', status: 'done', progress: 50 }).progress).toBeNull()
  })

  it('uses the error message or the default failure text', () => {
    expect(createFileCard({ name: 'a', status: 'failed', error: 'Network lost' }).statusText).toBe('Network lost')
    expect(createFileCard({ name: 'a', status: 'failed', error: '  ' }).statusText).toBe('Upload failed')
    expect(createFileCard({ name: 'a', status: 'failed' }).statusText).toBe('Upload failed')
  })

  it('localises numbers and labels', () => {
    const api = createFileCard({
      name: 'bericht.pdf',
      size: 1536,
      status: 'uploading',
      progress: 50,
      locale: 'de-DE',
      labels: { uploading: 'Wird hochgeladen', progress: (n) => `${n} wird hochgeladen`, kinds: { pdf: 'PDF' } },
    })
    expect(api.metaText).toBe('PDF · 1,5 KB')
    expect(api.statusText).toBe('Wird hochgeladen')
    expect(api.progressAriaProps['aria-label']).toBe('bericht.pdf wird hochgeladen')
  })

  it('is deterministic', () => {
    const options = { name: 'a-long-file-name-for-testing.tar.gz', size: 999_999, status: 'uploading' as const, progress: 10 }
    expect(createFileCard(options)).toEqual(createFileCard(options))
  })
})
