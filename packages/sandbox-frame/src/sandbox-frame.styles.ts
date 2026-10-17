import { cva } from '@refraction-ui/shared'
import { buttonVariants } from '@refraction-ui/button'

/** Outer container: border, radius and theme surface around the frame. */
export const sandboxFrameClass =
  'relative w-full overflow-hidden rounded-lg border border-border bg-background text-foreground'

/** Box that carries the resolved height; the iframe and overlays fill it. */
export const sandboxFrameViewportClass =
  'relative w-full transition-[height] duration-200 motion-reduce:transition-none'

/**
 * The iframe itself. It stays in the tab order (keyboard users can scroll a
 * fixed-height frame), so it gets the standard focus ring. While loading it is
 * transparent beneath the loading overlay.
 */
export const sandboxFrameIframeVariants = cva({
  base: [
    'block h-full w-full border-0 bg-background',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
  ].join(' '),
  variants: {
    state: {
      loading: 'opacity-0',
      ready: 'opacity-100',
      error: 'opacity-0',
    },
  },
  defaultVariants: {
    state: 'loading',
  },
})

/** Loading overlay covering the viewport. */
export const sandboxFrameLoadingClass =
  'absolute inset-0 flex items-center justify-center gap-2 bg-muted text-sm text-muted-foreground'

/** Decorative spinner next to the loading text; stops under reduced motion. */
export const sandboxFrameSpinnerClass =
  'size-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin motion-reduce:animate-none'

/** Error panel: a text message (never colour alone) plus the reload action. */
export const sandboxFrameErrorClass =
  'flex flex-col items-start gap-3 border-l-4 border-destructive bg-muted p-4 text-sm text-foreground'

/** Footer row holding the expand / collapse control. */
export const sandboxFrameFooterClass = 'flex justify-center border-t border-border bg-background p-1'

/** Text actions (expand, reload): composed from Button, with a 44px minimum target. */
export const sandboxFrameActionClass = [
  buttonVariants({ variant: 'ghost', size: 'default' }),
  'min-h-11 focus-visible:ring-ring focus-visible:ring-offset-background',
].join(' ')
