import * as React from 'react'
import {
  createAudienceFeatureCard,
  audienceFeatureCardVariants,
  audienceFeatureCardKickerClass,
  audienceFeatureCardTitleClass,
  audienceFeatureCardBodyClass,
  audienceFeatureCardFooterClass,
} from '@refraction-ui/audience-feature-card'
import { cn } from '@refraction-ui/shared'

export interface AudienceFeatureCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Kicker text displayed above the title (e.g. "For teams"). */
  kicker?: React.ReactNode
  /** Main title — required. */
  title: React.ReactNode
  /** Body copy. */
  body: React.ReactNode
  /** Footer slot — pushed to bottom of the card. */
  footer?: React.ReactNode
}

/**
 * AudienceFeatureCard — a marketing feature/audience card.
 *
 * Full-height flex-col layout so footers align across a row of cards.
 * Accepts kicker, title, body, and an optional footer slot.
 * Spreads `role="group"` from the headless core for accessibility.
 */
export const AudienceFeatureCard = React.forwardRef<
  HTMLDivElement,
  AudienceFeatureCardProps
>(({ kicker, title, body, footer, className, ...props }, ref) => {
  const { ariaProps, dataAttributes } = createAudienceFeatureCard()

  return (
    <div
      ref={ref}
      className={cn(audienceFeatureCardVariants(), className)}
      {...ariaProps}
      {...dataAttributes}
      {...props}
    >
      {kicker != null && (
        <p className={audienceFeatureCardKickerClass}>{kicker}</p>
      )}
      <p className={audienceFeatureCardTitleClass}>{title}</p>
      <p className={audienceFeatureCardBodyClass}>{body}</p>
      {footer != null && (
        <div className={audienceFeatureCardFooterClass}>{footer}</div>
      )}
    </div>
  )
})

AudienceFeatureCard.displayName = 'AudienceFeatureCard'
