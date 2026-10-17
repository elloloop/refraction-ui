import { cva } from '@refraction-ui/shared'

/**
 * Extra classes layered on Button's `buttonVariants` output. `shrink-0` keeps
 * the square from collapsing in flex rows; colour transitions stop under
 * `prefers-reduced-motion`. Button already supplies `relative`, which anchors
 * the hit-area extender below.
 */
export const iconButtonVariants = cva({
  base: 'shrink-0 focus-visible:ring-ring focus-visible:ring-offset-background motion-reduce:transition-none',
  variants: {
    // Only the `ghost` look gets a built-in pressed fill: every other Button
    // variant already sets a background, and `cn` does not resolve Tailwind
    // conflicts. For those, express the "on" state by swapping `variant`.
    // `shadow-inner` gives a non-colour depth cue alongside the fill.
    pressedGhost: {
      true: 'bg-accent text-accent-foreground shadow-inner',
      false: '',
    },
  },
  defaultVariants: {
    pressedGhost: 'false',
  },
})

/**
 * Invisible, absolutely positioned box centred on the button. It is at least
 * the button's own size and grows to `minTapTarget`, so pointer/touch hits
 * land on the button without changing its visual size or the layout around
 * it (absolute children take no space).
 */
export const iconButtonHitAreaClass =
  'absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2'

/** Icon wrapper: makes any child SVG fill the requested glyph size. */
export const iconButtonIconClass =
  'pointer-events-none inline-flex shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full'

/**
 * The trigger wrapper Tooltip needs for its hover/focus listeners. `contents`
 * removes its box so wrapping the button cannot change the surrounding layout.
 */
export const iconButtonTooltipTriggerClass = 'contents'

/** Positioned by the adapter (`position: fixed`); never intercepts pointer input. */
export const iconButtonTooltipClass =
  'pointer-events-none fixed whitespace-nowrap motion-reduce:animate-none'
