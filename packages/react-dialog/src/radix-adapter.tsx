import * as React from 'react'
// @ts-expect-error - Radix is not installed since pnpm install is forbidden
import * as RadixDialog from '@radix-ui/react-dialog'
import { overlayStyles, dialogContentVariants } from '@refraction-ui/dialog'
import { cn } from '@refraction-ui/shared'

export interface DialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  children?: React.ReactNode
}

export function Dialog(props: DialogProps) {
  return React.createElement(RadixDialog.Root, props)
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger(props, ref) {
    return React.createElement(RadixDialog.Trigger, { ...props, ref })
  }
)

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  function DialogOverlay({ className, ...props }, ref) {
    return React.createElement(RadixDialog.Overlay, {
      className: cn(overlayStyles, className),
      ...props,
      ref,
    })
  }
)

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ className, children, ...props }, ref) {
    return React.createElement(
      RadixDialog.Portal,
      null,
      React.createElement(
        RadixDialog.Content,
        {
          className: cn(dialogContentVariants(), className),
          ...props,
          ref,
        },
        children
      )
    )
  }
)

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader({ className, ...props }, ref) {
    return React.createElement('div', {
      className: cn('flex flex-col space-y-1.5 text-center sm:text-left', className),
      ...props,
      ref,
    })
  }
)

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter({ className, ...props }, ref) {
    return React.createElement('div', {
      className: cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className
      ),
      ...props,
      ref,
    })
  }
)

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ className, ...props }, ref) {
    return React.createElement(RadixDialog.Title, {
      className: cn('text-lg font-semibold leading-none tracking-tight', className),
      ...props,
      ref,
    })
  }
)

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, ...props }, ref) {
    return React.createElement(RadixDialog.Description, {
      className: cn('text-sm text-muted-foreground', className),
      ...props,
      ref,
    })
  }
)

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose(props, ref) {
    return React.createElement(RadixDialog.Close, { ...props, ref })
  }
)
