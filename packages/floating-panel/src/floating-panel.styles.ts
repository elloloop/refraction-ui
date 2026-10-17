import { cva } from '@refraction-ui/shared'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/**
 * The fixed-position panel. `motion` switches the snap animation off while
 * dragging and under reduced motion (the `motion-reduce:` class is the CSS
 * backstop for the JS check). `dragging` stops text selection mid-drag.
 * Position is a `transform` from `left: 0; top: 0`, so the panel's
 * shrink-to-fit width never depends on where it sits. Width is left to the
 * consumer's `className` (e.g. `w-72`).
 */
export const floatingPanelVariants = cva({
  base: [
    'fixed z-50 flex max-w-full flex-col overflow-hidden rounded-lg border border-border',
    'bg-card text-card-foreground shadow-lg',
  ].join(' '),
  variants: {
    motion: {
      animated: 'transition-transform duration-200 ease-out motion-reduce:transition-none',
      instant: 'transition-none',
    },
    dragging: {
      true: 'select-none',
      false: '',
    },
  },
  defaultVariants: {
    motion: 'animated',
    dragging: 'false',
  },
})

/** Header bar holding the drag handle, the header content and the collapse control. */
export const floatingPanelHeaderClass = 'flex items-center gap-1 bg-muted px-1'

/**
 * The drag handle: a 44 px square (`size-11`) so it meets the touch-target
 * minimum, `touch-none` so a touch drag moves the panel instead of scrolling.
 */
export const floatingPanelHandleVariants = cva({
  base: [
    'inline-flex size-11 shrink-0 touch-none select-none items-center justify-center rounded-md',
    'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    FOCUS_RING,
  ].join(' '),
  variants: {
    dragging: {
      true: 'cursor-grabbing',
      false: 'cursor-grab',
    },
  },
  defaultVariants: {
    dragging: 'false',
  },
})

/** Header content (e.g. the caller's name); truncates rather than widening the panel. */
export const floatingPanelHeaderContentClass =
  'min-w-0 flex-1 truncate text-sm font-medium text-foreground'

/** The collapsible body. */
export const floatingPanelBodyClass = 'border-t border-border'

/** Visually hidden text (handle hint, live announcements). */
export const floatingPanelSrOnlyClass = 'sr-only'
