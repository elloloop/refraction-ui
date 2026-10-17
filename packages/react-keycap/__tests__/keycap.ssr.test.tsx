import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Keycap, KeyLegend } from '../src/index.js'

const OPTION_GLYPH = '⌥'
const COMMAND_GLYPH = '⌘'

function html(ui: React.ReactElement): string {
  return renderToString(ui)
}

/** Text inside the visually hidden name span(s). */
function srText(markup: string): string[] {
  return Array.from(markup.matchAll(/<span class="sr-only">([^<]*)<\/span>/g), (m) => m[1])
}

describe('Keycap (SSR)', () => {
  it('renders a <kbd> with default state attributes', () => {
    const out = html(<Keycap legend="K" platform="windows" />)
    expect(out).toMatch(/^<kbd /)
    expect(out).toContain('data-size="md"')
    expect(out).toContain('data-pressed="false"')
    expect(out).toContain('data-highlighted="false"')
    expect(out).not.toContain('tabindex')
  })

  it.each(['sm', 'md', 'lg'] as const)('renders size %s', (size) => {
    expect(html(<Keycap legend="K" size={size} platform="mac" />)).toContain(`data-size="${size}"`)
  })

  it('reflects pressed and highlighted', () => {
    const out = html(<Keycap legend="K" pressed highlighted platform="mac" />)
    expect(out).toContain('data-pressed="true"')
    expect(out).toContain('data-highlighted="true"')
    expect(out).toContain('translate-y-px')
    expect(out).toContain('ring-2')
  })

  it('applies minWidth and merges style and className', () => {
    const out = html(
      <Keycap legend="Space" minWidth={96} style={{ color: 'inherit' }} className="custom" platform="mac" />,
    )
    expect(out).toContain('min-width:96px')
    expect(out).toContain('color:inherit')
    expect(out).toContain('custom')
  })

  it('omits the style attribute without minWidth or style', () => {
    expect(html(<Keycap legend="K" platform="mac" />)).not.toContain('style=')
  })

  it('treats a string legend as a platform-aware KeyLegend', () => {
    const mac = html(<Keycap legend="Alt" platform="mac" />)
    expect(mac).toContain(OPTION_GLYPH)
    expect(srText(mac)).toEqual(['Option'])

    const win = html(<Keycap legend="Alt" platform="windows" />)
    expect(win).not.toContain(OPTION_GLYPH)
    expect(srText(win)).toEqual(['Alt'])
  })

  it('semanticLabel replaces the spoken name and hides the printed legend', () => {
    const out = html(
      <Keycap
        legend={<KeyLegend word="Alt" side="right" platform="mac" />}
        semanticLabel="Hold to dictate"
        platform="mac"
      />,
    )
    // The legend's own sr-only name sits inside an aria-hidden wrapper.
    expect(out).toMatch(/<kbd [^>]*><span aria-hidden="true"/)
    expect(srText(out).at(-1)).toBe('Hold to dictate')
  })

  it('renders an arbitrary node legend as-is', () => {
    const out = html(<Keycap legend={<span>Fn</span>} platform="mac" />)
    expect(out).toContain('<span>Fn</span>')
  })

  it('uses the default platform when none is injected on the server', () => {
    const out = html(<Keycap legend="Mod" />)
    expect(out).toContain('data-platform="windows"')
    expect(srText(out)).toEqual(['Ctrl'])
  })
})

describe('KeyLegend (SSR)', () => {
  it('prints the glyph but names the key for screen readers', () => {
    const out = html(<KeyLegend word="Option" side="right" platform="mac" />)
    expect(out).toContain(`<span>${OPTION_GLYPH}</span>`)
    expect(srText(out)).toEqual(['Right Option'])
    expect(srText(out)[0]).not.toContain(OPTION_GLYPH)
    expect(out).toContain('data-side="right"')
  })

  it('hides the printed glyph and side from assistive tech', () => {
    const out = html(<KeyLegend word="Alt" side="left" platform="mac" />)
    expect(out).toMatch(/<span aria-hidden="true"[^>]*><span class="[^"]*">Left<\/span><span>/)
  })

  it('prints Alt on Windows', () => {
    const out = html(<KeyLegend word="Alt" side="right" platform="windows" />)
    expect(out).toContain('<span>Alt</span>')
    expect(srText(out)).toEqual(['Right Alt'])
  })

  it('prints ⌘ or Ctrl for Mod', () => {
    expect(html(<KeyLegend word="Mod" platform="mac" />)).toContain(COMMAND_GLYPH)
    expect(html(<KeyLegend word="Mod" platform="windows" />)).toContain('<span>Ctrl</span>')
  })

  it('prints the word or both as one contiguous string', () => {
    expect(html(<KeyLegend word="Alt" show="word" platform="mac" />)).toContain('<span>Option</span>')
    expect(html(<KeyLegend word="Alt" show="both" platform="mac" />)).toContain(
      `<span>${OPTION_GLYPH} Option</span>`,
    )
  })

  it('prints a custom icon but still names the key', () => {
    const out = html(<KeyLegend word="Fn" icon={<svg data-testid="globe" />} platform="mac" />)
    expect(out).toContain('data-testid="globe"')
    expect(out).not.toContain('<span>Fn</span>')
    expect(srText(out)).toEqual(['Fn'])
  })

  it('forwards attributes and className', () => {
    const out = html(<KeyLegend word="K" id="k" className="extra" platform="windows" />)
    expect(out).toContain('id="k"')
    expect(out).toContain('extra')
  })

  it('works inline in a sentence', () => {
    const out = html(
      <p>
        Hold <Keycap legend={<KeyLegend word="Option" side="right" platform="mac" />} /> to dictate.
      </p>,
    )
    expect(out).toMatch(/^<p>Hold <kbd [^>]*>.*<\/kbd> to dictate\.<\/p>$/)
    expect(srText(out)).toEqual(['Right Option'])
  })
})
