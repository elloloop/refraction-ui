// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { resetDevFeedback } from '@refraction-ui/shared'
import { StatusBadge } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function badge(): HTMLSpanElement {
  const el = container.querySelector<HTMLSpanElement>('[data-leading]')
  if (!el) throw new Error('StatusBadge not rendered')
  return el
}

const dot = () => container.querySelector<HTMLSpanElement>('[data-live]')
const icon = () => container.querySelector('[data-status-badge-icon]')

const Check = () => <svg data-icon="check" />

/** A permission check that resolves, the way a setup screen drives the badge. */
function PermissionCheck() {
  const [checking, setChecking] = React.useState(true)
  return (
    <div>
      <StatusBadge
        role="status"
        label={checking ? 'Checking…' : 'Allowed'}
        variant={checking ? 'outline' : 'success'}
        icon={<Check />}
        pulsing={checking}
      />
      <button type="button" onClick={() => setChecking((c) => !c)}>
        Toggle
      </button>
    </div>
  )
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

describe('StatusBadge (interaction)', () => {
  it('swaps the pulsing dot for the icon when the status settles', () => {
    render(<PermissionCheck />)
    expect(badge().dataset.pulsing).toBe('true')
    expect(dot()?.dataset.live).toBe('true')
    expect(icon()).toBeNull()
    expect(badge().textContent).toBe('Checking…')

    click(container.querySelector('button')!)
    expect(badge().dataset.pulsing).toBe('false')
    expect(dot()).toBeNull()
    expect(icon()).not.toBeNull()
    expect(badge().dataset.variant).toBe('success')
    expect(badge().textContent).toBe('Allowed')
  })

  it('keeps the same root element across updates so a status region announces', () => {
    render(<PermissionCheck />)
    const before = badge()
    click(container.querySelector('button')!)
    expect(badge()).toBe(before)
    expect(before.getAttribute('role')).toBe('status')
  })

  it('always shows the label text, whatever the leading mark', () => {
    render(<StatusBadge label="Off" />)
    expect(badge().textContent).toBe('Off')
    render(<StatusBadge label="Off" dotColor="muted" />)
    expect(badge().textContent).toBe('Off')
    render(<StatusBadge label="Off" icon={<Check />} />)
    expect(badge().textContent).toBe('Off')
    render(<StatusBadge label="Off" pulsing />)
    expect(badge().textContent).toBe('Off')
  })

  it('hides the dot and the icon from assistive technology', () => {
    render(<StatusBadge label="On" dotColor="success" />)
    expect(dot()!.getAttribute('aria-hidden')).toBe('true')
    render(<StatusBadge label="On" icon={<Check />} />)
    expect(icon()!.getAttribute('aria-hidden')).toBe('true')
  })

  it('keeps the halo still under reduced motion via motion-reduce classes', () => {
    // jsdom does not evaluate media queries; assert the CSS contract the
    // browser applies under `prefers-reduced-motion: reduce`.
    render(<StatusBadge label="Checking…" pulsing />)
    const halo = container.querySelector('[data-live-dot-halo]')!
    expect(halo.className).toContain('animate-ping')
    expect(halo.className).toContain('motion-reduce:animate-none')
  })

  it('updates the dot colour when dotColor changes', () => {
    render(<StatusBadge label="Mic" dotColor="success" />)
    render(<StatusBadge label="Mic" dotColor="destructive" />)
    expect(dot()!.dataset.color).toBe('destructive')
    expect(container.querySelectorAll('.bg-success')).toHaveLength(0)
  })

  it('stays out of the tab order', () => {
    render(<StatusBadge label="Allowed" icon={<Check />} />)
    expect(badge().tabIndex).toBe(-1)
    expect(container.querySelector('[tabindex]')).toBeNull()
  })

  it('forwards its ref to the root span', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(<StatusBadge ref={ref} label="On" />)
    expect(ref.current).toBe(badge())
    expect(ref.current!.tagName).toBe('SPAN')
  })

  it('warns once in development when the label is blank', () => {
    resetDevFeedback()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<StatusBadge label="   " dotColor="success" />)
    render(<StatusBadge label="" dotColor="warning" />)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]![0])).toContain('status-badge/empty-label')
    warn.mockRestore()
  })

  it('does not warn for a real label', () => {
    resetDevFeedback()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<StatusBadge label="Allowed" />)
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
