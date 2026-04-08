import * as React from 'react'
import {
  createCollapsible,
  collapsibleContentVariants,
  type CollapsibleProps as CoreCollapsibleProps,
} from '@refraction-ui/collapsible'
import { cn } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CollapsibleContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled: boolean
  contentId: string
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

function useCollapsibleContext(): CollapsibleContextValue {
  const ctx = React.useContext(CollapsibleContext)
  if (!ctx) {
    throw new Error(
      'Collapsible compound components must be used within <Collapsible>',
    )
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Collapsible (root provider)
// ---------------------------------------------------------------------------

export interface CollapsibleProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

export function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  children,
  className,
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next)
      }
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  // Use the headless core to get a stable content ID
  const apiRef = React.useRef<ReturnType<typeof createCollapsible> | null>(null)
  if (apiRef.current === null) {
    apiRef.current = createCollapsible({ open, defaultOpen, disabled })
  }
  const contentId = apiRef.current.contentProps.id

  const ctx = React.useMemo<CollapsibleContextValue>(
    () => ({
      open,
      onOpenChange: handleOpenChange,
      disabled,
      contentId,
    }),
    [open, handleOpenChange, disabled, contentId],
  )

  return React.createElement(
    CollapsibleContext.Provider,
    { value: ctx },
    React.createElement(
      'div',
      {
        'data-state': open ? 'open' : 'closed',
        'data-disabled': disabled ? '' : undefined,
        className,
      },
      children,
    ),
  )
}

Collapsible.displayName = 'Collapsible'

// ---------------------------------------------------------------------------
// CollapsibleTrigger
// ---------------------------------------------------------------------------

export interface CollapsibleTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(({ onClick, disabled: disabledProp, children, ...props }, ref) => {
  const { open, onOpenChange, disabled: ctxDisabled, contentId } =
    useCollapsibleContext()
  const disabled = disabledProp ?? ctxDisabled

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      onOpenChange(!open)
    }
    onClick?.(e)
  }

  return React.createElement(
    'button',
    {
      ref,
      type: 'button',
      'aria-expanded': open,
      'aria-controls': contentId,
      'data-state': open ? 'open' : 'closed',
      'data-disabled': disabled ? '' : undefined,
      disabled: disabled || undefined,
      onClick: handleClick,
      ...props,
    },
    children,
  )
})

CollapsibleTrigger.displayName = 'CollapsibleTrigger'

// ---------------------------------------------------------------------------
// CollapsibleContent
// ---------------------------------------------------------------------------

export interface CollapsibleContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(({ className, children, ...props }, ref) => {
  const { open, contentId } = useCollapsibleContext()
  const dataState = open ? 'open' : 'closed'

  if (!open) return null

  return React.createElement(
    'div',
    {
      ref,
      id: contentId,
      role: 'region',
      'data-state': dataState,
      className: cn(
        collapsibleContentVariants({ state: open ? 'open' : 'closed' }),
        className,
      ),
      ...props,
    },
    children,
  )
})

CollapsibleContent.displayName = 'CollapsibleContent'
