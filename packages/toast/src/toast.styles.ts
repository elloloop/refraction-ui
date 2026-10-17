import { cva } from '@refraction-ui/shared'

// Tinted variants paint their tint as a gradient layer over an opaque
// `bg-background`, so the page behind a toast never shows through it. Each
// class is written out in full because Tailwind only generates classes it can
// read in the source.
export const toastVariants = cva({
  base: 'pointer-events-auto relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-lg border p-4 shadow-lg transition-all motion-reduce:transition-none',
  variants: {
    variant: {
      default: 'border bg-background text-foreground',
      success:
        'border-l-4 border-success/50 bg-background bg-gradient-to-r from-success/10 to-success/10 text-success',
      error:
        'border-l-4 border-destructive/50 bg-background bg-gradient-to-r from-destructive/10 to-destructive/10 text-destructive',
      warning:
        'border-l-4 border-warning/50 bg-background bg-gradient-to-r from-warning/10 to-warning/10 text-warning',
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

/**
 * The text column of a toast. `min-w-0` lets it shrink below its longest
 * word and `break-words` wraps that word, so a long URL never pushes the
 * dismiss button out of the toast.
 */
export const toastContentClass = 'min-w-0 flex-1 break-words'

/**
 * The fixed container the toasts stack in. It keeps a gutter of `inset-x-4`
 * on both sides, so on a phone it spans the screen minus the gutters. Once
 * `max-w-sm` caps its width, `ml-auto` takes up the remaining space and keeps
 * it at the bottom right.
 */
export const toasterClass =
  'fixed bottom-4 inset-x-4 z-50 ml-auto flex max-w-sm flex-col gap-2 pointer-events-none'
