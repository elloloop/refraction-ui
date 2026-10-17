import { describe, it, expect } from 'vitest'
import { badgeVariants } from '@refraction-ui/badge'
import { LIVE_DOT_COLORS } from '@refraction-ui/live-dot'
import {
  createStatusBadge,
  resolveStatusBadgeDotColor,
  resolveStatusBadgeLeading,
  statusBadgeVariants,
  statusBadgeIconClasses,
  STATUS_BADGE_DEFAULT_VARIANT,
  STATUS_BADGE_PULSING_DOT_COLOR,
  STATUS_BADGE_DOT_SIZE,
} from '../src/index.js'

describe('resolveStatusBadgeLeading', () => {
  it('draws nothing before the label by default', () => {
    expect(resolveStatusBadgeLeading({})).toBe('none')
  })

  it('draws a dot for a valid dotColor', () => {
    expect(resolveStatusBadgeLeading({ dotColor: 'success' })).toBe('dot')
  })

  it('draws the icon when one is given', () => {
    expect(resolveStatusBadgeLeading({ hasIcon: true })).toBe('icon')
  })

  it('prefers the icon over a static dot (they are mutually exclusive)', () => {
    expect(resolveStatusBadgeLeading({ hasIcon: true, dotColor: 'success' })).toBe('icon')
  })

  it('prefers the pulsing dot over the icon', () => {
    expect(resolveStatusBadgeLeading({ hasIcon: true, pulsing: true })).toBe('dot')
  })

  it('draws a dot while pulsing even without a dotColor', () => {
    expect(resolveStatusBadgeLeading({ pulsing: true })).toBe('dot')
  })

  it('ignores a dotColor that is not a token name', () => {
    expect(resolveStatusBadgeLeading({ dotColor: '#ff0000' })).toBe('none')
    expect(resolveStatusBadgeLeading({ dotColor: 'red' })).toBe('none')
  })
})

describe('resolveStatusBadgeDotColor', () => {
  it('keeps every LiveDot colour token', () => {
    for (const color of LIVE_DOT_COLORS) {
      expect(resolveStatusBadgeDotColor(color, false)).toBe(color)
      expect(resolveStatusBadgeDotColor(color, true)).toBe(color)
    }
  })

  it('falls back to the pending token while pulsing', () => {
    expect(STATUS_BADGE_PULSING_DOT_COLOR).toBe('pending')
    expect(resolveStatusBadgeDotColor(undefined, true)).toBe('pending')
    expect(resolveStatusBadgeDotColor('rgb(0 0 0)', true)).toBe('pending')
  })

  it('returns no colour when settled and not a token', () => {
    expect(resolveStatusBadgeDotColor(undefined, false)).toBeUndefined()
    expect(resolveStatusBadgeDotColor('#0f0', false)).toBeUndefined()
  })
})

describe('createStatusBadge', () => {
  it('defaults to the outline variant, not pulsing, label only', () => {
    const api = createStatusBadge({ label: 'Off' })
    expect(STATUS_BADGE_DEFAULT_VARIANT).toBe('outline')
    expect(api.variant).toBe('outline')
    expect(api.pulsing).toBe(false)
    expect(api.leading).toBe('none')
    expect(api.dotColor).toBeUndefined()
    expect(api.label).toBe('Off')
  })

  it('trims the label and reports blank labels as empty', () => {
    expect(createStatusBadge({ label: '  Allowed  ' }).label).toBe('Allowed')
    expect(createStatusBadge({ label: '   ' }).label).toBe('')
  })

  it('exposes data attributes for variant, pulsing and leading', () => {
    const api = createStatusBadge({
      label: 'Checking…',
      variant: 'secondary',
      pulsing: true,
    })
    expect(api.dataAttributes).toEqual({
      'data-variant': 'secondary',
      'data-pulsing': 'true',
      'data-leading': 'dot',
    })
    expect(api.dotColor).toBe('pending')
  })

  it('keeps the given dotColor while pulsing', () => {
    const api = createStatusBadge({ label: 'Connecting', dotColor: 'info', pulsing: true })
    expect(api.leading).toBe('dot')
    expect(api.dotColor).toBe('info')
  })

  it('drops the dot colour when the icon wins', () => {
    const api = createStatusBadge({ label: 'Allowed', hasIcon: true, dotColor: 'success' })
    expect(api.leading).toBe('icon')
    expect(api.dotColor).toBeUndefined()
    expect(api.dataAttributes['data-leading']).toBe('icon')
  })

  it('is deterministic for the same input', () => {
    const options = { label: 'On', dotColor: 'success' as const }
    expect(createStatusBadge(options)).toEqual(createStatusBadge(options))
  })

  it('uses the LiveDot sm step for the dot', () => {
    expect(STATUS_BADGE_DOT_SIZE).toBe('sm')
  })
})

describe('statusBadgeVariants', () => {
  it("reuses Badge's classes for the same variant at the md size", () => {
    for (const variant of ['outline', 'success', 'destructive', 'secondary'] as const) {
      const badge = badgeVariants({ variant, size: 'md' })
      expect(statusBadgeVariants({ variant })).toContain(badge)
    }
  })

  it('defaults to the outline variant', () => {
    expect(statusBadgeVariants()).toContain(badgeVariants({ variant: 'outline', size: 'md' }))
  })

  it('uses rem-based text, never the pixel sm size', () => {
    const classes = statusBadgeVariants({ variant: 'success' })
    expect(classes).toContain('text-xs')
    expect(classes).not.toContain('text-[10px]')
  })

  it('adds spacing for the leading mark and appends className', () => {
    const classes = statusBadgeVariants({ className: 'ml-2' })
    expect(classes).toContain('gap-1.5')
    expect(classes).toContain('whitespace-nowrap')
    expect(classes.endsWith('ml-2')).toBe(true)
  })

  it('sizes an svg icon child', () => {
    expect(statusBadgeIconClasses).toContain('[&>svg]:size-3')
    expect(statusBadgeIconClasses).toContain('shrink-0')
  })
})
