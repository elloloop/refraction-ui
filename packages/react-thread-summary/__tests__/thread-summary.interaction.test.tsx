// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ThreadSummary } from '../src/index.js'

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

function summary(): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('button[data-slot="thread-summary"]')
  if (!el) throw new Error('thread summary not rendered')
  return el
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

const people = [
  { id: 'u1', name: 'Ada Lovelace' },
  { id: 'u2', name: 'Grace Hopper' },
]

describe('ThreadSummary (interaction, jsdom)', () => {
  it('clicking anywhere on the line opens the thread once', () => {
    const onTap = vi.fn()
    render(<ThreadSummary avatars={people} label="2 replies" detail="Last reply now" onTap={onTap} />)

    // Clicks on the decorative avatars, the label and the detail all land on the one button.
    const avatar = summary().querySelector('[data-slot="avatar"]')
    const detail = summary().querySelector('[data-slot="thread-summary-detail"]')
    click(avatar!)
    click(detail!)
    click(summary())
    expect(onTap).toHaveBeenCalledTimes(3)
  })

  it('is reachable by keyboard and keyboard activation opens the thread', () => {
    const onTap = vi.fn()
    render(<ThreadSummary label="2 replies" onTap={onTap} />)

    const button = summary()
    expect(button.tabIndex).toBe(0)
    act(() => {
      button.focus()
    })
    expect(document.activeElement).toBe(button)

    // Native <button> maps Enter/Space to a click; jsdom does not synthesise
    // that from keydown, so trigger the activation the browser would.
    act(() => {
      button.click()
    })
    expect(onTap).toHaveBeenCalledTimes(1)
  })

  it('a consumer onClick runs first and can veto onTap with preventDefault', () => {
    const order: string[] = []
    const onTap = vi.fn(() => order.push('tap'))
    render(
      <ThreadSummary
        label="2 replies"
        onClick={() => order.push('click')}
        onTap={onTap}
      />,
    )
    click(summary())
    expect(order).toEqual(['click', 'tap'])

    render(
      <ThreadSummary label="2 replies" onClick={(event) => event.preventDefault()} onTap={onTap} />,
    )
    click(summary())
    expect(onTap).toHaveBeenCalledTimes(1)
  })

  it('does not open the thread while disabled', () => {
    const onTap = vi.fn()
    render(<ThreadSummary label="2 replies" disabled onTap={onTap} />)
    click(summary())
    expect(onTap).not.toHaveBeenCalled()
  })

  it('forwards the ref to the button', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<ThreadSummary ref={ref} label="2 replies" />)
    expect(ref.current).toBe(summary())
  })

  it('updates the accessible name when the counts change', () => {
    render(<ThreadSummary label="1 reply" detail="Last reply now" />)
    expect(summary().getAttribute('aria-label')).toBe('1 reply, Last reply now')
    render(<ThreadSummary label="2 replies" detail="Last reply now" />)
    expect(summary().getAttribute('aria-label')).toBe('2 replies, Last reply now')
  })
})
