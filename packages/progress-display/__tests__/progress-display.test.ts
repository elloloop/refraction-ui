import { describe, it, expect } from 'vitest'
import { createProgressDisplay } from '../src/progress-display.js'
import {
  statsGridVariants,
  statCardVariants,
  badgeGridVariants,
  badgeItemVariants,
  progressBarVariants,
} from '../src/progress-display.styles.js'

describe('createProgressDisplay', () => {
  const sampleStats = [
    { label: 'Score', value: 95 },
    { label: 'Streak', value: 7, icon: 'fire', color: 'warning' },
    { label: 'Rank', value: 12 },
  ]

  const sampleBadges = [
    { name: 'First Win', description: 'Win your first game', icon: 'trophy', isUnlocked: true, unlockedAt: '2024-01-01' },
    { name: 'Perfectionist', description: 'Get a perfect score', icon: 'star', isUnlocked: false },
  ]

  it('returns the provided stats', () => {
    const api = createProgressDisplay({ stats: sampleStats, badges: [] })
    expect(api.stats).toEqual(sampleStats)
    expect(api.stats).toHaveLength(3)
  })

  it('returns the provided badges', () => {
    const api = createProgressDisplay({ stats: [], badges: sampleBadges })
    expect(api.badges).toEqual(sampleBadges)
    expect(api.badges).toHaveLength(2)
  })

  it('provides aria props for stats region', () => {
    const api = createProgressDisplay({ stats: sampleStats, badges: sampleBadges })
    expect(api.ariaProps.role).toBe('region')
    expect(api.ariaProps['aria-label']).toBe('Progress statistics')
  })

  it('returns badge aria props for unlocked badge', () => {
    const api = createProgressDisplay({ stats: [], badges: sampleBadges })
    const badgeAria = api.getBadgeAriaProps(sampleBadges[0])
    expect(badgeAria['aria-label']).toBe('First Win: Win your first game')
  })

  it('returns badge aria props for locked badge with locked indicator', () => {
    const api = createProgressDisplay({ stats: [], badges: sampleBadges })
    const badgeAria = api.getBadgeAriaProps(sampleBadges[1])
    expect(badgeAria['aria-label']).toBe('Perfectionist: Get a perfect score (locked)')
  })

  it('handles empty stats and badges', () => {
    const api = createProgressDisplay({ stats: [], badges: [] })
    expect(api.stats).toEqual([])
    expect(api.badges).toEqual([])
  })

  it('preserves stat card data including optional fields', () => {
    const api = createProgressDisplay({ stats: sampleStats, badges: [] })
    expect(api.stats[1].icon).toBe('fire')
    expect(api.stats[1].color).toBe('warning')
    expect(api.stats[0].icon).toBeUndefined()
  })
})

describe('progress-display styles', () => {
  it('statsGridVariants returns grid classes', () => {
    const classes = statsGridVariants()
    expect(classes).toContain('grid')
    expect(classes).toContain('gap-4')
  })

  it('statCardVariants returns default color classes', () => {
    const classes = statCardVariants()
    expect(classes).toContain('bg-card')
    expect(classes).toContain('rounded-lg')
  })

  it('statCardVariants returns success color classes', () => {
    const classes = statCardVariants({ color: 'success' })
    expect(classes).toContain('bg-green-500/10')
  })

  it('badgeGridVariants returns grid classes', () => {
    const classes = badgeGridVariants()
    expect(classes).toContain('grid')
  })

  it('badgeItemVariants returns unlocked state classes', () => {
    const classes = badgeItemVariants({ state: 'unlocked' })
    expect(classes).toContain('opacity-100')
  })

  it('badgeItemVariants returns locked state classes', () => {
    const classes = badgeItemVariants({ state: 'locked' })
    expect(classes).toContain('opacity-50')
    expect(classes).toContain('grayscale')
  })

  it('progressBarVariants returns default classes', () => {
    const classes = progressBarVariants()
    expect(classes).toContain('rounded-full')
    expect(classes).toContain('h-2')
  })

  it('progressBarVariants returns lg size', () => {
    const classes = progressBarVariants({ size: 'lg' })
    expect(classes).toContain('h-3')
  })
})
