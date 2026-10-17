/**
 * AdaptiveTabNav — headless core.
 *
 * One primary navigation for an app with a handful of top-level sections: a
 * row of pill tabs inline in a top bar on a wide viewport, docked to the
 * bottom of the screen as a tab bar on a narrow one. The same element does
 * both, so a page never carries two copies of its navigation. Pure functions;
 * no DOM, no framework.
 */

/**
 * The viewport at which the nav docks to the bottom: below 768px, the
 * library's mobile breakpoint. Every docked class uses this exact query as an
 * arbitrary variant, so the breakpoint a caller pads its content for and the
 * CSS that docks the nav cannot disagree.
 */
export const ADAPTIVE_TAB_NAV_DOCK_MEDIA_QUERY = '(max-width: 767px)'

/** One section: a stable id the caller selects by, and its visible name. */
export interface AdaptiveTabNavEntry<Id extends string = string> {
  id: Id
  label: string
}

/**
 * The index of the tab whose id is `active`, or -1. A page outside every
 * section (`null`) lights no tab.
 */
export function activeTabNavIndex<Id extends string>(
  items: readonly AdaptiveTabNavEntry<Id>[],
  active: Id | null,
): number {
  return active === null ? -1 : items.findIndex((item) => item.id === active)
}

/** Ids used by more than one item, each once, in first-seen order. */
export function duplicateTabNavIds(items: readonly AdaptiveTabNavEntry[]): string[] {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const { id } of items) {
    if (seen.has(id)) repeated.add(id)
    seen.add(id)
  }
  return [...repeated]
}

export interface AdaptiveTabNavItemAttributes {
  'data-slot': 'adaptive-tab-nav-item'
  'data-tab': string
  'data-state': 'active' | 'inactive'
  'aria-current'?: 'page'
}

export interface AdaptiveTabNavAPI {
  /** The lit tab, or -1 when the page belongs to no section. */
  activeIndex: number
  /** Ids that appear more than once; each would confuse selection and keys. */
  duplicateIds: string[]
  /** Attributes for the tab at `index`. */
  itemAttributes: (index: number) => AdaptiveTabNavItemAttributes
}

export function createAdaptiveTabNav<Id extends string>(
  items: readonly AdaptiveTabNavEntry<Id>[],
  active: Id | null,
): AdaptiveTabNavAPI {
  const activeIndex = activeTabNavIndex(items, active)
  return {
    activeIndex,
    duplicateIds: duplicateTabNavIds(items),
    itemAttributes(index) {
      const current = index === activeIndex
      return {
        'data-slot': 'adaptive-tab-nav-item',
        'data-tab': items[index]?.id ?? '',
        'data-state': current ? 'active' : 'inactive',
        ...(current ? { 'aria-current': 'page' as const } : {}),
      }
    },
  }
}
