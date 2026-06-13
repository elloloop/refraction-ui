import type { AccessibilityProps } from '@refraction-ui/shared'

export interface AudienceFeatureCardProps {
  /** Kicker text displayed above the title (e.g. "For teams"). */
  kicker?: string
  /** Main title — required. */
  title: string
  /** Body copy. */
  body: string
  /** Footer content (optional). */
  footer?: string
}

export interface AudienceFeatureCardAPI {
  /** ARIA attributes to spread on the group element (`role="group"`). */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic group props for an audience feature card.
 *
 * Returns `role="group"` plus data attributes; adapters spread these onto
 * their container and render the kicker, title, body, and footer slots.
 */
export function createAudienceFeatureCard(
  _props: Partial<AudienceFeatureCardProps> = {},
): AudienceFeatureCardAPI {
  const ariaProps: Partial<AccessibilityProps> = {
    role: 'group',
  }

  const dataAttributes: Record<string, string> = {
    'data-component': 'audience-feature-card',
  }

  return { ariaProps, dataAttributes }
}
