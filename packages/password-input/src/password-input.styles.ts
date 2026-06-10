import { cva } from '@refraction-ui/shared'

/**
 * Positioning classes for the reveal/hide toggle button rendered inside a
 * password input's trailing padding. The wrapper must be `relative` and the
 * input must reserve trailing space (e.g. `pr-10`).
 */
export const passwordToggleVariants = cva({
  base: 'absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
})
