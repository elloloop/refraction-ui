import type { AccessibilityProps } from '@refraction-ui/shared'

export interface BrandNetworkCellProps {
  /** Whether this cell represents the current/active product in the network. */
  current?: boolean
}

export interface BrandNetworkCellAPI {
  /** ARIA attributes to spread on the group element (`role="group"`). */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic group props for a brand network card.
 *
 * Returns `role="group"` plus a `data-current` attribute so adapters and
 * consumers can style the "You are here" state without coupling to class names.
 */
export function createBrandNetworkCell(
  props: BrandNetworkCellProps = {},
): BrandNetworkCellAPI {
  const { current = false } = props

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'group',
  }

  const dataAttributes: Record<string, string> = {
    'data-current': String(current),
  }

  return { ariaProps, dataAttributes }
}
