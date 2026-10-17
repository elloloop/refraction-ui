import {
  KEY_LEGEND_PRIMARY_MODIFIER,
  getKeyLegendGlyph,
  getKeyLegendName,
  normalizeKeyLegendKey,
  type KeycapPlatform,
} from '@refraction-ui/keycap'
import {
  SANE_DEFAULTS,
  SANE_DEFAULT_SHORTCUT_INFO,
  type RegisteredShortcut,
} from '@refraction-ui/keyboard-shortcut'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One shortcut to list: the keys to press and what they do. */
export interface ShortcutsDialogShortcut {
  /** Keys as ids or words (`['Mod', 'K']`, `['Meta', 'Shift', 'z']`, `['?']`). */
  keys: readonly string[]
  /** What the shortcut does ("Search"). Shortcuts without one are not listed. */
  description: string
  /** Section heading. Defaults to `SHORTCUTS_DIALOG_DEFAULT_GROUP`. */
  group?: string
}

/** One printed key of a combo. */
export interface ShortcutsDialogKeyPart {
  /** Canonical key id (`Meta`, `K`, `/`) — pass it to Keycap as the legend. */
  key: string
  /** Spoken name on the platform (Command, Ctrl). */
  name: string
  /** Printed glyph on the platform (⌘), or the name when the key has none. */
  glyph: string
}

/** A key combination resolved for one platform. */
export interface ShortcutsDialogCombo {
  /** Platform-resolved identity, used for de-duplication (`ctrl+shift+z`). */
  id: string
  /** Keys in display order: modifiers first (Ctrl, Alt, Shift, Meta), then the rest. */
  parts: ShortcutsDialogKeyPart[]
  /** Accessible name of the combo ("Command + K"). */
  label: string
}

/** A listed row: one description with every combo that performs it. */
export interface ShortcutsDialogRow {
  id: string
  description: string
  group: string
  combos: ShortcutsDialogCombo[]
}

/** A group heading with its rows. */
export interface ShortcutsDialogSection {
  group: string
  rows: ShortcutsDialogRow[]
}

/** Anything that lists registered shortcuts and announces changes, such as `globalShortcutRegistry`. */
export interface ShortcutsDialogRegistrySource {
  /** Stable function: calls `listener` on every change and returns an unsubscribe. */
  subscribe(listener: () => void): () => void
  /** Stable function returning an immutable list that keeps its identity until a change. */
  getSnapshot(): readonly RegisteredShortcut[]
  /**
   * What the server render (and hydration) lists. Omit it for registries
   * filled in effects, as `useShortcut` does — they are empty on the server.
   */
  getServerSnapshot?(): readonly RegisteredShortcut[]
}

/** Every visible or spoken string, for localisation. */
export interface ShortcutsDialogLabels {
  /** Dialog heading. */
  title: string
  /** Text under the heading. */
  description: string
  /** Accessible name of the search field. */
  searchLabel: string
  /** Search field placeholder. */
  searchPlaceholder: string
  /** Shown when nothing matches the search. */
  empty: string
  /** Accessible name of the close button. */
  close: string
  /** Description listed for the dialog's own open shortcuts. */
  openShortcut: string
  /** Word between alternative combos of one row ("⌘ / or ?"). */
  alternative: string
  /** Live-region text announcing how many shortcuts are shown. */
  resultCount: (count: number) => string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Group used for shortcuts that do not name one. */
export const SHORTCUTS_DIALOG_DEFAULT_GROUP = 'General'

/** The key that opens the dialog on its own, as on GitHub and Gmail. */
export const SHORTCUTS_DIALOG_HELP_KEY = '?'

/** The key that opens the dialog together with the primary modifier (⌘/ or Ctrl+/). */
export const SHORTCUTS_DIALOG_SLASH_KEY = '/'

/** The dialog's own open shortcuts, as listed in it. */
export const SHORTCUTS_DIALOG_OPEN_SHORTCUTS: readonly (readonly string[])[] = [
  [KEY_LEGEND_PRIMARY_MODIFIER, SHORTCUTS_DIALOG_SLASH_KEY],
  [SHORTCUTS_DIALOG_HELP_KEY],
]

/** Modifier display order shared by macOS (⌃⌥⇧⌘) and Windows (Ctrl+Alt+Shift+Win). */
export const SHORTCUTS_DIALOG_MODIFIER_ORDER: readonly string[] = ['Ctrl', 'Alt', 'Shift', 'Meta']

/** Locale used to sort groups and rows unless one is injected, so output is host-independent. */
export const SHORTCUTS_DIALOG_DEFAULT_LOCALE = 'en'

export const SHORTCUTS_DIALOG_DEFAULT_LABELS: Readonly<ShortcutsDialogLabels> = {
  title: 'Keyboard shortcuts',
  description: 'Press a combination anywhere outside a text field.',
  searchLabel: 'Search shortcuts',
  searchPlaceholder: 'Search by action or key…',
  empty: 'No shortcuts match your search.',
  close: 'Close',
  openShortcut: 'Show keyboard shortcuts',
  alternative: 'or',
  resultCount: (count) => (count === 1 ? '1 shortcut' : `${count} shortcuts`),
}

/** Extra words a key is found by, so "cmd", "option" or "return" match on either platform. */
const KEY_SEARCH_SYNONYMS: Readonly<Record<string, readonly string[]>> = {
  Meta: ['cmd', 'command', 'meta', 'win', 'super'],
  Ctrl: ['ctrl', 'control'],
  Alt: ['alt', 'option', 'opt'],
  Enter: ['enter', 'return'],
  Escape: ['esc', 'escape'],
  Delete: ['del', 'delete'],
  ' ': ['space'],
  '/': ['slash'],
  '?': ['question'],
}

/** A query splits into terms on whitespace and `+`, so "ctrl+k" and "ctrl k" match alike. */
const QUERY_TERM_SEPARATOR = /[\s+]+/

/** Joins key names in a combo's accessible name. */
const COMBO_LABEL_SEPARATOR = ' + '

/** Joins the parts of a row id; a character no description or group is expected to hold. */
const ROW_ID_SEPARATOR = '\u0000'

const MODIFIERS = new Set(SHORTCUTS_DIALOG_MODIFIER_ORDER)

// ---------------------------------------------------------------------------
// Combos
// ---------------------------------------------------------------------------

/**
 * Canonical keys for `platform` in display order: aliases folded (`Cmd` →
 * `Meta`, `Mod` → the platform modifier), blanks and repeats dropped,
 * modifiers first in SHORTCUTS_DIALOG_MODIFIER_ORDER, other keys as given.
 */
export function orderShortcutsDialogKeys(
  keys: readonly string[],
  platform: KeycapPlatform,
): string[] {
  const canonical = keys
    .filter((key) => key === ' ' || key.trim() !== '')
    .map((key) => normalizeKeyLegendKey(key, platform))
  const unique = Array.from(new Set(canonical))
  const modifiers = SHORTCUTS_DIALOG_MODIFIER_ORDER.filter((modifier) => unique.includes(modifier))
  const others = unique.filter((key) => !MODIFIERS.has(key))
  return [...modifiers, ...others]
}

/** Platform-resolved identity of a combo; `['Cmd', 'k']` and `['Mod', 'K']` match on macOS. */
export function getShortcutsDialogComboId(
  keys: readonly string[],
  platform: KeycapPlatform,
): string {
  return orderShortcutsDialogKeys(keys, platform)
    .map((key) => key.toLowerCase())
    .join('+')
}

/** Resolves a combo into the legend parts a Keycap prints and the name a screen reader hears. */
export function formatShortcutsDialogCombo(
  keys: readonly string[],
  platform: KeycapPlatform,
): ShortcutsDialogCombo {
  const parts = orderShortcutsDialogKeys(keys, platform).map((key) => ({
    key,
    name: getKeyLegendName(key, platform),
    glyph: getKeyLegendGlyph(key, platform),
  }))
  return {
    id: getShortcutsDialogComboId(keys, platform),
    parts,
    label: parts.map((part) => part.name).join(COMBO_LABEL_SEPARATOR),
  }
}

/** Accessible name of a row's keys: alternatives joined by the `alternative` word. */
export function formatShortcutsDialogRowKeysLabel(
  row: Pick<ShortcutsDialogRow, 'combos'>,
  alternative: string = SHORTCUTS_DIALOG_DEFAULT_LABELS.alternative,
): string {
  return row.combos.map((combo) => combo.label).join(` ${alternative} `)
}

// ---------------------------------------------------------------------------
// Collecting
// ---------------------------------------------------------------------------

/** Registry entries that carry a description, as listable shortcuts. */
export function shortcutsDialogFromRegistry(
  registered: readonly RegisteredShortcut[],
): ShortcutsDialogShortcut[] {
  return registered.flatMap((entry) =>
    entry.description ? [{ keys: entry.keys, description: entry.description, group: entry.group }] : [],
  )
}

/** Every SANE_DEFAULTS action with its description and group. */
export function shortcutsDialogFromSaneDefaults(): ShortcutsDialogShortcut[] {
  return Object.entries(SANE_DEFAULTS).flatMap(([action, keys]) => {
    const info = SANE_DEFAULT_SHORTCUT_INFO[action]
    return info ? [{ keys, description: info.description, group: info.group }] : []
  })
}

/** The dialog's own open shortcuts, described with `description`. */
export function shortcutsDialogOpenShortcuts(description: string): ShortcutsDialogShortcut[] {
  return SHORTCUTS_DIALOG_OPEN_SHORTCUTS.map((keys) => ({ keys, description }))
}

export interface CollectShortcutsDialogOptions {
  /** Live registry entries (from `useShortcut`); listed first, so their descriptions win. */
  registered?: readonly RegisteredShortcut[]
  /** Shortcuts passed in directly. */
  shortcuts?: readonly ShortcutsDialogShortcut[]
  /** Description for the dialog's own open shortcuts; omit to leave them out. */
  openShortcutDescription?: string
  /** Also list every SANE_DEFAULTS action, registered or not. */
  includeDefaults?: boolean
}

/** All sources in precedence order: registry, explicit, the dialog's own, defaults. */
export function collectShortcutsDialogShortcuts(
  options: CollectShortcutsDialogOptions,
): ShortcutsDialogShortcut[] {
  const { registered = [], shortcuts = [], openShortcutDescription, includeDefaults = false } = options
  return [
    ...shortcutsDialogFromRegistry(registered),
    ...shortcuts,
    ...(openShortcutDescription ? shortcutsDialogOpenShortcuts(openShortcutDescription) : []),
    ...(includeDefaults ? shortcutsDialogFromSaneDefaults() : []),
  ]
}

// ---------------------------------------------------------------------------
// Dedupe, group, sort, filter
// ---------------------------------------------------------------------------

/**
 * Drops shortcuts without keys or a description, and every later shortcut
 * whose combo resolves to one already listed on `platform` (first wins).
 */
export function dedupeShortcutsDialogShortcuts(
  shortcuts: readonly ShortcutsDialogShortcut[],
  platform: KeycapPlatform,
): ShortcutsDialogShortcut[] {
  const seen = new Set<string>()
  return shortcuts.filter((shortcut) => {
    const id = getShortcutsDialogComboId(shortcut.keys, platform)
    if (id === '' || shortcut.description.trim() === '' || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

function resolveGroup(group: string | undefined): string {
  const trimmed = group?.trim()
  return trimmed ? trimmed : SHORTCUTS_DIALOG_DEFAULT_GROUP
}

/** Merges shortcuts with the same group and description into one row with several combos. */
export function toShortcutsDialogRows(
  shortcuts: readonly ShortcutsDialogShortcut[],
  platform: KeycapPlatform,
): ShortcutsDialogRow[] {
  const rows = new Map<string, ShortcutsDialogRow>()
  for (const shortcut of shortcuts) {
    const group = resolveGroup(shortcut.group)
    const description = shortcut.description.trim()
    const id = `${group}${ROW_ID_SEPARATOR}${description}`
    const combo = formatShortcutsDialogCombo(shortcut.keys, platform)
    const row = rows.get(id)
    if (row) row.combos.push(combo)
    else rows.set(id, { id, group, description, combos: [combo] })
  }
  return Array.from(rows.values())
}

/** Lower-cased words a row is found by: description, group, and each key's id, name, glyph and synonyms. */
export function getShortcutsDialogRowSearchText(row: ShortcutsDialogRow): string {
  const keyWords = row.combos.flatMap((combo) =>
    combo.parts.flatMap((part) => [part.key, part.name, part.glyph, ...(KEY_SEARCH_SYNONYMS[part.key] ?? [])]),
  )
  return [row.description, row.group, ...keyWords].join(' ').toLowerCase()
}

/** Lower-cased, non-empty search terms of `query`. */
export function parseShortcutsDialogQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(QUERY_TERM_SEPARATOR)
    .filter((term) => term !== '')
}

/** Rows whose search text contains every term of `query`; all rows for a blank query. */
export function filterShortcutsDialogRows(
  rows: readonly ShortcutsDialogRow[],
  query: string,
): ShortcutsDialogRow[] {
  const terms = parseShortcutsDialogQuery(query)
  if (terms.length === 0) return [...rows]
  return rows.filter((row) => {
    const text = getShortcutsDialogRowSearchText(row)
    return terms.every((term) => text.includes(term))
  })
}

export interface GroupShortcutsDialogOptions {
  /** Groups listed first, in this order; the rest follow alphabetically. */
  groupOrder?: readonly string[]
  /** Collation locale. Default `SHORTCUTS_DIALOG_DEFAULT_LOCALE`. */
  locale?: string
}

/** Sections in group order, each with its rows sorted by description. */
export function groupShortcutsDialogRows(
  rows: readonly ShortcutsDialogRow[],
  options: GroupShortcutsDialogOptions = {},
): ShortcutsDialogSection[] {
  const { groupOrder = [SHORTCUTS_DIALOG_DEFAULT_GROUP], locale = SHORTCUTS_DIALOG_DEFAULT_LOCALE } = options
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true })
  const byGroup = new Map<string, ShortcutsDialogRow[]>()
  for (const row of rows) {
    const groupRows = byGroup.get(row.group)
    if (groupRows) groupRows.push(row)
    else byGroup.set(row.group, [row])
  }

  const rank = (group: string) => {
    const index = groupOrder.indexOf(group)
    return index === -1 ? groupOrder.length : index
  }
  const groups = Array.from(byGroup.keys()).sort(
    (a, b) => rank(a) - rank(b) || collator.compare(a, b),
  )
  return groups.map((group) => ({
    group,
    rows: [...(byGroup.get(group) ?? [])].sort((a, b) => collator.compare(a.description, b.description)),
  }))
}

// ---------------------------------------------------------------------------
// Whole dialog model
// ---------------------------------------------------------------------------

export interface ShortcutsDialogOptions extends GroupShortcutsDialogOptions {
  /** Shortcuts in precedence order (see `collectShortcutsDialogShortcuts`). */
  shortcuts: readonly ShortcutsDialogShortcut[]
  /** Platform to resolve keys for. */
  platform: KeycapPlatform
  /** Search text. */
  query?: string
}

export interface ShortcutsDialogAPI {
  /** Matching rows, grouped and sorted. */
  sections: ShortcutsDialogSection[]
  /** Number of rows that match the query. */
  matchCount: number
  /** Number of rows before filtering. */
  totalCount: number
  /** Nothing matches. */
  isEmpty: boolean
}

/** Dedupe → merge into rows → filter by query → group and sort. */
export function createShortcutsDialog(options: ShortcutsDialogOptions): ShortcutsDialogAPI {
  const { shortcuts, platform, query = '', groupOrder, locale } = options
  const rows = toShortcutsDialogRows(dedupeShortcutsDialogShortcuts(shortcuts, platform), platform)
  const matches = filterShortcutsDialogRows(rows, query)
  return {
    sections: groupShortcutsDialogRows(matches, { groupOrder, locale }),
    matchCount: matches.length,
    totalCount: rows.length,
    isEmpty: matches.length === 0,
  }
}

// ---------------------------------------------------------------------------
// Opening
// ---------------------------------------------------------------------------

/** The fields of a KeyboardEvent the open shortcut reads. */
export interface ShortcutsDialogKeyEvent {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  shiftKey: boolean
  isComposing?: boolean
  defaultPrevented?: boolean
}

/**
 * Whether the event is ⌘/ (macOS) or Ctrl+/ (elsewhere), or `?`. `?` is
 * typed with Shift on most layouts, so Shift is allowed for it; events
 * already handled (`defaultPrevented`) or part of IME composition are ignored.
 */
export function isShortcutsDialogOpenEvent(
  event: ShortcutsDialogKeyEvent,
  platform: KeycapPlatform,
): boolean {
  if (event.defaultPrevented || event.isComposing) return false
  if (event.key === SHORTCUTS_DIALOG_HELP_KEY) {
    return !event.ctrlKey && !event.metaKey && !event.altKey
  }
  if (event.key !== SHORTCUTS_DIALOG_SLASH_KEY || event.altKey || event.shiftKey) return false
  const mac = platform === 'mac'
  const primary = mac ? event.metaKey : event.ctrlKey
  const other = mac ? event.ctrlKey : event.metaKey
  return primary && !other
}

/** Input types that do not take typed text, so `?` there is still a shortcut. */
const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
])

/** Ancestors that make their descendants editable text. */
const EDITABLE_ANCESTOR_SELECTOR = '[contenteditable]:not([contenteditable="false"]), [role="textbox"]'

/** The parts of an event target the typing check reads (structural, so it runs without a DOM). */
export interface ShortcutsDialogEventTarget {
  tagName?: string
  type?: string
  isContentEditable?: boolean
  closest?: (selector: string) => unknown
}

function isEventTarget(target: unknown): target is ShortcutsDialogEventTarget {
  return typeof target === 'object' && target !== null
}

/** Whether keys pressed in `target` are text being typed: text inputs, textarea, select, contenteditable. */
export function isShortcutsDialogTypingTarget(target: unknown): boolean {
  if (!isEventTarget(target)) return false
  const tag = target.tagName?.toUpperCase()
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (tag === 'INPUT') return !NON_TEXT_INPUT_TYPES.has((target.type ?? '').toLowerCase())
  if (target.isContentEditable) return true
  return typeof target.closest === 'function' && Boolean(target.closest(EDITABLE_ANCESTOR_SELECTOR))
}
