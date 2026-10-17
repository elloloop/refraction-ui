import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { StatusBadge, type StatusBadgeProps } from '../src/index.js'

const render = (props: Partial<StatusBadgeProps> = {}) =>
  renderToString(<StatusBadge label="Allowed" {...props} />)

const count = (html: string, needle: string) => html.split(needle).length - 1

const Check = () => <svg data-testid="check" viewBox="0 0 16 16" />

describe('StatusBadge (SSR)', () => {
  it('renders a span with the label and Badge outline styles by default', () => {
    const html = render()
    expect(html.startsWith('<span')).toBe(true)
    expect(html).toContain('>Allowed</span>')
    expect(html).toContain('data-status-badge-label')
    expect(html).toContain('data-variant="outline"')
    expect(html).toContain('rounded-full')
    expect(html).toContain('text-foreground')
    expect(html).toContain('text-xs')
  })

  it('adds no role, aria-busy or live region of its own', () => {
    const html = render({ pulsing: true })
    expect(html).not.toContain('role=')
    expect(html).not.toContain('aria-busy')
    expect(html).not.toContain('aria-live')
  })

  it('draws nothing before the label without icon, dot or pulsing', () => {
    const html = render()
    expect(html).toContain('data-leading="none"')
    expect(html).not.toContain('data-live=')
    expect(html).not.toContain('data-status-badge-icon')
  })

  it('draws a static, decorative LiveDot for dotColor', () => {
    const html = render({ dotColor: 'success' })
    expect(html).toContain('data-leading="dot"')
    expect(html).toContain('data-live="false"')
    expect(html).toContain('data-color="success"')
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('data-live-dot-halo')
    expect(html).not.toContain('animate-ping')
  })

  it('draws a breathing LiveDot while pulsing, with a reduced-motion hold', () => {
    const html = render({ label: 'Checking…', pulsing: true })
    expect(html).toContain('data-pulsing="true"')
    expect(html).toContain('data-live="true"')
    expect(html).toContain('data-color="pending"')
    expect(html).toContain('animate-ping')
    expect(html).toContain('motion-reduce:animate-none')
    expect(html).toContain('Checking…')
  })

  it('keeps dotColor while pulsing', () => {
    const html = render({ pulsing: true, dotColor: 'info' })
    expect(html).toContain('data-color="info"')
    expect(count(html, 'bg-info')).toBe(2)
  })

  it('renders the icon hidden from assistive technology', () => {
    const html = render({ icon: <Check /> })
    expect(html).toContain('data-leading="icon"')
    expect(html).toMatch(/<span aria-hidden="true" data-status-badge-icon=""[^>]*><svg data-testid="check"/)
  })

  it('shows the icon instead of a static dot', () => {
    const html = render({ icon: <Check />, dotColor: 'success' })
    expect(html).toContain('data-testid="check"')
    expect(html).not.toContain('data-live=')
  })

  it('shows the pulsing dot instead of the icon', () => {
    const html = render({ icon: <Check />, pulsing: true })
    expect(html).toContain('data-live="true"')
    expect(html).not.toContain('data-testid="check"')
  })

  it('treats false / null / empty icons as no icon', () => {
    for (const icon of [false, null, '']) {
      const html = render({ icon, dotColor: 'warning' })
      expect(html).toContain('data-leading="dot"')
      expect(html).not.toContain('data-status-badge-icon')
    }
  })

  it("applies Badge's variant colours", () => {
    const html = render({ variant: 'success' })
    expect(html).toContain('data-variant="success"')
    expect(html).toContain('bg-success')
    expect(html).toContain('text-success-foreground')
  })

  it('merges className and passes through HTML attributes', () => {
    const html = render({ className: 'ml-2', id: 'mic', title: 'Microphone' })
    expect(html).toContain('ml-2')
    expect(html).toContain('id="mic"')
    expect(html).toContain('title="Microphone"')
  })

  it('lets a consumer opt into a polite status region', () => {
    expect(render({ role: 'status' })).toContain('role="status"')
  })

  it('is not focusable', () => {
    expect(render({ icon: <Check /> })).not.toContain('tabindex')
  })
})
