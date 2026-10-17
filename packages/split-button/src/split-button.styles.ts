import { cva } from '@refraction-ui/shared'

/**
 * The wrapper. `isolate` keeps the focused part's raised `z-index` inside this
 * control so it can't climb over surrounding page chrome.
 */
export const splitButtonGroupClass = 'relative isolate inline-flex items-stretch align-middle'

/**
 * Shared by both parts, layered on Button's `buttonVariants` output. The
 * focused part rises above its neighbour so its whole ring stays visible;
 * colour transitions stop under `prefers-reduced-motion`.
 */
const splitButtonPartClass =
  'shrink-0 focus-visible:z-10 focus-visible:ring-ring focus-visible:ring-offset-background motion-reduce:transition-none'

/** The primary action: square corners where it meets the caret. */
export const splitButtonActionClass = `${splitButtonPartClass} rounded-e-none`

/**
 * The caret: as tall as the action (same Button size), square, with square
 * corners where it meets the action. `ps-0 pe-0` drop the size's horizontal
 * padding (they sort after Button's `px-*`, so they win); the chevron sits
 * centred in the square. `relative` anchors the hit-area extender: the caret
 * is DropdownMenu's own trigger button, not a `Button`, which adds it itself.
 */
export const splitButtonTriggerVariants = cva({
  base: `${splitButtonPartClass} relative aspect-square ps-0 pe-0 rounded-s-none`,
  variants: {
    divider: {
      'shared-border': '-ms-px',
      hairline: 'border-s border-s-current/25',
    },
  },
  defaultVariants: {
    divider: 'hairline',
  },
})

/**
 * Invisible box that extends a part's hit area to the minimum tap target
 * without moving layout (absolute children take no space). Each one is pinned
 * to the edge where the two parts meet, so it grows outward and the two never
 * overlap: a press near the seam always lands on the part under the pointer.
 * `-z-10` stacks it beneath the parts, inside the group's isolated context:
 * it only catches presses outside a part's own box and never covers the
 * label, so contrast checkers can still read the label's background.
 */
export const splitButtonHitAreaVariants = cva({
  base: 'absolute top-1/2 -z-10 h-full w-full -translate-y-1/2',
  variants: {
    part: {
      action: 'end-0',
      trigger: 'start-0',
    },
  },
})

/** The default chevron glyph. */
export const splitButtonCaretClass = 'pointer-events-none h-4 w-4 shrink-0'
