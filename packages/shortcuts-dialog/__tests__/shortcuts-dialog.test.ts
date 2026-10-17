import { describe, it, expect } from 'vitest'
import { SANE_DEFAULTS, type RegisteredShortcut } from '@refraction-ui/keyboard-shortcut'
import {
  collectShortcutsDialogShortcuts,
  createShortcutsDialog,
  dedupeShortcutsDialogShortcuts,
  filterShortcutsDialogRows,
  formatShortcutsDialogCombo,
  formatShortcutsDialogRowKeysLabel,
  getShortcutsDialogComboId,
  getShortcutsDialogRowSearchText,
  groupShortcutsDialogRows,
  isShortcutsDialogOpenEvent,
  isShortcutsDialogTypingTarget,
  orderShortcutsDialogKeys,
  parseShortcutsDialogQuery,
  shortcutsDialogFromRegistry,
  shortcutsDialogFromSaneDefaults,
  shortcutsDialogOpenShortcuts,
  toShortcutsDialogRows,
  SHORTCUTS_DIALOG_DEFAULT_GROUP,
  SHORTCUTS_DIALOG_DEFAULT_LABELS,
  type ShortcutsDialogKeyEvent,
  type ShortcutsDialogShortcut,
} from '../src/shortcuts-dialog.js'
import {
  shortcutsDialogCloseVariants,
  shortcutsDialogSearchClass,
  shortcutsDialogContentClass,
} from '../src/shortcuts-dialog.styles.js'

const FIXTURE: ShortcutsDialogShortcut[] = [
  { keys: ['Mod', 'K'], description: 'Search', group: 'Navigation' },
  { keys: ['Meta', 'Shift', 'z'], description: 'Redo', group: 'Editing' },
  { keys: ['Meta', 'z'], description: 'Undo', group: 'Editing' },
  { keys: ['g', 'i'], description: 'Go to inbox', group: 'Navigation' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
]

describe('orderShortcutsDialogKeys', () => {
  it('puts modifiers first in Ctrl, Alt, Shift, Meta order', () => {
    expect(orderShortcutsDialogKeys(['k', 'Shift', 'Meta', 'Alt', 'Ctrl'], 'windows')).toEqual([
      'Ctrl', 'Alt', 'Shift', 'Meta', 'K',
    ])
  })

  it('keeps non-modifier keys in the given order (sequences)', () => {
    expect(orderShortcutsDialogKeys(['g', 'i'], 'mac')).toEqual(['G', 'I'])
  })

  it('folds aliases and resolves Mod per platform', () => {
    expect(orderShortcutsDialogKeys(['Cmd', 'k'], 'mac')).toEqual(['Meta', 'K'])
    expect(orderShortcutsDialogKeys(['Mod', 'k'], 'mac')).toEqual(['Meta', 'K'])
    expect(orderShortcutsDialogKeys(['Mod', 'k'], 'windows')).toEqual(['Ctrl', 'K'])
    expect(orderShortcutsDialogKeys(['Option', 'Return'], 'mac')).toEqual(['Alt', 'Enter'])
  })

  it('drops blanks and repeats but keeps the space key', () => {
    expect(orderShortcutsDialogKeys(['Ctrl', '', '  ', 'Control', ' '], 'windows')).toEqual(['Ctrl', ' '])
  })

  it('returns an empty list for no keys', () => {
    expect(orderShortcutsDialogKeys([], 'mac')).toEqual([])
  })
})

describe('getShortcutsDialogComboId', () => {
  it('is order- and alias-independent', () => {
    expect(getShortcutsDialogComboId(['k', 'Cmd'], 'mac')).toBe(getShortcutsDialogComboId(['Meta', 'K'], 'mac'))
    expect(getShortcutsDialogComboId(['Shift', 'Meta', 'z'], 'windows')).toBe('shift+meta+z')
  })

  it('treats Mod as Meta only on macOS', () => {
    expect(getShortcutsDialogComboId(['Mod', 'k'], 'mac')).toBe(getShortcutsDialogComboId(['Meta', 'k'], 'mac'))
    expect(getShortcutsDialogComboId(['Mod', 'k'], 'windows')).toBe(getShortcutsDialogComboId(['Ctrl', 'k'], 'windows'))
    expect(getShortcutsDialogComboId(['Mod', 'k'], 'windows')).not.toBe(
      getShortcutsDialogComboId(['Meta', 'k'], 'windows'),
    )
  })
})

describe('formatShortcutsDialogCombo', () => {
  it('produces legend parts with platform glyphs and names on macOS', () => {
    const combo = formatShortcutsDialogCombo(['Mod', 'Shift', 'p'], 'mac')
    expect(combo.parts).toEqual([
      { key: 'Shift', name: 'Shift', glyph: '⇧' },
      { key: 'Meta', name: 'Command', glyph: '⌘' },
      { key: 'P', name: 'P', glyph: 'P' },
    ])
    expect(combo.label).toBe('Shift + Command + P')
    expect(combo.id).toBe('shift+meta+p')
  })

  it('uses words on Windows', () => {
    const combo = formatShortcutsDialogCombo(['Mod', '/'], 'windows')
    expect(combo.parts.map((part) => part.glyph)).toEqual(['Ctrl', '/'])
    expect(combo.label).toBe('Ctrl + /')
  })

  it('names single non-letter keys as written', () => {
    expect(formatShortcutsDialogCombo(['?'], 'mac').label).toBe('?')
  })
})

describe('formatShortcutsDialogRowKeysLabel', () => {
  it('joins alternatives with the alternative word', () => {
    const [row] = toShortcutsDialogRows(shortcutsDialogOpenShortcuts('Help'), 'mac')
    expect(formatShortcutsDialogRowKeysLabel(row)).toBe('Command + / or ?')
    expect(formatShortcutsDialogRowKeysLabel(row, 'oder')).toBe('Command + / oder ?')
  })
})

describe('collecting', () => {
  const registered: RegisteredShortcut[] = [
    { id: 'meta+s', keys: ['Meta', 's'], description: 'Save', group: 'File' },
    { id: 'ctrl+j', keys: ['Ctrl', 'j'] },
  ]

  it('lists only described registry entries', () => {
    expect(shortcutsDialogFromRegistry(registered)).toEqual([
      { keys: ['Meta', 's'], description: 'Save', group: 'File' },
    ])
  })

  it('lists every SANE_DEFAULTS action', () => {
    const defaults = shortcutsDialogFromSaneDefaults()
    expect(defaults).toHaveLength(Object.keys(SANE_DEFAULTS).length)
    expect(defaults).toContainEqual({ keys: ['Meta', 's'], description: 'Save', group: 'General' })
    expect(defaults).toContainEqual({ keys: ['?'], description: 'Show keyboard shortcuts', group: 'General' })
  })

  it('describes the dialog’s own open shortcuts', () => {
    expect(shortcutsDialogOpenShortcuts('Help')).toEqual([
      { keys: ['Mod', '/'], description: 'Help' },
      { keys: ['?'], description: 'Help' },
    ])
  })

  it('orders sources registry, explicit, own, defaults — and omits optional ones by default', () => {
    const explicit = [{ keys: ['g', 'i'], description: 'Go to inbox' }]
    expect(collectShortcutsDialogShortcuts({ registered, shortcuts: explicit })).toEqual([
      { keys: ['Meta', 's'], description: 'Save', group: 'File' },
      ...explicit,
    ])
    const all = collectShortcutsDialogShortcuts({
      registered,
      shortcuts: explicit,
      openShortcutDescription: 'Help',
      includeDefaults: true,
    })
    expect(all.slice(0, 4).map((s) => s.description)).toEqual(['Save', 'Go to inbox', 'Help', 'Help'])
    expect(all).toHaveLength(4 + Object.keys(SANE_DEFAULTS).length)
  })

  it('returns nothing from no sources', () => {
    expect(collectShortcutsDialogShortcuts({})).toEqual([])
  })
})

describe('dedupeShortcutsDialogShortcuts', () => {
  it('keeps the first shortcut per resolved combo', () => {
    const result = dedupeShortcutsDialogShortcuts(
      [
        { keys: ['Meta', 's'], description: 'Save draft' },
        { keys: ['s', 'Cmd'], description: 'Save' },
        { keys: ['Mod', 's'], description: 'Save (Mod)' },
      ],
      'mac',
    )
    expect(result.map((s) => s.description)).toEqual(['Save draft'])
  })

  it('does not merge Mod with Meta off macOS', () => {
    const result = dedupeShortcutsDialogShortcuts(
      [
        { keys: ['Meta', 's'], description: 'A' },
        { keys: ['Mod', 's'], description: 'B' },
      ],
      'windows',
    )
    expect(result).toHaveLength(2)
  })

  it('drops shortcuts without keys or with a blank description', () => {
    const result = dedupeShortcutsDialogShortcuts(
      [
        { keys: [], description: 'Nothing' },
        { keys: [' '.trim()], description: 'Blank key' },
        { keys: ['k'], description: '   ' },
        { keys: ['j'], description: 'Down' },
      ],
      'mac',
    )
    expect(result.map((s) => s.description)).toEqual(['Down'])
  })
})

describe('toShortcutsDialogRows', () => {
  it('merges combos with the same group and description into one row', () => {
    const rows = toShortcutsDialogRows(
      [
        { keys: ['Mod', '/'], description: 'Help' },
        { keys: ['?'], description: ' Help ', group: SHORTCUTS_DIALOG_DEFAULT_GROUP },
        { keys: ['F1'], description: 'Help', group: 'Other' },
      ],
      'windows',
    )
    expect(rows).toHaveLength(2)
    expect(rows[0].combos.map((c) => c.label)).toEqual(['Ctrl + /', '?'])
    expect(rows[1]).toMatchObject({ group: 'Other', description: 'Help' })
  })

  it('falls back to the default group for a missing or blank group', () => {
    const rows = toShortcutsDialogRows(
      [
        { keys: ['a'], description: 'A' },
        { keys: ['b'], description: 'B', group: '  ' },
      ],
      'mac',
    )
    expect(rows.map((r) => r.group)).toEqual([SHORTCUTS_DIALOG_DEFAULT_GROUP, SHORTCUTS_DIALOG_DEFAULT_GROUP])
  })
})

describe('search', () => {
  const rows = toShortcutsDialogRows(FIXTURE, 'mac')

  it('parses terms on whitespace and +, lower-cased', () => {
    expect(parseShortcutsDialogQuery('  Cmd+K  shift ')).toEqual(['cmd', 'k', 'shift'])
    expect(parseShortcutsDialogQuery('   ')).toEqual([])
  })

  it('includes description, group, names, glyphs and synonyms in the search text', () => {
    const text = getShortcutsDialogRowSearchText(rows[0])
    expect(text).toContain('search')
    expect(text).toContain('navigation')
    expect(text).toContain('command')
    expect(text).toContain('⌘')
    expect(text).toContain('cmd')
  })

  it('returns every row for a blank query', () => {
    expect(filterShortcutsDialogRows(rows, '')).toHaveLength(rows.length)
  })

  it('matches descriptions case-insensitively', () => {
    expect(filterShortcutsDialogRows(rows, 'UNDO').map((r) => r.description)).toEqual(['Undo'])
  })

  it('matches key names, aliases and glyphs', () => {
    expect(filterShortcutsDialogRows(rows, 'shift').map((r) => r.description)).toEqual(['Redo'])
    expect(filterShortcutsDialogRows(rows, 'cmd z').map((r) => r.description)).toEqual(['Redo', 'Undo'])
    expect(filterShortcutsDialogRows(rows, '⌘+k').map((r) => r.description)).toEqual(['Search'])
    expect(filterShortcutsDialogRows(rows, '?').map((r) => r.description)).toEqual(['Show keyboard shortcuts'])
  })

  it('matches group names', () => {
    expect(filterShortcutsDialogRows(rows, 'editing')).toHaveLength(2)
  })

  it('requires every term to match', () => {
    expect(filterShortcutsDialogRows(rows, 'undo shift')).toEqual([])
  })
})

describe('groupShortcutsDialogRows', () => {
  const rows = toShortcutsDialogRows(FIXTURE, 'mac')

  it('lists General first, then other groups alphabetically, rows sorted by description', () => {
    const sections = groupShortcutsDialogRows(rows)
    expect(sections.map((s) => s.group)).toEqual(['General', 'Editing', 'Navigation'])
    expect(sections[2].rows.map((r) => r.description)).toEqual(['Go to inbox', 'Search'])
  })

  it('honours an explicit group order, appending unlisted groups alphabetically', () => {
    const sections = groupShortcutsDialogRows(rows, { groupOrder: ['Navigation'] })
    expect(sections.map((s) => s.group)).toEqual(['Navigation', 'Editing', 'General'])
  })

  it('sorts case-insensitively and numerically', () => {
    const sorted = groupShortcutsDialogRows(
      toShortcutsDialogRows(
        [
          { keys: ['2'], description: 'tab 10' },
          { keys: ['1'], description: 'Tab 2' },
          { keys: ['3'], description: 'apple' },
        ],
        'mac',
      ),
    )
    expect(sorted[0].rows.map((r) => r.description)).toEqual(['apple', 'Tab 2', 'tab 10'])
  })

  it('returns no sections for no rows', () => {
    expect(groupShortcutsDialogRows([])).toEqual([])
  })
})

describe('createShortcutsDialog', () => {
  it('builds sections and counts', () => {
    const api = createShortcutsDialog({ shortcuts: FIXTURE, platform: 'mac' })
    expect(api.totalCount).toBe(5)
    expect(api.matchCount).toBe(5)
    expect(api.isEmpty).toBe(false)
    expect(api.sections).toHaveLength(3)
  })

  it('filters and reports an empty result', () => {
    expect(createShortcutsDialog({ shortcuts: FIXTURE, platform: 'mac', query: 'redo' }).matchCount).toBe(1)
    const none = createShortcutsDialog({ shortcuts: FIXTURE, platform: 'mac', query: 'zzz-nothing' })
    expect(none).toMatchObject({ isEmpty: true, matchCount: 0, totalCount: 5, sections: [] })
  })

  it('merges a registered help shortcut with the dialog’s own Mod+/ into one row', () => {
    const shortcuts = collectShortcutsDialogShortcuts({
      registered: [{ id: '?', keys: ['?'], description: 'Show keyboard shortcuts', group: 'General' }],
      openShortcutDescription: SHORTCUTS_DIALOG_DEFAULT_LABELS.openShortcut,
    })
    const api = createShortcutsDialog({ shortcuts, platform: 'mac' })
    expect(api.totalCount).toBe(1)
    expect(api.sections[0].rows[0].combos.map((c) => c.label)).toEqual(['?', 'Command + /'])
  })

  it('is deterministic for the same input', () => {
    const a = createShortcutsDialog({ shortcuts: FIXTURE, platform: 'windows', query: 'z' })
    const b = createShortcutsDialog({ shortcuts: FIXTURE, platform: 'windows', query: 'z' })
    expect(a).toEqual(b)
  })
})

describe('isShortcutsDialogOpenEvent', () => {
  const key = (overrides: Partial<ShortcutsDialogKeyEvent>): ShortcutsDialogKeyEvent => ({
    key: '',
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    ...overrides,
  })

  it('opens on ? with or without Shift', () => {
    expect(isShortcutsDialogOpenEvent(key({ key: '?', shiftKey: true }), 'mac')).toBe(true)
    expect(isShortcutsDialogOpenEvent(key({ key: '?' }), 'windows')).toBe(true)
  })

  it('does not open on ? with Ctrl, Meta or Alt', () => {
    expect(isShortcutsDialogOpenEvent(key({ key: '?', ctrlKey: true }), 'windows')).toBe(false)
    expect(isShortcutsDialogOpenEvent(key({ key: '?', metaKey: true }), 'mac')).toBe(false)
    expect(isShortcutsDialogOpenEvent(key({ key: '?', altKey: true }), 'mac')).toBe(false)
  })

  it('opens on ⌘/ on macOS and Ctrl+/ elsewhere', () => {
    expect(isShortcutsDialogOpenEvent(key({ key: '/', metaKey: true }), 'mac')).toBe(true)
    expect(isShortcutsDialogOpenEvent(key({ key: '/', ctrlKey: true }), 'windows')).toBe(true)
    expect(isShortcutsDialogOpenEvent(key({ key: '/', ctrlKey: true }), 'mac')).toBe(false)
    expect(isShortcutsDialogOpenEvent(key({ key: '/', metaKey: true }), 'windows')).toBe(false)
  })

  it('rejects / alone, with extra modifiers, or both primary modifiers', () => {
    expect(isShortcutsDialogOpenEvent(key({ key: '/' }), 'windows')).toBe(false)
    expect(isShortcutsDialogOpenEvent(key({ key: '/', ctrlKey: true, altKey: true }), 'windows')).toBe(false)
    expect(isShortcutsDialogOpenEvent(key({ key: '/', ctrlKey: true, shiftKey: true }), 'windows')).toBe(false)
    expect(isShortcutsDialogOpenEvent(key({ key: '/', ctrlKey: true, metaKey: true }), 'windows')).toBe(false)
  })

  it('ignores handled and composing events, and other keys', () => {
    expect(isShortcutsDialogOpenEvent(key({ key: '?', defaultPrevented: true }), 'mac')).toBe(false)
    expect(isShortcutsDialogOpenEvent(key({ key: '?', isComposing: true }), 'mac')).toBe(false)
    expect(isShortcutsDialogOpenEvent(key({ key: 'k', metaKey: true }), 'mac')).toBe(false)
  })
})

describe('isShortcutsDialogTypingTarget', () => {
  it('treats text inputs, textarea and select as typing', () => {
    expect(isShortcutsDialogTypingTarget({ tagName: 'INPUT', type: 'text' })).toBe(true)
    expect(isShortcutsDialogTypingTarget({ tagName: 'input', type: 'search' })).toBe(true)
    expect(isShortcutsDialogTypingTarget({ tagName: 'INPUT' })).toBe(true)
    expect(isShortcutsDialogTypingTarget({ tagName: 'TEXTAREA' })).toBe(true)
    expect(isShortcutsDialogTypingTarget({ tagName: 'SELECT' })).toBe(true)
  })

  it('does not treat non-text inputs or buttons as typing', () => {
    expect(isShortcutsDialogTypingTarget({ tagName: 'INPUT', type: 'checkbox' })).toBe(false)
    expect(isShortcutsDialogTypingTarget({ tagName: 'INPUT', type: 'BUTTON' })).toBe(false)
    expect(isShortcutsDialogTypingTarget({ tagName: 'BUTTON' })).toBe(false)
  })

  it('treats contenteditable elements and their descendants as typing', () => {
    expect(isShortcutsDialogTypingTarget({ tagName: 'DIV', isContentEditable: true })).toBe(true)
    let asked = ''
    const inside = {
      tagName: 'SPAN',
      closest: (selector: string) => {
        asked = selector
        return {}
      },
    }
    expect(isShortcutsDialogTypingTarget(inside)).toBe(true)
    expect(asked).toContain('[contenteditable]')
    expect(isShortcutsDialogTypingTarget({ tagName: 'SPAN', closest: () => null })).toBe(false)
  })

  it('handles non-element targets', () => {
    expect(isShortcutsDialogTypingTarget(null)).toBe(false)
    expect(isShortcutsDialogTypingTarget(undefined)).toBe(false)
    expect(isShortcutsDialogTypingTarget('INPUT')).toBe(false)
    expect(isShortcutsDialogTypingTarget({})).toBe(false)
  })
})

describe('labels', () => {
  it('pluralises the result count', () => {
    expect(SHORTCUTS_DIALOG_DEFAULT_LABELS.resultCount(0)).toBe('0 shortcuts')
    expect(SHORTCUTS_DIALOG_DEFAULT_LABELS.resultCount(1)).toBe('1 shortcut')
    expect(SHORTCUTS_DIALOG_DEFAULT_LABELS.resultCount(12)).toBe('12 shortcuts')
  })
})

describe('styles', () => {
  it('gives the close button a 44px hit area, focus ring and reduced-motion variant', () => {
    const classes = shortcutsDialogCloseVariants()
    expect(classes).toContain('h-11')
    expect(classes).toContain('w-11')
    expect(classes).toContain('focus-visible:ring-2')
    expect(classes).toContain('motion-reduce:transition-none')
  })

  it('uses semantic tokens and rem text for the search field', () => {
    expect(shortcutsDialogSearchClass).toContain('bg-background')
    expect(shortcutsDialogSearchClass).toContain('text-sm')
    expect(shortcutsDialogSearchClass).toContain('focus-visible:ring-ring')
  })

  it('caps the panel height so the list scrolls', () => {
    expect(shortcutsDialogContentClass).toContain('max-h-[85vh]')
  })
})
