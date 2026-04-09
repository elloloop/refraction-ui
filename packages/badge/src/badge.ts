import type { AccessibilityProps } from '@refraction-ui/shared'

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
}

export interface BadgeAPI {
  /** ARIA attributes to spread on the element */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
}

const statusVariants: BadgeVariant[] = ['success', 'warning', 'destructive']

/** Icon name for status badge variants — non-color indicator for colorblind safety */
const BADGE_ICONS: Partial<Record<BadgeVariant, string>> = {
  success: 'check',
  warning: 'alert',
  destructive: 'x',
}

/** Get the icon name for a badge variant (undefined for non-status variants) */
export function getBadgeIcon(variant: BadgeVariant): string | undefined {
  return BADGE_ICONS[variant]
}

export function createBadge(props: BadgeProps = {}): BadgeAPI {
  const { variant = 'default' } = props

  const ariaProps: Partial<AccessibilityProps> = {}

  if (statusVariants.includes(variant)) {
    ariaProps.role = 'status'
  }

  const dataAttributes: Record<string, string> = {}
  dataAttributes['data-variant'] = variant

  return {
    ariaProps,
    dataAttributes,
  }
}
