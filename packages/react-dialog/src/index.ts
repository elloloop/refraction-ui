export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  type DialogProps,
  type DialogTriggerProps,
  type DialogContentProps,
  type DialogOverlayProps,
  type DialogHeaderProps,
  type DialogFooterProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
  type DialogCloseProps,
} from './dialog.js'

// Re-export headless types for convenience
export {
  type DialogProps as CoreDialogProps,
  type DialogAPI,
  type DialogState,
  overlayStyles,
  dialogContentVariants,
} from '@elloloop/dialog'
