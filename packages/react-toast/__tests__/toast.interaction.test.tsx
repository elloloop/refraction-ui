// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  ToastProvider,
  Toaster,
  Toast,
  useToast,
  type UseToastReturn,
  type ToastEntry,
} from '../src/toast.js'

// React 19 expects this flag when running tests outside a browser bundler.
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
  vi.useRealTimers()
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

/** Captures the useToast() API exposed by the nearest provider. */
let toastApi: UseToastReturn
function Probe() {
  toastApi = useToast()
  return null
}

function renderToaster() {
  render(
    React.createElement(
      ToastProvider,
      null,
      React.createElement(Probe),
      React.createElement(Toaster),
    ),
  )
}

function alerts(): HTMLElement[] {
  return Array.from(container.querySelectorAll('[role="alert"]'))
}

function showToast(
  message: string,
  opts?: { variant?: 'default' | 'success' | 'error' | 'warning'; duration?: number },
): string {
  let id = ''
  act(() => {
    id = toastApi.toast(message, opts)
  })
  return id
}

describe('useToast – show', () => {
  it('shows a toast inside the Toaster', () => {
    renderToaster()
    showToast('Saved!')
    expect(container.textContent).toContain('Saved!')
    expect(alerts()).toHaveLength(1)
  })

  it('returns a unique id for each toast', () => {
    renderToaster()
    const id1 = showToast('one')
    const id2 = showToast('two')
    expect(id1).toBeTruthy()
    expect(id2).toBeTruthy()
    expect(id1).not.toBe(id2)
  })

  it('exposes current entries through the hook', () => {
    renderToaster()
    showToast('first', { variant: 'success', duration: 5000 })
    expect(toastApi.toasts).toHaveLength(1)
    expect(toastApi.toasts[0]?.message).toBe('first')
    expect(toastApi.toasts[0]?.variant).toBe('success')
    expect(toastApi.toasts[0]?.duration).toBe(5000)
  })

  it('renders the variant styling passed to toast()', () => {
    renderToaster()
    showToast('Broke', { variant: 'error' })
    const alert = alerts()[0]
    expect(alert).toBeDefined()
    expect(alert!.className).toContain('bg-red-50')
  })
})

describe('useToast – queue', () => {
  it('queues multiple toasts in insertion order', () => {
    renderToaster()
    showToast('First')
    showToast('Second')
    showToast('Third')

    const texts = alerts().map((el) => el.textContent)
    expect(alerts()).toHaveLength(3)
    expect(texts[0]).toContain('First')
    expect(texts[1]).toContain('Second')
    expect(texts[2]).toContain('Third')
  })

  it('keeps the remaining queue order after dismissing the middle toast', () => {
    renderToaster()
    showToast('First')
    const middle = showToast('Middle')
    showToast('Last')

    act(() => {
      toastApi.dismiss(middle)
    })

    const texts = alerts().map((el) => el.textContent)
    expect(alerts()).toHaveLength(2)
    expect(texts[0]).toContain('First')
    expect(texts[1]).toContain('Last')
  })
})

describe('useToast – dismiss', () => {
  it('dismiss(id) removes only the targeted toast', () => {
    renderToaster()
    const id = showToast('Bye')
    showToast('Stay')

    act(() => {
      toastApi.dismiss(id)
    })

    expect(alerts()).toHaveLength(1)
    expect(container.textContent).not.toContain('Bye')
    expect(container.textContent).toContain('Stay')
  })

  it('dismissing an unknown id leaves the queue untouched', () => {
    renderToaster()
    showToast('Still here')

    act(() => {
      toastApi.dismiss('does-not-exist')
    })

    expect(alerts()).toHaveLength(1)
    expect(container.textContent).toContain('Still here')
  })

  it('clicking the dismiss button removes the toast', () => {
    renderToaster()
    showToast('Click away')

    const button = container.querySelector('button[aria-label="Dismiss"]')
    expect(button).not.toBeNull()
    click(button!)

    expect(alerts()).toHaveLength(0)
    expect(container.textContent).not.toContain('Click away')
  })
})

describe('auto-dismiss timing', () => {
  it('auto-dismisses after the default duration of 3000ms', () => {
    vi.useFakeTimers()
    renderToaster()
    showToast('Default duration')

    act(() => {
      vi.advanceTimersByTime(2999)
    })
    expect(alerts()).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(alerts()).toHaveLength(0)
  })

  it('auto-dismisses after a custom duration', () => {
    vi.useFakeTimers()
    renderToaster()
    showToast('Quick', { duration: 500 })

    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(alerts()).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(alerts()).toHaveLength(0)
  })

  it('auto-dismisses queued toasts independently', () => {
    vi.useFakeTimers()
    renderToaster()
    showToast('Short', { duration: 100 })
    showToast('Long', { duration: 5000 })

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(alerts()).toHaveLength(1)
    expect(container.textContent).toContain('Long')

    act(() => {
      vi.advanceTimersByTime(4900)
    })
    expect(alerts()).toHaveLength(0)
  })

  it('duration 0 disables auto-dismiss', () => {
    vi.useFakeTimers()
    renderToaster()
    showToast('Sticky', { duration: 0 })

    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(alerts()).toHaveLength(1)
    expect(container.textContent).toContain('Sticky')
  })

  it('a manually dismissed toast stays gone after its timer would have fired', () => {
    vi.useFakeTimers()
    renderToaster()
    const id = showToast('Early dismiss', { duration: 1000 })

    act(() => {
      toastApi.dismiss(id)
    })
    expect(alerts()).toHaveLength(0)

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(alerts()).toHaveLength(0)
  })
})

describe('ARIA live region', () => {
  it('renders each toast as an assertive, atomic alert', () => {
    renderToaster()
    showToast('Announce me')

    const alert = alerts()[0]
    expect(alert).toBeDefined()
    expect(alert!.getAttribute('aria-live')).toBe('assertive')
    expect(alert!.getAttribute('aria-atomic')).toBe('true')
  })

  it('renders alerts inside the fixed Toaster container', () => {
    renderToaster()
    showToast('Contained')

    const toaster = container.querySelector('.fixed')
    expect(toaster).not.toBeNull()
    expect(toaster!.querySelector('[role="alert"]')).not.toBeNull()
  })
})

describe('Toast action button (standalone)', () => {
  function makeEntry(overrides: Partial<ToastEntry> = {}): ToastEntry {
    return {
      id: 'standalone-1',
      message: 'Standalone',
      variant: 'default',
      duration: 0,
      createdAt: 0,
      ...overrides,
    }
  }

  it('calls onDismiss with the entry id when the button is clicked', () => {
    const onDismiss = vi.fn()
    render(
      React.createElement(Toast, { entry: makeEntry({ id: 'toast-42' }), onDismiss }),
    )

    click(container.querySelector('button[aria-label="Dismiss"]')!)
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(onDismiss).toHaveBeenCalledWith('toast-42')
  })

  it('renders custom children (action slot) next to the dismiss button', () => {
    render(
      React.createElement(
        Toast,
        { entry: makeEntry(), onDismiss: () => {} },
        React.createElement('button', null, 'Undo'),
      ),
    )
    expect(container.textContent).toContain('Undo')
    expect(container.querySelector('button[aria-label="Dismiss"]')).not.toBeNull()
  })
})
