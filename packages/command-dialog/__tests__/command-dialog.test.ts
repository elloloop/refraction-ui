import { describe, it, expect } from 'vitest'
import {
  COMMAND_DIALOG_ALL_FILTER,
  DEFAULT_COMMAND_DIALOG_MAX_RECENTS,
  buildCommandDialogSections,
  clampCommandDialogMaxRecents,
  commandDialogFilterChipVariants,
  dedupeCommandDialogRecents,
  detectCommandDialogPlatform,
  expandCommandDialogShortcut,
  filterCommandDialogGroups,
  getCommandDialogFilterKeyTarget,
  getCommandDialogFilterOptions,
  isCommandDialogQueryBlank,
  joinCommandDialogShortcut,
  matchesCommandDialogFilter,
  mergeCommandDialogRecents,
  orderCommandDialogGroups,
  resolveCommandDialogActiveFilter,
  resolveCommandDialogItemScope,
  type CommandDialogGroup,
  type CommandDialogItem,
} from '../src/index.js'

const ada: CommandDialogItem = { id: 'ada', label: 'Ada Lovelace' }
const alan: CommandDialogItem = { id: 'alan', label: 'Alan Turing' }
const roadmap: CommandDialogItem = { id: 'roadmap', label: 'Roadmap.pdf' }
const standup: CommandDialogItem = { id: 'standup', label: 'Standup notes', scope: 'messages' }

const people: CommandDialogGroup = { id: 'people', heading: 'People', scope: 'people', items: [ada, alan] }
const files: CommandDialogGroup = { id: 'files', heading: 'Files', scope: 'files', items: [roadmap, standup] }

describe('clampCommandDialogMaxRecents', () => {
  it('defaults, floors and clamps at zero', () => {
    expect(clampCommandDialogMaxRecents(undefined)).toBe(DEFAULT_COMMAND_DIALOG_MAX_RECENTS)
    expect(clampCommandDialogMaxRecents(Number.NaN)).toBe(DEFAULT_COMMAND_DIALOG_MAX_RECENTS)
    expect(clampCommandDialogMaxRecents(Infinity)).toBe(DEFAULT_COMMAND_DIALOG_MAX_RECENTS)
    expect(clampCommandDialogMaxRecents(3.9)).toBe(3)
    expect(clampCommandDialogMaxRecents(-2)).toBe(0)
  })
})

describe('chip filtering', () => {
  it('"all" and no filter match every scope, including none', () => {
    expect(matchesCommandDialogFilter(undefined, COMMAND_DIALOG_ALL_FILTER)).toBe(true)
    expect(matchesCommandDialogFilter('files', undefined)).toBe(true)
  })

  it('a specific chip matches only its own scope', () => {
    expect(matchesCommandDialogFilter('files', 'files')).toBe(true)
    expect(matchesCommandDialogFilter('people', 'files')).toBe(false)
    expect(matchesCommandDialogFilter(undefined, 'files')).toBe(false)
  })

  it('an item scope overrides its group scope', () => {
    expect(resolveCommandDialogItemScope(roadmap, files).scope).toBe('files')
    expect(resolveCommandDialogItemScope(standup, files).scope).toBe('messages')
    expect(resolveCommandDialogItemScope(standup, files)).toBe(standup)
  })

  it('narrows groups, resolves scopes and drops emptied groups', () => {
    const result = filterCommandDialogGroups([people, files], 'messages')
    expect(result).toEqual([{ ...files, items: [standup] }])
    const all = filterCommandDialogGroups([people, files], COMMAND_DIALOG_ALL_FILTER)
    expect(all[0].items.map((i) => i.scope)).toEqual(['people', 'people'])
  })

  it('does not mutate the input', () => {
    filterCommandDialogGroups([people], 'people')
    expect(ada.scope).toBeUndefined()
  })
})

describe('orderCommandDialogGroups', () => {
  const a = { id: 'a' }
  const b = { id: 'b' }
  const c = { id: 'c' }

  it('keeps input order without a groupOrder', () => {
    expect(orderCommandDialogGroups([c, a, b])).toEqual([c, a, b])
  })

  it('puts ranked groups first, in rank order, then the rest stably', () => {
    expect(orderCommandDialogGroups([c, a, b], ['b', 'a'])).toEqual([b, a, c])
  })

  it('ignores unknown and repeated ids in groupOrder', () => {
    expect(orderCommandDialogGroups([a, b], ['zzz', 'b', 'b'])).toEqual([b, a])
  })
})

describe('recents', () => {
  it('dedupes by id keeping the first (most recent) copy', () => {
    const stale = { ...ada, label: 'old' }
    expect(dedupeCommandDialogRecents([ada, alan, stale])).toEqual([ada, alan])
  })

  it('caps at max and treats 0 as "keep none"', () => {
    expect(dedupeCommandDialogRecents([ada, alan, roadmap], 2)).toEqual([ada, alan])
    expect(dedupeCommandDialogRecents([ada], 0)).toEqual([])
  })

  it('merging moves the chosen item to the front without duplicating it', () => {
    expect(mergeCommandDialogRecents([ada, alan, roadmap], roadmap)).toEqual([roadmap, ada, alan])
  })

  it('merging replaces a stored copy with the fresh item', () => {
    const renamed = { ...alan, label: 'A. Turing' }
    expect(mergeCommandDialogRecents([ada, alan], renamed)).toEqual([renamed, ada])
  })

  it('merging drops the oldest past the limit', () => {
    expect(mergeCommandDialogRecents([ada, alan], roadmap, 2)).toEqual([roadmap, ada])
  })
})

describe('filter options', () => {
  it('returns no chips when the caller gives none', () => {
    expect(getCommandDialogFilterOptions([], 'All')).toEqual([])
  })

  it('prepends the implicit All chip and drops duplicate ids', () => {
    const options = getCommandDialogFilterOptions(
      [
        { id: 'people', label: 'People' },
        { id: 'people', label: 'Again' },
        { id: 'files', label: 'Files' },
      ],
      'All',
    )
    expect(options).toEqual([
      { id: 'all', label: 'All' },
      { id: 'people', label: 'People' },
      { id: 'files', label: 'Files' },
    ])
  })

  it("uses the caller's own All chip, in first place", () => {
    const options = getCommandDialogFilterOptions(
      [{ id: 'files', label: 'Files' }, { id: 'all', label: 'Everything' }],
      'All',
    )
    expect(options.map((o) => o.label)).toEqual(['Everything', 'Files'])
  })

  it('falls back to All for an unknown active filter', () => {
    const options = getCommandDialogFilterOptions([{ id: 'files', label: 'Files' }], 'All')
    expect(resolveCommandDialogActiveFilter(options, 'files')).toBe('files')
    expect(resolveCommandDialogActiveFilter(options, 'gone')).toBe('all')
    expect(resolveCommandDialogActiveFilter(options, undefined)).toBe('all')
  })
})

describe('getCommandDialogFilterKeyTarget', () => {
  it('wraps with the arrow keys in both axes', () => {
    expect(getCommandDialogFilterKeyTarget('ArrowRight', 2, 3)).toBe(0)
    expect(getCommandDialogFilterKeyTarget('ArrowDown', 0, 3)).toBe(1)
    expect(getCommandDialogFilterKeyTarget('ArrowLeft', 0, 3)).toBe(2)
    expect(getCommandDialogFilterKeyTarget('ArrowUp', 2, 3)).toBe(1)
  })

  it('jumps with Home and End', () => {
    expect(getCommandDialogFilterKeyTarget('Home', 2, 3)).toBe(0)
    expect(getCommandDialogFilterKeyTarget('End', 0, 3)).toBe(2)
  })

  it('ignores other keys and empty groups, and clamps a stale index', () => {
    expect(getCommandDialogFilterKeyTarget('Enter', 0, 3)).toBeUndefined()
    expect(getCommandDialogFilterKeyTarget('ArrowRight', 0, 0)).toBeUndefined()
    expect(getCommandDialogFilterKeyTarget('ArrowRight', 9, 3)).toBe(0)
    expect(getCommandDialogFilterKeyTarget('ArrowLeft', -4, 3)).toBe(2)
  })
})

describe('isCommandDialogQueryBlank', () => {
  it('treats whitespace as blank', () => {
    expect(isCommandDialogQueryBlank(undefined)).toBe(true)
    expect(isCommandDialogQueryBlank('   ')).toBe(true)
    expect(isCommandDialogQueryBlank(' a ')).toBe(false)
  })
})

describe('buildCommandDialogSections', () => {
  const base = { recentHeading: 'Recent' }

  it('shows recents first while the query is blank', () => {
    const sections = buildCommandDialogSections({ ...base, groups: [people], recentItems: [roadmap] })
    expect(sections.map((s) => [s.id, s.kind])).toEqual([
      ['recent', 'recent'],
      ['people', 'group'],
    ])
    expect(sections[0].heading).toBe('Recent')
  })

  it('hides recents once there is a query', () => {
    const sections = buildCommandDialogSections({ ...base, groups: [people], recentItems: [roadmap], query: 'a' })
    expect(sections.map((s) => s.id)).toEqual(['people'])
  })

  it('lists each item id once: a recent is not repeated in a group', () => {
    const sections = buildCommandDialogSections({
      ...base,
      groups: [people, { id: 'more', heading: 'More', items: [alan] }],
      recentItems: [ada],
    })
    expect(sections.map((s) => s.items.map((i) => i.id))).toEqual([['ada'], ['alan']])
  })

  it('drops a group whose items were all shown already', () => {
    const sections = buildCommandDialogSections({
      ...base,
      groups: [{ id: 'dup', heading: 'Dup', items: [ada] }],
      recentItems: [ada],
    })
    expect(sections.map((s) => s.id)).toEqual(['recent'])
  })

  it('applies the chip to recents and groups', () => {
    const sections = buildCommandDialogSections({
      ...base,
      groups: [people, files],
      recentItems: [{ ...roadmap, scope: 'files' }, { ...ada, id: 'ada-2', scope: 'people' }],
      activeFilter: 'files',
    })
    expect(sections.map((s) => s.items.map((i) => i.id))).toEqual([['roadmap']])
  })

  it('orders groups and caps recents', () => {
    const sections = buildCommandDialogSections({
      ...base,
      groups: [files, people],
      groupOrder: ['people', 'files'],
      recentItems: [{ id: 'r1', label: 'r1' }, { id: 'r2', label: 'r2' }],
      maxRecentItems: 1,
    })
    expect(sections.map((s) => s.id)).toEqual(['recent', 'people', 'files'])
    expect(sections[0].items.map((i) => i.id)).toEqual(['r1'])
  })

  it('returns nothing for no input', () => {
    expect(buildCommandDialogSections(base)).toEqual([])
  })
})

describe('shortcuts', () => {
  it('expands Mod to Meta on mac, case-insensitively', () => {
    expect(expandCommandDialogShortcut(undefined, 'mac')).toEqual(['Meta', 'K'])
    expect(expandCommandDialogShortcut('mod + shift + p', 'mac')).toEqual(['Meta', 'shift', 'p'])
  })

  it('expands Mod to Ctrl on other platforms, which is also the default', () => {
    expect(expandCommandDialogShortcut(undefined, 'other')).toEqual(['Ctrl', 'K'])
    expect(expandCommandDialogShortcut('MOD+J', 'other')).toEqual(['Ctrl', 'J'])
    expect(expandCommandDialogShortcut(undefined)).toEqual(['Ctrl', 'K'])
  })

  it('keeps an explicit Ctrl or Meta binding as is on every platform', () => {
    for (const platform of ['mac', 'other'] as const) {
      expect(expandCommandDialogShortcut('Ctrl+/', platform)).toEqual(['Ctrl', '/'])
      expect(expandCommandDialogShortcut('Meta+K', platform)).toEqual(['Meta', 'K'])
      expect(expandCommandDialogShortcut('Ctrl+K', platform)).toEqual(['Ctrl', 'K'])
    }
  })

  it('disables with false or an empty string', () => {
    expect(expandCommandDialogShortcut(false, 'mac')).toEqual([])
    expect(expandCommandDialogShortcut(' ', 'other')).toEqual([])
  })

  it('joins back into the useShortcut string form', () => {
    expect(joinCommandDialogShortcut(['Meta', 'K'])).toBe('Meta+K')
  })
})

describe('detectCommandDialogPlatform', () => {
  it('treats macOS and iOS platform strings as mac', () => {
    for (const platform of ['MacIntel', 'Macintosh', 'macOS', 'iPhone', 'iPad', 'iPod touch']) {
      expect(detectCommandDialogPlatform(platform)).toBe('mac')
    }
  })

  it('treats Windows, Linux, ChromeOS and Android as other', () => {
    for (const platform of ['Win32', 'Linux x86_64', 'CrOS x86_64', 'Linux armv81', 'Android']) {
      expect(detectCommandDialogPlatform(platform)).toBe('other')
    }
  })

  it('falls back to the user agent when the platform string is empty', () => {
    const macUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Safari/605.1.15'
    const linuxUa = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36'
    expect(detectCommandDialogPlatform('', macUa)).toBe('mac')
    // "AppleWebKit" alone is not an Apple platform.
    expect(detectCommandDialogPlatform('', linuxUa)).toBe('other')
    expect(detectCommandDialogPlatform(undefined, undefined)).toBe('other')
  })
})

describe('commandDialogFilterChipVariants', () => {
  it('marks the selected chip with more than colour', () => {
    expect(commandDialogFilterChipVariants({ selected: 'true' })).toContain('font-semibold')
    expect(commandDialogFilterChipVariants()).toContain('focus-visible:ring-2')
    expect(commandDialogFilterChipVariants()).toContain('motion-reduce:transition-none')
  })
})
