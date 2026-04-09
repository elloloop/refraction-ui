import type { AccessibilityProps } from '@elloloop/shared'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type AvatarLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: AvatarSize
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

export function createAvatar(props: AvatarProps = {}): AvatarAPI {
  const { src, alt = '', fallback = '', size = 'md' } = props

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'img',
  }
  if (alt) {
    ariaProps['aria-label'] = alt
  }

  const fallbackText = fallback ? getInitials(fallback) : (alt ? getInitials(alt) : '')

  const dataAttributes: Record<string, string> = {
    'data-slot': 'avatar',
  }

  return {
    ariaProps,
    dataAttributes,
    imageProps: {
      alt,
      role: 'img',
    },
    fallbackText,
    state: {
      size,
      hasSrc: !!src,
    },
  }
}
