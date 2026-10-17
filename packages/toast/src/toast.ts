import type { AccessibilityProps } from '@refraction-ui/shared'
import { generateId } from '@refraction-ui/shared'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning'

/** Auto-dismiss delay (ms) used when a toast does not set its own `duration`. */
export const DEFAULT_TOAST_DURATION = 3000

/**
 * How long (ms) an adapter keeps a toast's announcement in its live region
 * before removing it. Long enough for assistive technology to pick the
 * mutation up, short enough that a screen-reader user browsing the page does
 * not meet the same text twice (once in the live region, once in the toast).
 */
export const TOAST_ANNOUNCEMENT_LIFETIME_MS = 1000

/** Default accessible name of a toast's dismiss button. */
export const DEFAULT_TOAST_DISMISS_LABEL = 'Dismiss'

/** Default accessible name of the landmark region that holds the toasts. */
export const DEFAULT_TOASTER_LABEL = 'Notifications'

/** `aria-live` politeness a toast is announced with. */
export type ToastPoliteness = 'polite' | 'assertive'

/** A single action a toast offers, such as "Undo". */
export interface ToastAction {
  /** Visible text of the action button; also its accessible name. */
  label: string
  /** Runs once when the action is chosen. The toast is dismissed first. */
  onClick: () => void
}

/** Options accepted by `toast(message, opts)`. Every field is optional. */
export interface ToastOptions {
  /** Visual variant (default: `'default'`). */
  variant?: ToastVariant
  /** Auto-dismiss duration in ms (default: `DEFAULT_TOAST_DURATION`). `0` keeps the toast until it is dismissed. */
  duration?: number
  /** Short heading rendered above the message. */
  title?: string
  /** An action button, such as "Undo". */
  action?: ToastAction
}

/** Icon name for each toast variant — non-color indicator for colorblind safety */
const TOAST_ICONS: Record<ToastVariant, string> = {
  default: 'info-circle',
  success: 'check-circle',
  error: 'x-circle',
  warning: 'alert-triangle',
}

/** Get the icon name for a toast variant (colorblind-safe: meaning not conveyed by color alone) */
export function getToastIcon(variant: ToastVariant): string {
  return TOAST_ICONS[variant]
}

/**
 * Whether a runtime value names a toast variant. Untyped callers, such as a
 * script calling a global toast function, use it to fall back to `default`
 * instead of rendering a toast without any variant styles.
 */
export function isToastVariant(value: unknown): value is ToastVariant {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TOAST_ICONS, value)
}

export interface ToastProps {
  /** Visual variant */
  variant?: ToastVariant
  /** Auto-dismiss duration in ms (default: 3000). Set to 0 to disable. */
  duration?: number
  /** Whether the toast is open (controlled) */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Elapsed-time clock for timer pause/resume math (ms). Default: ambient `Date.now()` — inject for deterministic tests. */
  now?: () => number
}

export interface ToastState {
  open: boolean
  variant: ToastVariant
}

export interface ToastAPI {
  /** Current toast state */
  state: ToastState
  /** ARIA attributes for the toast element */
  ariaProps: Partial<AccessibilityProps>
  /** Dismiss the toast */
  dismiss(): void
  /** Start the auto-dismiss timer */
  startTimer(): void
  /** Pause the auto-dismiss timer (e.g. on hover) */
  pauseTimer(): void
  /** Resume the auto-dismiss timer */
  resumeTimer(): void
}

export function createToast(props: ToastProps = {}): ToastAPI {
  const {
    variant = 'default',
    duration = DEFAULT_TOAST_DURATION,
    open: controlledOpen,
    onOpenChange,
  } = props

  // Injection boundary: ambient time is the default; inject `now` for deterministic timer math.
  const now = props.now ?? (() => Date.now())
  let isOpen = controlledOpen ?? true
  let timerId: ReturnType<typeof setTimeout> | null = null
  let remaining = duration
  let startedAt = 0

  function dismiss(): void {
    clearTimer()
    isOpen = false
    onOpenChange?.(false)
  }

  function clearTimer(): void {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  function startTimer(): void {
    if (duration <= 0) return
    clearTimer()
    remaining = duration
    startedAt = now()
    timerId = setTimeout(dismiss, remaining)
  }

  function pauseTimer(): void {
    if (timerId === null) return
    clearTimer()
    remaining = remaining - (now() - startedAt)
    if (remaining < 0) remaining = 0
  }

  function resumeTimer(): void {
    if (duration <= 0 || remaining <= 0) return
    clearTimer()
    startedAt = now()
    timerId = setTimeout(dismiss, remaining)
  }

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'alert',
    'aria-live': 'assertive',
    'aria-atomic': true,
  }

  return {
    state: {
      get open() {
        return controlledOpen !== undefined ? controlledOpen : isOpen
      },
      variant,
    },
    ariaProps,
    dismiss,
    startTimer,
    pauseTimer,
    resumeTimer,
  }
}

/**
 * Politeness a toast should be announced with. Errors interrupt the user
 * (`assertive`); every other variant waits for a pause in speech (`polite`),
 * so routine confirmations do not cut off what the user is listening to.
 */
export function getToastPoliteness(variant: ToastVariant): ToastPoliteness {
  return variant === 'error' ? 'assertive' : 'polite'
}

/** Text that ends a sentence in the scripts we expect: `. ! ? …` and their full-width forms. */
const SENTENCE_END = /[.!?\u2026\u3002\uFF01\uFF1F]$/u

/**
 * The single string a screen reader should hear for a toast: its title,
 * message and action label, in reading order. Parts that do not already end
 * a sentence are closed with a full stop, so assistive technology pauses
 * between them instead of running them together.
 */
export function getToastAnnouncement(
  entry: Pick<ToastEntry, 'message' | 'title' | 'action'>,
): string {
  const parts = [entry.title, entry.message, entry.action?.label]
    .map((part) => part?.trim() ?? '')
    .filter((part) => part.length > 0)
  return parts
    .map((part, index) =>
      index < parts.length - 1 && !SENTENCE_END.test(part) ? `${part}.` : part,
    )
    .join(' ')
}

/** Entry in the toast manager */
export interface ToastEntry {
  id: string
  message: string
  variant: ToastVariant
  duration: number
  createdAt: number
  /** Short heading rendered above the message, when set. */
  title?: string
  /** The toast's action button, when set. */
  action?: ToastAction
}

export interface ToastManagerAPI {
  /** Add a new toast. Returns the toast id. */
  toast(message: string, opts?: ToastOptions): string
  /** Dismiss a toast by id */
  dismiss(id: string): void
  /**
   * Stop a toast's auto-dismiss countdown, keeping the time it has left
   * (e.g. while it is hovered or holds focus). No-op for an unknown id, a
   * toast without a countdown, or one that is already paused.
   */
  pause(id: string): void
  /**
   * Restart a paused countdown with the time it had left. No-op unless the
   * toast is paused.
   */
  resume(id: string): void
  /** Current toast list (read-only) */
  readonly toasts: ReadonlyArray<ToastEntry>
  /** Subscribe to toast list changes. Returns unsubscribe function. */
  subscribe(fn: (toasts: ReadonlyArray<ToastEntry>) => void): () => void
}

export interface ToastManagerConfig {
  /** Clock for entry `createdAt` stamps and pause/resume math (ms). Default: ambient `Date.now()` — inject for deterministic tests. */
  now?: () => number
}

/** Auto-dismiss countdown of one toast. `handle` is null while paused. */
interface Countdown {
  handle: ReturnType<typeof setTimeout> | null
  remaining: number
  startedAt: number
}

export function createToastManager(config: ToastManagerConfig = {}): ToastManagerAPI {
  // Injection boundary: ambient time is the default; inject `now` for deterministic createdAt.
  const now = config.now ?? (() => Date.now())
  let toasts: ToastEntry[] = []
  const listeners = new Set<(toasts: ReadonlyArray<ToastEntry>) => void>()
  const countdowns = new Map<string, Countdown>()

  function notify(): void {
    const snapshot = [...toasts]
    for (const fn of listeners) {
      fn(snapshot)
    }
  }

  function dismiss(id: string): void {
    const countdown = countdowns.get(id)
    if (countdown) {
      if (countdown.handle !== null) clearTimeout(countdown.handle)
      countdowns.delete(id)
    }
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  }

  function startCountdown(id: string, countdown: Countdown): void {
    countdown.startedAt = now()
    countdown.handle = setTimeout(() => dismiss(id), countdown.remaining)
  }

  function pause(id: string): void {
    const countdown = countdowns.get(id)
    if (!countdown || countdown.handle === null) return
    clearTimeout(countdown.handle)
    countdown.handle = null
    countdown.remaining -= now() - countdown.startedAt
  }

  function resume(id: string): void {
    const countdown = countdowns.get(id)
    if (!countdown || countdown.handle !== null) return
    if (countdown.remaining <= 0) {
      dismiss(id)
      return
    }
    startCountdown(id, countdown)
  }

  function toast(message: string, opts: ToastOptions = {}): string {
    const id = generateId('rfr-toast')
    const duration = opts.duration ?? DEFAULT_TOAST_DURATION

    const entry: ToastEntry = {
      id,
      message,
      variant: opts.variant ?? 'default',
      duration,
      createdAt: now(),
      ...(opts.title !== undefined && { title: opts.title }),
      ...(opts.action !== undefined && { action: opts.action }),
    }

    toasts = [...toasts, entry]
    notify()

    if (duration > 0) {
      const countdown: Countdown = { handle: null, remaining: duration, startedAt: 0 }
      countdowns.set(id, countdown)
      startCountdown(id, countdown)
    }

    return id
  }

  function subscribe(fn: (toasts: ReadonlyArray<ToastEntry>) => void): () => void {
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  }

  return {
    toast,
    dismiss,
    pause,
    resume,
    get toasts() {
      return toasts
    },
    subscribe,
  }
}
