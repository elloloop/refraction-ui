import * as React from 'react'
import { createPortal } from 'react-dom'
import {
  createPopover,
  popoverContentVariants,
  type PopoverAPI,
} from '@elloloop/popover'
import type { Side } from '@elloloop/shared'
import { cn } from '@elloloop/shared'

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface PopoverContextValue {
  api: PopoverAPI
  open: boolean
  setOpen: (value: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function usePopoverContext(): PopoverContextValue {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) {
    throw new Error('Popover compound components must be used within <Popover>')
  }
  return ctx
}

/* ------------------------------------------------------------------ */
/*  Popover (root provider)                                            */
/* ------------------------------------------------------------------ */

export interface PopoverProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: Side
  children: React.ReactNode
}

export function Popover({ open: controlledOpen, defaultOpen = false, onOpenChange, placement, children }: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(controlledOpen ?? defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

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
    () => createPopover({ open: isOpen, onOpenChange: handleOpenChange, placement }),
    [isOpen, handleOpenChange, placement],
  )

  const ctx = React.useMemo<PopoverContextValue>(
    () => ({ api, open: isOpen, setOpen: handleOpenChange }),
    [api, isOpen, handleOpenChange],
  )

  return React.createElement(PopoverContext.Provider, { value: ctx }, children)
}

Popover.displayName = 'Popover'

/* ------------------------------------------------------------------ */
/*  PopoverTrigger                                                     */
/* ------------------------------------------------------------------ */

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ onClick, children, ...props }, ref) => {
    const { api, setOpen, open } = usePopoverContext()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(!open)
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={api.triggerProps['aria-expanded']}
        aria-controls={api.triggerProps['aria-controls']}
        aria-haspopup={api.triggerProps['aria-haspopup']}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  },
)

PopoverTrigger.displayName = 'PopoverTrigger'

/* ------------------------------------------------------------------ */
/*  PopoverContent                                                     */
/* ------------------------------------------------------------------ */

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: Side
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ side, className, children, onKeyDown, ...props }, ref) => {
    const { api, open, setOpen } = usePopoverContext()

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
      onKeyDown?.(e)
    }

    if (!open) return null

    const content = (
      <div
        ref={ref}
        role={api.contentProps.role}
        id={api.contentProps.id}
        className={cn(popoverContentVariants({ side: side ?? api.placement }), className)}
        onKeyDown={handleKeyDown}
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

PopoverContent.displayName = 'PopoverContent'

/* ------------------------------------------------------------------ */
/*  PopoverClose                                                       */
/* ------------------------------------------------------------------ */

export interface PopoverCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const PopoverClose = React.forwardRef<HTMLButtonElement, PopoverCloseProps>(
  ({ onClick, children, ...props }, ref) => {
    const { setOpen } = usePopoverContext()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(false)
      onClick?.(e)
    }

    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    )
  },
)

PopoverClose.displayName = 'PopoverClose'
