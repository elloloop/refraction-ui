import { cva } from '@refraction-ui/shared'

/**
 * Grid container variants.
 *
 * - `layout: 'grid'`    — uniform CSS grid; column count is set inline by the
 *   adapter using `computeGridColumns` (gridTemplateColumns).
 * - `layout: 'speaker'` — two-row layout: large spotlight on top, filmstrip row
 *   below. The adapter renders the spotlight as the first child and a horizontal
 *   overflow row for remaining tiles.
 */
export const videoGridVariants = cva({
  base: 'w-full h-full gap-2',
  variants: {
    layout: {
      grid: 'grid',
      speaker: 'flex flex-col',
      auto: 'grid',
    },
  },
  defaultVariants: {
    layout: 'auto',
  },
})

/** Full-bleed spotlight area in speaker view (takes up remaining vertical space). */
export const videoGridSpotlightClass = 'relative flex-1 min-h-0 rounded-xl overflow-hidden bg-muted'

/**
 * Horizontal filmstrip row used in speaker view.
 * Each tile in this row is constrained to a fixed width so the row scrolls
 * rather than wraps on large calls.
 */
export const videoGridFilmstripClass =
  'flex flex-row gap-2 overflow-x-auto py-1 shrink-0'

/** Individual filmstrip tile wrapper — fixed width so they don't collapse. */
export const videoGridFilmstripTileClass = 'w-36 shrink-0'
