import { badgeVariants } from '@refraction-ui/badge'
import { cn } from '@refraction-ui/shared'
import {
  STATUS_BADGE_DEFAULT_VARIANT,
  type StatusBadgeVariant,
} from './status-badge.js'

/**
 * Badge size every StatusBadge uses. Badge's `sm` step sets a pixel font size;
 * `md` is `text-xs` (0.75rem), so the label scales with the user's font size.
 */
const STATUS_BADGE_BADGE_SIZE = 'md'

/** Spacing between the leading mark and the label, plus no mid-word wrap. */
const statusBadgeLayoutClasses = 'gap-1.5 whitespace-nowrap'

export interface StatusBadgeVariantProps {
  variant?: StatusBadgeVariant
  className?: string
}

/**
 * Root classes: Badge's own pill and variant colours (reused, not copied, so a
 * StatusBadge always matches a Badge of the same variant) plus room for the
 * leading mark.
 */
export function statusBadgeVariants(props: StatusBadgeVariantProps = {}): string {
  const variant = props.variant ?? STATUS_BADGE_DEFAULT_VARIANT
  return cn(
    badgeVariants({ variant, size: STATUS_BADGE_BADGE_SIZE }),
    statusBadgeLayoutClasses,
    props.className,
  )
}

/** Leading icon box: an svg child is sized to the label's cap height. */
export const statusBadgeIconClasses =
  'inline-flex shrink-0 items-center [&>svg]:size-3'
