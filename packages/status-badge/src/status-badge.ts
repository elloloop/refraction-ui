import type { BadgeVariant } from '@refraction-ui/badge'
import {
  isLiveDotColor,
  type LiveDotColor,
  type LiveDotSizeName,
} from '@refraction-ui/live-dot'

/** A StatusBadge takes exactly Badge's variants (same names, same styles). */
export type StatusBadgeVariant = BadgeVariant

/**
 * Default variant. A status badge usually carries a coloured dot, and a dot
 * only reads on a neutral surface (a `success` dot on a `success` fill
 * disappears), so the default is Badge's `outline` rather than its filled
 * `default`.
 */
export const STATUS_BADGE_DEFAULT_VARIANT: StatusBadgeVariant = 'outline'

/**
 * Dot colour used while `pulsing` when no `dotColor` is given: the `pending`
 * token is the library's "being worked out" colour.
 */
export const STATUS_BADGE_PULSING_DOT_COLOR: LiveDotColor = 'pending'

/** Dot size on the LiveDot scale (0.5rem), matched to the badge's `text-xs`. */
export const STATUS_BADGE_DOT_SIZE: LiveDotSizeName = 'sm'

/**
 * What sits before the label. At most one leading mark is drawn:
 * - `dot`  — a LiveDot (breathing while `pulsing`)
 * - `icon` — the consumer's icon
 * - `none` — label only
 */
export type StatusBadgeLeading = 'dot' | 'icon' | 'none'

export interface StatusBadgeOptions {
  /** The status in words ("Allowed", "Off", "Checking…"). Always rendered. */
  label: string
  /** One of Badge's variants. Defaults to `outline`. */
  variant?: StatusBadgeVariant
  /** Whether the adapter has a renderable icon to place before the label. */
  hasIcon?: boolean
  /** Semantic colour token for the dot (never a raw CSS colour). */
  dotColor?: LiveDotColor
  /** The status is still being worked out: draw a breathing dot. */
  pulsing?: boolean
}

export interface StatusBadgeAPI {
  /** Trimmed label; an empty string means the caller passed no visible text. */
  label: string
  /** Resolved variant. */
  variant: StatusBadgeVariant
  /** Resolved pulsing state. */
  pulsing: boolean
  /** The single leading mark to draw. */
  leading: StatusBadgeLeading
  /** Dot colour token when `leading` is `dot`; otherwise `undefined`. */
  dotColor: LiveDotColor | undefined
  /** Data attributes for styling hooks and tests. */
  dataAttributes: Record<string, string>
}

/**
 * Resolve the dot colour: a valid token wins; otherwise a pulsing badge falls
 * back to {@link STATUS_BADGE_PULSING_DOT_COLOR} and a settled one draws no
 * dot. Anything that is not a token name (e.g. `'#f00'`) is ignored, so the
 * dot can never be painted in an arbitrary CSS colour that skips theming.
 */
export function resolveStatusBadgeDotColor(
  dotColor: unknown,
  pulsing: boolean,
): LiveDotColor | undefined {
  if (isLiveDotColor(dotColor)) return dotColor
  return pulsing ? STATUS_BADGE_PULSING_DOT_COLOR : undefined
}

/**
 * Pick the single leading mark. Icon and dot are mutually exclusive:
 *
 * 1. `pulsing` → a breathing dot, even when an icon is given. "Still being
 *    worked out" is transient and must stay visible; an icon describes the
 *    settled state, so it returns once pulsing stops.
 * 2. an icon → the icon (a static `dotColor` is ignored).
 * 3. a valid `dotColor` → a static dot.
 * 4. otherwise → label only.
 */
export function resolveStatusBadgeLeading(options: {
  hasIcon?: boolean
  dotColor?: unknown
  pulsing?: boolean
}): StatusBadgeLeading {
  if (options.pulsing) return 'dot'
  if (options.hasIcon) return 'icon'
  if (isLiveDotColor(options.dotColor)) return 'dot'
  return 'none'
}

/**
 * Build the framework-agnostic state for a StatusBadge: a Badge-styled pill
 * whose label is always shown, with at most one leading dot or icon.
 *
 * No ARIA role is added. The label is plain text read in place, which is what
 * a static status needs; turning every badge into a live region (as a list of
 * permission rows would) makes screen readers announce each one. `aria-busy`
 * is deliberately not set while pulsing either: it asks assistive technology
 * to hold back the element's content until it is no longer busy, which would
 * hide the very "Checking…" label that explains the state.
 */
export function createStatusBadge(options: StatusBadgeOptions): StatusBadgeAPI {
  const pulsing = options.pulsing ?? false
  const variant = options.variant ?? STATUS_BADGE_DEFAULT_VARIANT
  const leading = resolveStatusBadgeLeading({
    hasIcon: options.hasIcon,
    dotColor: options.dotColor,
    pulsing,
  })
  const dotColor =
    leading === 'dot'
      ? resolveStatusBadgeDotColor(options.dotColor, pulsing)
      : undefined

  const dataAttributes: Record<string, string> = {
    'data-variant': variant,
    'data-pulsing': pulsing ? 'true' : 'false',
    'data-leading': leading,
  }

  return {
    label: (options.label ?? '').trim(),
    variant,
    pulsing,
    leading,
    dotColor,
    dataAttributes,
  }
}
