/**
 * Headless logic for CommandDialog — a command palette in a dialog with
 * filter chips, recent items and caller-driven (async) grouped results.
 *
 * Everything here is pure and deterministic: the adapter owns state and
 * time, this module only derives what to show from what it is given.
 */

/** Id of the implicit chip that shows every scope. */
export const COMMAND_DIALOG_ALL_FILTER = 'all'

/** How many recent items are kept when the caller does not say. */
export const DEFAULT_COMMAND_DIALOG_MAX_RECENTS = 5

/** Section id used for the recent-items block. */
export const COMMAND_DIALOG_RECENT_SECTION = 'recent'

/** Default shortcut. `Mod` means ⌘ on Apple keyboards and Ctrl elsewhere. */
export const DEFAULT_COMMAND_DIALOG_SHORTCUT = 'Mod+K'

/** Platform-neutral modifier token accepted in `shortcut`. */
const MOD_TOKEN = 'mod'
const SHORTCUT_SEPARATOR = '+'

/**
 * Keyboard family that decides what `Mod` means. Apple keyboards use ⌘
 * (Meta); everything else uses Ctrl. Binding only one keeps the other free —
 * Ctrl+K is "kill to end of line" in macOS text fields.
 */
export type CommandDialogPlatform = 'mac' | 'other'

/** Platform assumed until (or unless) the real one is known, e.g. during SSR. */
export const DEFAULT_COMMAND_DIALOG_PLATFORM: CommandDialogPlatform = 'other'

/** What `Mod` expands to on each platform. */
const MOD_EXPANSION: Record<CommandDialogPlatform, string> = { mac: 'Meta', other: 'Ctrl' }

/** Apple platform names as they appear in `navigator.platform` / the user agent (iPadOS reports `MacIntel`). */
const APPLE_PLATFORM_PATTERN = /Mac|iPhone|iPad|iPod/i

/** One result row. Extra fields on `T` pass through untouched. */
export interface CommandDialogItem {
  /** Unique id; also the option's value inside the Command list. */
  id: string
  /** Primary text, highlighted against the query. */
  label: string
  /** Secondary text shown under the label, also highlighted. */
  description?: string
  /** Filter-chip id this item belongs to. Falls back to its group's `scope`. */
  scope?: string
  /** Shown but not selectable. */
  disabled?: boolean
}

/** A heading plus its items, as returned by the caller's search. */
export interface CommandDialogGroup<T extends CommandDialogItem = CommandDialogItem> {
  id: string
  heading: string
  /** Default filter-chip id for every item in the group. */
  scope?: string
  items: readonly T[]
}

/** A filter chip. */
export interface CommandDialogFilter {
  id: string
  label: string
}

/** A rendered block of the list: recents first, then result groups. */
export interface CommandDialogSection<T extends CommandDialogItem = CommandDialogItem> {
  id: string
  heading: string
  kind: 'recent' | 'group'
  /** Items with `scope` resolved, so they can be stored as recents as-is. */
  items: T[]
}

export interface BuildCommandDialogSectionsOptions<T extends CommandDialogItem> {
  groups?: readonly CommandDialogGroup<T>[]
  recentItems?: readonly T[]
  /** Raw input text; recents are shown only while it is blank. */
  query?: string
  activeFilter?: string
  /** Group ids in the order they should appear; unknown groups follow in input order. */
  groupOrder?: readonly string[]
  maxRecentItems?: number
  recentHeading: string
}

/** Clamp a caller-supplied limit to a non-negative integer. */
export function clampCommandDialogMaxRecents(max: number | undefined): number {
  if (max === undefined || !Number.isFinite(max)) return DEFAULT_COMMAND_DIALOG_MAX_RECENTS
  return Math.max(0, Math.floor(max))
}

/** Whether an item in `scope` is visible under the chip `activeFilter`. */
export function matchesCommandDialogFilter(
  scope: string | undefined,
  activeFilter: string | undefined,
): boolean {
  if (activeFilter === undefined || activeFilter === COMMAND_DIALOG_ALL_FILTER) return true
  return scope === activeFilter
}

/** The item with its effective scope (own scope, else the group's). */
export function resolveCommandDialogItemScope<T extends CommandDialogItem>(
  item: T,
  group: Pick<CommandDialogGroup<T>, 'scope'>,
): T {
  const scope = item.scope ?? group.scope
  if (scope === item.scope) return item
  return { ...item, scope }
}

/** Groups narrowed to the active chip; groups left empty are dropped. */
export function filterCommandDialogGroups<T extends CommandDialogItem>(
  groups: readonly CommandDialogGroup<T>[],
  activeFilter: string | undefined,
): CommandDialogGroup<T>[] {
  const result: CommandDialogGroup<T>[] = []
  for (const group of groups) {
    const items = group.items
      .map((item) => resolveCommandDialogItemScope(item, group))
      .filter((item) => matchesCommandDialogFilter(item.scope, activeFilter))
    if (items.length > 0) result.push({ ...group, items })
  }
  return result
}

/**
 * Stable ordering for groups. Async sources resolve in any order; a fixed
 * `groupOrder` stops headings jumping around as results stream in.
 */
export function orderCommandDialogGroups<G extends { id: string }>(
  groups: readonly G[],
  groupOrder: readonly string[] = [],
): G[] {
  const rank = new Map<string, number>()
  groupOrder.forEach((id, index) => {
    if (!rank.has(id)) rank.set(id, index)
  })
  const unranked = groupOrder.length
  return groups
    .map((group, index) => ({ group, index, rank: rank.get(group.id) ?? unranked }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.group)
}

/** Recents with duplicate ids removed (first, i.e. most recent, wins), capped at `max`. */
export function dedupeCommandDialogRecents<T extends CommandDialogItem>(
  recents: readonly T[],
  max?: number,
): T[] {
  const limit = clampCommandDialogMaxRecents(max)
  const seen = new Set<string>()
  const result: T[] = []
  for (const item of recents) {
    if (result.length >= limit) break
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }
  return result
}

/** Recents after `item` was chosen: it moves to the front, older copies go, list capped. */
export function mergeCommandDialogRecents<T extends CommandDialogItem>(
  recents: readonly T[],
  item: T,
  max?: number,
): T[] {
  return dedupeCommandDialogRecents([item, ...recents.filter((r) => r.id !== item.id)], max)
}

/**
 * The chip list with the implicit "All" chip first. A caller-supplied chip
 * with the `all` id replaces the implicit one; duplicate ids are dropped.
 */
export function getCommandDialogFilterOptions(
  filters: readonly CommandDialogFilter[],
  allLabel: string,
): CommandDialogFilter[] {
  if (filters.length === 0) return []
  const callerAll = filters.find((f) => f.id === COMMAND_DIALOG_ALL_FILTER)
  const options = [callerAll ?? { id: COMMAND_DIALOG_ALL_FILTER, label: allLabel }]
  const seen = new Set([COMMAND_DIALOG_ALL_FILTER])
  for (const filter of filters) {
    if (seen.has(filter.id)) continue
    seen.add(filter.id)
    options.push(filter)
  }
  return options
}

/** A chip id that exists in `options`, falling back to "All". */
export function resolveCommandDialogActiveFilter(
  options: readonly CommandDialogFilter[],
  activeFilter: string | undefined,
): string {
  if (activeFilter !== undefined && options.some((o) => o.id === activeFilter)) return activeFilter
  return COMMAND_DIALOG_ALL_FILTER
}

/**
 * Next chip index for a key press in the chip radiogroup (WAI-ARIA radio
 * pattern: arrows wrap, Home/End jump). `undefined` means "not handled".
 */
export function getCommandDialogFilterKeyTarget(
  key: string,
  currentIndex: number,
  count: number,
): number | undefined {
  if (count <= 0) return undefined
  const current = Math.min(Math.max(currentIndex, 0), count - 1)
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return undefined
  }
}

/** Whether the query counts as empty (whitespace only). */
export function isCommandDialogQueryBlank(query: string | undefined): boolean {
  return query === undefined || query.trim().length === 0
}

/**
 * The list to render: recents (only while the query is blank) then ordered,
 * chip-filtered groups. An item id appears once in the whole list — the
 * first occurrence wins — because the Command list keys options by value.
 */
export function buildCommandDialogSections<T extends CommandDialogItem>(
  options: BuildCommandDialogSectionsOptions<T>,
): CommandDialogSection<T>[] {
  const { groups = [], recentItems = [], query, activeFilter, groupOrder, maxRecentItems, recentHeading } =
    options
  const seen = new Set<string>()
  const takeUnseen = (items: readonly T[]): T[] =>
    items.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })

  const sections: CommandDialogSection<T>[] = []
  if (isCommandDialogQueryBlank(query)) {
    const recents = takeUnseen(
      dedupeCommandDialogRecents(recentItems, maxRecentItems).filter((item) =>
        matchesCommandDialogFilter(item.scope, activeFilter),
      ),
    )
    if (recents.length > 0) {
      sections.push({ id: COMMAND_DIALOG_RECENT_SECTION, heading: recentHeading, kind: 'recent', items: recents })
    }
  }

  for (const group of orderCommandDialogGroups(filterCommandDialogGroups(groups, activeFilter), groupOrder)) {
    const items = takeUnseen(group.items)
    if (items.length > 0) sections.push({ id: group.id, heading: group.heading, kind: 'group', items })
  }
  return sections
}

/**
 * The platform for a `navigator.platform`-style string, falling back to the
 * user agent when the platform string is empty. Pure: the caller reads
 * `navigator`, so this stays usable during SSR and in tests.
 */
export function detectCommandDialogPlatform(
  platform: string | undefined,
  userAgent?: string,
): CommandDialogPlatform {
  const source = platform || userAgent || ''
  return APPLE_PLATFORM_PATTERN.test(source) ? 'mac' : 'other'
}

/**
 * Expand a shortcut string into the key list `useShortcut` understands.
 * `Mod` becomes `Meta` on `mac` and `Ctrl` elsewhere, so `Mod+K` is
 * `['Meta','K']` or `['Ctrl','K']`; explicit `Ctrl`/`Meta` are kept as
 * written. `false` or an empty string disables the shortcut (`[]`).
 */
export function expandCommandDialogShortcut(
  shortcut: string | false | undefined,
  platform: CommandDialogPlatform = DEFAULT_COMMAND_DIALOG_PLATFORM,
): string[] {
  if (shortcut === false) return []
  const source = shortcut ?? DEFAULT_COMMAND_DIALOG_SHORTCUT
  const modifier = MOD_EXPANSION[platform]
  return source
    .split(SHORTCUT_SEPARATOR)
    .map((key) => key.trim())
    .filter((key) => key.length > 0)
    .map((key) => (key.toLowerCase() === MOD_TOKEN ? modifier : key))
}

/** `useShortcut` takes a single `a+b` string. */
export function joinCommandDialogShortcut(keys: readonly string[]): string {
  return keys.join(SHORTCUT_SEPARATOR)
}
