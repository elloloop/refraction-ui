// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { AppShell } from '../src/app-shell.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

// A phone-width viewport, below the default 768px mobile breakpoint, so the
// header renders its sidebar toggle.
const MOBILE_WIDTH = 375

let root: Root | undefined

beforeEach(() => {
  vi.stubGlobal('innerWidth', MOBILE_WIDTH)
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
})

afterEach(async () => {
  if (root) await act(async () => { root!.unmount() })
  root = undefined
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

describe('AppShell sidebar toggle focus (jsdom)', () => {
  it('is keyboard focusable and carries a focus ring', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    await act(async () => {
      root!.render(
        <AppShell>
          <AppShell.Main>
            <AppShell.Header>Title</AppShell.Header>
          </AppShell.Main>
        </AppShell>,
      )
    })

    const toggle = document.querySelector<HTMLButtonElement>('button[aria-label="Toggle sidebar"]')
    expect(toggle).not.toBeNull()
    expect(toggle!.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring']),
    )
    toggle!.focus()
    expect(document.activeElement).toBe(toggle)
  })
})
