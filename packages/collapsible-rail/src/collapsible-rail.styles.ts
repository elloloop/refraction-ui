import { cva } from '@refraction-ui/shared'

/*
 * Every narrow-viewport class uses the arbitrary variant
 * `[@media(max-width:767px)]`, the same query as RAIL_MOBILE_MEDIA_QUERY, so
 * CSS and script agree to the pixel whatever breakpoints a theme defines. The
 * class strings are written out in full so Tailwind's scanner finds them.
 */

/**
 * The rail. On a wide viewport it sits in the layout at its width; on a narrow
 * one it is fixed to the start edge, capped at 80vw, and slides off screen
 * while closed (towards the left, or the right in right-to-left text).
 */
export const collapsibleRailVariants = cva({
  base:
    'relative z-10 flex shrink-0 cursor-pointer flex-col overflow-visible ' +
    'transition-[width,translate,transform] duration-200 ease-in-out motion-reduce:transition-none ' +
    '[@media(max-width:767px)]:fixed [@media(max-width:767px)]:inset-y-0 ' +
    '[@media(max-width:767px)]:start-0 [@media(max-width:767px)]:z-50 ' +
    '[@media(max-width:767px)]:h-dvh [@media(max-width:767px)]:max-w-[80vw]',
  variants: {
    open: {
      true: '[@media(max-width:767px)]:translate-x-0 [@media(max-width:767px)]:shadow-xl',
      false:
        '[@media(max-width:767px)]:pointer-events-none [@media(max-width:767px)]:-translate-x-full ' +
        '[@media(max-width:767px)]:rtl:translate-x-full',
    },
  },
  defaultVariants: {
    open: 'false',
  },
})

/**
 * The round control on the rail's end edge. `tone` matches the surface the
 * rail is drawn on. It hides with a closed overlay so it cannot peek on screen.
 */
export const railEdgeToggleVariants = cva({
  base:
    'absolute -end-3 top-3 z-10 flex size-6 items-center justify-center rounded-full border p-0 ' +
    'shadow-sm transition-[background-color,border-color,color,scale] hover:scale-110 ' +
    'motion-reduce:transition-none motion-reduce:hover:scale-100 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  variants: {
    tone: {
      default: 'border-border bg-card text-foreground hover:bg-muted',
      tertiary:
        'border-border-subtle bg-tertiary text-tertiary-foreground hover:border-primary ' +
        'hover:bg-primary hover:text-primary-foreground',
    },
    open: {
      true: '',
      false: '[@media(max-width:767px)]:hidden',
    },
  },
  defaultVariants: {
    tone: 'default',
    open: 'true',
  },
})

/** The chevron inside the edge control; it points the other way in right-to-left text. */
export const railEdgeToggleIconVariants = cva({
  base: 'size-2.5 rtl:-scale-x-100',
})

/**
 * The scrim under an open overlay. It covers the page beside the rail and
 * closes the rail when clicked; it never shows on a wide viewport.
 */
export const railBackdropVariants = cva({
  base:
    'fixed inset-0 z-40 cursor-pointer border-0 bg-black/40 p-0 ' +
    '[-webkit-tap-highlight-color:transparent] [@media(min-width:768px)]:hidden',
})
