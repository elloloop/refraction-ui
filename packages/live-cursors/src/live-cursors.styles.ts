import { cva } from '@refraction-ui/shared'

/**
 * Full-bleed overlay that contains all cursor elements.
 * `pointer-events-none` and `overflow-hidden` ensure cursors are decorative
 * and don't interfere with the underlying canvas interactions.
 */
export const liveCursorsVariants = cva({
  base: 'absolute inset-0 overflow-hidden pointer-events-none',
  variants: {
    /** Future variant hook — reserved for theming overrides. */
    hidden: {
      true: 'invisible',
      false: '',
    },
  },
  defaultVariants: {
    hidden: 'false',
  },
})

/**
 * Wrapper for a single cursor (SVG + label). Absolutely positioned via inline
 * `left`/`top` style; the transition provides smooth movement when coordinates
 * update.
 */
export const cursorWrapperClass =
  'absolute flex flex-col items-start transition-[left,top] duration-100 ease-linear'

/**
 * The SVG cursor arrow container. Fill is applied via inline style (per
 * collaborator color) so no utility class is needed here.
 */
export const cursorArrowClass = 'h-5 w-5 drop-shadow-sm'

/**
 * Name-label chip that appears below the cursor arrow. Background is applied
 * via inline style (per collaborator color); text is always white for contrast.
 */
export const cursorLabelClass =
  'mt-0.5 ml-2 rounded px-1.5 py-0.5 text-xs font-medium text-white shadow-sm whitespace-nowrap'
