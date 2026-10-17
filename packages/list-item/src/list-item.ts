/**
 * The semantic context a ListItem lives in. It decides what `selected` means
 * to assistive technology, so it is always explicit (a group or a prop):
 *
 * - `listbox`    — a selection widget (people picker, search results). The row
 *   is a `role="option"`; `selected` → `aria-selected`. Focus is roving.
 * - `navigation` — a list of destinations (conversation sidebar). The row's
 *   control is a native button; `selected` → `aria-current`.
 */
export type ListItemContext = 'listbox' | 'navigation'

/** Row padding / minimum height. */
export type ListItemDensity = 'compact' | 'comfortable'

/** Context used by a ListItem rendered outside any group or explicit prop. */
export const LIST_ITEM_DEFAULT_CONTEXT: ListItemContext = 'navigation'

/** Density used when none is given. */
export const LIST_ITEM_DEFAULT_DENSITY: ListItemDensity = 'comfortable'

/**
 * `aria-current` token for the selected row of a navigation list. `"true"`
 * ("the current item within a set") is valid for any destination, unlike
 * `"page"`, which only fits links to whole documents.
 */
export const LIST_ITEM_CURRENT_TOKEN = 'true'

/** Where the adapter spreads {@link ListItemAPI.ariaProps}. */
export type ListItemAriaTarget = 'row' | 'control'

export interface ListItemProps {
  /** Semantic context; defaults to {@link LIST_ITEM_DEFAULT_CONTEXT}. */
  context?: ListItemContext
  /** Whether the row is the selected / current one. */
  selected?: boolean
  /** Unread emphasis. */
  emphasized?: boolean
  /** Row padding. */
  density?: ListItemDensity
  /**
   * Whether the row has an activation handler. A navigation row without one
   * renders no control (it is static content). Listbox options are always
   * interactive because they are selectable.
   */
  interactive?: boolean
}

export interface ListItemAPI {
  /** Role and selection state (`aria-selected` or `aria-current`). */
  ariaProps: Record<string, string | number | boolean>
  /** Which element receives {@link ariaProps}: the `<li>` row or its inner control. */
  ariaTarget: ListItemAriaTarget
  /** Whether the row itself is the focusable control (listbox options). */
  rowIsControl: boolean
  /** Whether a navigation-style inner `<button>` should be rendered. */
  rendersControl: boolean
  /**
   * Whether a separate trailing `action` control may be rendered. Listbox
   * options have presentational children and a listbox may own only options,
   * so an action button there would be invalid ARIA (interactive-in-option).
   */
  allowsAction: boolean
  /** Data attributes for styling hooks and tests. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic semantics for one ListItem row.
 *
 * The row never nests one interactive element inside another: in a listbox
 * the `<li role="option">` is the only control; in navigation the main
 * `<button>` and the optional action are siblings inside a plain `<li>`.
 */
export function createListItem(props: ListItemProps = {}): ListItemAPI {
  const {
    context = LIST_ITEM_DEFAULT_CONTEXT,
    selected = false,
    emphasized = false,
    density = LIST_ITEM_DEFAULT_DENSITY,
    interactive = false,
  } = props

  const dataAttributes: Record<string, string> = {
    'data-slot': 'list-item',
    'data-context': context,
    'data-density': density,
    'data-state': selected ? 'selected' : 'unselected',
  }
  if (emphasized) dataAttributes['data-emphasized'] = ''

  if (context === 'listbox') {
    return {
      ariaProps: { role: 'option', 'aria-selected': selected },
      ariaTarget: 'row',
      rowIsControl: true,
      rendersControl: false,
      allowsAction: false,
      dataAttributes,
    }
  }

  const ariaProps: Record<string, string | number | boolean> = {}
  if (selected) ariaProps['aria-current'] = LIST_ITEM_CURRENT_TOKEN

  return {
    ariaProps,
    ariaTarget: interactive ? 'control' : 'row',
    rowIsControl: false,
    rendersControl: interactive,
    allowsAction: true,
    dataAttributes,
  }
}

export interface ListItemGroupProps {
  /** Semantic context shared by every row in the group (required: be explicit). */
  context: ListItemContext
  /** Listbox only: more than one option may be selected (checkbox pickers). */
  multiselectable?: boolean
}

export interface ListItemGroupAPI {
  /** Role for the `<ul>`; `role="list"` is explicit because `list-style: none` drops it in Safari. */
  ariaProps: Record<string, string | number | boolean>
  /** Whether the group runs roving focus (listbox only). */
  roving: boolean
  /** Data attributes for styling hooks and tests. */
  dataAttributes: Record<string, string>
}

/** Build the framework-agnostic semantics for the list that holds ListItems. */
export function createListItemGroup(props: ListItemGroupProps): ListItemGroupAPI {
  const { context, multiselectable = false } = props
  const dataAttributes: Record<string, string> = {
    'data-slot': 'list-item-group',
    'data-context': context,
  }

  if (context === 'listbox') {
    const ariaProps: Record<string, string | number | boolean> = { role: 'listbox' }
    if (multiselectable) ariaProps['aria-multiselectable'] = true
    return { ariaProps, roving: true, dataAttributes }
  }

  return { ariaProps: { role: 'list' }, roving: false, dataAttributes }
}

/** Keys the roving-focus helper owns (they never scroll the page inside a listbox). */
const LIST_ITEM_ROVING_KEYS: ReadonlySet<string> = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End'])

/** Keys that activate a listbox option, matching native button behaviour. */
const LIST_ITEM_ACTIVATION_KEYS: ReadonlySet<string> = new Set(['Enter', ' '])

/** Whether `key` is handled by {@link getNextListItemIndex}. */
export function isListItemRovingKey(key: string): boolean {
  return LIST_ITEM_ROVING_KEYS.has(key)
}

/** Whether `key` activates (taps) a focused listbox option. */
export function isListItemActivationKey(key: string): boolean {
  return LIST_ITEM_ACTIVATION_KEYS.has(key)
}

/**
 * Pure roving-focus rule for a vertical list of `count` rows.
 *
 * The list **clamps** at both ends rather than wrapping, so holding ArrowDown
 * stops on the last row instead of jumping back to the top of a long list.
 * A `current` of `-1` (nothing focused yet) moves to the first row.
 *
 * - ArrowDown → next (clamped to last)
 * - ArrowUp   → previous (clamped to first)
 * - Home      → first
 * - End       → last
 * - any other key → `current` unchanged
 */
export function getNextListItemIndex(current: number, key: string, count: number): number {
  if (count <= 0) return current

  switch (key) {
    case 'ArrowDown':
      return Math.min(Math.max(current + 1, 0), count - 1)
    case 'ArrowUp':
      return Math.max(Math.min(current - 1, count - 1), 0)
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return current
  }
}

/**
 * Which row owns the listbox's single tab stop before the user has moved
 * focus: the first selected row, else the first row, else `-1` (empty list).
 * Entering a picker on the current selection is the WAI-ARIA listbox rule.
 */
export function getInitialListItemIndex(selected: readonly boolean[]): number {
  if (selected.length === 0) return -1
  const firstSelected = selected.indexOf(true)
  return firstSelected === -1 ? 0 : firstSelected
}
