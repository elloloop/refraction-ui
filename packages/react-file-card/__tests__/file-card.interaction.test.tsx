// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { FileCard } from '../src/index.js'

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

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

function keyDown(el: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function openControl(): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-file-card-open]')
  if (!el) throw new Error('open control not rendered')
  return el
}

function button(label: string): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
  if (!el) throw new Error(`${label} button not rendered`)
  return el
}

function byId(id: string): HTMLElement {
  const el = document.getElementById(id)
  if (!el) throw new Error(`#${id} not found`)
  return el
}

describe('FileCard opening', () => {
  it('opens on click when rendered as a button', () => {
    const onOpen = vi.fn()
    render(<FileCard name="spec.pdf" onOpen={onOpen} />)
    const control = openControl()
    expect(control.tagName).toBe('BUTTON')
    // A native button: the browser turns Enter and Space into this same click.
    expect((control as HTMLButtonElement).type).toBe('button')
    click(control)
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('is reachable by keyboard', () => {
    render(<FileCard name="spec.pdf" onOpen={() => {}} onDownload={() => {}} />)
    const control = openControl()
    act(() => control.focus())
    expect(document.activeElement).toBe(control)
  })

  it('opens a link on click and on Space, preventing the page scroll', () => {
    const onOpen = vi.fn()
    render(<FileCard name="spec.pdf" href="#spec" onOpen={onOpen} />)
    const control = openControl()
    expect(control.tagName).toBe('A')
    click(control)
    expect(onOpen).toHaveBeenCalledTimes(1)
    const space = keyDown(control, ' ')
    expect(space.defaultPrevented).toBe(true)
    expect(onOpen).toHaveBeenCalledTimes(2)
  })

  it('leaves other keys on a link alone (Enter is native link activation)', () => {
    const onOpen = vi.fn()
    render(<FileCard name="spec.pdf" href="#spec" onOpen={onOpen} />)
    const enter = keyDown(openControl(), 'Enter')
    expect(enter.defaultPrevented).toBe(false)
    const letter = keyDown(openControl(), 'a')
    expect(letter.defaultPrevented).toBe(false)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('hands the click event to onOpen so a preview can replace navigation', () => {
    render(<FileCard name="spec.pdf" href="#spec" onOpen={(event) => event.preventDefault()} />)
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    act(() => {
      openControl().dispatchEvent(event)
    })
    expect(event.defaultPrevented).toBe(true)
  })
})

describe('FileCard actions', () => {
  it('cancels an upload without opening the card', () => {
    const onOpen = vi.fn()
    const onCancel = vi.fn()
    render(<FileCard name="a.zip" status="uploading" progress={30} onOpen={onOpen} onCancel={onCancel} />)
    click(button('Cancel upload'))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('retries a failed upload without opening the card', () => {
    const onOpen = vi.fn()
    const onRetry = vi.fn()
    render(<FileCard name="a.zip" status="failed" onOpen={onOpen} onRetry={onRetry} />)
    click(button('Retry upload'))
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('downloads without opening the card', () => {
    const onOpen = vi.fn()
    const onDownload = vi.fn()
    render(<FileCard name="a.zip" onOpen={onOpen} onDownload={onDownload} />)
    click(button('Download'))
    expect(onDownload).toHaveBeenCalledTimes(1)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('places actions after the open control in tab order, outside it', () => {
    render(<FileCard name="a.zip" onOpen={() => {}} onDownload={() => {}} />)
    const control = openControl()
    const download = button('Download')
    expect(control.contains(download)).toBe(false)
    const focusables = Array.from(container.querySelectorAll('button, a[href]'))
    expect(focusables.indexOf(control)).toBeLessThan(focusables.indexOf(download))
  })

  it('describes each action with the full file name', () => {
    const name = 'a-really-long-archive-name-for-testing.zip'
    render(<FileCard name={name} maxNameLength={16} onOpen={() => {}} onDownload={() => {}} />)
    const describedBy = button('Download').getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    const nameEl = byId(describedBy!)
    expect(nameEl).toBe(openControl())
    expect(nameEl.querySelector('.sr-only')?.textContent).toBe(name)
  })
})

describe('FileCard state changes', () => {
  function Upload({ status, progress }: { status: 'uploading' | 'failed' | 'done'; progress?: number }) {
    return <FileCard name="a.zip" status={status} progress={progress} error="Network lost" onOpen={() => {}} />
  }

  it('updates the progress bar value as the upload advances', () => {
    render(<Upload status="uploading" progress={10} />)
    const bar = () => container.querySelector('[role="progressbar"]')
    expect(bar()?.getAttribute('aria-valuenow')).toBe('10')
    render(<Upload status="uploading" progress={80} />)
    expect(bar()?.getAttribute('aria-valuenow')).toBe('80')
    expect(bar()?.getAttribute('aria-valuetext')).toBe('80%')
  })

  it('announces transitions through the same live region and removes the bar when done', () => {
    render(<Upload status="uploading" progress={50} />)
    const statusId = openControl().getAttribute('aria-describedby')!.split(' ')[1]
    const live = byId(statusId)
    expect(live.getAttribute('role')).toBe('status')
    expect(live.textContent).toBe('Uploading')

    render(<Upload status="failed" />)
    expect(byId(statusId)).toBe(live)
    expect(live.textContent).toBe('Network lost')
    expect(container.querySelector('[role="progressbar"]')).toBeNull()

    render(<Upload status="done" />)
    expect(live.textContent).toBe('')
    expect(container.querySelector('[data-state="done"]')).not.toBeNull()
  })

  it('keeps the open control mounted (and focused) across state changes', () => {
    render(<Upload status="uploading" progress={50} />)
    const control = openControl()
    act(() => control.focus())
    render(<Upload status="done" />)
    expect(openControl()).toBe(control)
    expect(document.activeElement).toBe(control)
  })
})
