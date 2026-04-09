import * as React from 'react'
import {
  createToast,
  createToastManager,
  toastVariants,
  type ToastVariant,
  type ToastEntry,
  type ToastManagerAPI,
} from '@elloloop/toast'
import { cn } from '@elloloop/shared'

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

ToastProvider.displayName = 'ToastProvider'

// ---------------------------------------------------------------------------
// useToast hook
// ---------------------------------------------------------------------------

export interface UseToastReturn {
  /** Show a new toast */
  toast: (message: string, opts?: { variant?: ToastVariant; duration?: number }) => string
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
// Toast (individual toast component)
// ---------------------------------------------------------------------------

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  entry: ToastEntry
  onDismiss?: (id: string) => void
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ entry, onDismiss, className, children, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const api = React.useMemo(
      () => createToast({ variant: entry.variant, duration: entry.duration }),
      [entry.variant, entry.duration],
    )

    // Start auto-dismiss timer on mount
    React.useEffect(() => {
      api.startTimer()
      return () => api.pauseTimer()
    }, [api])

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      api.pauseTimer()
      onMouseEnter?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      api.resumeTimer()
      onMouseLeave?.(e)
    }

    return React.createElement(
      'div',
      {
        ref,
        className: cn(toastVariants({ variant: entry.variant }), className),
        ...api.ariaProps,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        ...props,
      },
      React.createElement('div', { className: 'flex-1' }, entry.message),
      children,
      onDismiss &&
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'shrink-0',
            onClick: () => onDismiss(entry.id),
            'aria-label': 'Dismiss',
          },
          '\u00d7',
        ),
    )
  },
)

Toast.displayName = 'Toast'

// ---------------------------------------------------------------------------
// Toaster (container that renders all active toasts)
// ---------------------------------------------------------------------------

export interface ToasterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(
  ({ className, ...props }, ref) => {
    const { toasts, dismiss } = useToast()

    return React.createElement(
      'div',
      {
        ref,
        className: cn(
          'fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none',
          className,
        ),
        ...props,
      },
      toasts.map((entry) =>
        React.createElement(Toast, {
          key: entry.id,
          entry,
          onDismiss: dismiss,
        }),
      ),
    )
  },
)

Toaster.displayName = 'Toaster'
