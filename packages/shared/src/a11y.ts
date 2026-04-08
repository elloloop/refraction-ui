/**
 * Accessibility constants and utilities used across all components.
 *
 * Refraction UI Accessibility Principles:
 * 1. NEVER convey meaning through color alone — always provide icon, text, or pattern
 * 2. All interactive elements are keyboard navigable
 * 3. All dynamic content has aria-live announcements
 * 4. All colors meet WCAG AA contrast ratios (4.5:1 normal, 3:1 large)
 * 5. Respect prefers-reduced-motion
 * 6. Respect prefers-contrast
 * 7. Focus indicators are always visible on keyboard navigation
 */

/** Standard icon names used across components for status indication */
export const STATUS_ICONS = {
  success: 'check-circle',
  error: 'x-circle',
  warning: 'alert-triangle',
  info: 'info-circle',
} as const

export type StatusIconName = typeof STATUS_ICONS[keyof typeof STATUS_ICONS]

/** Check if a component state relies on color alone (for testing) */
export function hasNonColorIndicator(config: {
  hasIcon?: boolean
  hasText?: boolean
  hasPattern?: boolean
  hasBorder?: boolean
  hasShape?: boolean
}): boolean {
  return Object.values(config).some(Boolean)
}
