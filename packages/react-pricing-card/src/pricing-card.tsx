import * as React from 'react'
import {
  createPricingCard,
  pricingCardVariants,
  pricingCardBadgeClass,
  pricingCardNameClass,
  pricingCardPriceClass,
  pricingCardPeriodClass,
  pricingCardDescriptionClass,
  pricingCardFeatureListClass,
  pricingCardFeatureRowClass,
  pricingCardFeatureTickClass,
  pricingCtaVariants,
  type PricingCtaVariant,
} from '@refraction-ui/pricing-card'
import { cn } from '@refraction-ui/shared'

export type { PricingCtaVariant }

export interface PricingCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  /** Optional badge label shown above the plan name (e.g. "Most popular"). */
  badge?: string
  /** Plan name (e.g. "Pro", "Starter"). */
  name: string
  /** Price string (e.g. "$29", "Free"). */
  price: string
  /** Billing period or qualifier (e.g. "/ month"). */
  period?: string
  /** Short marketing description. */
  description?: string
  /** List of included features to render as a checklist. */
  features: string[]
  /** CTA button/link label. */
  cta: string
  /** Visual variant for the CTA. */
  ctaVariant?: PricingCtaVariant
  /** When provided, the CTA renders as an `<a>` tag. */
  ctaHref?: string
  /** Click handler for the CTA button (ignored when `ctaHref` is provided). */
  onCtaClick?: React.MouseEventHandler<HTMLButtonElement>
  /** Highlights the card with a primary ring. */
  featured?: boolean
}

/**
 * PricingCard — a self-contained pricing plan card.
 *
 * Renders an optional badge, the plan name, price + optional period, optional
 * description, a feature checklist, and a full-width CTA (anchor when
 * `ctaHref` is set, button otherwise). The `featured` prop adds a primary-
 * colour ring to highlight the recommended plan. Logic and styles come from
 * the headless `@refraction-ui/pricing-card` core.
 */
export const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      badge,
      name,
      price,
      period,
      description,
      features,
      cta,
      ctaVariant = 'default',
      ctaHref,
      onCtaClick,
      featured = false,
      className,
      ...props
    },
    ref,
  ) => {
    const { ariaProps, dataAttributes } = createPricingCard({ featured })

    return (
      <div
        ref={ref}
        className={cn(pricingCardVariants({ featured: featured ? 'true' : 'false' }), className)}
        {...ariaProps}
        {...dataAttributes}
        {...props}
      >
        {badge != null && (
          <span className={pricingCardBadgeClass}>{badge}</span>
        )}

        <p className={pricingCardNameClass}>{name}</p>

        <div className="mt-4 flex items-baseline gap-1">
          <span className={pricingCardPriceClass}>{price}</span>
          {period != null && (
            <span className={pricingCardPeriodClass}>{period}</span>
          )}
        </div>

        {description != null && (
          <p className={`mt-2 ${pricingCardDescriptionClass}`}>{description}</p>
        )}

        <ul className={`mt-6 ${pricingCardFeatureListClass}`}>
          {features.map((feature) => (
            <li key={feature} className={pricingCardFeatureRowClass}>
              <svg
                className={pricingCardFeatureTickClass}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8l3.5 3.5L13 4.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          {ctaHref != null ? (
            <a
              href={ctaHref}
              className={pricingCtaVariants({ variant: ctaVariant })}
            >
              {cta}
            </a>
          ) : (
            <button
              type="button"
              className={pricingCtaVariants({ variant: ctaVariant })}
              onClick={onCtaClick}
            >
              {cta}
            </button>
          )}
        </div>
      </div>
    )
  },
)

PricingCard.displayName = 'PricingCard'
