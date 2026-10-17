/** Default cap above which the count renders as `"<cap>+"` (e.g. "99+"). */
export const DEFAULT_NAV_ITEM_MAX_COUNT = 99

/** Suffix appended to the cap when the count overflows it ("99" → "99+"). */
export const NAV_ITEM_COUNT_OVERFLOW_SUFFIX = '+'

/** Joins the label and the spoken count in the accessible name ("Chats, 2 unread"). */
export const NAV_ITEM_NAME_SEPARATOR = ', '

/** Gap, in CSS pixels, between a collapsed item and its tooltip. */
export const NAV_ITEM_TOOLTIP_GAP_PX = 8

/**
 * Turns a count into the phrase spoken after the label.
 *
 * Receives the raw count and the capped display text ("99+") so a formatter can
 * choose either, pluralise, or translate. Only used when a badge is shown.
 */
export type NavItemCountLabelFormatter = (count: number, display: string) => string

/** English default: speaks what is shown — "2 unread", "99+ unread". */
export const defaultNavItemCountLabel: NavItemCountLabelFormatter = (_count, display) =>
  `${display} unread`

export interface NavItemProps {
  /** Visible label; also the tooltip and accessible name when collapsed. */
  label: string
  /** Number waiting at this destination. Zero, negative or NaN hides the badge. */
  count?: number
  /** Cap for the visible count; above it the badge reads `"<maxCount>+"`. */
  maxCount?: number
  /** Whether this is the current destination (sets `aria-current="page"`). */
  selected?: boolean
  /** Icon-only (rail) presentation. */
  collapsed?: boolean
  /** Replaces the composed accessible name verbatim (Flutter `semanticLabel`). */
  semanticLabel?: string
  /** Wording for the count in the accessible name. Defaults to "N unread". */
  formatCountLabel?: NavItemCountLabelFormatter
}

export interface NavItemAPI {
  /** ARIA attributes for the interactive element (button or link). */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
  /** Capped badge text, or `null` when no badge should render. */
  countText: string | null
  /** The composed accessible name ("Chats, 2 unread"). */
  accessibleName: string
}

/** Treat a missing, non-finite or sub-1 cap as the default; floor fractional caps. */
function normalizeMaxCount(maxCount: number | undefined): number {
  if (maxCount === undefined || !Number.isFinite(maxCount) || maxCount < 1) {
    return DEFAULT_NAV_ITEM_MAX_COUNT
  }
  return Math.floor(maxCount)
}

/**
 * Format a count for the badge, capping it at `maxCount` ("99+").
 *
 * Returns `null` when there is nothing to show (undefined, NaN, zero or
 * negative) so adapters can skip rendering the badge entirely. Fractional
 * counts are floored — a badge counts whole things.
 */
export function formatNavItemCount(
  count: number | undefined,
  maxCount?: number,
): string | null {
  if (count === undefined || Number.isNaN(count)) return null
  const whole = Math.floor(count)
  if (whole <= 0) return null

  const cap = normalizeMaxCount(maxCount)
  if (whole > cap) return `${cap}${NAV_ITEM_COUNT_OVERFLOW_SUFFIX}`
  return String(whole)
}

/**
 * Compose the accessible name: the label, then the spoken count when a badge is
 * shown ("Chats, 2 unread"). `semanticLabel` wins outright, matching Flutter.
 */
export function getNavItemAccessibleName(
  props: Pick<NavItemProps, 'label' | 'count' | 'maxCount' | 'semanticLabel' | 'formatCountLabel'>,
): string {
  const { label, count, maxCount, semanticLabel, formatCountLabel = defaultNavItemCountLabel } = props
  if (semanticLabel !== undefined && semanticLabel !== '') return semanticLabel

  const display = formatNavItemCount(count, maxCount)
  if (display === null || count === undefined) return label
  return `${label}${NAV_ITEM_NAME_SEPARATOR}${formatCountLabel(Math.floor(count), display)}`
}

/**
 * Pick the icon to render: `activeIcon` while selected (when given), otherwise
 * `icon`. Generic so every framework passes its own node type through.
 */
export function resolveNavItemIcon<T>(
  icon: T | undefined,
  activeIcon: T | undefined,
  selected: boolean,
): T | undefined {
  if (selected && activeIcon !== undefined && activeIcon !== null) return activeIcon
  return icon
}

/** Minimal rect shape so the core does not depend on DOM types. */
export interface NavItemRect {
  top: number
  left: number
  width: number
  height: number
}

/**
 * Viewport position for a collapsed item's tooltip: vertically centred on the
 * item, `gap` px to its right (a rail sits on the leading edge). The adapter
 * pairs this with `position: fixed` and `translateY(-50%)`.
 */
export function getNavItemTooltipPosition(
  rect: NavItemRect,
  gap: number = NAV_ITEM_TOOLTIP_GAP_PX,
): { top: number; left: number } {
  return {
    top: rect.top + rect.height / 2,
    left: rect.left + rect.width + gap,
  }
}

/**
 * Build the framework-agnostic props for a navigation destination.
 *
 * The accessible name is always set explicitly because the visible content
 * ("Chats" + a "2" badge) would otherwise be read as "Chats 2", and a collapsed
 * item has no visible text at all.
 */
export function createNavItem(props: NavItemProps): NavItemAPI {
  const { count, maxCount, selected = false, collapsed = false } = props

  const countText = formatNavItemCount(count, maxCount)
  const accessibleName = getNavItemAccessibleName(props)

  const ariaProps: Record<string, string | number | boolean> = {
    'aria-label': accessibleName,
  }
  if (selected) ariaProps['aria-current'] = 'page'

  const dataAttributes: Record<string, string> = {
    'data-state': selected ? 'active' : 'inactive',
    'data-collapsed': collapsed ? 'true' : 'false',
  }
  if (countText !== null) dataAttributes['data-count'] = countText

  return { ariaProps, dataAttributes, countText, accessibleName }
}
