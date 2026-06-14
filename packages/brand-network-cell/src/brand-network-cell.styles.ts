import { cva } from '@refraction-ui/shared'

/**
 * Root card container. The `current` variant adds the primary ring that signals
 * "You are here". Background and border come from semantic tokens so the card
 * works in both light and dark themes without callers touching class names.
 */
export const brandNetworkCellVariants = cva({
  base: [
    'relative rounded-xl border border-border bg-card p-4',
    'flex flex-col gap-3 transition-shadow',
  ].join(' '),
  variants: {
    current: {
      true: 'ring-1 ring-primary',
      false: '',
    },
  },
  defaultVariants: {
    current: 'false',
  },
})

/**
 * Square glyph box — the brand monogram or icon.
 * Background and text colour are caller-provided via inline `style` (brand
 * tints vary per product); this class only controls geometry and typography.
 */
export const brandNetworkCellGlyphClass =
  'flex size-10 items-center justify-center rounded-lg text-sm font-bold'

/** Domain / product name row. */
export const brandNetworkCellDomainClass = 'font-semibold text-foreground'

/**
 * "You are here" badge shown beside the domain when `current` is true.
 * Uses semantic token colours so it inherits the active theme automatically.
 */
export const brandNetworkCellCurrentBadgeClass =
  'inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'

/** Supporting body text below the domain. */
export const brandNetworkCellBodyClass = 'text-sm text-muted-foreground'

/** Inline link row rendered at the bottom of the card. */
export const brandNetworkCellLinkClass = 'text-sm text-primary'
