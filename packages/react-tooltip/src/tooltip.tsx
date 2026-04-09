import * as React from 'react'
import { createPortal } from 'react-dom'
import {
  createTooltip,
  tooltipContentVariants,
  type TooltipAPI,
} from '@refraction-ui/tooltip'
import type { Side } from '@refraction-ui/shared'
import { cn } from '@refraction-ui/shared'

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface TooltipContextValue {
  api: TooltipAPI
  open: boolean
  setOpen: (value: boolean) => void
  openWithDelay: () => void
  cancelDelay: () => void
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

function useTooltipContext(): TooltipContextValue {
  const ctx = React.useContext(TooltipContext)
  if (!ctx) {
    throw new Error('Tooltip compound components must be used within <Tooltip>')
  }
  return ctx
}

/* ------------------------------------------------------------------ */
/*  Tooltip (root provider)                                            */
/* ------------------------------------------------------------------ */

export interface TooltipProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: Side
  delayDuration?: number
  children: React.ReactNode
}

export function Tooltip({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement,
  delayDuration = 300,
  children,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = React.useState(controlledOpen ?? defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value)
      }
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange],
  )

  const api = React.useMemo(
    () => createTooltip({ open: isOpen, onOpenChange: handleOpenChange, placement, delayDuration }),
    [isOpen, handleOpenChange, placement, delayDuration],
  )

  const cancelDelay = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const openWithDelay = React.useCallback(() => {
    cancelDelay()
    if (delayDuration <= 0) {
      handleOpenChange(true)
      return
    }
    timerRef.current = setTimeout(() => {
      handleOpenChange(true)
      timerRef.current = null
    }, delayDuration)
  }, [cancelDelay, delayDuration, handleOpenChange])

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const ctx = React.useMemo<TooltipContextValue>(
    () => ({ api, open: isOpen, setOpen: handleOpenChange, openWithDelay, cancelDelay }),
    [api, isOpen, handleOpenChange, openWithDelay, cancelDelay],
  )

  return React.createElement(TooltipContext.Provider, { value: ctx }, children)
}

Tooltip.displayName = 'Tooltip'

/* ------------------------------------------------------------------ */
/*  TooltipTrigger                                                     */
/* ------------------------------------------------------------------ */

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const TooltipTrigger = React.forwardRef<HTMLSpanElement, TooltipTriggerProps>(
  ({ onMouseEnter, onMouseLeave, onFocus, onBlur, children, ...props }, ref) => {
    const { api, setOpen, openWithDelay, cancelDelay } = useTooltipContext()

    const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
      openWithDelay()
      onMouseEnter?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
      cancelDelay()
      setOpen(false)
      onMouseLeave?.(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLSpanElement>) => {
      openWithDelay()
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
      cancelDelay()
      setOpen(false)
      onBlur?.(e)
    }

    return (
      <span
        ref={ref}
        aria-describedby={api.triggerProps['aria-describedby']}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </span>
    )
  },
)

TooltipTrigger.displayName = 'TooltipTrigger'

/* ------------------------------------------------------------------ */
/*  TooltipContent                                                     */
/* ------------------------------------------------------------------ */

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: Side
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ side, className, children, ...props }, ref) => {
    const { api, open } = useTooltipContext()

    if (!open) return null

    const content = (
      <div
        ref={ref}
        role={api.contentProps.role}
        id={api.contentProps.id}
        className={cn(tooltipContentVariants({ side: side ?? api.placement }), className)}
        {...props}
      >
        {children}
      </div>
    )

    if (typeof document !== 'undefined') {
      return createPortal(content, document.body)
    }

    return content
  },
)

TooltipContent.displayName = 'TooltipContent'
