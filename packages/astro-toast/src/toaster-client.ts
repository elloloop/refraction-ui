import {
  createToast,
  getToastAnnouncement,
  getToastPoliteness,
  isToastVariant,
  toastActionClass,
  toastCloseClass,
  toastDescriptionClass,
  toastTitleClass,
  toastVariants,
  DEFAULT_TOAST_DISMISS_LABEL,
  DEFAULT_TOAST_DURATION,
  TOAST_ANNOUNCEMENT_LIFETIME_MS,
  type ToastAction,
  type ToastOptions,
  type ToastPoliteness,
  type ToastVariant,
} from '@refraction-ui/toast'
import { Keys } from '@refraction-ui/shared'

/**
 * Client behaviour of `Toaster.astro` and the `Toast.astro` toasts in it:
 * auto-dismiss that pauses while a toast is hovered or holds focus, the
 * dismiss and action buttons, Escape, announcements through the toaster's
 * live regions, focus hand-back, and the programmatic `window.__rfr_toast`.
 *
 * It drives the markup through data attributes, the contract it shares with
 * the two components:
 * - `data-rfr-toaster` on the toaster, with `data-rfr-toast-dismiss-label`
 *   and two `data-rfr-toast-announcer="polite" | "assertive"` live regions;
 * - `data-rfr-toast` on a toast, with `data-rfr-toast-variant` and
 *   `data-rfr-toast-duration`, and `data-rfr-toast-title`,
 *   `data-rfr-toast-message`, `data-rfr-toast-action` and
 *   `data-rfr-toast-dismiss` on its parts.
 */

/** Dispatched (bubbling) from a toast when it starts to close. */
export const TOAST_DISMISS_EVENT = 'rfr-toast-dismiss'

/** Dispatched (bubbling) from a toast when its action is chosen, after it starts to close. */
export const TOAST_ACTION_EVENT = 'rfr-toast-action'

/** How long (ms) a closing toast fades and slides out before it is removed. */
export const TOAST_EXIT_MS = 200

/** What `window.__rfr_toast` accepts besides a bare message: the message and the React `toast()` options. */
export interface ProgrammaticToastOptions extends ToastOptions {
  message: string
}

declare global {
  interface Window {
    /** Show a toast in the page's `<Toaster>`. Installed by `Toaster.astro`. */
    __rfr_toast?: (options: ProgrammaticToastOptions | string) => void
  }
}

const TOASTER_SELECTOR = '[data-rfr-toaster]'
const TOAST_SELECTOR = '[data-rfr-toast]'
const TOAST_INIT_ATTR = 'data-rfr-toast-init'

interface ToasterState {
  /** Where focus came from when it last entered the toaster from outside. */
  returnFocus: HTMLElement | null
}

const toasters = new WeakMap<HTMLElement, ToasterState>()

/** Action callbacks of toasts shown with `showToast`; markup cannot carry a function. */
const actionCallbacks = new WeakMap<HTMLElement, () => void>()

function prefersReducedMotion(view: Window | null): boolean {
  return view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function parseDuration(value: string | null): number {
  const duration = Number.parseInt(value ?? '', 10)
  return Number.isFinite(duration) ? duration : DEFAULT_TOAST_DURATION
}

function textOf(root: HTMLElement, selector: string): string | undefined {
  const node = root.matches(selector) ? root : root.querySelector<HTMLElement>(selector)
  return node?.textContent?.trim() || undefined
}

function setUpToaster(toaster: HTMLElement): ToasterState {
  const existing = toasters.get(toaster)
  if (existing) return existing
  const state: ToasterState = { returnFocus: null }
  toasters.set(toaster, state)
  toaster.addEventListener('focusin', (event) => {
    const from = event.relatedTarget
    if (from instanceof Node && toaster.contains(from)) return
    state.returnFocus = from instanceof HTMLElement ? from : null
  })
  return state
}

/**
 * Put focus back where it was before it entered the toaster. Called once the
 * toast that held focus is gone, so focus has been lost to the body; focus the
 * user, or an action, moved out of the toast first never gets here.
 */
function restoreFocus(toaster: HTMLElement): void {
  const target = toasters.get(toaster)?.returnFocus
  if (target?.isConnected) target.focus()
}

/** Read a toast's text into its live region, then take it out again once it has been read. */
function announce(toaster: HTMLElement, text: string, politeness: ToastPoliteness): void {
  if (!text) return
  const region = toaster.querySelector<HTMLElement>(
    `:scope > [data-rfr-toast-announcer="${politeness}"]`,
  )
  if (!region) return
  const line = toaster.ownerDocument.createElement('div')
  line.textContent = text
  region.appendChild(line)
  setTimeout(() => line.remove(), TOAST_ANNOUNCEMENT_LIFETIME_MS)
}

function setUpToast(toast: HTMLElement): void {
  if (toast.hasAttribute(TOAST_INIT_ATTR)) return
  toast.setAttribute(TOAST_INIT_ATTR, '')

  const toaster = toast.closest<HTMLElement>(TOASTER_SELECTOR)
  if (toaster) setUpToaster(toaster)
  const variantValue = toast.getAttribute('data-rfr-toast-variant')
  const variant: ToastVariant = isToastVariant(variantValue) ? variantValue : 'default'
  const dismissButton = toast.querySelector<HTMLElement>('[data-rfr-toast-dismiss]')
  const actionButton = toast.querySelector<HTMLElement>('[data-rfr-toast-action]')

  let closing = false
  let hovered = false
  let focusWithin = false
  let paused = false

  function remove(): void {
    const hadFocus = toast.contains(toast.ownerDocument.activeElement)
    toast.remove()
    if (hadFocus && toaster) restoreFocus(toaster)
  }

  function close(): void {
    if (closing) return
    closing = true
    toast.dispatchEvent(new CustomEvent(TOAST_DISMISS_EVENT, { bubbles: true }))
    if (prefersReducedMotion(toast.ownerDocument.defaultView)) {
      remove()
      return
    }
    toast.style.transition = `opacity ${TOAST_EXIT_MS}ms, transform ${TOAST_EXIT_MS}ms`
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(remove, TOAST_EXIT_MS)
  }

  const api = createToast({
    variant,
    duration: parseDuration(toast.getAttribute('data-rfr-toast-duration')),
    onOpenChange: (open) => {
      if (!open) close()
    },
  })

  function syncCountdown(): void {
    if (closing) return
    const shouldPause = hovered || focusWithin
    if (shouldPause === paused) return
    paused = shouldPause
    if (paused) api.pauseTimer()
    else api.resumeTimer()
  }

  // Close first, then run the action, so it runs exactly once and anything it
  // opens or focuses is not undone by the toast going away.
  const actionLabel = actionButton?.textContent?.trim() || undefined
  const action: ToastAction | undefined = actionLabel
    ? {
        label: actionLabel,
        onClick: () => {
          if (closing) return
          api.dismiss()
          actionCallbacks.get(toast)?.()
          toast.dispatchEvent(new CustomEvent(TOAST_ACTION_EVENT, { bubbles: true }))
        },
      }
    : undefined

  if (action) actionButton?.addEventListener('click', action.onClick)
  dismissButton?.addEventListener('click', () => api.dismiss())

  toast.addEventListener('mouseenter', () => {
    hovered = true
    syncCountdown()
  })
  toast.addEventListener('mouseleave', () => {
    hovered = false
    syncCountdown()
  })
  toast.addEventListener('focusin', () => {
    focusWithin = true
    syncCountdown()
  })
  toast.addEventListener('focusout', (event) => {
    const next = event.relatedTarget
    if (next instanceof Node && toast.contains(next)) return
    focusWithin = false
    syncCountdown()
  })
  toast.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.key !== Keys.Escape || !dismissButton) return
    event.preventDefault()
    api.dismiss()
  })

  if (toaster) {
    // Inside a Toaster the toaster's live regions announce the toast, so it
    // carries no live role of its own: that would announce it twice.
    toast.removeAttribute('role')
    toast.removeAttribute('aria-live')
    toast.removeAttribute('aria-atomic')
    const message = textOf(toast, '[data-rfr-toast-message]') ?? ''
    const title = textOf(toast, '[data-rfr-toast-title]')
    announce(toaster, getToastAnnouncement({ message, title, action }), getToastPoliteness(variant))
  }

  api.startTimer()
}

/** Set up every toaster and toast under `root` that is not set up yet. Safe to call again. */
export function initToasters(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(TOASTER_SELECTOR).forEach((toaster) => setUpToaster(toaster))
  root.querySelectorAll<HTMLElement>(TOAST_SELECTOR).forEach(setUpToast)
}

function element(doc: Document, className: string, text?: string): HTMLDivElement {
  const node = doc.createElement('div')
  node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

/** The markup `Toast.astro` renders, built in the browser. */
function createToastElement(
  doc: Document,
  options: ProgrammaticToastOptions,
  dismissLabel: string,
): HTMLElement {
  const { message, title, action } = options
  // A plain script can pass any string; an unknown one gets the default look.
  const variant: ToastVariant = isToastVariant(options.variant) ? options.variant : 'default'
  const duration = options.duration ?? DEFAULT_TOAST_DURATION

  const toast = element(doc, toastVariants({ variant }))
  toast.setAttribute('data-rfr-toast', '')
  toast.setAttribute('data-rfr-toast-variant', variant)
  toast.setAttribute('data-rfr-toast-duration', String(duration))

  if (title) {
    const content = element(doc, 'flex-1')
    const heading = element(doc, toastTitleClass, title)
    heading.setAttribute('data-rfr-toast-title', '')
    const body = element(doc, toastDescriptionClass, message)
    body.setAttribute('data-rfr-toast-message', '')
    content.append(heading, body)
    toast.append(content)
  } else {
    const content = element(doc, 'flex-1', message)
    content.setAttribute('data-rfr-toast-message', '')
    toast.append(content)
  }

  if (action) {
    const button = doc.createElement('button')
    button.type = 'button'
    button.className = toastActionClass
    button.setAttribute('data-rfr-toast-action', '')
    button.textContent = action.label
    toast.append(button)
    actionCallbacks.set(toast, action.onClick)
  }

  const dismiss = doc.createElement('button')
  dismiss.type = 'button'
  dismiss.className = toastCloseClass
  dismiss.setAttribute('data-rfr-toast-dismiss', '')
  dismiss.setAttribute('aria-label', dismissLabel)
  const glyph = doc.createElement('span')
  glyph.setAttribute('aria-hidden', 'true')
  glyph.textContent = '×'
  dismiss.append(glyph)
  toast.append(dismiss)

  return toast
}

/**
 * Show a toast in the document's first `<Toaster>`, the way `toast()` does in
 * React: `showToast('Saved')` or
 * `showToast({ message, title, variant, duration, action: { label, onClick } })`.
 */
export function showToast(input: ProgrammaticToastOptions | string, doc: Document = document): void {
  const options: ProgrammaticToastOptions = typeof input === 'string' ? { message: input } : input
  const toaster = doc.querySelector<HTMLElement>(TOASTER_SELECTOR)
  if (!toaster) {
    console.warn(
      '[refraction-ui] No <Toaster /> found in the document. Add a <Toaster /> component to use programmatic toasts.',
    )
    return
  }
  const dismissLabel =
    toaster.getAttribute('data-rfr-toast-dismiss-label') || DEFAULT_TOAST_DISMISS_LABEL
  const toast = createToastElement(doc, options, dismissLabel)
  toaster.appendChild(toast)
  setUpToast(toast)
}

/**
 * Wire up the page: set up its toasters and toasts, install
 * `window.__rfr_toast`, and set up the new page after an Astro view
 * transition swaps it in.
 */
export function installToaster(view: Window = window): void {
  const doc = view.document
  view.__rfr_toast = (options) => showToast(options, doc)
  initToasters(doc)
  doc.addEventListener('astro:after-swap', () => initToasters(view.document))
}
