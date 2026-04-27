import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cn, cva, createKeyboardHandler, generateId } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// Side
// ---------------------------------------------------------------------------

export type SheetSide = 'top' | 'right' | 'bottom' | 'left'

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const sheetOverlayStyles =
  'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'

export const sheetContentVariants = cva({
  base: 'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  variants: {
    side: {
      top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
      right:
        'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      bottom:
        'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
      left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
    },
  },
  defaultVariants: {
    side: 'right',
  },
})

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SheetContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  modal: boolean
  side: SheetSide
  contentId: string
  titleId: string
  descriptionId: string
  triggerRef: React.MutableRefObject<HTMLElement | null>
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

function useSheetContext(): SheetContextValue {
  const ctx = React.useContext(SheetContext)
  if (!ctx) {
    throw new Error('Sheet compound components must be used within <Sheet>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Sheet (root provider)
// ---------------------------------------------------------------------------

export interface SheetProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  side?: SheetSide
  children?: React.ReactNode
}

export function Sheet({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  side = 'right',
  children,
}: SheetProps) {
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

  // Stable IDs for aria linking — generated once per Sheet instance.
  const idsRef = React.useRef<{ content: string; title: string; description: string } | null>(
    null,
  )
  if (idsRef.current === null) {
    idsRef.current = {
      content: generateId('rfr-sheet'),
      title: generateId('rfr-sheet-title'),
      description: generateId('rfr-sheet-desc'),
    }
  }

  const triggerRef = React.useRef<HTMLElement | null>(null)

  const ctx = React.useMemo<SheetContextValue>(
    () => ({
      open,
      onOpenChange: handleOpenChange,
      modal,
      side,
      contentId: idsRef.current!.content,
      titleId: idsRef.current!.title,
      descriptionId: idsRef.current!.description,
      triggerRef,
    }),
    [open, handleOpenChange, modal, side],
  )

  return React.createElement(SheetContext.Provider, { value: ctx }, children)
}

Sheet.displayName = 'Sheet'

// ---------------------------------------------------------------------------
// SheetTrigger
// ---------------------------------------------------------------------------

export interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ onClick, children, ...props }, ref) => {
    const { open, onOpenChange, contentId, triggerRef } = useSheetContext()

    const setRefs = React.useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
        }
      },
      [ref, triggerRef],
    )

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onOpenChange(!open)
      onClick?.(e)
    }

    return React.createElement(
      'button',
      {
        ref: setRefs,
        type: 'button',
        'aria-expanded': open,
        'aria-controls': contentId,
        'aria-haspopup': 'dialog',
        onClick: handleClick,
        ...props,
      },
      children,
    )
  },
)

SheetTrigger.displayName = 'SheetTrigger'

// ---------------------------------------------------------------------------
// SheetOverlay
// ---------------------------------------------------------------------------

export interface SheetOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SheetOverlay = React.forwardRef<HTMLDivElement, SheetOverlayProps>(
  ({ className, onClick, ...props }, ref) => {
    const { open, onOpenChange } = useSheetContext()

    if (!open) return null

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onOpenChange(false)
      }
      onClick?.(e)
    }

    return React.createElement('div', {
      ref,
      className: cn(sheetOverlayStyles, className),
      'data-state': open ? 'open' : 'closed',
      onClick: handleClick,
      ...props,
    })
  },
)

SheetOverlay.displayName = 'SheetOverlay'

// ---------------------------------------------------------------------------
// SheetContent
// ---------------------------------------------------------------------------

export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Side of the screen the sheet slides in from.
   * Overrides the `side` prop on the parent <Sheet> if provided.
   */
  side?: SheetSide
  /**
   * If true (default), an overlay is rendered behind the content and
   * clicks outside the content close the sheet.
   */
  withOverlay?: boolean
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  (
    {
      className,
      children,
      onKeyDown,
      side: sideProp,
      withOverlay = true,
      ...props
    },
    ref,
  ) => {
    const {
      open,
      onOpenChange,
      modal,
      side: ctxSide,
      contentId,
      titleId,
      descriptionId,
      triggerRef,
    } = useSheetContext()

    const side = sideProp ?? ctxSide

    const contentRef = React.useRef<HTMLDivElement | null>(null)
    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        contentRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
      },
      [ref],
    )

    // Restore focus to trigger when sheet closes.
    const wasOpenRef = React.useRef(false)
    React.useEffect(() => {
      if (open) {
        wasOpenRef.current = true
        // Move focus into the content for keyboard users / screen readers.
        if (contentRef.current && typeof document !== 'undefined') {
          const active = document.activeElement as HTMLElement | null
          if (!active || !contentRef.current.contains(active)) {
            contentRef.current.focus({ preventScroll: true })
          }
        }
      } else if (wasOpenRef.current) {
        wasOpenRef.current = false
        const trigger = triggerRef.current
        if (trigger && typeof trigger.focus === 'function') {
          trigger.focus({ preventScroll: true })
        }
      }
    }, [open, triggerRef])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const handler = createKeyboardHandler({
        Escape: (ev: KeyboardEvent) => {
          ev.preventDefault()
          onOpenChange(false)
        },
      })
      handler(e.nativeEvent)
      onKeyDown?.(e)
    }

    if (!open) return null

    const contentEl = React.createElement(
      'div',
      {
        ref: setRefs,
        role: 'dialog',
        'aria-modal': modal,
        'aria-labelledby': titleId,
        'aria-describedby': descriptionId,
        id: contentId,
        'data-state': open ? 'open' : 'closed',
        'data-side': side,
        className: cn(sheetContentVariants({ side }), className),
        onKeyDown: handleKeyDown,
        tabIndex: -1,
        ...props,
      },
      children,
    )

    const tree = withOverlay
      ? React.createElement(
          React.Fragment,
          null,
          React.createElement('div', {
            key: 'overlay',
            className: sheetOverlayStyles,
            'data-state': open ? 'open' : 'closed',
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
              if (e.target === e.currentTarget) {
                onOpenChange(false)
              }
            },
          }),
          contentEl,
        )
      : contentEl

    if (typeof document !== 'undefined') {
      return ReactDOM.createPortal(tree, document.body)
    }

    return tree
  },
)

SheetContent.displayName = 'SheetContent'

// ---------------------------------------------------------------------------
// SheetHeader
// ---------------------------------------------------------------------------

export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ className, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      className: cn('flex flex-col space-y-2 text-center sm:text-left', className),
      ...props,
    })
  },
)

SheetHeader.displayName = 'SheetHeader'

// ---------------------------------------------------------------------------
// SheetFooter
// ---------------------------------------------------------------------------

export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SheetFooter = React.forwardRef<HTMLDivElement, SheetFooterProps>(
  ({ className, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      className: cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className,
      ),
      ...props,
    })
  },
)

SheetFooter.displayName = 'SheetFooter'

// ---------------------------------------------------------------------------
// SheetTitle
// ---------------------------------------------------------------------------

export interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const SheetTitle = React.forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ className, ...props }, ref) => {
    const { titleId } = useSheetContext()
    return React.createElement('h2', {
      ref,
      id: titleId,
      className: cn('text-lg font-semibold text-foreground', className),
      ...props,
    })
  },
)

SheetTitle.displayName = 'SheetTitle'

// ---------------------------------------------------------------------------
// SheetDescription
// ---------------------------------------------------------------------------

export interface SheetDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  SheetDescriptionProps
>(({ className, ...props }, ref) => {
  const { descriptionId } = useSheetContext()
  return React.createElement('p', {
    ref,
    id: descriptionId,
    className: cn('text-sm text-muted-foreground', className),
    ...props,
  })
})

SheetDescription.displayName = 'SheetDescription'

// ---------------------------------------------------------------------------
// SheetClose
// ---------------------------------------------------------------------------

export interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(
  ({ onClick, children, ...props }, ref) => {
    const { onOpenChange } = useSheetContext()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onOpenChange(false)
      onClick?.(e)
    }

    return React.createElement(
      'button',
      {
        ref,
        type: 'button',
        onClick: handleClick,
        ...props,
      },
      children,
    )
  },
)

SheetClose.displayName = 'SheetClose'
