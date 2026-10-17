import { describe, it, expect, vi, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { ColorChip, colorFor } from '../src/index.js'

function render(props: Partial<React.ComponentProps<typeof ColorChip>> = {}) {
  return renderToString(<ColorChip label="Ada" {...props} />)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ColorChip (SSR) — read-only', () => {
  it('renders a non-interactive span with the visible label', () => {
    const html = render()
    expect(html).toMatch(/^<span/)
    expect(html).not.toContain('<button')
    expect(html).not.toContain('tabindex')
    expect(html).not.toContain('role=')
    expect(html).toContain('>Ada</span>')
    expect(html).toContain('data-editable="false"')
  })

  it('derives the colour from colorFor(label) when no dot is given', () => {
    const c = colorFor('Ada')
    const html = render()
    expect(html).toContain(`data-dot="${c}"`)
    expect(html).toContain(`bg-category-${c}-wash`)
    expect(html).toContain(`text-category-${c}-foreground`)
    expect(html).toContain(`bg-category-${c}"`)
  })

  it('uses explicit dot and wash categories', () => {
    const html = render({ dot: 2, wash: 7 })
    expect(html).toContain('data-dot="2"')
    expect(html).toContain('data-wash="7"')
    expect(html).toMatch(/aria-hidden="true" class="size-2 shrink-0 rounded-full bg-category-2"/)
    expect(html).toContain('bg-category-7-wash text-category-7-foreground')
  })

  it('hides the dot and separator from assistive tech, but not the hint', () => {
    const html = render({ hint: 'from the calendar' })
    expect(html).toMatch(/<span aria-hidden="true" class="[^"]*">·<\/span>/)
    expect(html).toMatch(/<span id="[^"]+" class="[^"]*">from the calendar<\/span>/)
  })

  it('uses semantic token classes and rem text, with no inline colours', () => {
    const html = render({ hint: 'from the calendar' })
    expect(html).toContain('text-xs')
    expect(html).not.toMatch(/#[0-9a-f]{3,6}\b|rgb\(|hsl\(/i)
  })

  it('merges className', () => {
    expect(render({ className: 'my-chip' })).toContain('my-chip')
  })
})

describe('ColorChip (SSR) — editable', () => {
  const noop = () => {}

  it('renders one type=button named by editLabel (default "Edit <label>")', () => {
    const html = render({ onEdit: noop })
    expect(html.match(/<button/g)).toHaveLength(1)
    expect(html).toMatch(/<button[^>]*type="button"/)
    expect(html).toContain('aria-label="Edit Ada"')
    expect(html).toContain('data-editable="true"')
    expect(render({ onEdit: noop, editLabel: 'Rename Ada' })).toContain('aria-label="Rename Ada"')
  })

  it('keeps the label visible inside the button', () => {
    expect(render({ onEdit: noop })).toContain('>Ada</span>')
  })

  it('has a focus-visible ring, reduced-motion guard and a 44 px hit area', () => {
    const html = render({ onEdit: noop })
    expect(html).toContain('focus-visible:ring-2')
    expect(html).toContain('focus-visible:ring-ring')
    expect(html).toContain('motion-reduce:transition-none')
    expect(html).toMatch(/<span aria-hidden="true" data-color-chip-hit-area="" class="absolute /)
    expect(html).toContain('min-width:44px;min-height:44px')
  })

  it('shows an aria-hidden pencil glyph as a non-colour edit cue', () => {
    expect(render({ onEdit: noop })).toMatch(/<svg aria-hidden="true"[^>]*data-color-chip-edit-icon=""/)
    expect(render()).not.toContain('data-color-chip-edit-icon')
  })

  it('describes the hint (aria-label hides the button text)', () => {
    const html = render({ onEdit: noop, hint: 'from the calendar' })
    const hintId = html.match(/<span id="([^"]+)" class="[^"]*">from the calendar/)?.[1]
    expect(hintId).toBeTruthy()
    expect(html).toContain(`aria-describedby="${hintId}"`)
  })

  it('adds a screen-reader copy of a tooltip that says more than the name', () => {
    const html = render({ onEdit: noop, editTooltip: 'Change name or colour' })
    const id = html.match(/<span id="([^"]+)" class="sr-only">Change name or colour<\/span>/)?.[1]
    expect(id).toBeTruthy()
    expect(html).toContain(`aria-describedby="${id}"`)
  })

  it('does not repeat a tooltip that equals the name', () => {
    const html = render({ onEdit: noop })
    expect(html).not.toContain('sr-only')
    expect(html).not.toContain('aria-describedby')
  })

  it('does not render the tooltip until it opens', () => {
    expect(render({ onEdit: noop })).not.toContain('role="tooltip"')
  })

  it('merges a consumer aria-describedby with its own', () => {
    const html = render({ onEdit: noop, hint: 'h', 'aria-describedby': 'outside' })
    expect(html).toMatch(/aria-describedby="outside [^"]+"/)
  })
})
