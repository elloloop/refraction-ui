import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  createDropdownMenu,
  menuContentVariants,
  menuItemVariants,
  type DropdownMenuProps as CoreDropdownMenuProps,
  type MenuItemProps as CoreMenuItemProps,
} from '@refraction-ui/dropdown-menu'
import { cn, createKeyboardHandler, devWarn } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface DropdownMenuContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentId: string
  /** The trigger element, so the portalled content can anchor to it. */
  triggerRef: React.MutableRefObject<HTMLElement | null>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenuContext(): DropdownMenuContextValue {
  const ctx = React.useContext(DropdownMenuContext)
  if (!ctx) {
    devWarn(
      'react-dropdown-menu/context-outside-provider',
      'DropdownMenu compound components (DropdownMenuTrigger/DropdownMenuContent/DropdownMenuItem/etc.) must be rendered inside a <DropdownMenu>. The missing DropdownMenuContext makes this throw.',
    )
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

  const triggerRef = React.useRef<HTMLElement | null>(null)

  const ctx = React.useMemo<DropdownMenuContextValue>(
    () => ({
      open,
      onOpenChange: handleOpenChange,
      contentId: api.ids.content,
      triggerRef,
    }),
    [open, handleOpenChange, api.ids.content],
  )

  return React.createElement(DropdownMenuContext.Provider, { value: ctx }, children)
}

// ---------------------------------------------------------------------------
// DropdownMenuTrigger
// ---------------------------------------------------------------------------

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge the trigger's props/behavior onto the child element instead of
   * rendering a `<button>` around it (Radix-style `asChild`). Use it with
   * styled triggers like `<Button>` — otherwise you'd nest a button in a
   * button (invalid HTML and a hydration error). */
  asChild?: boolean
}

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger({ asChild = false, onClick, children, ...props }, ref) {
    const { open, onOpenChange, contentId, triggerRef } = useDropdownMenuContext()
    const setRefs = (node: HTMLButtonElement | null) => {
      triggerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onOpenChange(!open)
      onClick?.(e)
    }

    const triggerProps = {
      type: 'button' as const,
      'aria-expanded': open,
      'aria-controls': contentId,
      'aria-haspopup': 'menu' as const,
      onClick: handleClick,
      ...props,
    }

    if (asChild) {
      if (!React.isValidElement(children)) {
        devWarn(
          'dropdown-menu-trigger-asChild-child',
          'DropdownMenuTrigger: `asChild` expects a single React element child; rendering nothing.',
        )
        return null
      }
      const child = children as React.ReactElement<
        Record<string, unknown>
      > & { ref?: React.Ref<HTMLButtonElement> }
      const childOnClick = child.props.onClick as
        | ((e: React.MouseEvent<HTMLButtonElement>) => void)
        | undefined
      const childRef = child.ref
      const mergedProps = {
        ...triggerProps,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          childOnClick?.(e)
          if (!e.defaultPrevented) handleClick(e)
        },
        ref: (node: HTMLButtonElement | null) => {
          setRefs(node)
          if (typeof childRef === 'function') childRef(node)
          else if (childRef) childRef.current = node
        },
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return React.cloneElement(child, mergedProps as any)
    }

    return React.createElement('button', { ref: setRefs, ...triggerProps }, children)
  },
)

// ---------------------------------------------------------------------------
// Positioning
// ---------------------------------------------------------------------------

export type DropdownMenuAlign = 'start' | 'center' | 'end'

const DEFAULT_SIDE_OFFSET = 4

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

/**
 * Fixed-position coordinates that place a menu under its trigger, aligned to
 * the trigger's start, centre or end edge. Pure, so it is unit-testable.
 */
export function computeMenuPosition(
  trigger: { top: number; bottom: number; left: number; right: number; width: number },
  contentWidth: number,
  align: DropdownMenuAlign,
  sideOffset: number,
): React.CSSProperties {
  const left =
    align === 'end'
      ? trigger.right - contentWidth
      : align === 'center'
        ? trigger.left + trigger.width / 2 - contentWidth / 2
        : trigger.left
  return { position: 'fixed', top: trigger.bottom + sideOffset, left: Math.max(0, left), minWidth: trigger.width }
}

// ---------------------------------------------------------------------------
// DropdownMenuContent
// ---------------------------------------------------------------------------

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Horizontal alignment to the trigger. Defaults to `start`. */
  align?: DropdownMenuAlign
  /** Gap between trigger and menu in px. Defaults to 4. */
  sideOffset?: number
}

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent(
    { className, children, onKeyDown, align = 'start', sideOffset = DEFAULT_SIDE_OFFSET, style, ...props },
    forwardedRef,
  ) {
    const { open, onOpenChange, contentId, triggerRef } = useDropdownMenuContext()
    const contentRef = React.useRef<HTMLDivElement | null>(null)
    const ref = React.useCallback(
      (node: HTMLDivElement | null) => {
        contentRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef],
    )
    const [position, setPosition] = React.useState<React.CSSProperties | null>(null)

    // The content is portalled to <body>, so anchor it to the trigger with
    // fixed coordinates, and follow the trigger on scroll / resize.
    useIsomorphicLayoutEffect(() => {
      if (!open) return
      const update = () => {
        const trigger = triggerRef.current
        const content = contentRef.current
        if (!trigger) return
        setPosition(
          computeMenuPosition(trigger.getBoundingClientRect(), content?.offsetWidth ?? 0, align, sideOffset),
        )
      }
      update()
      window.addEventListener('resize', update)
      window.addEventListener('scroll', update, true)
      return () => {
        window.removeEventListener('resize', update)
        window.removeEventListener('scroll', update, true)
      }
    }, [open, align, sideOffset, triggerRef])

    // Close on a pointer press outside the menu and its trigger.
    React.useEffect(() => {
      if (!open) return
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node
        if (contentRef.current?.contains(target) || triggerRef.current?.contains(target)) return
        onOpenChange(false)
      }
      document.addEventListener('pointerdown', onPointerDown)
      return () => document.removeEventListener('pointerdown', onPointerDown)
    }, [open, onOpenChange, triggerRef])

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
        style: position ? { ...position, ...style } : style,
        'data-align': align,
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

// ---------------------------------------------------------------------------
// DropdownMenuItem
// ---------------------------------------------------------------------------

export interface DropdownMenuItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  disabled?: boolean
  onSelect?: () => void
}

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  function DropdownMenuItem({ className, disabled, onSelect, onClick, children, ...props }, ref) {
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

// ---------------------------------------------------------------------------
// DropdownMenuSeparator
// ---------------------------------------------------------------------------

export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  function DropdownMenuSeparator({ className, ...props }, ref) {
    return React.createElement('div', {
      ref,
      role: 'separator',
      className: cn('-mx-1 my-1 h-px bg-muted', className),
      ...props,
    })
  },
)

// ---------------------------------------------------------------------------
// DropdownMenuLabel
// ---------------------------------------------------------------------------

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  function DropdownMenuLabel({ className, ...props }, ref) {
    return React.createElement('div', {
      ref,
      className: cn('px-2 py-1.5 text-sm font-semibold', className),
      ...props,
    })
  },
)
