import { describe, it, expect } from 'vitest'
import {
  RAIL_MOBILE_MEDIA_QUERY,
  initialRailState,
  railReducer,
  shouldPersistRail,
  serializeRailCollapsed,
  parseRailCollapsed,
  collapsibleRailVariants,
  railEdgeToggleVariants,
  railEdgeToggleIconVariants,
  railBackdropVariants,
  type RailState,
  type RailAction,
} from '../src/index.js'

const wide = (collapsed = false): RailState => ({ mobile: false, open: true, collapsed })
const narrow = (open: boolean, collapsed = true): RailState => ({ mobile: true, open, collapsed })

describe('initialRailState', () => {
  it('is closed and at the default width until the viewport is known', () => {
    expect(initialRailState()).toEqual({ mobile: false, open: false, collapsed: false })
    expect(initialRailState(true)).toEqual({ mobile: false, open: false, collapsed: true })
  })
})

describe('railReducer', () => {
  it('shows the rail on a wide viewport at the remembered width', () => {
    expect(
      railReducer(initialRailState(), { type: 'viewport', mobile: false, storedCollapsed: true }),
    ).toEqual(wide(true))
  })

  it('starts a narrow viewport closed and collapsed, whatever was remembered', () => {
    expect(
      railReducer(wide(false), { type: 'viewport', mobile: true, storedCollapsed: false }),
    ).toEqual(narrow(false))
  })

  it('expands and collapses the width only, and returns the same state when nothing changes', () => {
    expect(railReducer(wide(true), { type: 'expand' })).toEqual(wide(false))
    expect(railReducer(wide(false), { type: 'collapse' })).toEqual(wide(true))
    const full = wide(false)
    expect(railReducer(full, { type: 'expand' })).toBe(full)
    const collapsed = wide(true)
    expect(railReducer(collapsed, { type: 'collapse' })).toBe(collapsed)
  })

  it('toggles the width, but opens a closed overlay at its collapsed width instead', () => {
    expect(railReducer(wide(false), { type: 'toggle' })).toEqual(wide(true))
    expect(railReducer(wide(true), { type: 'toggle' })).toEqual(wide(false))
    expect(railReducer(narrow(true, false), { type: 'toggle' })).toEqual(narrow(true, true))
    expect(railReducer(narrow(false), { type: 'toggle' })).toEqual(narrow(true, true))
  })

  it('opens and closes the overlay on a narrow viewport', () => {
    expect(railReducer(narrow(false), { type: 'openMobile' })).toEqual(narrow(true, true))
    expect(railReducer(narrow(true, false), { type: 'closeMobile' })).toEqual(narrow(false, true))
  })

  it('ignores overlay actions that cannot apply', () => {
    for (const state of [wide(false), wide(true)]) {
      expect(railReducer(state, { type: 'openMobile' })).toBe(state)
      expect(railReducer(state, { type: 'closeMobile' })).toBe(state)
    }
    const open = narrow(true, false)
    expect(railReducer(open, { type: 'openMobile' })).toBe(open)
    const closed = narrow(false)
    expect(railReducer(closed, { type: 'closeMobile' })).toBe(closed)
  })
})

describe('shouldPersistRail', () => {
  const step = (state: RailState, action: RailAction) => {
    const next = railReducer(state, action)
    return shouldPersistRail(state, next, action)
  }

  it('remembers a change of the wide-viewport width', () => {
    expect(step(wide(false), { type: 'toggle' })).toBe(true)
    expect(step(wide(true), { type: 'expand' })).toBe(true)
    expect(step(wide(false), { type: 'collapse' })).toBe(true)
    // Before the viewport is known, a change is taken as a wide-viewport choice.
    expect(step(initialRailState(), { type: 'collapse' })).toBe(true)
  })

  it('never remembers a viewport change, an unchanged width or the overlay width', () => {
    expect(step(initialRailState(), { type: 'viewport', mobile: false, storedCollapsed: true })).toBe(
      false,
    )
    expect(step(wide(true), { type: 'collapse' })).toBe(false)
    expect(step(narrow(false), { type: 'openMobile' })).toBe(false)
    expect(step(narrow(true, true), { type: 'toggle' })).toBe(false)
    expect(step(narrow(true, false), { type: 'closeMobile' })).toBe(false)
  })
})

describe('stored width', () => {
  it('round-trips both widths', () => {
    expect(parseRailCollapsed(serializeRailCollapsed(true), false)).toBe(true)
    expect(parseRailCollapsed(serializeRailCollapsed(false), true)).toBe(false)
  })

  it('falls back when nothing, or something unreadable, is stored', () => {
    expect(parseRailCollapsed(null, true)).toBe(true)
    expect(parseRailCollapsed(null, false)).toBe(false)
    expect(parseRailCollapsed('yes', true)).toBe(true)
    expect(parseRailCollapsed('', false)).toBe(false)
  })
})

describe('class variants', () => {
  it('lays the rail out as an overlay with the same query the adapter listens to', () => {
    const query = RAIL_MOBILE_MEDIA_QUERY.replace(/\s/g, '')
    expect(query).toBe('(max-width:767px)')
    const classes = collapsibleRailVariants({ open: 'false' }).split(' ')
    const narrowOnly = classes.filter((c) => c.startsWith('['))
    expect(narrowOnly.length).toBeGreaterThan(0)
    for (const c of narrowOnly) expect(c.startsWith(`[@media${query}]:`)).toBe(true)
  })

  it('keeps a closed overlay off screen in both writing directions', () => {
    const closed = collapsibleRailVariants({ open: 'false' })
    expect(closed).toContain('[@media(max-width:767px)]:-translate-x-full')
    expect(closed).toContain('[@media(max-width:767px)]:rtl:translate-x-full')
    expect(closed).toContain('[@media(max-width:767px)]:pointer-events-none')
    expect(closed).toContain('[@media(max-width:767px)]:start-0')
    const open = collapsibleRailVariants({ open: 'true' })
    expect(open).toContain('[@media(max-width:767px)]:translate-x-0')
    expect(open).not.toContain('translate-x-full')
  })

  it('hides the edge control with a closed overlay and follows its tone', () => {
    expect(railEdgeToggleVariants({ open: 'false' })).toContain('[@media(max-width:767px)]:hidden')
    expect(railEdgeToggleVariants({ open: 'true' })).not.toContain('hidden')
    expect(railEdgeToggleVariants()).toContain('bg-card')
    expect(railEdgeToggleVariants({ tone: 'tertiary' })).toContain('bg-tertiary')
    expect(railEdgeToggleVariants()).toContain('-end-3')
    expect(railEdgeToggleVariants()).toContain('focus-visible:ring-2')
  })

  it('mirrors the chevron in right-to-left text and never shows the backdrop on a wide viewport', () => {
    expect(railEdgeToggleIconVariants()).toContain('rtl:-scale-x-100')
    expect(railBackdropVariants()).toContain('[@media(min-width:768px)]:hidden')
    expect(railBackdropVariants({ className: 'bg-black/60' })).toContain('bg-black/60')
  })
})
