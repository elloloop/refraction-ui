import { cva } from '@refraction-ui/shared'

// Tinted variants paint their tint as a gradient layer over an opaque
// `bg-background`, so the page behind a toast never shows through it. Each
// class is written out in full because Tailwind only generates classes it can
// read in the source.
export const toastVariants = cva({
  base: 'pointer-events-auto relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
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
