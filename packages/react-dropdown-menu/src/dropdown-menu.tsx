import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  createDropdownMenu,
  menuContentVariants,
  menuItemVariants,
  type DropdownMenuProps as CoreDropdownMenuProps,
  type MenuItemProps as CoreMenuItemProps,
} from '@refraction-ui/dropdown-menu'
import { cn, createKeyboardHandler } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface DropdownMenuContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentId: string
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenuContext(): DropdownMenuContextValue {
  const ctx = React.useContext(DropdownMenuContext)
  if (!ctx) {
    throw new Error('DropdownMenu compound components must be used within <DropdownMenu>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// DropdownMenu (root provider)
// ---------------------------------------------------------------------------

export interface DropdownMenuProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function DropdownMenu({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: DropdownMenuProps) {
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

  // Use the headless core to get stable IDs
  const apiRef = React.useRef<ReturnType<typeof createDropdownMenu> | null>(null)
  if (apiRef.current === null) {
    apiRef.current = createDropdownMenu({ open })
  }
  const api = apiRef.current

  const ctx = React.useMemo<DropdownMenuContextValue>(
    () => ({
      open,
      onOpenChange: handleOpenChange,
      contentId: api.ids.content,
    }),
    [open, handleOpenChange, api.ids.content],
  )

  return React.createElement(DropdownMenuContext.Provider, { value: ctx }, children)
}

DropdownMenu.displayName = 'DropdownMenu'

// ---------------------------------------------------------------------------
// DropdownMenuTrigger
// ---------------------------------------------------------------------------

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ onClick, children, ...props }, ref) => {
    const { open, onOpenChange, contentId } = useDropdownMenuContext()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onOpenChange(!open)
      onClick?.(e)
    }

    return React.createElement(
      'button',
      {
        ref,
        type: 'button',
        'aria-expanded': open,
        'aria-controls': contentId,
        'aria-haspopup': 'menu',
        onClick: handleClick,
        ...props,
      },
      children,
    )
  },
)

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

// ---------------------------------------------------------------------------
// DropdownMenuContent
// ---------------------------------------------------------------------------

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, children, onKeyDown, ...props }, ref) => {
    const { open, onOpenChange, contentId } = useDropdownMenuContext()

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const handler = createKeyboardHandler({
        Escape: (ev) => {
          ev.preventDefault()
          onOpenChange(false)
        },
      })
      handler(e.nativeEvent)
      onKeyDown?.(e)
    }

    if (!open) return null

    const content = React.createElement(
      'div',
      {
        ref,
        role: 'menu',
        id: contentId,
        'data-state': open ? 'open' : 'closed',
        className: cn(menuContentVariants(), className),
        onKeyDown: handleKeyDown,
        tabIndex: -1,
        ...props,
      },
      children,
    )

    // Render via portal if document is available (client-side)
    if (typeof document !== 'undefined') {
      return ReactDOM.createPortal(content, document.body)
    }

    // SSR fallback: render inline
    return content
  },
)

DropdownMenuContent.displayName = 'DropdownMenuContent'

// ---------------------------------------------------------------------------
// DropdownMenuItem
// ---------------------------------------------------------------------------

export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  onSelect?: () => void
}

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, disabled, onSelect, onClick, children, ...props }, ref) => {
    const { onOpenChange } = useDropdownMenuContext()

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      onSelect?.()
      onOpenChange(false)
      onClick?.(e)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect?.()
        onOpenChange(false)
      }
    }

    return React.createElement(
      'div',
      {
        ref,
        role: 'menuitem',
        tabIndex: disabled ? -1 : 0,
        'data-disabled': disabled ? '' : undefined,
        'aria-disabled': disabled || undefined,
        className: cn(menuItemVariants(), className),
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        ...props,
      },
      children,
    )
  },
)

DropdownMenuItem.displayName = 'DropdownMenuItem'

// ---------------------------------------------------------------------------
// DropdownMenuSeparator
// ---------------------------------------------------------------------------

export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      role: 'separator',
      className: cn('-mx-1 my-1 h-px bg-muted', className),
      ...props,
    })
  },
)

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

// ---------------------------------------------------------------------------
// DropdownMenuLabel
// ---------------------------------------------------------------------------

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      className: cn('px-2 py-1.5 text-sm font-semibold', className),
      ...props,
    })
  },
)

DropdownMenuLabel.displayName = 'DropdownMenuLabel'
