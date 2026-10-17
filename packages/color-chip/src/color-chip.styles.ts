import { cva } from '@refraction-ui/shared'
import type { ColorChipCategory } from './color-chip.js'

/**
 * The chip itself. `border-transparent` is invisible normally but becomes a
 * real outline under Windows forced-colours mode, where the wash disappears.
 */
export const colorChipVariants = cva({
  base: [
    'inline-flex max-w-full items-center gap-1.5 rounded-full border border-transparent',
    'px-2.5 py-0.5 align-middle text-xs font-medium',
  ].join(' '),
  variants: {
    editable: {
      true: [
        // `relative` anchors the invisible hit-area extender.
        'relative cursor-pointer select-none transition-shadow motion-reduce:transition-none',
        'hover:ring-1 hover:ring-current',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      ].join(' '),
      false: '',
    },
  },
  defaultVariants: {
    editable: 'false',
  },
})

/**
 * Wash + text colour per category. Written out literally (not built from a
 * template) so Tailwind's content scanner finds every class.
 */
export const colorChipWashClasses: Record<ColorChipCategory, string> = {
  1: 'bg-category-1-wash text-category-1-foreground',
  2: 'bg-category-2-wash text-category-2-foreground',
  3: 'bg-category-3-wash text-category-3-foreground',
  4: 'bg-category-4-wash text-category-4-foreground',
  5: 'bg-category-5-wash text-category-5-foreground',
  6: 'bg-category-6-wash text-category-6-foreground',
  7: 'bg-category-7-wash text-category-7-foreground',
  8: 'bg-category-8-wash text-category-8-foreground',
}

/** Dot fill per category (literal for the same reason as the washes). */
export const colorChipDotClasses: Record<ColorChipCategory, string> = {
  1: 'bg-category-1',
  2: 'bg-category-2',
  3: 'bg-category-3',
  4: 'bg-category-4',
  5: 'bg-category-5',
  6: 'bg-category-6',
  7: 'bg-category-7',
  8: 'bg-category-8',
}

/** The dot's shape; combine with `colorChipDotClasses[dot]`. */
export const colorChipDotClass = 'size-2 shrink-0 rounded-full'

/** Label text: truncates instead of wrapping inside a narrow row. */
export const colorChipLabelClass = 'min-w-0 truncate'

/** The middle-dot between label and hint (decorative). */
export const colorChipSeparatorClass = 'shrink-0 opacity-60'

/** Hint text: lighter weight, same colour so it keeps the wash contrast. */
export const colorChipHintClass = 'min-w-0 truncate font-normal'

/** Edit glyph shown on editable chips. */
export const colorChipEditIconClass = 'size-3 shrink-0'

/** Screen-reader-only copy of the tooltip text. */
export const colorChipSrOnlyClass = 'sr-only'
