// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { RefractionComposer, type ComposerAPI } from '../src/index.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root
let reduceMotion = false

function setMatchMedia(reduce: boolean) {
  reduceMotion = reduce
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).matchMedia = (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduceMotion : false,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
    onchange: null,
  })
}

beforeEach(() => {
  setMatchMedia(false)
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.useRealTimers()
})

function render(ui: React.ReactElement) {
  act(() => root.render(ui))
}

function byLabel(label: string): HTMLElement {
  const el = container.querySelector(`[aria-label="${label}"]`)
  if (!el) throw new Error(`no element labelled ${label}`)
  return el as HTMLElement
}

function click(el: HTMLElement) {
  act(() => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })))
}

describe('inline accessory panel (interaction)', () => {
  it('toggles the inline panel open/closed without a portal', () => {
    render(
      <RefractionComposer
        placeholder="hi"
        accessoryPanel={<div data-testid="panel">EMOJI_PANEL</div>}
      />,
    )
    expect(container.querySelector('[data-testid="panel"]')).toBeNull()

    click(byLabel('Emoji and stickers'))
    const panel = container.querySelector('[data-testid="panel"]')
    expect(panel).not.toBeNull()
    // Not portaled: the panel lives inside the composer form, and the textarea
    // (the message in progress) is still present next to it.
    expect(panel!.closest('[role="form"]')).not.toBeNull()
    expect(container.querySelector('textarea')).not.toBeNull()

    click(byLabel('Emoji and stickers'))
    expect(container.querySelector('[data-testid="panel"]')).toBeNull()
  })
})

describe('attachment chip exit animation (interaction)', () => {
  it('marks the chip exiting, then removes it after the animation window', () => {
    vi.useFakeTimers()
    let api: ComposerAPI | null = null
    render(<RefractionComposer placeholder="hi" apiRef={(a) => (api = a)} maxAttachments={5} />)
    act(() => {
      api!.addAttachment({ kind: 'file', name: 'report.pdf' })
    })
    expect(container.textContent).toContain('report.pdf')

    click(byLabel('Remove attachment report.pdf'))
    // Still in the DOM, now flagged exiting (scale/opacity classes).
    const chip = container.querySelector('span.opacity-0, span[class*="opacity-0"]')
    expect(chip).not.toBeNull()
    expect(container.textContent).toContain('report.pdf')

    // After the exit window it is actually removed from core state.
    act(() => vi.advanceTimersByTime(200))
    expect(container.textContent).not.toContain('report.pdf')
  })

  it('removes immediately under reduced motion (no interpolation)', () => {
    setMatchMedia(true)
    vi.useFakeTimers()
    let api: ComposerAPI | null = null
    render(<RefractionComposer placeholder="hi" apiRef={(a) => (api = a)} maxAttachments={5} />)
    act(() => {
      api!.addAttachment({ kind: 'file', name: 'note.txt' })
    })
    expect(container.textContent).toContain('note.txt')

    click(byLabel('Remove attachment note.txt'))
    // Gone in the same tick — no exit timer scheduled.
    expect(container.textContent).not.toContain('note.txt')
  })
})
