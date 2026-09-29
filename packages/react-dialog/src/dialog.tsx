import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  overlayStyles,
  dialogContentVariants,
} from '@refraction-ui/dialog'
import { cn, createKeyboardHandler, devWarn } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
  modal: boolean
  contentId: string
  titleId: string
  descriptionId: string
  /** Whether a DialogTitle / DialogDescription is mounted — only then is it referenced. */
  hasTitle: boolean
  hasDescription: boolean
  setHasTitle: (present: boolean) => void
  setHasDescription: (present: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext(): DialogContextValue {
  const ctx = React.useContext(DialogContext)
  if (!ctx) {
    devWarn(
      'react-dialog/context-outside-provider',
      'Dialog compound components (DialogTrigger/DialogContent/DialogTitle/etc.) must be rendered inside a <Dialog>. The missing DialogContext makes this throw.',
    )
    throw new Error('Dialog compound components must be used within <Dialog>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Dialog (root provider)
// ---------------------------------------------------------------------------

export interface DialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  children?: React.ReactNode
}

export function Dialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  children,
}: DialogProps) {
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

  // React's tree-derived IDs survive SSR requests and client hydration.
  const id = React.useId()
  const contentId = `rfr-dialog-content-${id}`
  const titleId = `rfr-dialog-title-${id}`
  const descriptionId = `rfr-dialog-desc-${id}`
  const [hasTitle, setHasTitle] = React.useState(false)
  const [hasDescription, setHasDescription] = React.useState(false)

  const ctx = React.useMemo<DialogContextValue>(
    () => ({
      open,
      onOpenChange: handleOpenChange,
      modal,
      contentId,
      titleId,
      descriptionId,
      hasTitle,
      hasDescription,
      setHasTitle,
      setHasDescription,
    }),
    [open, handleOpenChange, modal, contentId, titleId, descriptionId, hasTitle, hasDescription],
  )

  return React.createElement(DialogContext.Provider, { value: ctx }, children)
}

// ---------------------------------------------------------------------------
// DialogTrigger
// ---------------------------------------------------------------------------

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger({ asChild = false, onClick, children, ...props }, ref) {
    const { open, onOpenChange, contentId } = useDialogContext()

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented) onOpenChange(!open)
    }
    const triggerProps = {
      type: 'button' as const,
      'aria-expanded': open,
      'aria-controls': contentId,
      'aria-haspopup': 'dialog' as const,
      ...props,
      onClick: handleClick,
    }

    if (asChild) {
      if (!React.isValidElement(children)) {
        devWarn('dialog-trigger-asChild-child', 'DialogTrigger: `asChild` expects a single React element child; rendering nothing.')
        return null
      }
      const child = children as React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement> & {
        ref?: React.Ref<HTMLButtonElement>
      }> & { ref?: React.Ref<HTMLButtonElement> }
      // React 19 moved ref into props; reading element.ref there emits a warning.
      const childRef = React.version.startsWith('18.') ? child.ref : child.props.ref
      return React.cloneElement(child, {
        ...triggerProps,
        className: cn(props.className, child.props.className),
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          child.props.onClick?.(event)
          if (!event.defaultPrevented) handleClick(event)
        },
        ref: (node: HTMLButtonElement | null) => {
          const outerCleanup: unknown = typeof ref === 'function' ? ref(node) : undefined
          if (ref && typeof ref !== 'function') ref.current = node
          const childCleanup: unknown = typeof childRef === 'function' ? childRef(node) : undefined
          if (childRef && typeof childRef !== 'function') childRef.current = node
          if (typeof outerCleanup === 'function' || typeof childCleanup === 'function') {
            return () => {
              if (typeof outerCleanup === 'function') outerCleanup()
              else if (typeof ref === 'function') ref(null)
              else if (ref) ref.current = null
              if (typeof childCleanup === 'function') childCleanup()
              else if (typeof childRef === 'function') childRef(null)
              else if (childRef) childRef.current = null
            }
          }
        },
      })
    }

    return React.createElement('button', { ref, ...triggerProps }, children)
  },
)

// ---------------------------------------------------------------------------
// DialogOverlay
// ---------------------------------------------------------------------------

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  function DialogOverlay({ className, onClick, ...props }, ref) {
    const { open, onOpenChange } = useDialogContext()

    if (!open) return null

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Only close if clicking the overlay itself, not children
      if (e.target === e.currentTarget) {
        onOpenChange(false)
      }
      onClick?.(e)
    }

    return React.createElement('div', {
      ref,
      className: cn(overlayStyles, className),
      'data-state': open ? 'open' : 'closed',
      onClick: handleClick,
      ...props,
    })
  },
)

// ---------------------------------------------------------------------------
// DialogContent
// ---------------------------------------------------------------------------

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Whether `type` appears in the element tree — covers the first and server
 * render, before a mounted DialogTitle/DialogDescription has registered.
 * Parts nested inside custom components are found once they mount.
 */
function containsElement(node: React.ReactNode, type: React.ElementType): boolean {
  let found = false
  React.Children.forEach(node, (child) => {
    if (found || !React.isValidElement<{ children?: React.ReactNode }>(child)) return
    found = child.type === type || containsElement(child.props.children, type)
  })
  return found
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ className, children, onKeyDown, ...props }, ref) {
    const { open, onOpenChange, modal, contentId, titleId, descriptionId, hasTitle, hasDescription } =
      useDialogContext()

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
        role: 'dialog',
        'aria-modal': modal,
        // Reference only parts that exist: an id pointing at nothing leaves the
        // dialog unnamed while looking labelled.
        'aria-labelledby': hasTitle || containsElement(children, DialogTitle) ? titleId : undefined,
        'aria-describedby':
          hasDescription || containsElement(children, DialogDescription) ? descriptionId : undefined,
        id: contentId,
        className: cn(dialogContentVariants(), className),
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
// DialogHeader
// ---------------------------------------------------------------------------

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader({ className, ...props }, ref) {
    return React.createElement('div', {
      ref,
      className: cn('flex flex-col space-y-1.5 text-center sm:text-left', className),
      ...props,
    })
  },
)

// ---------------------------------------------------------------------------
// DialogFooter
// ---------------------------------------------------------------------------

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter({ className, ...props }, ref) {
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

// ---------------------------------------------------------------------------
// DialogTitle
// ---------------------------------------------------------------------------

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ className, ...props }, ref) {
    const { titleId, setHasTitle } = useDialogContext()
    React.useEffect(() => {
      setHasTitle(true)
      return () => setHasTitle(false)
    }, [setHasTitle])

    return React.createElement('h2', {
      ref,
      id: titleId,
      className: cn('text-lg font-semibold leading-none tracking-tight', className),
      ...props,
    })
  },
)

// ---------------------------------------------------------------------------
// DialogDescription
// ---------------------------------------------------------------------------

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(function DialogDescription({ className, ...props }, ref) {
  const { descriptionId, setHasDescription } = useDialogContext()
  React.useEffect(() => {
    setHasDescription(true)
    return () => setHasDescription(false)
  }, [setHasDescription])

  return React.createElement('p', {
    ref,
    id: descriptionId,
    className: cn('text-sm text-muted-foreground', className),
    ...props,
  })
})

// ---------------------------------------------------------------------------
// DialogClose
// ---------------------------------------------------------------------------

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose({ onClick, children, ...props }, ref) {
    const { onOpenChange } = useDialogContext()

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
