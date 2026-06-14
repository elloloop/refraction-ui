import type { AccessibilityProps } from '@refraction-ui/shared'

/** CTA button/link visual variant. */
export type PricingCtaVariant = 'default' | 'outline'

export interface PricingCardOptions {
  /** Whether this card is highlighted as the featured / recommended plan. */
  featured?: boolean
}

export interface PricingCardAPI {
  /** ARIA props to spread on the card container. */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for styling hooks and CSS selectors. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic props for a pricing plan card.
 *
 * Returns `role="group"` (semantically groups the plan's content without
 * imposing listitem semantics on a standalone card) and a `data-featured`
 * attribute that adapters can use for conditional ring/highlight styling.
 */
export function createPricingCard(options: PricingCardOptions = {}): PricingCardAPI {
  const { featured = false } = options

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'group',
  }

  const dataAttributes: Record<string, string> = {
    'data-featured': String(featured),
  }

  return { ariaProps, dataAttributes }
}
