import { describe, it, expect } from 'vitest'
import {
  ADAPTIVE_TAB_NAV_DOCK_MEDIA_QUERY,
  activeTabNavIndex,
  adaptiveTabNavItemVariants,
  adaptiveTabNavVariants,
  createAdaptiveTabNav,
  duplicateTabNavIds,
} from '../src/index.js'

const ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'settings', label: 'Settings' },
] as const

const classes = (value: string) => value.split(/\s+/).filter(Boolean)
const DOCKED = '[@media(max-width:767px)]:'

describe('activeTabNavIndex', () => {
  it('finds the active tab by id', () => {
    expect(activeTabNavIndex(ITEMS, 'home')).toBe(0)
    expect(activeTabNavIndex(ITEMS, 'settings')).toBe(2)
  })

  it('lights no tab on a page outside every section, or for an unknown id', () => {
    expect(activeTabNavIndex(ITEMS, null)).toBe(-1)
    expect(activeTabNavIndex(ITEMS as readonly { id: string; label: string }[], 'missing')).toBe(-1)
    expect(activeTabNavIndex([], null)).toBe(-1)
  })
})

describe('duplicateTabNavIds', () => {
  it('reports each repeated id once, in first-seen order', () => {
    expect(duplicateTabNavIds(ITEMS)).toEqual([])
    expect(
      duplicateTabNavIds([
        { id: 'b', label: 'B' },
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B again' },
        { id: 'a', label: 'A again' },
        { id: 'b', label: 'B third' },
      ]),
    ).toEqual(['b', 'a'])
  })
})

describe('createAdaptiveTabNav', () => {
  it('marks only the active tab as the current page', () => {
    const api = createAdaptiveTabNav(ITEMS, 'inbox')
    expect(api.activeIndex).toBe(1)
    expect(api.itemAttributes(1)).toEqual({
      'data-slot': 'adaptive-tab-nav-item',
      'data-tab': 'inbox',
      'data-state': 'active',
      'aria-current': 'page',
    })
    expect(api.itemAttributes(0)).toEqual({
      'data-slot': 'adaptive-tab-nav-item',
      'data-tab': 'home',
      'data-state': 'inactive',
    })
    expect('aria-current' in api.itemAttributes(2)).toBe(false)
  })

  it('marks none on a page outside every section', () => {
    const api = createAdaptiveTabNav(ITEMS, null)
    expect(api.activeIndex).toBe(-1)
    expect(ITEMS.map((_, index) => api.itemAttributes(index)['data-state'])).toEqual([
      'inactive',
      'inactive',
      'inactive',
    ])
  })

  it('exposes repeated ids', () => {
    expect(createAdaptiveTabNav([...ITEMS, { id: 'home', label: 'Home' }], 'home').duplicateIds).toEqual([
      'home',
    ])
  })
})

describe('adaptiveTabNavVariants', () => {
  it('docks only through the query it exports', () => {
    expect(ADAPTIVE_TAB_NAV_DOCK_MEDIA_QUERY).toBe('(max-width: 767px)')
    const variant = `[@media${ADAPTIVE_TAB_NAV_DOCK_MEDIA_QUERY.replace(/\s/g, '')}]:`
    expect(variant).toBe(DOCKED)
    const all = [...classes(adaptiveTabNavVariants()), ...classes(adaptiveTabNavItemVariants({ active: 'true' }))]
    for (const value of all.filter((c) => c.startsWith('[@media'))) expect(value.startsWith(DOCKED)).toBe(true)
  })

  it('pins the nav to the bottom only when docked', () => {
    const nav = classes(adaptiveTabNavVariants())
    for (const rule of ['fixed', 'inset-x-0', 'bottom-0', 'z-40', 'border-t', 'bg-card']) {
      expect(nav).toContain(`${DOCKED}${rule}`)
      expect(nav).not.toContain(rule)
    }
    expect(nav).toContain('flex')
  })

  it('keeps the docked bar clear of a phone’s home indicator', () => {
    expect(classes(adaptiveTabNavVariants())).toContain(
      `${DOCKED}pb-[max(0.75rem,env(safe-area-inset-bottom))]`,
    )
  })

  it('shrinks in a crowded bar instead of widening the page', () => {
    // A flex item does not shrink below its content without this, and the
    // labels (which truncate) would push the bar past the viewport.
    expect(classes(adaptiveTabNavVariants())).toContain('min-w-0')
    const item = classes(adaptiveTabNavItemVariants())
    expect(item).toContain('min-w-0')
  })

  it('appends the caller’s classes', () => {
    expect(adaptiveTabNavVariants({ className: 'my-nav' })).toMatch(/ my-nav$/)
  })
})

describe('adaptiveTabNavItemVariants', () => {
  it('never draws a tab below the touch target, which a surface can raise', () => {
    expect(classes(adaptiveTabNavItemVariants())).toContain('min-h-[var(--rfr-tab-nav-target,2.75rem)]')
  })

  it('shares the docked bar’s width and stacks icon over label when docked', () => {
    const item = classes(adaptiveTabNavItemVariants())
    for (const rule of ['flex-1', 'flex-col', 'text-xs']) expect(item).toContain(`${DOCKED}${rule}`)
  })

  it('lights only the active tab, from theme tokens', () => {
    const active = classes(adaptiveTabNavItemVariants({ active: 'true' }))
    const idle = classes(adaptiveTabNavItemVariants({ active: 'false' }))
    expect(active).toEqual(expect.arrayContaining(['bg-primary-soft', 'text-primary-soft-foreground']))
    expect(idle).not.toContain('bg-primary-soft')
    expect(idle).toEqual(expect.arrayContaining(['text-foreground', 'hover:bg-muted']))
    expect(classes(adaptiveTabNavItemVariants())).toEqual(idle)
    // Colours come from tokens and sizes are in rem; the only px is the breakpoint.
    const styling = `${active.join(' ')} ${adaptiveTabNavVariants()}`.replaceAll(DOCKED, '')
    expect(styling).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(|\d+px/i)
  })

  it('draws a focus ring for keyboard focus and respects reduced motion', () => {
    const item = classes(adaptiveTabNavItemVariants())
    expect(item).toEqual(
      expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:ring-ring', 'motion-reduce:transition-none']),
    )
  })
})
