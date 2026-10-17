/**
 * A highlighted match.
 *
 * Colour: `bg-warning` / `text-warning-foreground` is the only existing token
 * pair that (a) clears WCAG AA (≥ 5.9:1, most themes ≥ 7.7:1) in every
 * built-in theme in both light and dark, and (b) stays distinct from
 * `bg-accent`, the active-row colour of menus and command lists that compose
 * this component — an accent highlight would vanish on the active row.
 *
 * Not colour alone: matches are also `font-semibold`, which survives
 * greyscale, colour-blindness and forced-colours modes. `box-decoration-clone`
 * keeps the rounded background intact when a match wraps across lines.
 */
export const highlightTextMarkClass = [
  'rounded-sm bg-warning font-semibold text-warning-foreground',
  'box-decoration-clone',
].join(' ')
