/**
 * Headless core for a multi-select combobox ("people picker").
 *
 * Everything here is pure and deterministic: the selection reducer, filtering,
 * the list of navigable items (options plus an optional create-from-query
 * item), active-item movement, the keyboard map, max enforcement and the
 * polite announcement text. Adapters own rendering, focus and ids.
 */

/* ─── Types ────────────────────────────────────────────────────── */

/** One selectable option. Extend it to carry extra data (e.g. an avatar URL). */
export interface MultiComboboxOption {
  /** Stable identity; selection is compared by this. */
  value: string
  /** Visible, filterable and announced text. */
  label: string
  /** A disabled option is shown but cannot be selected. */
  disabled?: boolean
}

/** Predicate deciding whether an option matches the current query. */
export type MultiComboboxFilter<T extends MultiComboboxOption = MultiComboboxOption> = (
  option: T,
  query: string,
) => boolean

/** Key of the create-from-query item; option keys are prefixed so they never clash. */
export const MULTI_COMBOBOX_CREATE_KEY = 'create'
const OPTION_KEY_PREFIX = 'option:'

/** Navigable entry in the listbox. */
export type MultiComboboxItem<T extends MultiComboboxOption = MultiComboboxOption> =
  | {
      kind: 'option'
      key: string
      option: T
      selected: boolean
      disabled: boolean
    }
  | {
      kind: 'create'
      key: string
      query: string
      selected: false
      disabled: boolean
    }

/** Changes the selection reducer understands. */
export type MultiComboboxAction<T extends MultiComboboxOption = MultiComboboxOption> =
  | { type: 'add'; option: T }
  | { type: 'remove'; value: string }
  | { type: 'toggle'; option: T }
  | { type: 'removeLast' }
  | { type: 'clear' }

export interface MultiComboboxReducerConfig {
  /** Maximum number of selected options; unlimited when omitted. */
  max?: number
}

/* ─── Query + selection helpers ────────────────────────────────── */

/** Normalise a query (or label) for case-insensitive, whitespace-tolerant matching. */
export function normalizeMultiComboboxQuery(query: string): string {
  return query.trim().toLocaleLowerCase()
}

/** Default filter: the label contains the trimmed query, ignoring case. */
export function defaultMultiComboboxFilter(option: MultiComboboxOption, query: string): boolean {
  const needle = normalizeMultiComboboxQuery(query)
  if (!needle) return true
  return normalizeMultiComboboxQuery(option.label).includes(needle)
}

/** Whether `value` is part of the selection. */
export function isMultiComboboxSelected(
  selected: readonly MultiComboboxOption[],
  value: string,
): boolean {
  return selected.some((option) => option.value === value)
}

/**
 * Whether the selection is full. A missing, non-finite or negative `max`
 * means "no limit"; `max` is floored so `2.5` behaves like `2`.
 */
export function isMultiComboboxAtMax(
  selected: readonly MultiComboboxOption[],
  max: number | undefined,
): boolean {
  if (max === undefined || !Number.isFinite(max) || max < 0) return false
  return selected.length >= Math.floor(max)
}

/* ─── Selection reducer ────────────────────────────────────────── */

/**
 * Apply a selection change. Returns the **same array** when nothing changes
 * (duplicate add, add past `max`, add of a disabled option, remove of an
 * unknown value, `removeLast`/`clear` on an empty selection) so adapters can
 * skip a no-op update by reference.
 */
export function multiComboboxReducer<T extends MultiComboboxOption>(
  selected: readonly T[],
  action: MultiComboboxAction<T>,
  config: MultiComboboxReducerConfig = {},
): readonly T[] {
  switch (action.type) {
    case 'add':
      return addOption(selected, action.option, config.max)
    case 'remove':
      return removeValue(selected, action.value)
    case 'toggle':
      return isMultiComboboxSelected(selected, action.option.value)
        ? removeValue(selected, action.option.value)
        : addOption(selected, action.option, config.max)
    case 'removeLast':
      return selected.length === 0 ? selected : selected.slice(0, -1)
    case 'clear':
      return selected.length === 0 ? selected : []
    default:
      return selected
  }
}

function addOption<T extends MultiComboboxOption>(
  selected: readonly T[],
  option: T,
  max: number | undefined,
): readonly T[] {
  if (option.disabled) return selected
  if (isMultiComboboxSelected(selected, option.value)) return selected
  if (isMultiComboboxAtMax(selected, max)) return selected
  return [...selected, option]
}

function removeValue<T extends MultiComboboxOption>(
  selected: readonly T[],
  value: string,
): readonly T[] {
  if (!isMultiComboboxSelected(selected, value)) return selected
  return selected.filter((option) => option.value !== value)
}

/* ─── Filtering + items ────────────────────────────────────────── */

/**
 * Filter options by the query. Pass `filter: false` when the caller already
 * filtered them (e.g. server-side search results) to show them as given.
 */
export function filterMultiComboboxOptions<T extends MultiComboboxOption>(
  options: readonly T[],
  query: string,
  filter: MultiComboboxFilter<T> | false = defaultMultiComboboxFilter,
): T[] {
  if (filter === false) return [...options]
  return options.filter((option) => filter(option, query))
}

/**
 * Whether to offer a "Create <query>" item: there is a non-blank query and no
 * option or selected chip already has that exact label (case-insensitive).
 */
export function shouldOfferMultiComboboxCreate(
  query: string,
  options: readonly MultiComboboxOption[],
  selected: readonly MultiComboboxOption[],
): boolean {
  const needle = normalizeMultiComboboxQuery(query)
  if (!needle) return false
  const sameLabel = (option: MultiComboboxOption) =>
    normalizeMultiComboboxQuery(option.label) === needle
  return !options.some(sameLabel) && !selected.some(sameLabel)
}

export interface BuildMultiComboboxItemsInput<T extends MultiComboboxOption> {
  options: readonly T[]
  selected: readonly T[]
  query: string
  filter?: MultiComboboxFilter<T> | false
  /** Append a create-from-query item when the query matches no label. */
  creatable?: boolean
  max?: number
}

/**
 * Build the ordered, navigable listbox items. Selected options stay in the
 * list (the listbox is multi-selectable, so activating one toggles it off).
 * Once the selection is full, unselected options and the create item are
 * disabled; selected ones stay enabled so they can still be removed.
 */
export function buildMultiComboboxItems<T extends MultiComboboxOption>(
  input: BuildMultiComboboxItemsInput<T>,
): MultiComboboxItem<T>[] {
  const { options, selected, query, filter, creatable = false, max } = input
  const full = isMultiComboboxAtMax(selected, max)

  const items: MultiComboboxItem<T>[] = filterMultiComboboxOptions(options, query, filter).map(
    (option) => {
      const isSelected = isMultiComboboxSelected(selected, option.value)
      return {
        kind: 'option',
        key: `${OPTION_KEY_PREFIX}${option.value}`,
        option,
        selected: isSelected,
        disabled: Boolean(option.disabled) || (full && !isSelected),
      }
    },
  )

  if (creatable && shouldOfferMultiComboboxCreate(query, options, selected)) {
    items.push({
      kind: 'create',
      key: MULTI_COMBOBOX_CREATE_KEY,
      query: query.trim(),
      selected: false,
      disabled: full,
    })
  }
  return items
}

/* ─── Active item ──────────────────────────────────────────────── */

/** Movement requested by the keyboard. */
export type MultiComboboxMove = 'next' | 'prev' | 'first' | 'last'

const NO_ACTIVE_INDEX = -1

function firstEnabledIndex(items: readonly MultiComboboxItem<MultiComboboxOption>[]): number {
  return items.findIndex((item) => !item.disabled)
}

function lastEnabledIndex(items: readonly MultiComboboxItem<MultiComboboxOption>[]): number {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (!items[i].disabled) return i
  }
  return NO_ACTIVE_INDEX
}

/**
 * Resolve which item is active. The adapter remembers the active item by
 * key so async option updates keep it; when that key is gone or disabled the
 * first enabled item becomes active. Returns -1 when nothing can be active.
 */
export function resolveMultiComboboxActiveIndex(
  items: readonly MultiComboboxItem<MultiComboboxOption>[],
  activeKey: string | null,
): number {
  if (activeKey !== null) {
    const index = items.findIndex((item) => item.key === activeKey)
    if (index !== NO_ACTIVE_INDEX && !items[index].disabled) return index
  }
  return firstEnabledIndex(items)
}

/**
 * Move the active index, skipping disabled items. Arrow movement wraps
 * (listbox convention, matching Combobox); Home/End jump to the first/last
 * enabled item. Returns -1 when every item is disabled.
 */
export function moveMultiComboboxActiveIndex(
  items: readonly MultiComboboxItem<MultiComboboxOption>[],
  current: number,
  move: MultiComboboxMove,
): number {
  if (move === 'first') return firstEnabledIndex(items)
  if (move === 'last') return lastEnabledIndex(items)

  const count = items.length
  if (count === 0) return NO_ACTIVE_INDEX
  const step = move === 'next' ? 1 : -1
  // Starting "outside" the list makes next land on the first item, prev on the last.
  const start = current >= 0 && current < count ? current : move === 'next' ? -1 : count
  for (let offset = 1; offset <= count; offset += 1) {
    const index = (((start + step * offset) % count) + count) % count
    if (!items[index].disabled) return index
  }
  return NO_ACTIVE_INDEX
}

/* ─── Keyboard map ─────────────────────────────────────────────── */

/** What a key press on the combobox input should do. */
export type MultiComboboxKeyIntent =
  | 'open-first'
  | 'open-last'
  | MultiComboboxMove
  | 'commit'
  | 'close'
  | 'clear-query'
  | 'remove-last'
  | 'none'

export interface MultiComboboxKeyContext {
  open: boolean
  query: string
  /** An item is active (so Enter has something to commit). */
  hasActive: boolean
  /** At least one chip is selected (so Backspace has something to remove). */
  hasSelection: boolean
}

/**
 * Pure keyboard map for the input (ARIA 1.2 combobox with listbox popup).
 *
 * - ArrowDown / ArrowUp: open (activating first / last) or move, wrapping
 * - Home / End: first / last item while open (native caret movement when closed)
 * - Enter: toggle the active item while open
 * - Escape: close when open; otherwise clear a non-empty query
 * - Backspace on an empty query: remove the last chip
 */
export function getMultiComboboxKeyIntent(
  key: string,
  context: MultiComboboxKeyContext,
): MultiComboboxKeyIntent {
  const { open, query, hasActive, hasSelection } = context
  switch (key) {
    case 'ArrowDown':
      return open ? 'next' : 'open-first'
    case 'ArrowUp':
      return open ? 'prev' : 'open-last'
    case 'Home':
      return open ? 'first' : 'none'
    case 'End':
      return open ? 'last' : 'none'
    case 'Enter':
      return open && hasActive ? 'commit' : 'none'
    case 'Escape':
      if (open) return 'close'
      return query ? 'clear-query' : 'none'
    case 'Backspace':
      return query === '' && hasSelection ? 'remove-last' : 'none'
    default:
      return 'none'
  }
}

/* ─── Announcements ────────────────────────────────────────────── */

/** User-facing strings; override any of them for i18n. */
export interface MultiComboboxMessages {
  /** Accessible name of a chip's remove button. */
  remove: (label: string) => string
  /** Text of the create-from-query item. */
  create: (query: string) => string
  /** Shown while options are loading. */
  loading: string
  /** Shown when no option matches. */
  empty: string
  /** Shown (and announced) when the selection is full. */
  maxReached: (max: number) => string
  /** Announced after one option is added. */
  added: (label: string, count: number) => string
  /** Announced after one option is removed. */
  removed: (label: string, count: number) => string
  /** Announced after any other selection change (e.g. a controlled reset). */
  selectedCount: (count: number) => string
  /** Accessible name of the chip list. */
  selectedListLabel: string
}

export const multiComboboxDefaultMessages: MultiComboboxMessages = {
  remove: (label) => `Remove ${label}`,
  create: (query) => `Create "${query}"`,
  loading: 'Loading…',
  empty: 'No results',
  maxReached: (max) => `Maximum of ${max} selected`,
  added: (label, count) => `${label} added. ${count} selected.`,
  removed: (label, count) => `${label} removed. ${count} selected.`,
  selectedCount: (count) => `${count} selected.`,
  selectedListLabel: 'Selected',
}

/** Merge partial overrides onto the default messages. */
export function resolveMultiComboboxMessages(
  overrides: Partial<MultiComboboxMessages> = {},
): MultiComboboxMessages {
  return { ...multiComboboxDefaultMessages, ...overrides }
}

export interface MultiComboboxSelectionDiff<T extends MultiComboboxOption = MultiComboboxOption> {
  added: T[]
  removed: T[]
}

/** Options added and removed between two selections (compared by value). */
export function diffMultiComboboxSelection<T extends MultiComboboxOption>(
  previous: readonly T[],
  next: readonly T[],
): MultiComboboxSelectionDiff<T> {
  return {
    added: next.filter((option) => !isMultiComboboxSelected(previous, option.value)),
    removed: previous.filter((option) => !isMultiComboboxSelected(next, option.value)),
  }
}

/**
 * Polite announcement for a selection change, or `''` when nothing changed.
 * A single add/remove names the option; anything else reports the count.
 */
export function formatMultiComboboxAnnouncement(
  diff: MultiComboboxSelectionDiff,
  count: number,
  messages: MultiComboboxMessages = multiComboboxDefaultMessages,
): string {
  const { added, removed } = diff
  if (added.length === 0 && removed.length === 0) return ''
  if (added.length === 1 && removed.length === 0) return messages.added(added[0].label, count)
  if (removed.length === 1 && added.length === 0) return messages.removed(removed[0].label, count)
  return messages.selectedCount(count)
}

/* ─── ARIA ─────────────────────────────────────────────────────── */

export interface MultiComboboxAriaInput {
  open: boolean
  listboxId: string
  /** Id of the active option, when one is active and the popup is open. */
  activeDescendantId?: string
  disabled?: boolean
  loading?: boolean
}

export interface MultiComboboxAPI {
  /** Spread on the text input (`role="combobox"`). */
  inputAriaProps: Record<string, string | number | boolean>
  /** Spread on the popup list (`role="listbox"`, multi-selectable). */
  listboxAriaProps: Record<string, string | number | boolean>
  /** Styling hooks for the root. */
  dataAttributes: Record<string, string>
}

/** Framework-agnostic ARIA 1.2 combobox wiring for input and listbox. */
export function createMultiCombobox(input: MultiComboboxAriaInput): MultiComboboxAPI {
  const { open, listboxId, activeDescendantId, disabled = false, loading = false } = input

  const inputAriaProps: Record<string, string | number | boolean> = {
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-haspopup': 'listbox',
    'aria-expanded': open,
    'aria-controls': listboxId,
  }
  if (open && activeDescendantId) inputAriaProps['aria-activedescendant'] = activeDescendantId

  const listboxAriaProps: Record<string, string | number | boolean> = {
    role: 'listbox',
    id: listboxId,
    'aria-multiselectable': true,
  }
  if (loading) listboxAriaProps['aria-busy'] = true

  const dataAttributes: Record<string, string> = {
    'data-state': open ? 'open' : 'closed',
  }
  if (disabled) dataAttributes['data-disabled'] = ''
  if (loading) dataAttributes['data-loading'] = ''

  return { inputAriaProps, listboxAriaProps, dataAttributes }
}
