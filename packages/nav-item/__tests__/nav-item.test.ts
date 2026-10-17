import { describe, it, expect } from 'vitest'
import {
  createNavItem,
  formatNavItemCount,
  getNavItemAccessibleName,
  resolveNavItemIcon,
  getNavItemTooltipPosition,
  defaultNavItemCountLabel,
  DEFAULT_NAV_ITEM_MAX_COUNT,
  NAV_ITEM_TOOLTIP_GAP_PX,
  navItemVariants,
  navItemCountVariants,
  navItemLiveDotVariants,
  navItemTooltipTriggerVariants,
} from '../src/index.js'

describe('formatNavItemCount', () => {
  it('returns null when there is nothing to show', () => {
    expect(formatNavItemCount(undefined)).toBeNull()
    expect(formatNavItemCount(0)).toBeNull()
    expect(formatNavItemCount(-3)).toBeNull()
    expect(formatNavItemCount(Number.NaN)).toBeNull()
    expect(formatNavItemCount(0.4)).toBeNull()
  })

  it('renders counts up to and including the cap verbatim', () => {
    expect(formatNavItemCount(1)).toBe('1')
    expect(formatNavItemCount(42)).toBe('42')
    expect(formatNavItemCount(DEFAULT_NAV_ITEM_MAX_COUNT)).toBe('99')
  })

  it('caps above the default maximum as "99+"', () => {
    expect(formatNavItemCount(100)).toBe('99+')
    expect(formatNavItemCount(12_345)).toBe('99+')
    expect(formatNavItemCount(Number.POSITIVE_INFINITY)).toBe('99+')
  })

  it('honours a custom maxCount', () => {
    expect(formatNavItemCount(9, 9)).toBe('9')
    expect(formatNavItemCount(10, 9)).toBe('9+')
    expect(formatNavItemCount(1000, 999)).toBe('999+')
  })

  it('floors fractional counts and caps', () => {
    expect(formatNavItemCount(2.9)).toBe('2')
    expect(formatNavItemCount(10, 9.7)).toBe('9+')
  })

  it('falls back to the default cap for invalid maxCount values', () => {
    expect(formatNavItemCount(150, 0)).toBe('99+')
    expect(formatNavItemCount(150, -5)).toBe('99+')
    expect(formatNavItemCount(150, Number.NaN)).toBe('99+')
    expect(formatNavItemCount(150, Number.POSITIVE_INFINITY)).toBe('99+')
  })
})

describe('getNavItemAccessibleName', () => {
  it('is just the label without a count', () => {
    expect(getNavItemAccessibleName({ label: 'Chats' })).toBe('Chats')
    expect(getNavItemAccessibleName({ label: 'Chats', count: 0 })).toBe('Chats')
  })

  it('appends the spoken count ("Chats, 2 unread")', () => {
    expect(getNavItemAccessibleName({ label: 'Chats', count: 2 })).toBe('Chats, 2 unread')
  })

  it('speaks the capped display by default', () => {
    expect(getNavItemAccessibleName({ label: 'Chats', count: 250 })).toBe('Chats, 99+ unread')
    expect(getNavItemAccessibleName({ label: 'Chats', count: 25, maxCount: 9 })).toBe(
      'Chats, 9+ unread',
    )
  })

  it('uses a custom formatter with the raw (floored) count and the display', () => {
    const calls: Array<[number, string]> = []
    const name = getNavItemAccessibleName({
      label: 'Tasks',
      count: 250.5,
      formatCountLabel: (count, display) => {
        calls.push([count, display])
        return `${count} open`
      },
    })
    expect(name).toBe('Tasks, 250 open')
    expect(calls).toEqual([[250, '99+']])
  })

  it('does not call the formatter when no badge is shown', () => {
    let called = false
    getNavItemAccessibleName({
      label: 'Tasks',
      count: 0,
      formatCountLabel: () => {
        called = true
        return ''
      },
    })
    expect(called).toBe(false)
  })

  it('lets semanticLabel replace the composed name verbatim', () => {
    expect(
      getNavItemAccessibleName({ label: 'Chats', count: 2, semanticLabel: 'Conversations' }),
    ).toBe('Conversations')
  })

  it('ignores an empty semanticLabel', () => {
    expect(getNavItemAccessibleName({ label: 'Chats', count: 2, semanticLabel: '' })).toBe(
      'Chats, 2 unread',
    )
  })

  it('exposes the English default formatter', () => {
    expect(defaultNavItemCountLabel(3, '3')).toBe('3 unread')
  })
})

describe('resolveNavItemIcon', () => {
  it('uses activeIcon only while selected', () => {
    expect(resolveNavItemIcon('outline', 'filled', true)).toBe('filled')
    expect(resolveNavItemIcon('outline', 'filled', false)).toBe('outline')
  })

  it('falls back to icon when there is no activeIcon', () => {
    expect(resolveNavItemIcon('outline', undefined, true)).toBe('outline')
    expect(resolveNavItemIcon<string | null>('outline', null, true)).toBe('outline')
  })

  it('returns undefined when no icon is given', () => {
    expect(resolveNavItemIcon(undefined, undefined, false)).toBeUndefined()
  })
})

describe('getNavItemTooltipPosition', () => {
  const rect = { top: 100, left: 10, width: 44, height: 44 }

  it('centres vertically and sits the default gap to the right', () => {
    expect(getNavItemTooltipPosition(rect)).toEqual({
      top: 122,
      left: 10 + 44 + NAV_ITEM_TOOLTIP_GAP_PX,
    })
  })

  it('accepts a custom gap', () => {
    expect(getNavItemTooltipPosition(rect, 0)).toEqual({ top: 122, left: 54 })
  })
})

describe('createNavItem', () => {
  it('always sets an explicit accessible name', () => {
    const api = createNavItem({ label: 'Home' })
    expect(api.ariaProps['aria-label']).toBe('Home')
    expect(api.accessibleName).toBe('Home')
    expect(api.countText).toBeNull()
  })

  it('marks the selected item with aria-current="page"', () => {
    expect(createNavItem({ label: 'Home', selected: true }).ariaProps['aria-current']).toBe('page')
    expect(createNavItem({ label: 'Home' }).ariaProps).not.toHaveProperty('aria-current')
  })

  it('returns the capped count and the composed name', () => {
    const api = createNavItem({ label: 'Chats', count: 120 })
    expect(api.countText).toBe('99+')
    expect(api.ariaProps['aria-label']).toBe('Chats, 99+ unread')
    expect(api.dataAttributes['data-count']).toBe('99+')
  })

  it('exposes state data attributes', () => {
    expect(createNavItem({ label: 'A', selected: true, collapsed: true }).dataAttributes).toEqual({
      'data-state': 'active',
      'data-collapsed': 'true',
    })
    expect(createNavItem({ label: 'A' }).dataAttributes).toEqual({
      'data-state': 'inactive',
      'data-collapsed': 'false',
    })
  })
})

describe('nav item styles', () => {
  it('gives the collapsed item a 44px square target', () => {
    expect(navItemVariants({ collapsed: 'true' })).toContain('size-11')
    expect(navItemVariants({ collapsed: 'false' })).toContain('min-h-11')
  })

  it('distinguishes selection by weight as well as colour', () => {
    expect(navItemVariants({ selected: 'true' })).toContain('font-semibold')
    expect(navItemVariants({ selected: 'false' })).toContain('font-medium')
  })

  it('carries a focus-visible ring and a reduced-motion opt-out', () => {
    const cls = navItemVariants()
    expect(cls).toContain('focus-visible:ring-2')
    expect(cls).toContain('motion-reduce:transition-none')
  })

  it('pins the badge and live dot to the corner when collapsed', () => {
    expect(navItemCountVariants({ placement: 'corner' })).toContain('absolute')
    expect(navItemCountVariants({ placement: 'inline' })).not.toContain('absolute')
    expect(navItemLiveDotVariants({ placement: 'corner' })).toContain('absolute')
  })

  it('keeps the tooltip trigger box only when collapsed', () => {
    expect(navItemTooltipTriggerVariants({ collapsed: 'true' })).toBe('inline-flex')
    expect(navItemTooltipTriggerVariants({ collapsed: 'false' })).toBe('contents')
    expect(navItemTooltipTriggerVariants()).toBe('contents')
  })
})
