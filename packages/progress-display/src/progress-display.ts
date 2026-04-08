import type { AccessibilityProps } from '@refraction-ui/shared'

export interface StatCardData {
  label: string
  value: number
  icon?: string
  color?: string
}

export interface BadgeData {
  name: string
  description: string
  icon: string
  unlockedAt?: string
  isUnlocked: boolean
}

export interface ProgressDisplayProps {
  stats: StatCardData[]
  badges: BadgeData[]
  level?: number
  accuracy?: number
}

export interface ProgressDisplayAPI {
  /** The computed stats array */
  stats: StatCardData[]
  /** The badges array */
  badges: BadgeData[]
  /** ARIA props for the stats region */
  ariaProps: Partial<AccessibilityProps>
  /** Get ARIA props for a specific badge */
  getBadgeAriaProps: (badge: BadgeData) => Partial<AccessibilityProps>
}

export function createProgressDisplay(props: ProgressDisplayProps): ProgressDisplayAPI {
  const { stats, badges } = props

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'region',
    'aria-label': 'Progress statistics',
  }

  function getBadgeAriaProps(badge: BadgeData): Partial<AccessibilityProps> {
    const label = badge.isUnlocked
      ? `${badge.name}: ${badge.description}`
      : `${badge.name}: ${badge.description} (locked)`

    return {
      'aria-label': label,
    }
  }

  return {
    stats,
    badges,
    ariaProps,
    getBadgeAriaProps,
  }
}
