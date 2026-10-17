import type { AccessibilityProps } from '@refraction-ui/shared'
import { STATUS_LABELS, type PresenceStatus } from '@refraction-ui/presence-indicator'

export type { PresenceStatus }

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Outline of the avatar. */
export type AvatarShape = 'circle' | 'square'

export type AvatarLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: AvatarSize
  /** Shows a presence dot and adds the status to the avatar's name. */
  presence?: PresenceStatus
  /** The status as words, e.g. for another language. Default: "Online", "Away", … */
  presenceLabel?: string
}

/** The presence dot: what it says and how assistive tech reaches it. */
export interface AvatarPresenceAPI {
  status: PresenceStatus
  /** The status as words, e.g. "Online". */
  label: string
  /**
   * Spread on the dot. When the avatar is named the status is already part of
   * that name, so the dot is hidden; otherwise the dot names itself.
   */
  ariaProps: Record<string, string>
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
}

export interface AvatarAPI {
  /** ARIA attributes to spread on the root element */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for CSS styling hooks */
  dataAttributes: Record<string, string>
  /** Image ARIA props */
  imageProps: {
    alt: string
    role: string
  }
  /** Fallback text (initials) */
  fallbackText: string
  /** The presence dot, or null when no presence is given */
  presence: AvatarPresenceAPI | null
  /** Current state */
  state: {
    size: AvatarSize
    hasSrc: boolean
  }
}

/**
 * Extract initials from a name or fallback string.
 * Takes first letter of first two words, uppercased.
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || parts[0] === '') return ''
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/** "Ada Lovelace" and "Away" → "Ada Lovelace (Away)". */
function getAvatarLabel(name: string, presenceLabel?: string): string {
  return presenceLabel ? `${name} (${presenceLabel})` : name
}

export function createAvatar(props: AvatarProps = {}): AvatarAPI {
  const { src, alt = '', fallback = '', size = 'md', presence: status, presenceLabel } = props
  // An empty override would leave the dot nameless, so it falls back too.
  const statusLabel = status ? presenceLabel || STATUS_LABELS[status] : undefined

  // role="img" makes its children presentational, so it is only applied when
  // the avatar itself has a name; otherwise the inner <img alt> / fallback
  // text stays exposed.
  const ariaProps: Partial<AccessibilityProps> = {}
  if (alt) {
    ariaProps.role = 'img'
    ariaProps['aria-label'] = getAvatarLabel(alt, statusLabel)
  }

  const fallbackText = fallback ? getInitials(fallback) : (alt ? getInitials(alt) : '')

  const dataAttributes: Record<string, string> = {
    'data-slot': 'avatar',
  }
  if (status) dataAttributes['data-presence'] = status

  const presence: AvatarPresenceAPI | null =
    status && statusLabel
      ? {
          status,
          label: statusLabel,
          ariaProps: alt
            ? { 'aria-hidden': 'true' }
            : { role: 'img', 'aria-label': statusLabel },
          dataAttributes: { 'data-slot': 'avatar-presence', 'data-status': status },
        }
      : null

  return {
    ariaProps,
    dataAttributes,
    imageProps: {
      alt,
      role: 'img',
    },
    fallbackText,
    presence,
    state: {
      size,
      hasSrc: !!src,
    },
  }
}
