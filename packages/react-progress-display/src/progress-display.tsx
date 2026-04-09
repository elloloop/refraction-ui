import * as React from 'react'
import {
  createProgressDisplay,
  statsGridVariants,
  statCardVariants,
  badgeGridVariants,
  badgeItemVariants,
  progressBarVariants,
  type StatCardData,
  type BadgeData,
} from '@elloloop/progress-display'
import { cn } from '@elloloop/shared'

/* ------------------------------------------------------------------ */
/*  StatsGrid                                                          */
/* ------------------------------------------------------------------ */

export interface StatsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: StatCardData[]
  badges?: BadgeData[]
}

export const StatsGrid = React.forwardRef<HTMLDivElement, StatsGridProps>(
  ({ stats, badges = [], className, ...props }, ref) => {
    const api = createProgressDisplay({ stats, badges })

    return (
      <div
        ref={ref}
        className={cn(statsGridVariants(), className)}
        {...api.ariaProps}
        {...props}
      >
        {api.stats.map((stat) => (
          <div
            key={stat.label}
            className={statCardVariants({
              color: (stat.color as 'default' | 'primary' | 'success' | 'warning' | 'destructive') ?? 'default',
            })}
          >
            {stat.icon && <span className="text-2xl">{stat.icon}</span>}
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    )
  },
)

StatsGrid.displayName = 'StatsGrid'

/* ------------------------------------------------------------------ */
/*  ProgressBar                                                        */
/* ------------------------------------------------------------------ */

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max = 100, size, className, ...props }, ref) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100))

    return (
      <div
        ref={ref}
        className={cn(progressBarVariants({ size }), className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    )
  },
)

ProgressBar.displayName = 'ProgressBar'

/* ------------------------------------------------------------------ */
/*  BadgeDisplay                                                       */
/* ------------------------------------------------------------------ */

export interface BadgeDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  badges: BadgeData[]
}

export const BadgeDisplay = React.forwardRef<HTMLDivElement, BadgeDisplayProps>(
  ({ badges, className, ...props }, ref) => {
    const api = createProgressDisplay({ stats: [], badges })

    return (
      <div
        ref={ref}
        className={cn(badgeGridVariants(), className)}
        {...props}
      >
        {api.badges.map((badge) => (
          <div
            key={badge.name}
            className={badgeItemVariants({
              state: badge.isUnlocked ? 'unlocked' : 'locked',
            })}
            {...api.getBadgeAriaProps(badge)}
          >
            <span className="text-3xl">{badge.icon}</span>
            <span className="font-medium">{badge.name}</span>
            {!badge.isUnlocked && (
              <span className="text-xs text-muted-foreground">Locked</span>
            )}
          </div>
        ))}
      </div>
    )
  },
)

BadgeDisplay.displayName = 'BadgeDisplay'
