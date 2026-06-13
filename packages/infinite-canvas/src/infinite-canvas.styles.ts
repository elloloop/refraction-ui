import { cva } from '@refraction-ui/shared'

/**
 * The outer viewport container. `overflow-hidden` clips panned content;
 * `relative` anchors the absolute controls overlay.
 *
 * The `grid` variant adds a subtle dot-grid background rendered with a radial
 * gradient using the `--border` semantic token so it respects the active theme.
 */
export const infiniteCanvasVariants = cva({
  base: 'relative overflow-hidden bg-background',
  variants: {
    grid: {
      'true': [
        'bg-[radial-gradient(circle,hsl(var(--border))_1px,transparent_1px)]',
        '[background-size:24px_24px]',
      ].join(' '),
      'false': '',
    },
  },
  defaultVariants: {
    grid: 'false',
  },
})

/**
 * The transformed content layer that wraps children.
 * `transform-gpu` promotes the layer for smooth panning/zooming.
 * `origin-top-left` matches `transformOrigin: '0 0'` in the React adapter.
 */
export const canvasContentClass =
  'absolute inset-0 origin-top-left will-change-transform'

/** Zoom-controls cluster — pinned to the bottom-right of the viewport. */
export const canvasControlsClass =
  'absolute bottom-4 right-4 z-10 flex items-center gap-1'

/** Individual zoom button (+ / − / fit). */
export const canvasZoomButtonVariants = cva({
  base: [
    'inline-flex h-8 w-8 items-center justify-center rounded-md border border-border',
    'bg-card text-foreground text-sm font-medium',
    'hover:bg-muted transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  variants: {},
  defaultVariants: {},
})
