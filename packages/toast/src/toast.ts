import type { AccessibilityProps } from '@elloloop/shared'
import { generateId } from '@elloloop/shared'

export type ToastVariant = 'default' | 'success' | 'error' | 'warning'

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

export interface ToastProps {
  /** Visual variant */
  variant?: ToastVariant
  /** Auto-dismiss duration in ms (default: 3000). Set to 0 to disable. */
  duration?: number
  /** Whether the toast is open (controlled) */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
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
    duration = 3000,
    open: controlledOpen,
    onOpenChange,
  } = props

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
    startedAt = Date.now()
    timerId = setTimeout(dismiss, remaining)
  }

  function pauseTimer(): void {
    if (timerId === null) return
    clearTimer()
    remaining = remaining - (Date.now() - startedAt)
    if (remaining < 0) remaining = 0
  }

  function resumeTimer(): void {
    if (duration <= 0 || remaining <= 0) return
    clearTimer()
    startedAt = Date.now()
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

/** Entry in the toast manager */
export interface ToastEntry {
  id: string
  message: string
  variant: ToastVariant
  duration: number
  createdAt: number
}

export interface ToastManagerAPI {
  /** Add a new toast. Returns the toast id. */
  toast(message: string, opts?: { variant?: ToastVariant; duration?: number }): string
  /** Dismiss a toast by id */
  dismiss(id: string): void
  /** Current toast list (read-only) */
  readonly toasts: ReadonlyArray<ToastEntry>
  /** Subscribe to toast list changes. Returns unsubscribe function. */
  subscribe(fn: (toasts: ReadonlyArray<ToastEntry>) => void): () => void
}

export function createToastManager(): ToastManagerAPI {
  let toasts: ToastEntry[] = []
  const listeners = new Set<(toasts: ReadonlyArray<ToastEntry>) => void>()
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  function notify(): void {
    const snapshot = [...toasts]
    for (const fn of listeners) {
      fn(snapshot)
    }
  }

  function dismiss(id: string): void {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  }

  function toast(
    message: string,
    opts?: { variant?: ToastVariant; duration?: number },
  ): string {
    const id = generateId('rfr-toast')
    const variant = opts?.variant ?? 'default'
    const duration = opts?.duration ?? 3000

    const entry: ToastEntry = {
      id,
      message,
      variant,
      duration,
      createdAt: Date.now(),
    }

    toasts = [...toasts, entry]
    notify()

    if (duration > 0) {
      const timer = setTimeout(() => dismiss(id), duration)
      timers.set(id, timer)
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
    get toasts() {
      return toasts
    },
    subscribe,
  }
}
