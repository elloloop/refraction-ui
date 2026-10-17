import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { HighlightText, type HighlightTextProps } from '../src/index.js'

const render = (props: HighlightTextProps) => renderToString(<HighlightText {...props} />)

/** Text content of every rendered `<mark>`, in order. */
const marks = (html: string) =>
  Array.from(html.matchAll(/<mark[^>]*>([^<]*)<\/mark>/g), (m) => m[1])

/** Strip tags and React's SSR text separators to recover the visible text. */
const visibleText = (html: string) => html.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, '')

describe('HighlightText (SSR)', () => {
  it('renders a span with the plain text when nothing matches', () => {
    const html = render({ text: 'Open file', query: 'zzz' })
    expect(html).toBe('<span>Open file</span>')
  })

  it('wraps matches in <mark> with the token classes', () => {
    const html = render({ text: 'Open file', query: 'file' })
    expect(marks(html)).toEqual(['file'])
    expect(html).toContain('bg-warning')
    expect(html).toContain('text-warning-foreground')
    expect(html).toContain('font-semibold')
  })

  it('keeps the full text intact so assistive tech reads it continuously', () => {
    const text = 'Crème brûlée recipe'
    const html = render({ text, query: ['creme', 'recipe'] })
    expect(visibleText(html)).toBe(text)
    expect(marks(html)).toEqual(['Crème', 'recipe'])
  })

  it('adds no role or aria-label that would override the text', () => {
    const html = render({ text: 'Open file', query: 'file' })
    expect(html).not.toContain('role=')
    expect(html).not.toContain('aria-label')
  })

  it('applies caseSensitive, diacriticSensitive and wholeWord', () => {
    expect(marks(render({ text: 'Cat cat', query: 'cat', caseSensitive: true }))).toEqual(['cat'])
    expect(
      marks(render({ text: 'cafe café', query: 'café', diacriticSensitive: true })),
    ).toEqual(['café'])
    expect(marks(render({ text: 'concat cat', query: 'cat', wholeWord: true }))).toEqual(['cat'])
  })

  it('highlights explicit ranges', () => {
    const html = render({ text: 'Command palette', ranges: [{ start: 0, end: 3 }] })
    expect(marks(html)).toEqual(['Com'])
  })

  it('merges adjacent matches into a single mark', () => {
    expect(marks(render({ text: 'foobar', query: ['foo', 'bar'] }))).toEqual(['foobar'])
  })

  it('passes className, DOM attributes and markClassName through', () => {
    const html = render({
      text: 'Open file',
      query: 'file',
      className: 'truncate',
      id: 'result-1',
      markClassName: 'underline',
    })
    expect(html).toContain('class="truncate"')
    expect(html).toContain('id="result-1"')
    expect(html).toMatch(/<mark class="[^"]*underline"/)
  })

  it('renders an empty span for empty text', () => {
    expect(render({ text: '', query: 'a' })).toBe('<span></span>')
  })
})
