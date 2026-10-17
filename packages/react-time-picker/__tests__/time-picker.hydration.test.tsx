// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { TimePicker, type TimePickerProps } from '../src/index.js'
import { stubRuntimeLocale } from './stub-runtime-locale.js'

// React 19 expects this flag when running outside a browser bundler.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const t = (h: number, m = 0) => h * 60 + m
const NINE_THIRTY_PM = t(21, 30)

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
  vi.unstubAllGlobals()
})

function input(): HTMLInputElement {
  const el = container.querySelector<HTMLInputElement>('input[role="combobox"]')
  if (!el) throw new Error('input not rendered')
  return el
}

function firstOptionLabel(): string | undefined {
  return container.querySelector('[role="option"]')?.textContent ?? undefined
}

/** Server-render on `serverLocale`, then hydrate in a browser on `browserLocale`. */
function serverRenderThenHydrate(props: TimePickerProps, serverLocale: string, browserLocale: string) {
  const ui = <TimePicker aria-label="Time" step={60} {...props} />
  stubRuntimeLocale(serverLocale)
  container.innerHTML = renderToString(ui)
  const serverValue = input().value
  const serverOption = firstOptionLabel()

  vi.unstubAllGlobals()
  stubRuntimeLocale(browserLocale)
  const onRecoverableError = vi.fn()
  act(() => {
    root = hydrateRoot(container, ui, { onRecoverableError })
  })
  return { serverValue, serverOption, onRecoverableError }
}

describe('TimePicker (hydration, jsdom)', () => {
  it('hydrates without a mismatch, then switches to the runtime locale clock', () => {
    const { serverValue, serverOption, onRecoverableError } = serverRenderThenHydrate(
      { defaultValue: NINE_THIRTY_PM },
      'de-DE',
      'en-GB',
    )
    // The server ignores its own locale and renders the default (en-US) clock.
    expect(serverValue).toBe('9:30 PM')
    expect(serverOption).toBe('12:00 AM')

    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(input().value).toBe('21:30')
    expect(firstOptionLabel()).toBe('00:00')
  })

  it('keeps the default clock after hydration when the runtime locale shares it', () => {
    const { onRecoverableError } = serverRenderThenHydrate({ defaultValue: NINE_THIRTY_PM }, 'en-GB', 'en-US')
    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(input().value).toBe('9:30 PM')
  })

  it.each([
    ['locale', { locale: 'en-GB' }, '21:30', '00:00'],
    ['hourCycle', { hourCycle: 12 as const }, '9:30 PM', '12:00 AM'],
  ])('an explicit %s renders the same on server and client, with no switch', (_, props, value, option) => {
    const { serverValue, serverOption, onRecoverableError } = serverRenderThenHydrate(
      { defaultValue: NINE_THIRTY_PM, ...props },
      'en-US',
      'de-DE',
    )
    expect(serverValue).toBe(value)
    expect(serverOption).toBe(option)
    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(input().value).toBe(value)
    expect(firstOptionLabel()).toBe(option)
  })
})
