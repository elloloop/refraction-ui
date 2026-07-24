// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { SocialAuthButton, type SocialProvider } from '../src/index.js'

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

function button(): HTMLButtonElement {
  const el = container.querySelector('button')
  if (!el) throw new Error('button not rendered')
  return el
}

describe('SocialAuthButton interaction – click callback', () => {
  it.each(['google', 'github', 'microsoft', 'apple'] as SocialProvider[])(
    'fires onClick for %s',
    (provider) => {
      const onClick = vi.fn()
      render(React.createElement(SocialAuthButton, { provider, onClick }))

      act(() => {
        button().click()
      })

      expect(onClick).toHaveBeenCalledTimes(1)
    },
  )

  it('does not fire onClick while loading', () => {
    const onClick = vi.fn()
    render(
      React.createElement(SocialAuthButton, {
        provider: 'google',
        loading: true,
        onClick,
      }),
    )

    expect(button().disabled).toBe(true)
    // Disabled buttons swallow .click() in jsdom, matching browser behavior.
    act(() => {
      button().click()
    })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn()
    render(
      React.createElement(SocialAuthButton, {
        provider: 'github',
        disabled: true,
        onClick,
      }),
    )

    expect(button().disabled).toBe(true)
    act(() => {
      button().click()
    })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('recovers interactivity when loading flips back to false', () => {
    const onClick = vi.fn()
    const props = { provider: 'microsoft' as SocialProvider, onClick }
    render(React.createElement(SocialAuthButton, { ...props, loading: true }))
    expect(button().disabled).toBe(true)

    act(() => {
      root.render(React.createElement(SocialAuthButton, { ...props, loading: false }))
    })

    expect(button().disabled).toBe(false)
    act(() => {
      button().click()
    })
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
