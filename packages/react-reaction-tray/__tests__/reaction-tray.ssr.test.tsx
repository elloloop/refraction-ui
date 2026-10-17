import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { ReactionTray, type ReactionTrayOption } from '../src/index.js'

const OPTIONS: ReactionTrayOption[] = [
  { id: 'like', glyph: '\u{1F44D}', label: 'Thumbs up', isActive: true },
  { id: 'heart', glyph: '❤️', label: 'Heart' },
  { id: 'laugh', glyph: '\u{1F602}', label: 'Laugh' },
  { id: 'wow', glyph: '\u{1F62E}', label: 'Wow' },
  { id: 'sad', glyph: '\u{1F622}', label: 'Sad' },
]

const render = (props: Partial<React.ComponentProps<typeof ReactionTray>> = {}) =>
  renderToString(<ReactionTray options={OPTIONS} {...props} />)

const count = (html: string, needle: RegExp) => (html.match(needle) ?? []).length

describe('ReactionTray (SSR)', () => {
  it('renders a labelled grid of rows and gridcells', () => {
    const html = render({ inlineCount: 3 })
    expect(html).toContain('role="grid"')
    expect(html).toContain('aria-label="Reactions"')
    expect(count(html, /role="row"/g)).toBe(1)
    expect(count(html, /role="gridcell"/g)).toBe(4)
  })

  it('names each option by its label and reflects isActive with aria-pressed', () => {
    const html = render({ inlineCount: 3 })
    expect(html).toContain('aria-label="Thumbs up"')
    expect(html).toContain('aria-label="Heart"')
    expect(count(html, /aria-pressed="true"/g)).toBe(1)
    expect(count(html, /aria-pressed="false"/g)).toBe(2)
    expect(html).not.toContain('aria-label="Wow"')
  })

  it('hides the glyph from assistive tech (the label is the name)', () => {
    const html = render({ inlineCount: 1 })
    expect(html).toMatch(/<span aria-hidden="true"[^>]*>\u{1F44D}<\/span>/u)
  })

  it('renders a collapsed More toggle when options overflow', () => {
    const html = render({ inlineCount: 3, moreLabel: 'Show all' })
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-label="Show all"')
    expect(html).toContain('data-state="collapsed"')
  })

  it('initiallyExpanded reveals every option and names the toggle with fewerLabel', () => {
    const html = render({ inlineCount: 2, initiallyExpanded: true, fewerLabel: 'Show less' })
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('aria-label="Show less"')
    expect(count(html, /aria-pressed=/g)).toBe(5)
    // First row = 2 inline + toggle → 3 columns; 6 cells → 2 rows.
    expect(count(html, /role="row"/g)).toBe(2)
  })

  it('omits the toggle when everything fits inline', () => {
    const html = render({ inlineCount: 10 })
    expect(html).not.toContain('aria-expanded')
    expect(html).toContain('data-state="static"')
    expect(count(html, /aria-pressed=/g)).toBe(5)
  })

  it('uses a single roving tab stop', () => {
    const html = render({ inlineCount: 3 })
    expect(count(html, /tabindex="0"/gi)).toBe(1)
    expect(count(html, /tabindex="-1"/gi)).toBe(3)
  })

  it('sizes cells in rem, never below the 44px target, and glyphs from glyphSize', () => {
    expect(render({ cellSize: 20 })).toContain('width:2.75rem;height:2.75rem')
    const html = render({ cellSize: 56, glyphSize: 32 })
    expect(html).toContain('width:3.5rem;height:3.5rem')
    expect(html).toContain('font-size:2rem')
    expect(html).not.toMatch(/font-size:\d+px/)
  })

  it('accepts a ReactNode glyph and a custom renderGlyph', () => {
    const html = render({
      options: [{ id: 'party', glyph: <img alt="" src="/party.svg" />, label: 'Party' }],
      renderGlyph: (option) => <b data-glyph={option.id}>{option.glyph}</b>,
    })
    expect(html).toContain('data-glyph="party"')
    expect(html).toContain('src="/party.svg"')
  })

  it('forwards aria-label and className to the grid', () => {
    const html = renderToString(
      <ReactionTray options={OPTIONS} aria-label="React to message" className="extra" />,
    )
    expect(html).toMatch(/^<div class="[^"]*extra"[^>]*role="grid"[^>]*aria-label="React to message"/)
  })

  it('has a visible focus ring class on every cell', () => {
    const html = render({ inlineCount: 2 })
    expect(count(html, /focus-visible:ring-2/g)).toBe(3)
  })
})
