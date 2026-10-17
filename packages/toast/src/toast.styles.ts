import { cva } from '@refraction-ui/shared'

export const toastVariants = cva({
  base: 'pointer-events-auto relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-lg border p-4 shadow-lg transition-all motion-reduce:transition-none',
  variants: {
    variant: {
      default: 'border bg-background text-foreground',
      success: 'border-l-4 border-success/50 bg-success/10 text-success',
      error: 'border-l-4 border-destructive/50 bg-destructive/10 text-destructive',
      warning: 'border-l-4 border-warning/50 bg-warning/10 text-warning',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

/** Keyboard focus ring shared by the toast's buttons; shown only for keyboard focus. */
const toastControlFocusClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** Heading above the message, when the toast has a title. */
export const toastTitleClass = 'text-sm font-semibold'

/** The message under a title. A toast without a title keeps the message unstyled. */
export const toastDescriptionClass = 'text-sm opacity-90'

/** The action button (e.g. "Undo"). It inherits the variant's text color. */
export const toastActionClass =
  'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-current/30 bg-transparent px-3 text-sm font-medium transition-colors hover:bg-current/10 motion-reduce:transition-none ' +
  toastControlFocusClass

/** The dismiss button. */
export const toastCloseClass =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none ' +
  toastControlFocusClass

/** Live region that announces toasts: present for assistive technology, invisible on screen. */
export const toastAnnouncerClass = 'sr-only'

/** The fixed container the toasts stack in. */
export const toasterClass =
  'fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none'
