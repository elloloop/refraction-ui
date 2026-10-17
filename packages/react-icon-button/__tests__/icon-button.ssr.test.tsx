import { describe, it, expect, vi, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { IconButton } from '../src/index.js'

const Glyph = () => <svg data-testid="glyph" viewBox="0 0 24 24" />

function render(props: Partial<React.ComponentProps<typeof IconButton>> = {}) {
  return renderToString(<IconButton icon={<Glyph />} label="Settings" {...props} />)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('IconButton (SSR)', () => {
  it('renders a type=button <button> named by label', () => {
    const html = render()
    expect(html).toMatch(/<button[^>]*type="button"/)
    expect(html).toContain('aria-label="Settings"')
  })

  it('hides the icon and the hit-area box from assistive tech', () => {
    const html = render()
    expect(html).toMatch(/<span aria-hidden="true" data-icon-button-hit-area=""/)
    expect(html).toMatch(/<span aria-hidden="true" class="[^"]*"[^>]*><svg data-testid="glyph"/)
  })

  it('sizes the hit area to 44 px by default and to minTapTarget when given', () => {
    expect(render()).toContain('min-width:44px;min-height:44px')
    expect(render({ minTapTarget: 48 })).toContain('min-width:48px;min-height:48px')
  })

  it('positions the hit area absolutely so layout is unchanged', () => {
    const html = render()
    expect(html).toMatch(/data-icon-button-hit-area="" class="absolute /)
    expect(html).toMatch(/<button[^>]*class="[^"]*\brelative\b/)
  })

  it('sizes the glyph in rem from iconSize', () => {
    expect(render({ iconSize: 20 })).toContain('width:1.25rem;height:1.25rem')
  })

  it('is a plain button (no aria-pressed) unless pressed is given', () => {
    expect(render()).not.toContain('aria-pressed')
    expect(render({ pressed: true })).toContain('aria-pressed="true"')
    expect(render({ pressed: false })).toContain('aria-pressed="false"')
    expect(render({ pressed: true })).toContain('data-state="on"')
  })

  it('uses Button variants and maps size onto the square icon sizes', () => {
    expect(render()).toContain('hover:bg-accent') // ghost default
    expect(render({ variant: 'destructive' })).toContain('bg-destructive')
    expect(render()).toContain('h-9 w-9')
    expect(render({ size: 'sm' })).toContain('h-8 w-8')
    expect(render({ size: 'xs' })).toContain('h-7 w-7')
  })

  it('gives a pressed ghost button a fill plus a non-colour inset cue', () => {
    const html = render({ pressed: true })
    expect(html).toContain('bg-accent text-accent-foreground shadow-inner')
  })

  it('renders a visible focus ring and stops transitions under reduced motion', () => {
    const html = render()
    expect(html).toContain('focus-visible:ring-2')
    expect(html).toContain('focus-visible:ring-ring')
    expect(html).toContain('motion-reduce:transition-none')
  })

  it('renders disabled natively', () => {
    const html = render({ disabled: true })
    expect(html).toMatch(/<button[^>]*disabled=""/)
  })

  it('does not wire the tooltip as a description of the button', () => {
    const html = render()
    expect(html).not.toContain('aria-describedby')
    expect(html).not.toContain('role="tooltip"')
  })

  it('passes native attributes and className through', () => {
    const html = render({ className: 'custom', title: 'native', type: 'submit', id: 'b1' })
    expect(html).toContain('custom')
    expect(html).toContain('title="native"')
    expect(html).toContain('type="submit"')
    expect(html).toContain('id="b1"')
  })

  it('warns in development when label is empty', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render({ label: '  ' })
    expect(warn).toHaveBeenCalled()
    expect(String(warn.mock.calls[0][0])).toContain('react-icon-button/missing-label')
  })
})
