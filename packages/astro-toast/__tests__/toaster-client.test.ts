import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getToastAnnouncement,
  toastActionClass,
  toastCloseClass,
  toastContentClass,
  toastDescriptionClass,
  toastTitleClass,
  toastVariants,
  DEFAULT_TOAST_DISMISS_LABEL,
  DEFAULT_TOAST_DURATION,
  TOAST_ANNOUNCEMENT_LIFETIME_MS,
} from '@refraction-ui/toast'
import {
  initToasters,
  installToaster,
  showToast,
  TOAST_ACTION_EVENT,
  TOAST_DISMISS_EVENT,
  TOAST_EXIT_MS,
} from '../src/toaster-client.js'

// The markup Toaster.astro renders (its SSR output is checked in the Astro
// meta package's render tests); the client script drives it from here.
const TOASTER = (inner = '', attrs = '') => `
  <div data-rfr-toaster role="region" aria-label="Notifications" ${attrs}>
    <div aria-live="polite" aria-atomic="false" aria-relevant="additions" data-rfr-toast-announcer="polite"></div>
    <div aria-live="assertive" aria-atomic="false" aria-relevant="additions" data-rfr-toast-announcer="assertive"></div>
    ${inner}
  </div>`

// The markup Toast.astro renders for a toast with a title and an action.
const SERVER_TOAST = (attrs = 'data-rfr-toast-variant="success" data-rfr-toast-duration="5000"') => `
  <div data-rfr-toast ${attrs} role="alert" aria-live="assertive" aria-atomic="true">
    <div class="flex-1">
      <div data-rfr-toast-title> Draft deleted </div>
      <div data-rfr-toast-message> It is no longer in your drafts. </div>
    </div>
    <button type="button" data-rfr-toast-action> Undo </button>
    <button type="button" data-rfr-toast-dismiss aria-label="Dismiss"><span aria-hidden="true">&times;</span></button>
  </div>`

function mount(html: string): void {
  document.body.innerHTML = `<button type="button" id="trigger">Save</button>${html}`
}

const toaster = () => document.querySelector<HTMLElement>('[data-rfr-toaster]')!
const toasts = () => Array.from(document.querySelectorAll<HTMLElement>('[data-rfr-toast]'))
const lastToast = () => toasts().at(-1)!
const announcer = (politeness: 'polite' | 'assertive') =>
  toaster().querySelector<HTMLElement>(`[data-rfr-toast-announcer="${politeness}"]`)!
const button = (root: ParentNode, selector: string) => root.querySelector<HTMLButtonElement>(selector)!

function press(target: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}

/** Let a closing toast finish its exit transition. */
function finishExit(): void {
  vi.advanceTimersByTime(TOAST_EXIT_MS)
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
  delete window.__rfr_toast
  // jsdom has no matchMedia; a test that stubs it removes it again.
  Reflect.deleteProperty(window, 'matchMedia')
})

describe('programmatic toasts (window.__rfr_toast)', () => {
  it('installs the global, which accepts a bare message', () => {
    mount(TOASTER())
    installToaster(window)
    expect(typeof window.__rfr_toast).toBe('function')

    window.__rfr_toast!('Saved')

    expect(lastToast().textContent).toContain('Saved')
    expect(lastToast().getAttribute('data-rfr-toast-variant')).toBe('default')
    expect(lastToast().getAttribute('data-rfr-toast-duration')).toBe(String(DEFAULT_TOAST_DURATION))
  })

  it('renders the title, message, action and dismiss button with the shared styles', () => {
    mount(TOASTER())
    showToast({
      message: 'It is no longer in your drafts.',
      title: 'Draft deleted',
      variant: 'success',
      action: { label: 'Undo', onClick: () => {} },
    })

    const toast = lastToast()
    expect(toast.className).toBe(toastVariants({ variant: 'success' }))
    const title = toast.querySelector('[data-rfr-toast-title]')!
    expect(title.className).toBe(toastTitleClass)
    expect(title.textContent).toBe('Draft deleted')
    const message = toast.querySelector('[data-rfr-toast-message]')!
    expect(message.className).toBe(toastDescriptionClass)
    expect(message.textContent).toBe('It is no longer in your drafts.')

    const action = button(toast, '[data-rfr-toast-action]')
    expect(action.type).toBe('button')
    expect(action.className).toBe(toastActionClass)
    expect(action.textContent).toBe('Undo')

    const dismiss = button(toast, '[data-rfr-toast-dismiss]')
    expect(dismiss.type).toBe('button')
    expect(dismiss.className).toBe(toastCloseClass)
    expect(dismiss.getAttribute('aria-label')).toBe(DEFAULT_TOAST_DISMISS_LABEL)
    expect(dismiss.querySelector('[aria-hidden="true"]')?.textContent).toBe('×')
  })

  it('keeps a message without a title unstyled, as the React toast does', () => {
    mount(TOASTER())
    showToast({ message: 'Saved' })

    const message = lastToast().querySelector('[data-rfr-toast-message]')!
    expect(message.className).toBe(toastContentClass)
    expect(message.textContent).toBe('Saved')
    expect(lastToast().querySelector('[data-rfr-toast-title]')).toBeNull()
    expect(lastToast().querySelector('[data-rfr-toast-action]')).toBeNull()
  })

  it('names the dismiss button with the toaster dismissLabel', () => {
    mount(TOASTER('', 'data-rfr-toast-dismiss-label="Schließen"'))
    showToast('Gespeichert')

    expect(button(lastToast(), '[data-rfr-toast-dismiss]').getAttribute('aria-label')).toBe('Schließen')
  })

  it('gives an unknown variant from a plain script the default look', () => {
    mount(TOASTER())
    showToast({ message: 'Hello', variant: 'info' as never })

    expect(lastToast().getAttribute('data-rfr-toast-variant')).toBe('default')
    expect(lastToast().className).toBe(toastVariants({ variant: 'default' }))
  })

  it('warns and shows nothing when the page has no toaster', () => {
    mount('')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    showToast('Saved')

    expect(toasts()).toHaveLength(0)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('No <Toaster />'))
  })
})

describe('announcements', () => {
  it('announces a toast once through the polite region, then removes the text', () => {
    mount(TOASTER())
    showToast({ message: 'It is no longer in your drafts.', title: 'Draft deleted', variant: 'success', action: { label: 'Undo', onClick: () => {} } })

    expect(announcer('polite').textContent).toBe('Draft deleted. It is no longer in your drafts. Undo')
    expect(announcer('assertive').textContent).toBe('')

    vi.advanceTimersByTime(TOAST_ANNOUNCEMENT_LIFETIME_MS)
    expect(announcer('polite').textContent).toBe('')
    expect(lastToast().textContent).toContain('It is no longer in your drafts.')
  })

  it('announces errors through the assertive region', () => {
    mount(TOASTER())
    showToast({ message: 'Upload failed', variant: 'error' })

    expect(announcer('assertive').textContent).toBe('Upload failed')
    expect(announcer('polite').textContent).toBe('')
  })

  it('takes the live role off a server-rendered toast in a toaster and announces it instead', () => {
    mount(TOASTER(SERVER_TOAST()))
    initToasters()

    const toast = lastToast()
    expect(toast.hasAttribute('role')).toBe(false)
    expect(toast.hasAttribute('aria-live')).toBe(false)
    expect(toast.hasAttribute('aria-atomic')).toBe(false)
    expect(announcer('polite').textContent).toBe(
      getToastAnnouncement({
        title: 'Draft deleted',
        message: 'It is no longer in your drafts.',
        action: { label: 'Undo', onClick: () => {} },
      }),
    )
  })

  it('leaves a toast outside any toaster as its own alert', () => {
    mount(SERVER_TOAST())
    initToasters()

    expect(lastToast().getAttribute('role')).toBe('alert')
    expect(lastToast().getAttribute('aria-live')).toBe('assertive')
  })

  it('sets up and announces each toast only once, however often it runs', () => {
    mount(TOASTER(SERVER_TOAST()))
    initToasters()
    initToasters()
    document.dispatchEvent(new Event('astro:after-swap'))

    expect(announcer('polite').children).toHaveLength(1)
  })
})

describe('auto-dismiss', () => {
  it('closes after its duration: the dismiss event fires, then the toast fades out and is removed', () => {
    mount(TOASTER())
    const dismissed = vi.fn()
    document.addEventListener(TOAST_DISMISS_EVENT, dismissed)
    showToast({ message: 'Saved', duration: 2000 })

    vi.advanceTimersByTime(1999)
    expect(dismissed).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(dismissed).toHaveBeenCalledTimes(1)
    expect(lastToast().style.opacity).toBe('0')

    finishExit()
    expect(toasts()).toHaveLength(0)
    document.removeEventListener(TOAST_DISMISS_EVENT, dismissed)
  })

  it('keeps a toast with duration 0 until it is dismissed', () => {
    mount(TOASTER())
    showToast({ message: 'Stays', duration: 0 })

    vi.advanceTimersByTime(60_000)
    expect(toasts()).toHaveLength(1)
  })

  it('removes the toast at once, without the exit transition, when motion is reduced', () => {
    mount(TOASTER())
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({ matches: query === '(prefers-reduced-motion: reduce)' }),
    })
    showToast({ message: 'Saved', duration: 1000 })

    vi.advanceTimersByTime(1000)
    expect(toasts()).toHaveLength(0)
  })

  it('pauses while hovered and resumes with the time it had left', () => {
    mount(TOASTER())
    showToast({ message: 'Saved', duration: 3000 })
    const toast = lastToast()

    vi.advanceTimersByTime(1000)
    toast.dispatchEvent(new MouseEvent('mouseenter'))
    vi.advanceTimersByTime(10_000)
    expect(toast.isConnected).toBe(true)

    toast.dispatchEvent(new MouseEvent('mouseleave'))
    vi.advanceTimersByTime(1999)
    expect(toast.style.opacity).toBe('')
    vi.advanceTimersByTime(1)
    expect(toast.style.opacity).toBe('0')
  })

  it('does not restart the countdown on a stray mouseleave or focusout', () => {
    mount(TOASTER())
    showToast({ message: 'Saved', duration: 3000 })
    const toast = lastToast()

    vi.advanceTimersByTime(2000)
    toast.dispatchEvent(new MouseEvent('mouseleave'))
    toast.dispatchEvent(new FocusEvent('focusout'))
    vi.advanceTimersByTime(1000)
    expect(toast.style.opacity).toBe('0')
  })

  it('pauses while it holds focus, and stays paused until both hover and focus have left', () => {
    mount(TOASTER())
    showToast({ message: 'Saved', duration: 3000 })
    const toast = lastToast()
    const dismiss = button(toast, '[data-rfr-toast-dismiss]')

    dismiss.focus()
    toast.dispatchEvent(new MouseEvent('mouseenter'))
    toast.dispatchEvent(new MouseEvent('mouseleave'))
    vi.advanceTimersByTime(10_000)
    expect(toast.style.opacity).toBe('')

    document.getElementById('trigger')!.focus()
    vi.advanceTimersByTime(3000)
    expect(toast.style.opacity).toBe('0')
  })
})

describe('dismissing', () => {
  it('closes from the dismiss button', () => {
    mount(TOASTER())
    showToast({ message: 'Saved', duration: 0 })

    button(lastToast(), '[data-rfr-toast-dismiss]').click()
    finishExit()
    expect(toasts()).toHaveLength(0)
  })

  it('closes the focused toast on Escape', () => {
    mount(TOASTER())
    showToast({ message: 'Saved', duration: 0 })
    const dismiss = button(lastToast(), '[data-rfr-toast-dismiss]')
    dismiss.focus()

    const event = press(dismiss, 'Escape')
    expect(event.defaultPrevented).toBe(true)
    finishExit()
    expect(toasts()).toHaveLength(0)
  })

  it('leaves Escape alone when something else already handled it, or the toast cannot be dismissed', () => {
    mount(TOASTER(SERVER_TOAST('data-rfr-toast-duration="0"').replace(/<button[^>]*data-rfr-toast-dismiss[\s\S]*?<\/button>/, '')))
    initToasters()
    const action = button(lastToast(), '[data-rfr-toast-action]')

    expect(press(action, 'Escape').defaultPrevented).toBe(false)
    finishExit()
    expect(toasts()).toHaveLength(1)

    mount(TOASTER())
    showToast({ message: 'Saved', duration: 0 })
    const dismiss = button(lastToast(), '[data-rfr-toast-dismiss]')
    dismiss.addEventListener('keydown', (event) => event.preventDefault())
    press(dismiss, 'Escape')
    finishExit()
    expect(toasts()).toHaveLength(1)
  })

  it('fires the dismiss event once, even when dismissed again while it fades out', () => {
    mount(TOASTER())
    const dismissed = vi.fn()
    toaster().addEventListener(TOAST_DISMISS_EVENT, dismissed)
    showToast({ message: 'Saved', duration: 0 })
    const dismiss = button(lastToast(), '[data-rfr-toast-dismiss]')

    dismiss.click()
    dismiss.click()
    finishExit()
    expect(dismissed).toHaveBeenCalledTimes(1)
  })
})

describe('the action', () => {
  it('closes the toast first, then runs the callback once and dispatches the action event', () => {
    mount(TOASTER())
    const order: string[] = []
    toaster().addEventListener(TOAST_DISMISS_EVENT, () => order.push('dismiss'))
    toaster().addEventListener(TOAST_ACTION_EVENT, () => order.push('event'))
    showToast({ message: 'Draft deleted', duration: 0, action: { label: 'Undo', onClick: () => order.push('callback') } })
    const action = button(lastToast(), '[data-rfr-toast-action]')

    action.click()
    action.click()
    finishExit()

    expect(order).toEqual(['dismiss', 'callback', 'event'])
    expect(toasts()).toHaveLength(0)
  })

  it('dispatches the action event for a server-rendered action', () => {
    mount(TOASTER(SERVER_TOAST()))
    initToasters()
    const chosen = vi.fn()
    document.addEventListener(TOAST_ACTION_EVENT, chosen)

    button(lastToast(), '[data-rfr-toast-action]').click()

    expect(chosen).toHaveBeenCalledTimes(1)
    expect(chosen.mock.calls[0][0].target).toBe(lastToast())
    document.removeEventListener(TOAST_ACTION_EVENT, chosen)
  })
})

describe('focus', () => {
  it('returns focus to where it came from when the focused toast closes', () => {
    mount(TOASTER())
    const trigger = document.getElementById('trigger')!
    showToast({ message: 'Saved', duration: 0 })
    trigger.focus()
    const dismiss = button(lastToast(), '[data-rfr-toast-dismiss]')
    dismiss.focus()

    press(dismiss, 'Escape')
    finishExit()

    expect(document.activeElement).toBe(trigger)
  })

  it('leaves focus alone when the action moved it', () => {
    mount(`${TOASTER()}<input id="restored" />`)
    const trigger = document.getElementById('trigger')!
    const restored = document.getElementById('restored')!
    showToast({ message: 'Draft deleted', duration: 0, action: { label: 'Undo', onClick: () => restored.focus() } })
    trigger.focus()
    const action = button(lastToast(), '[data-rfr-toast-action]')
    action.focus()

    action.click()
    finishExit()

    expect(document.activeElement).toBe(restored)
  })

  it('does not take focus when a toast nobody focused closes', () => {
    mount(`${TOASTER()}<input id="field" />`)
    const field = document.getElementById('field')!
    field.focus()
    showToast({ message: 'Saved', duration: 1000 })

    vi.advanceTimersByTime(1000)
    finishExit()

    expect(document.activeElement).toBe(field)
  })
})
