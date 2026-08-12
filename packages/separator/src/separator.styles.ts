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
      horizontal: 'h-px w-full',
      vertical: 'w-px h-full',
    },
    // Line color (issue #485). `default` is the standard border token;
    // `subtle` uses the hairline `border-subtle` token for a lighter rule.
    // Keeping the color here (not in `orientation`) keeps every existing call
    // pixel-identical while adding the subtle option.
    tone: {
      default: 'bg-border',
      subtle: 'bg-border-subtle',
    },
    labeled: {
      true: 'flex items-center',
      false: '',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    tone: 'default',
    labeled: 'false',
  },
})

/** Line tone for the separator rule and labeled-divider flanks. */
export type SeparatorTone = 'default' | 'subtle'

/** Class for each flanking line in the labeled-divider variant. */
export const separatorLineClass = 'h-px flex-1 bg-border'

/** Hairline variant of {@link separatorLineClass} (issue #485). */
export const separatorSubtleLineClass = 'h-px flex-1 bg-border-subtle'

/** Class for the centered label in the labeled-divider variant. */
export const separatorLabelClass =
  'px-3 text-xs uppercase tracking-wide text-muted-foreground'
