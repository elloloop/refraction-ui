// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { Keycap, KeyLegend } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const OPTION_GLYPH = '⌥'

let container: HTMLDivElement
let root: Root | undefined

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  act(() => {
    root?.unmount()
  })
  root = undefined
  container.remove()
  vi.restoreAllMocks()
})

function render(ui: React.ReactElement) {
  act(() => {
    root ??= createRoot(container)
    root.render(ui)
  })
}

function stubPlatform(platform: string) {
  vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue(platform)
  vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(platform)
}

function kbd(): HTMLElement {
  const el = container.querySelector('kbd')
  if (!el) throw new Error('kbd not rendered')
  return el
}

function spokenName(): string {
  return Array.from(container.querySelectorAll('.sr-only'))
    .filter((el) => !el.closest('[aria-hidden="true"]'))
    .map((el) => el.textContent)
    .join(' ')
}

function visibleText(): string {
  return Array.from(container.querySelectorAll('[aria-hidden="true"]'))
    .map((el) => el.textContent)
    .join('')
}

/** A key that is held while the pointer / keyboard is down — how a dictation hint uses it. */
function HoldToTalk() {
  const [held, setHeld] = React.useState(false)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => e.key === 'Alt' && setHeld(true)
    const up = (e: KeyboardEvent) => e.key === 'Alt' && setHeld(false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])
  return <Keycap legend={<KeyLegend word="Alt" side="right" platform="mac" />} pressed={held} />
}

describe('platform detection in the browser', () => {
  it('detects macOS when no platform is injected', () => {
    stubPlatform('MacIntel')
    render(<Keycap legend="Alt" />)
    expect(visibleText()).toBe(OPTION_GLYPH)
    expect(spokenName()).toBe('Option')
  })

  it('detects non-Apple platforms', () => {
    stubPlatform('Win32')
    render(<Keycap legend={<KeyLegend word="Alt" side="right" />} />)
    expect(visibleText()).toBe('RightAlt')
    expect(spokenName()).toBe('Right Alt')
  })

  it('an injected platform wins over detection', () => {
    stubPlatform('MacIntel')
    render(<Keycap legend="Mod" platform="windows" />)
    expect(visibleText()).toBe('Ctrl')
  })

  it('hydrates server markup without a mismatch, then switches to the detected platform', () => {
    const ui = <Keycap legend={<KeyLegend word="Option" side="right" />} />
    container.innerHTML = renderToString(ui)
    expect(visibleText()).toBe('RightAlt')

    stubPlatform('MacIntel')
    const onRecoverableError = vi.fn()
    act(() => {
      root = hydrateRoot(container, ui, { onRecoverableError })
    })
    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(visibleText()).toBe(`Right${OPTION_GLYPH}`)
    expect(spokenName()).toBe('Right Option')
  })
})

describe('pressed and highlighted', () => {
  it('follows a held key', () => {
    render(<HoldToTalk />)
    expect(kbd().dataset.pressed).toBe('false')

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }))
    })
    expect(kbd().dataset.pressed).toBe('true')
    expect(kbd().className).toContain('translate-y-px')

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }))
    })
    expect(kbd().dataset.pressed).toBe('false')
    expect(kbd().className).toContain('border-b-2')
  })

  it('toggles highlighted', () => {
    render(<Keycap legend="K" platform="mac" />)
    expect(kbd().className).not.toContain('ring-2')
    render(<Keycap legend="K" platform="mac" highlighted />)
    expect(kbd().dataset.highlighted).toBe('true')
    expect(kbd().className).toContain('ring-2')
  })

  it('is not focusable — it describes a key, it is not a control', () => {
    render(<Keycap legend="K" platform="mac" />)
    expect(kbd().tabIndex).toBe(-1)
    expect(kbd().getAttribute('role')).toBeNull()
  })
})

describe('refs', () => {
  it('forwards refs to the kbd and the legend span', () => {
    const keyRef = React.createRef<HTMLElement>()
    const legendRef = React.createRef<HTMLSpanElement>()
    render(<Keycap ref={keyRef} legend={<KeyLegend ref={legendRef} word="K" platform="mac" />} />)
    expect(keyRef.current?.tagName).toBe('KBD')
    expect(legendRef.current?.tagName).toBe('SPAN')
  })
})
