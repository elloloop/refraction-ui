// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { PaneHeader, paneHeaderHeightStyle } from '../src/index.js'

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

function titleButton(): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('h2 > button')
  if (!el) throw new Error('title button not rendered')
  return el
}

/** Resolve an aria-labelledby / aria-describedby list to its text, as AT would. */
function textOf(idrefs: string | null): string {
  return (idrefs ?? '')
    .split(' ')
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ')
}

describe('PaneHeader (interaction)', () => {
  it('calls onTitleTap when the title block is clicked', () => {
    const onTitleTap = vi.fn()
    render(<PaneHeader title="Ana Ruiz" subtitle="Online" onTitleTap={onTitleTap} />)
    act(() => {
      titleButton().click()
    })
    expect(onTitleTap).toHaveBeenCalledTimes(1)
  })

  it('is a native button, so Enter/Space activate it from the keyboard', () => {
    render(<PaneHeader title="Ana Ruiz" onTitleTap={() => {}} />)
    const button = titleButton()
    // A native <button type="button"> gets Enter/Space activation from the
    // browser; jsdom does not synthesise that, so assert the element contract.
    expect(button.tagName).toBe('BUTTON')
    expect(button.type).toBe('button')
    expect(button.tabIndex).toBe(0)
  })

  it('is reachable by focus in DOM order: leading, title, actions', () => {
    render(
      <PaneHeader
        title="Ana Ruiz"
        leading={<button type="button">Back</button>}
        actions={<button type="button">Call</button>}
        onTitleTap={() => {}}
      />,
    )
    const focusables = Array.from(container.querySelectorAll<HTMLElement>('button'))
    expect(focusables.map((el) => el.textContent)).toEqual(['Back', 'Ana Ruiz', 'Call'])
    act(() => {
      focusables[1].focus()
    })
    expect(document.activeElement).toBe(titleButton())
  })

  it('names the button by the title and describes it by subtitle + hint', () => {
    render(
      <PaneHeader
        title="Ana Ruiz"
        subtitle="Online"
        avatar={<img alt="Ana Ruiz avatar" src="data:," />}
        onTitleTap={() => {}}
        titleTapHint="Show contact details"
      />,
    )
    const button = titleButton()
    expect(textOf(button.getAttribute('aria-labelledby'))).toBe('Ana Ruiz')
    expect(textOf(button.getAttribute('aria-describedby'))).toBe('Online Show contact details')
    expect(button.querySelector('img')).not.toBeNull()
  })

  it('keeps leading and actions working independently of the title button', () => {
    const onTitleTap = vi.fn()
    const onBack = vi.fn()
    const onCall = vi.fn()
    render(
      <PaneHeader
        title="Ana Ruiz"
        leading={<button type="button" onClick={onBack}>Back</button>}
        actions={<button type="button" onClick={onCall}>Call</button>}
        onTitleTap={onTitleTap}
      />,
    )
    const [back, , call] = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    act(() => {
      back.click()
      call.click()
    })
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onCall).toHaveBeenCalledTimes(1)
    expect(onTitleTap).not.toHaveBeenCalled()
  })

  it('switches between static and tappable title when onTitleTap toggles', () => {
    render(<PaneHeader title="Ana Ruiz" />)
    expect(container.querySelector('button')).toBeNull()
    expect(container.querySelector('h2')?.textContent).toBe('Ana Ruiz')
    render(<PaneHeader title="Ana Ruiz" onTitleTap={() => {}} />)
    expect(titleButton().textContent).toBe('Ana Ruiz')
  })

  it('inherits a shared height from an ancestor and lets an instance override it', () => {
    render(
      <div data-testid="split" style={paneHeaderHeightStyle('4rem')}>
        <PaneHeader title="Inbox" />
        <PaneHeader title="Thread" height={72} />
      </div>,
    )
    const split = container.querySelector<HTMLElement>('[data-testid="split"]')
    expect(split?.style.getPropertyValue('--pane-header-height')).toBe('4rem')
    const [inbox, thread] = Array.from(container.querySelectorAll<HTMLElement>('header'))
    expect(inbox.style.getPropertyValue('height')).toBe('var(--pane-header-height, 3.5rem)')
    expect(inbox.style.getPropertyValue('--pane-header-height')).toBe('')
    expect(thread.style.getPropertyValue('--pane-header-height')).toBe('72px')
  })

  it('forwards the ref to the header element', () => {
    const ref = React.createRef<HTMLElement>()
    render(<PaneHeader ref={ref} title="Ana Ruiz" />)
    expect(ref.current?.tagName).toBe('HEADER')
  })

  it('generates unique title ids for headers without an id', () => {
    render(
      <>
        <PaneHeader title="Inbox" onTitleTap={() => {}} />
        <PaneHeader title="Thread" onTitleTap={() => {}} />
      </>,
    )
    const [a, b] = Array.from(container.querySelectorAll('button')).map((el) =>
      el.getAttribute('aria-labelledby'),
    )
    expect(a).toBeTruthy()
    expect(a).not.toBe(b)
    expect(textOf(a)).toBe('Inbox')
    expect(textOf(b)).toBe('Thread')
  })
})
