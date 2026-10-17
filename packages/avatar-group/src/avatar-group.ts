import type { AccessibilityProps } from '@refraction-ui/shared'
import { generateId } from '@refraction-ui/shared'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy' | 'dnd'

export interface AvatarUser {
  /** Unique identifier */
  id: string
  /** Display name */
  name: string
  /** Avatar image URL */
  src?: string
  /** Online presence status */
  status?: PresenceStatus
}

export interface AvatarGroupProps {
  /** Array of users to display */
  users: AvatarUser[]
  /** Maximum number of visible avatars */
  max?: number
  /** Avatar size */
  size?: AvatarSize
  /**
   * Whether the "+N" badge is a button. The adapter decides what pressing it
   * does; a badge that does nothing is labelled as an image, never a button.
   */
  overflowInteractive?: boolean
  /** Prefix for generated ids; an adapter passes a stable one for hydration. */
  idPrefix?: string
}

export interface AvatarGroupAPI {
  /** Users that are visible (within max limit) */
  visibleUsers: AvatarUser[]
  /** Number of overflow users */
  overflowCount: number
  /** All overflow users (for tooltip/popup) */
  overflowUsers: AvatarUser[]
  /** ARIA props for the group container */
  ariaProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** Get ARIA props for an individual avatar */
  getAvatarAriaProps(user: AvatarUser): Record<string, unknown>
  /** Get initials from a user's name */
  getInitials(name: string): string
  /**
   * Props for the "+N" badge: a button's `type` when `overflowInteractive`,
   * otherwise `role="img"`; both carry the label ("2 more users").
   */
  overflowBadgeProps: Record<string, unknown>
  /** Generated IDs */
  ids: {
    group: string
    label: string
  }
}

export const AVATAR_SIZES: Record<AvatarSize, { width: number; fontSize: number }> = {
  xs: { width: 24, fontSize: 10 },
  sm: { width: 32, fontSize: 12 },
  md: { width: 40, fontSize: 14 },
  lg: { width: 48, fontSize: 16 },
  xl: { width: 64, fontSize: 20 },
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/** How far an `<img>` has got. Read from the element, so it also holds for an
 * image that settled before any script could listen for its events. */
export type AvatarImageStatus = 'loading' | 'loaded' | 'failed'

export function getAvatarImageStatus(
  image: Pick<HTMLImageElement, 'complete' | 'naturalWidth'>,
): AvatarImageStatus {
  if (!image.complete) return 'loading'
  return image.naturalWidth > 0 ? 'loaded' : 'failed'
}

export function createAvatarGroup(props: AvatarGroupProps): AvatarGroupAPI {
  const { users, max, overflowInteractive = false, idPrefix } = props

  const visibleUsers = max && max > 0 ? users.slice(0, max) : users
  const overflowUsers = max && max > 0 ? users.slice(max) : []
  const overflowCount = overflowUsers.length

  const groupId = idPrefix ?? generateId('rfr-avatar-group')
  const labelId = `${groupId}-label`

  const ariaProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'group',
    'aria-label': `${users.length} users`,
    id: groupId,
  }

  function getAvatarAriaProps(user: AvatarUser): Record<string, unknown> {
    const label = user.status ? `${user.name} (${user.status})` : user.name
    return {
      role: 'img',
      'aria-label': label,
    }
  }

  const overflowLabel = `${overflowCount} more users`
  const overflowBadgeProps: Record<string, unknown> = overflowInteractive
    ? { type: 'button', 'aria-label': overflowLabel }
    : { role: 'img', 'aria-label': overflowLabel }

  return {
    visibleUsers,
    overflowCount,
    overflowUsers,
    ariaProps,
    getAvatarAriaProps,
    getInitials,
    overflowBadgeProps,
    ids: {
      group: groupId,
      label: labelId,
    },
  }
}
