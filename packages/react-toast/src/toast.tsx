import * as React from 'react'
import {
  createToast,
  createToastManager,
  getToastAnnouncement,
  getToastPoliteness,
  toastVariants,
  toastTitleClass,
  toastDescriptionClass,
  toastActionClass,
  toastCloseClass,
  toastAnnouncerClass,
  toasterClass,
  DEFAULT_TOAST_DISMISS_LABEL,
  DEFAULT_TOASTER_LABEL,
  TOAST_ANNOUNCEMENT_LIFETIME_MS,
  type ToastEntry,
  type ToastManagerAPI,
  type ToastOptions,
  type ToastPoliteness,
} from '@refraction-ui/toast'
import { cn, devWarn, Keys } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ToastContextValue {
  manager: ToastManagerAPI
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

function useToastContext(): ToastContextValue {
  const ctx = React.useContext(ToastContext)
  if (!ctx) {
    devWarn(
      'react-toast/use-toast-outside-provider',
      'useToast() was called outside a <ToastProvider>. Wrap your app (or the consuming subtree) in <ToastProvider> so the toast context is available.',
    )
    throw new Error('useToast must be used within a <ToastProvider>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// ToastProvider
// ---------------------------------------------------------------------------

export interface ToastProviderProps {
  children?: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const managerRef = React.useRef<ToastManagerAPI | null>(null)
  if (managerRef.current === null) {
    managerRef.current = createToastManager()
  }

  const ctx = React.useMemo<ToastContextValue>(
    () => ({ manager: managerRef.current! }),
    [],
  )

  return React.createElement(ToastContext.Provider, { value: ctx }, children)
}

// ---------------------------------------------------------------------------
// useToast hook
// ---------------------------------------------------------------------------

export interface UseToastReturn {
  /** Show a new toast: `toast(message)` or `toast(message, { variant, duration, title, action })` */
  toast: (message: string, opts?: ToastOptions) => string
  /** Dismiss a toast by id */
  dismiss: (id: string) => void
  /** Current toast entries */
  toasts: ReadonlyArray<ToastEntry>
}

export function useToast(): UseToastReturn {
  const { manager } = useToastContext()
  const [toasts, setToasts] = React.useState<ReadonlyArray<ToastEntry>>(manager.toasts)

  React.useEffect(() => {
    // Sync initial state
    setToasts(manager.toasts)
    const unsub = manager.subscribe(setToasts)
    return unsub
  }, [manager])

  return {
    toast: manager.toast,
    dismiss: manager.dismiss,
    toasts,
  }
}

// ---------------------------------------------------------------------------
// Toaster context (what a Toast needs from the Toaster that renders it)
// ---------------------------------------------------------------------------

interface ToasterContextValue {
  /**
   * Put focus back where it was before it entered the toaster, but only when
   * focus was lost (it sits on the document body because the focused toast
   * went away). Focus the user, or an action, already moved is left alone.
   */
  restoreFocus(): void
}

const ToasterContext = React.createContext<ToasterContextValue | null>(null)

// ---------------------------------------------------------------------------
// Toast (individual toast component)
// ---------------------------------------------------------------------------

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  entry: ToastEntry
  onDismiss?: (id: string) => void
  /** Accessible name of the dismiss button (default: `'Dismiss'`). */
  dismissLabel?: string
}

/**
 * One toast. Inside a `<Toaster>` it is announced through the toaster's live
 * regions; rendered on its own it is its own `role="alert"` live region.
 * While it is hovered or holds focus, its auto-dismiss countdown is paused.
 */
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    entry,
    onDismiss,
    dismissLabel = DEFAULT_TOAST_DISMISS_LABEL,
    className,
    children,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onKeyDown,
    ...props
  },
  ref,
) {
  const manager = React.useContext(ToastContext)?.manager
  const toaster = React.useContext(ToasterContext)
  const { id, action } = entry
  const hovered = React.useRef(false)
  const focusWithin = React.useRef(false)

  // A standalone toast has no toaster to announce it, so it is its own alert.
  const standaloneLiveProps = React.useMemo(() => createToast().ariaProps, [])

  const syncCountdown = React.useCallback(() => {
    if (!manager) return
    if (hovered.current || focusWithin.current) manager.pause(id)
    else manager.resume(id)
  }, [manager, id])

  // When the toast leaves the screen it hands back what it held: a countdown it
  // paused carries on, and focus it held returns to where the user came from.
  React.useEffect(() => {
    return () => {
      if (focusWithin.current) toaster?.restoreFocus()
      hovered.current = false
      focusWithin.current = false
      manager?.resume(id)
    }
  }, [manager, toaster, id])

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseEnter?.(e)
    hovered.current = true
    syncCountdown()
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(e)
    hovered.current = false
    syncCountdown()
  }

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(e)
    focusWithin.current = true
    syncCountdown()
  }

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    onBlur?.(e)
    const next = e.relatedTarget
    if (next instanceof Node && e.currentTarget.contains(next)) return
    focusWithin.current = false
    syncCountdown()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented || e.key !== Keys.Escape || !onDismiss) return
    e.preventDefault()
    onDismiss(id)
  }

  // Close first, then run the action, so the action runs exactly once and
  // anything it opens or focuses is not undone by the toast going away.
  const handleAction = () => {
    if (!action) return
    onDismiss?.(id)
    action.onClick()
  }

  const content = entry.title
    ? React.createElement(
        'div',
        { className: 'flex-1' },
        React.createElement('div', { className: toastTitleClass }, entry.title),
        React.createElement('div', { className: toastDescriptionClass }, entry.message),
      )
    : React.createElement('div', { className: 'flex-1' }, entry.message)

  return React.createElement(
    'div',
    {
      ref,
      className: cn(toastVariants({ variant: entry.variant }), className),
      'data-rfr-toast': '',
      ...(toaster ? undefined : standaloneLiveProps),
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      ...props,
    },
    content,
    action &&
      React.createElement(
        'button',
        { type: 'button', className: toastActionClass, onClick: handleAction },
        action.label,
      ),
    children,
    onDismiss &&
      React.createElement(
        'button',
        {
          type: 'button',
          className: toastCloseClass,
          onClick: () => onDismiss(id),
          'aria-label': dismissLabel,
        },
        React.createElement('span', { 'aria-hidden': true }, '\u00d7'),
      ),
  )
})

// ---------------------------------------------------------------------------
// Toaster (container that renders all active toasts)
// ---------------------------------------------------------------------------

export interface ToasterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name of each toast's dismiss button (default: `'Dismiss'`). */
  dismissLabel?: string
}

interface Announcement {
  id: string
  text: string
  politeness: ToastPoliteness
}

interface ToastAnnouncementProps {
  id: string
  text: string
  onExpire: (id: string) => void
}

/** One toast's text in a live region, removed once assistive technology has read it. */
function ToastAnnouncement({ id, text, onExpire }: ToastAnnouncementProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => onExpire(id), TOAST_ANNOUNCEMENT_LIFETIME_MS)
    return () => clearTimeout(timer)
  }, [id, onExpire])
  return React.createElement('div', null, text)
}

/**
 * The landmark region (`aria-label="Notifications"` by default) that stacks the
 * active toasts. Two always-present live regions, one polite and one
 * assertive, announce each new toast once: errors interrupt, everything else
 * waits its turn. Live regions that exist before their content changes are
 * the ones screen readers announce reliably.
 */
export const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(function Toaster(
  { className, dismissLabel, onFocus, ...props },
  ref,
) {
  const { toasts, dismiss } = useToast()
  const regionRef = React.useRef<HTMLDivElement | null>(null)
  const returnFocusRef = React.useRef<HTMLElement | null>(null)
  const announcedRef = React.useRef(new Set<string>())
  const [announcements, setAnnouncements] = React.useState<ReadonlyArray<Announcement>>([])

  React.useEffect(() => {
    const announced = announcedRef.current
    const current = new Set(toasts.map((t) => t.id))
    // Ids are never reused, so a dismissed toast's id can be forgotten.
    for (const id of announced) {
      if (!current.has(id)) announced.delete(id)
    }
    const fresh = toasts.filter((t) => !announced.has(t.id))
    if (fresh.length === 0) return
    for (const t of fresh) announced.add(t.id)
    setAnnouncements((prev) => [
      ...prev,
      ...fresh.map((t) => ({
        id: t.id,
        text: getToastAnnouncement(t),
        politeness: getToastPoliteness(t.variant),
      })),
    ])
  }, [toasts])

  const expireAnnouncement = React.useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const restoreFocus = React.useCallback(() => {
    const doc = regionRef.current?.ownerDocument
    if (!doc) return
    const active = doc.activeElement
    if (active && active !== doc.body) return
    const target = returnFocusRef.current
    if (target?.isConnected) target.focus()
  }, [])

  const toasterContext = React.useMemo<ToasterContextValue>(
    () => ({ restoreFocus }),
    [restoreFocus],
  )

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      regionRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  // Remember where focus came from each time it enters the toaster from outside.
  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(e)
    const from = e.relatedTarget
    if (from instanceof Node && e.currentTarget.contains(from)) return
    returnFocusRef.current = from instanceof HTMLElement ? from : null
  }

  const announcer = (politeness: ToastPoliteness) =>
    React.createElement(
      'div',
      {
        className: toastAnnouncerClass,
        'aria-live': politeness,
        'aria-atomic': false,
        'aria-relevant': 'additions',
        'data-rfr-toast-announcer': politeness,
      },
      announcements
        .filter((a) => a.politeness === politeness)
        .map((a) =>
          React.createElement(ToastAnnouncement, {
            key: a.id,
            id: a.id,
            text: a.text,
            onExpire: expireAnnouncement,
          }),
        ),
    )

  return React.createElement(
    ToasterContext.Provider,
    { value: toasterContext },
    React.createElement(
      'div',
      {
        ref: setRefs,
        role: 'region',
        'aria-label': DEFAULT_TOASTER_LABEL,
        className: cn(toasterClass, className),
        ...props,
        onFocus: handleFocus,
      },
      announcer('polite'),
      announcer('assertive'),
      toasts.map((entry) =>
        React.createElement(Toast, {
          key: entry.id,
          entry,
          onDismiss: dismiss,
          dismissLabel,
        }),
      ),
    ),
  )
})
