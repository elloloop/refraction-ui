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
import { TOAST_ANNOUNCEMENT_LIFETIME_MS, type ToastOptions } from '@refraction-ui/toast'

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

/** The rendered toasts (not the live-region announcements). */
function toastEls(): HTMLElement[] {
  return Array.from(container.querySelectorAll('[data-rfr-toast]'))
}

/** Text of the rendered toasts only, so lingering announcements do not count. */
function toastText(): string {
  return toastEls()
    .map((el) => el.textContent)
    .join('\n')
}

function showToast(message: string, opts?: ToastOptions): string {
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
    expect(toastText()).toContain('Saved!')
    expect(toastEls()).toHaveLength(1)
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
    const alert = toastEls()[0]
    expect(alert).toBeDefined()
    expect(alert!.className).toContain('from-destructive/10')
  })
})

describe('useToast – queue', () => {
  it('queues multiple toasts in insertion order', () => {
    renderToaster()
    showToast('First')
    showToast('Second')
    showToast('Third')

    const texts = toastEls().map((el) => el.textContent)
    expect(toastEls()).toHaveLength(3)
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

    const texts = toastEls().map((el) => el.textContent)
    expect(toastEls()).toHaveLength(2)
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

    expect(toastEls()).toHaveLength(1)
    expect(toastText()).not.toContain('Bye')
    expect(toastText()).toContain('Stay')
  })

  it('dismissing an unknown id leaves the queue untouched', () => {
    renderToaster()
    showToast('Still here')

    act(() => {
      toastApi.dismiss('does-not-exist')
    })

    expect(toastEls()).toHaveLength(1)
    expect(toastText()).toContain('Still here')
  })

  it('clicking the dismiss button removes the toast', () => {
    renderToaster()
    showToast('Click away')

    const button = container.querySelector('button[aria-label="Dismiss"]')
    expect(button).not.toBeNull()
    click(button!)

    expect(toastEls()).toHaveLength(0)
    expect(toastText()).not.toContain('Click away')
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
    expect(toastEls()).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(toastEls()).toHaveLength(0)
  })

  it('auto-dismisses after a custom duration', () => {
    vi.useFakeTimers()
    renderToaster()
    showToast('Quick', { duration: 500 })

    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(toastEls()).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(toastEls()).toHaveLength(0)
  })

  it('auto-dismisses queued toasts independently', () => {
    vi.useFakeTimers()
    renderToaster()
    showToast('Short', { duration: 100 })
    showToast('Long', { duration: 5000 })

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(toastEls()).toHaveLength(1)
    expect(toastText()).toContain('Long')

    act(() => {
      vi.advanceTimersByTime(4900)
    })
    expect(toastEls()).toHaveLength(0)
  })

  it('duration 0 disables auto-dismiss', () => {
    vi.useFakeTimers()
    renderToaster()
    showToast('Sticky', { duration: 0 })

    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(toastEls()).toHaveLength(1)
    expect(toastText()).toContain('Sticky')
  })

  it('a manually dismissed toast stays gone after its timer would have fired', () => {
    vi.useFakeTimers()
    renderToaster()
    const id = showToast('Early dismiss', { duration: 1000 })

    act(() => {
      toastApi.dismiss(id)
    })
    expect(toastEls()).toHaveLength(0)

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(toastEls()).toHaveLength(0)
  })
})

describe('ARIA live region', () => {
  function announcer(politeness: 'polite' | 'assertive'): HTMLElement {
    const el = container.querySelector<HTMLElement>(`[data-rfr-toast-announcer="${politeness}"]`)
    expect(el).not.toBeNull()
    return el!
  }

  it('the Toaster is a labelled landmark region', () => {
    renderToaster()
    const region = container.querySelector('[role="region"]')
    expect(region).not.toBeNull()
    expect(region!.getAttribute('aria-label')).toBe('Notifications')
    expect(region!.className).toContain('fixed')
  })

  it('the region label can be replaced (e.g. translated)', () => {
    render(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Toaster, { 'aria-label': 'Benachrichtigungen' }),
      ),
    )
    expect(container.querySelector('[role="region"]')!.getAttribute('aria-label')).toBe(
      'Benachrichtigungen',
    )
  })

  it('both live regions exist before any toast, so the first toast is announced', () => {
    renderToaster()
    expect(announcer('polite').getAttribute('aria-live')).toBe('polite')
    expect(announcer('assertive').getAttribute('aria-live')).toBe('assertive')
    for (const el of [announcer('polite'), announcer('assertive')]) {
      expect(el.getAttribute('aria-relevant')).toBe('additions')
      expect(el.className).toContain('sr-only')
      expect(el.textContent).toBe('')
    }
  })

  it('announces a routine toast politely, with its title, message and action', () => {
    renderToaster()
    showToast('One conversation moved to the archive', {
      variant: 'success',
      title: 'Archived',
      action: { label: 'Undo', onClick: () => {} },
    })
    expect(announcer('polite').textContent).toBe(
      'Archived. One conversation moved to the archive. Undo',
    )
    expect(announcer('assertive').textContent).toBe('')
  })

  it('announces an error assertively', () => {
    renderToaster()
    showToast('Could not send', { variant: 'error' })
    expect(announcer('assertive').textContent).toBe('Could not send')
    expect(announcer('polite').textContent).toBe('')
  })

  it('announces each toast once, even as the list changes', () => {
    renderToaster()
    showToast('First')
    showToast('Second')
    const lines = Array.from(announcer('polite').children).map((el) => el.textContent)
    expect(lines).toEqual(['First', 'Second'])
  })

  it('removes an announcement once it has been read, keeping the toast', () => {
    vi.useFakeTimers()
    renderToaster()
    showToast('Saved', { duration: 0 })
    expect(announcer('polite').textContent).toBe('Saved')

    act(() => {
      vi.advanceTimersByTime(TOAST_ANNOUNCEMENT_LIFETIME_MS)
    })
    expect(announcer('polite').textContent).toBe('')
    expect(toastText()).toContain('Saved')
  })

  it('toasts inside the Toaster are not live regions themselves (no double announcement)', () => {
    renderToaster()
    showToast('Announce me once')
    const toast = toastEls()[0]!
    expect(toast.getAttribute('role')).toBeNull()
    expect(toast.getAttribute('aria-live')).toBeNull()
    expect(container.querySelector('[role="alert"]')).toBeNull()
  })

  it('a standalone Toast stays an assertive, atomic alert (backward compatible)', () => {
    render(
      React.createElement(Toast, {
        entry: { id: 'solo', message: 'Solo', variant: 'default', duration: 0, createdAt: 0 },
      }),
    )
    const alert = container.querySelector('[role="alert"]')
    expect(alert).not.toBeNull()
    expect(alert!.getAttribute('aria-live')).toBe('assertive')
    expect(alert!.getAttribute('aria-atomic')).toBe('true')
  })
})

describe('title', () => {
  it('renders the title above the message', () => {
    renderToaster()
    showToast('Your changes were saved', { title: 'Saved' })
    const toast = toastEls()[0]!
    const title = toast.querySelector('.font-semibold')
    expect(title?.textContent).toBe('Saved')
    expect(title?.nextElementSibling?.textContent).toBe('Your changes were saved')
  })

  it('without a title, renders the message as before', () => {
    renderToaster()
    showToast('Plain')
    const toast = toastEls()[0]!
    expect(toast.querySelector('.font-semibold')).toBeNull()
    expect(toast.querySelector('.flex-1')?.textContent).toBe('Plain')
  })
})

describe('action', () => {
  function actionButton(label: string): HTMLButtonElement {
    const button = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === label,
    )
    expect(button).toBeDefined()
    return button as HTMLButtonElement
  }

  it('renders the action as a native button named by its label', () => {
    renderToaster()
    showToast('Message deleted', { action: { label: 'Undo', onClick: () => {} } })
    const button = actionButton('Undo')
    expect(button.type).toBe('button')
    expect(button.className).toContain('focus-visible:ring-2')
  })

  it('runs the callback once and closes the toast', () => {
    renderToaster()
    const onClick = vi.fn()
    showToast('Message deleted', { action: { label: 'Undo', onClick } })
    click(actionButton('Undo'))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(toastEls()).toHaveLength(0)
  })

  it('dismisses before running the callback', () => {
    const calls: string[] = []
    render(
      React.createElement(Toast, {
        entry: {
          id: 'undo-1',
          message: 'Message deleted',
          variant: 'default',
          duration: 0,
          createdAt: 0,
          action: { label: 'Undo', onClick: () => calls.push('action') },
        },
        onDismiss: (id: string) => calls.push(`dismiss:${id}`),
      }),
    )
    click(actionButton('Undo'))
    expect(calls).toEqual(['dismiss:undo-1', 'action'])
  })

  it('a toast without an action renders only the dismiss button', () => {
    renderToaster()
    showToast('Saved')
    const buttons = toastEls()[0]!.querySelectorAll('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]!.getAttribute('aria-label')).toBe('Dismiss')
  })
})

describe('keyboard', () => {
  function keyDown(el: Element, key: string) {
    act(() => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
    })
  }

  it('Escape on a focused toast dismisses it', () => {
    renderToaster()
    showToast('Press Escape', { duration: 0 })
    const button = toastEls()[0]!.querySelector('button')!
    act(() => button.focus())
    keyDown(button, 'Escape')
    expect(toastEls()).toHaveLength(0)
  })

  it('other keys leave the toast open', () => {
    renderToaster()
    showToast('Stay open', { duration: 0 })
    const button = toastEls()[0]!.querySelector('button')!
    keyDown(button, 'Enter')
    expect(toastEls()).toHaveLength(1)
  })

  it('the dismiss button uses a keyboard-only focus ring and a replaceable name', () => {
    render(
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Probe),
        React.createElement(Toaster, { dismissLabel: 'Schließen' }),
      ),
    )
    showToast('Hallo')
    const button = toastEls()[0]!.querySelector('button')!
    expect(button.getAttribute('aria-label')).toBe('Schließen')
    expect(button.className).toContain('focus-visible:ring-2')
    expect(button.querySelector('[aria-hidden="true"]')?.textContent).toBe('\u00d7')
  })
})

describe('pause while hovered or focused', () => {
  // React derives enter/leave from over/out events whose other end is outside its tree.
  function hover(el: Element) {
    act(() => {
      el.dispatchEvent(
        new MouseEvent('mouseover', { bubbles: true, relatedTarget: document.body }),
      )
    })
  }

  function unhover(el: Element) {
    act(() => {
      el.dispatchEvent(
        new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }),
      )
    })
  }

  function advance(ms: number) {
    act(() => {
      vi.advanceTimersByTime(ms)
    })
  }

  it('hovering pauses the countdown; leaving finishes the time that was left', () => {
    vi.useFakeTimers()
    renderToaster()
    showToast('Hover me', { duration: 1000 })
    advance(400)
    hover(toastEls()[0]!)
    advance(10_000)
    expect(toastEls()).toHaveLength(1)

    unhover(toastEls()[0]!)
    advance(599)
    expect(toastEls()).toHaveLength(1)
    advance(1)
    expect(toastEls()).toHaveLength(0)
  })

  it('focus inside the toast pauses the countdown until focus leaves', () => {
    vi.useFakeTimers()
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    renderToaster()
    showToast('Focus me', { duration: 1000 })
    act(() => toastEls()[0]!.querySelector('button')!.focus())
    advance(10_000)
    expect(toastEls()).toHaveLength(1)

    act(() => outside.focus())
    advance(1000)
    expect(toastEls()).toHaveLength(0)
    outside.remove()
  })

  it('stays paused while either hover or focus holds it', () => {
    vi.useFakeTimers()
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    renderToaster()
    showToast('Both', { duration: 1000 })
    const toast = toastEls()[0]!
    hover(toast)
    act(() => toast.querySelector('button')!.focus())
    unhover(toast)
    advance(10_000)
    expect(toastEls()).toHaveLength(1)
    act(() => outside.focus())
    advance(1000)
    expect(toastEls()).toHaveLength(0)
    outside.remove()
  })

  it('a toast that unmounts while hovered hands its countdown back', () => {
    vi.useFakeTimers()
    const tree = (withToaster: boolean) =>
      React.createElement(
        ToastProvider,
        null,
        React.createElement(Probe),
        withToaster ? React.createElement(Toaster) : null,
      )
    render(tree(true))
    showToast('Paused then unmounted', { duration: 1000 })
    hover(toastEls()[0]!)
    render(tree(false))
    advance(1000)
    expect(toastApi.toasts).toHaveLength(0)
  })
})

describe('focus restore', () => {
  function setup() {
    const trigger = document.createElement('button')
    trigger.textContent = 'Trigger'
    document.body.appendChild(trigger)
    renderToaster()
    act(() => trigger.focus())
    return trigger
  }

  it('returns focus to where it came from when the focused toast is dismissed', () => {
    const trigger = setup()
    showToast('Dismiss me', { duration: 0 })
    const dismissButton = toastEls()[0]!.querySelector<HTMLButtonElement>(
      'button[aria-label="Dismiss"]',
    )!
    act(() => dismissButton.focus())
    click(dismissButton)
    expect(toastEls()).toHaveLength(0)
    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })

  it('returns focus after Escape', () => {
    const trigger = setup()
    showToast('Escape me', { duration: 0 })
    const button = toastEls()[0]!.querySelector('button')!
    act(() => button.focus())
    act(() => {
      button.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      )
    })
    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })

  it('leaves focus alone when the action moved it somewhere else', () => {
    const trigger = setup()
    const elsewhere = document.createElement('input')
    document.body.appendChild(elsewhere)
    showToast('Message deleted', {
      duration: 0,
      action: { label: 'Undo', onClick: () => elsewhere.focus() },
    })
    const undo = Array.from(toastEls()[0]!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Undo',
    )!
    act(() => undo.focus())
    click(undo)
    expect(toastEls()).toHaveLength(0)
    expect(document.activeElement).toBe(elsewhere)
    elsewhere.remove()
    trigger.remove()
  })

  it('does not move focus when a toast closes without holding it', () => {
    const trigger = setup()
    const id = showToast('Not focused', { duration: 0 })
    const other = document.createElement('input')
    document.body.appendChild(other)
    act(() => other.focus())
    act(() => {
      toastApi.dismiss(id)
    })
    expect(document.activeElement).toBe(other)
    other.remove()
    trigger.remove()
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
