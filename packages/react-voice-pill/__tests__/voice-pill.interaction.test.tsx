// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { VoicePill } from '../src/voice-pill.js'

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

function muteButton(): HTMLButtonElement {
  const el = container.querySelector('button')
  if (!el) throw new Error('mute button not rendered')
  return el
}

describe('VoicePill interaction – mute toggle', () => {
  it('calls onToggleMute when the toggle is clicked', () => {
    const onToggleMute = vi.fn()
    render(React.createElement(VoicePill, { label: 'Alex', onToggleMute }))

    act(() => {
      muteButton().click()
    })

    expect(onToggleMute).toHaveBeenCalledTimes(1)
  })

  it('reflects the muted prop on the toggle ARIA state', () => {
    const onToggleMute = vi.fn()
    render(
      React.createElement(VoicePill, { label: 'Alex', muted: false, onToggleMute }),
    )

    expect(muteButton().getAttribute('aria-pressed')).toBe('false')
    expect(muteButton().getAttribute('aria-label')).toBe('Mute voice')

    // Muted is controlled — the consumer flips the prop in onToggleMute.
    act(() => {
      root.render(
        React.createElement(VoicePill, { label: 'Alex', muted: true, onToggleMute }),
      )
    })

    expect(muteButton().getAttribute('aria-pressed')).toBe('true')
    expect(muteButton().getAttribute('aria-label')).toBe('Unmute voice')
  })

  it('keeps the live-region semantics on the pill root', () => {
    render(React.createElement(VoicePill, { label: 'Alex', sub: 'Listening' }))

    const pill = container.querySelector('[role="status"]')
    expect(pill).toBeTruthy()
    expect(pill!.getAttribute('aria-live')).toBe('polite')
    expect(pill!.getAttribute('aria-label')).toBe('AI: Alex, Listening')
  })
})
