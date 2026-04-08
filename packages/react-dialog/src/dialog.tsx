import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  createDialog,
  overlayStyles,
  dialogContentVariants,
  type DialogProps as CoreDialogProps,
} from '@refraction-ui/dialog'
import { cn, createKeyboardHandler } from '@refraction-ui/shared'

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
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext(): DialogContextValue {
  const ctx = React.useContext(DialogContext)
  if (!ctx) {
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

  // Use the headless core to get stable IDs
  const apiRef = React.useRef<ReturnType<typeof createDialog> | null>(null)
  if (apiRef.current === null) {
    apiRef.current = createDialog({ open, modal })
  }
  const api = apiRef.current

  const ctx = React.useMemo<DialogContextValue>(
    () => ({
      open,
      onOpenChange: handleOpenChange,
      modal,
      contentId: api.ids.content,
      titleId: api.ids.title,
      descriptionId: api.ids.description,
    }),
    [open, handleOpenChange, modal, api.ids.content, api.ids.title, api.ids.description],
  )

  return React.createElement(DialogContext.Provider, { value: ctx }, children)
}

Dialog.displayName = 'Dialog'

// ---------------------------------------------------------------------------
// DialogTrigger
// ---------------------------------------------------------------------------

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ onClick, children, ...props }, ref) => {
    const { open, onOpenChange, contentId } = useDialogContext()

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
        'aria-haspopup': 'dialog',
        onClick: handleClick,
        ...props,
      },
      children,
    )
  },
)

DialogTrigger.displayName = 'DialogTrigger'

// ---------------------------------------------------------------------------
// DialogOverlay
// ---------------------------------------------------------------------------

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, onClick, ...props }, ref) => {
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

DialogOverlay.displayName = 'DialogOverlay'

// ---------------------------------------------------------------------------
// DialogContent
// ---------------------------------------------------------------------------

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, onKeyDown, ...props }, ref) => {
    const { open, onOpenChange, modal, contentId, titleId, descriptionId } =
      useDialogContext()

    const api = React.useMemo(
      () => createDialog({ open, modal }),
      [open, modal],
    )

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
        'aria-labelledby': titleId,
        'aria-describedby': descriptionId,
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

DialogContent.displayName = 'DialogContent'

// ---------------------------------------------------------------------------
// DialogHeader
// ---------------------------------------------------------------------------

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      className: cn('flex flex-col space-y-1.5 text-center sm:text-left', className),
      ...props,
    })
  },
)

DialogHeader.displayName = 'DialogHeader'

// ---------------------------------------------------------------------------
// DialogFooter
// ---------------------------------------------------------------------------

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
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

DialogFooter.displayName = 'DialogFooter'

// ---------------------------------------------------------------------------
// DialogTitle
// ---------------------------------------------------------------------------

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => {
    const { titleId } = useDialogContext()

    return React.createElement('h2', {
      ref,
      id: titleId,
      className: cn('text-lg font-semibold leading-none tracking-tight', className),
      ...props,
    })
  },
)

DialogTitle.displayName = 'DialogTitle'

// ---------------------------------------------------------------------------
// DialogDescription
// ---------------------------------------------------------------------------

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, ...props }, ref) => {
  const { descriptionId } = useDialogContext()

  return React.createElement('p', {
    ref,
    id: descriptionId,
    className: cn('text-sm text-muted-foreground', className),
    ...props,
  })
})

DialogDescription.displayName = 'DialogDescription'

// ---------------------------------------------------------------------------
// DialogClose
// ---------------------------------------------------------------------------

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ onClick, children, ...props }, ref) => {
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

DialogClose.displayName = 'DialogClose'
