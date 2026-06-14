import { cva } from '@refraction-ui/shared'

/**
 * Root pricing card container. The `featured` variant adds a primary-coloured
 * ring to draw the eye to the recommended plan.
 */
export const pricingCardVariants = cva({
  base: [
    'relative flex flex-col rounded-2xl border border-border bg-card p-6',
    'transition-shadow',
  ].join(' '),
  variants: {
    featured: {
      true: 'ring-1 ring-primary',
      false: '',
    },
  },
  defaultVariants: {
    featured: 'false',
  },
})

/** "Best value" / "Most popular" badge above the plan name. */
export const pricingCardBadgeClass =
  'mb-3 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'

/** Plan name (e.g. "Pro", "Starter"). */
export const pricingCardNameClass = 'text-lg font-bold text-foreground'

/** Main price figure (e.g. "$29", "Free"). */
export const pricingCardPriceClass = 'text-3xl font-bold text-foreground'

/** Billing period or qualifier (e.g. "/ month", "forever"). */
export const pricingCardPeriodClass = 'text-sm text-muted-foreground'

/** Short marketing description beneath the price. */
export const pricingCardDescriptionClass = 'text-sm text-muted-foreground'

/** Unordered list of included features. */
export const pricingCardFeatureListClass = 'flex flex-col gap-2'

/** A single feature row — tick icon + text. */
export const pricingCardFeatureRowClass = 'flex items-start gap-2 text-sm text-foreground'

/** Inline check SVG rendered before each feature string. */
export const pricingCardFeatureTickClass = 'mt-0.5 size-4 shrink-0 text-primary'

/**
 * CTA button/link that appears at the bottom of the card.
 *
 * `default` — filled primary style (call to action on featured plans).
 * `outline` — bordered secondary style (for non-featured plans).
 */
export const pricingCtaVariants = cva({
  base: [
    'mt-auto inline-flex w-full items-center justify-center rounded-lg px-4 py-2',
    'text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline:
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
