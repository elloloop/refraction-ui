import { cva } from '@refraction-ui/shared'

/**
 * Visual variants for the separator rule.
 *
 * - `orientation: horizontal` → a full-width 1px line.
 * - `orientation: vertical` → a full-height 1px line.
 * - `labeled` → flex layout used by the labeled-divider variant, which
 *   arranges a centered label between two flanking lines.
 */
export const separatorVariants = cva({
  base: '',
  variants: {
    orientation: {
      horizontal: 'h-px w-full bg-border',
      vertical: 'w-px h-full bg-border',
    },
    labeled: {
      true: 'flex items-center',
      false: '',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    labeled: 'false',
  },
})

/** Class for each flanking line in the labeled-divider variant. */
export const separatorLineClass = 'h-px flex-1 bg-border'

/** Class for the centered label in the labeled-divider variant. */
export const separatorLabelClass =
  'px-3 text-xs uppercase tracking-wide text-muted-foreground'
