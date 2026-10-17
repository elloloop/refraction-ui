import { describe, it, expect } from 'vitest'
import {
  MULTI_COMBOBOX_CREATE_KEY,
  normalizeMultiComboboxQuery,
  defaultMultiComboboxFilter,
  isMultiComboboxSelected,
  isMultiComboboxAtMax,
  multiComboboxReducer,
  filterMultiComboboxOptions,
  shouldOfferMultiComboboxCreate,
  buildMultiComboboxItems,
  resolveMultiComboboxActiveIndex,
  moveMultiComboboxActiveIndex,
  getMultiComboboxKeyIntent,
  multiComboboxDefaultMessages,
  resolveMultiComboboxMessages,
  diffMultiComboboxSelection,
  formatMultiComboboxAnnouncement,
  createMultiCombobox,
  multiComboboxOptionVariants,
  multiComboboxFieldVariants,
  multiComboboxChipRemoveClass,
  multiComboboxSpinnerClass,
  multiComboboxPopoverClass,
  type MultiComboboxOption,
  type MultiComboboxItem,
  type MultiComboboxKeyContext,
} from '../src/index.js'

const ada: MultiComboboxOption = { value: 'ada', label: 'Ada Lovelace' }
const alan: MultiComboboxOption = { value: 'alan', label: 'Alan Turing' }
const grace: MultiComboboxOption = { value: 'grace', label: 'Grace Hopper' }
const off: MultiComboboxOption = { value: 'off', label: 'Offline Person', disabled: true }
const people = [ada, alan, grace, off]

function item(key: string, disabled = false): MultiComboboxItem {
  return { kind: 'option', key, option: { value: key, label: key }, selected: false, disabled }
}

describe('normalizeMultiComboboxQuery / defaultMultiComboboxFilter', () => {
  it('trims and lower-cases', () => {
    expect(normalizeMultiComboboxQuery('  AdA ')).toBe('ada')
  })

  it('matches every option for a blank query', () => {
    expect(defaultMultiComboboxFilter(ada, '')).toBe(true)
    expect(defaultMultiComboboxFilter(ada, '   ')).toBe(true)
  })

  it('matches case-insensitive substrings of the label', () => {
    expect(defaultMultiComboboxFilter(ada, 'LOVE')).toBe(true)
    expect(defaultMultiComboboxFilter(ada, ' lace ')).toBe(true)
    expect(defaultMultiComboboxFilter(ada, 'turing')).toBe(false)
  })

  it('filters on the label, not the value', () => {
    expect(defaultMultiComboboxFilter({ value: 'xyz', label: 'Ada' }, 'xyz')).toBe(false)
  })
})

describe('isMultiComboboxSelected / isMultiComboboxAtMax', () => {
  it('compares by value', () => {
    expect(isMultiComboboxSelected([ada], 'ada')).toBe(true)
    expect(isMultiComboboxSelected([ada], 'alan')).toBe(false)
  })

  it('treats a missing, negative or non-finite max as unlimited', () => {
    expect(isMultiComboboxAtMax([ada, alan], undefined)).toBe(false)
    expect(isMultiComboboxAtMax([ada, alan], -1)).toBe(false)
    expect(isMultiComboboxAtMax([ada, alan], Number.POSITIVE_INFINITY)).toBe(false)
    expect(isMultiComboboxAtMax([ada, alan], Number.NaN)).toBe(false)
  })

  it('is full at or beyond max, flooring fractional values', () => {
    expect(isMultiComboboxAtMax([ada], 2)).toBe(false)
    expect(isMultiComboboxAtMax([ada, alan], 2)).toBe(true)
    expect(isMultiComboboxAtMax([ada, alan, grace], 2)).toBe(true)
    expect(isMultiComboboxAtMax([ada, alan], 2.9)).toBe(true)
    expect(isMultiComboboxAtMax([], 0)).toBe(true)
  })
})

describe('multiComboboxReducer', () => {
  it('adds an option to the end', () => {
    expect(multiComboboxReducer([ada], { type: 'add', option: alan })).toEqual([ada, alan])
  })

  it('returns the same array for no-op adds (duplicate, disabled, past max)', () => {
    const state = [ada]
    expect(multiComboboxReducer(state, { type: 'add', option: ada })).toBe(state)
    expect(multiComboboxReducer(state, { type: 'add', option: off })).toBe(state)
    expect(multiComboboxReducer(state, { type: 'add', option: alan }, { max: 1 })).toBe(state)
  })

  it('removes by value and no-ops on an unknown value', () => {
    const state = [ada, alan]
    expect(multiComboboxReducer(state, { type: 'remove', value: 'ada' })).toEqual([alan])
    expect(multiComboboxReducer(state, { type: 'remove', value: 'nobody' })).toBe(state)
  })

  it('toggles selection, honouring max only when adding', () => {
    expect(multiComboboxReducer([ada], { type: 'toggle', option: ada })).toEqual([])
    expect(multiComboboxReducer([ada], { type: 'toggle', option: alan })).toEqual([ada, alan])
    const full = [ada, alan]
    expect(multiComboboxReducer(full, { type: 'toggle', option: grace }, { max: 2 })).toBe(full)
    expect(multiComboboxReducer(full, { type: 'toggle', option: alan }, { max: 2 })).toEqual([ada])
  })

  it('removes the last chip, and no-ops on an empty selection', () => {
    expect(multiComboboxReducer([ada, alan], { type: 'removeLast' })).toEqual([ada])
    const empty: MultiComboboxOption[] = []
    expect(multiComboboxReducer(empty, { type: 'removeLast' })).toBe(empty)
  })

  it('clears, and no-ops when already empty', () => {
    expect(multiComboboxReducer([ada, alan], { type: 'clear' })).toEqual([])
    const empty: MultiComboboxOption[] = []
    expect(multiComboboxReducer(empty, { type: 'clear' })).toBe(empty)
  })

  it('does not mutate the input array', () => {
    const state = [ada]
    multiComboboxReducer(state, { type: 'add', option: alan })
    multiComboboxReducer(state, { type: 'removeLast' })
    expect(state).toEqual([ada])
  })

  it('preserves extra fields on generic options', () => {
    const withAvatar = { value: 'x', label: 'X', avatar: 'x.png' }
    const next = multiComboboxReducer([] as (typeof withAvatar)[], { type: 'add', option: withAvatar })
    expect(next[0].avatar).toBe('x.png')
  })
})

describe('filterMultiComboboxOptions', () => {
  it('uses the default filter', () => {
    expect(filterMultiComboboxOptions(people, 'al')).toEqual([alan])
  })

  it('accepts a custom filter', () => {
    const startsWith = (o: MultiComboboxOption, q: string) => o.label.startsWith(q)
    expect(filterMultiComboboxOptions(people, 'G', startsWith)).toEqual([grace])
  })

  it('returns options as given (copied) when filter is false', () => {
    const result = filterMultiComboboxOptions(people, 'zzz', false)
    expect(result).toEqual(people)
    expect(result).not.toBe(people)
  })
})

describe('shouldOfferMultiComboboxCreate', () => {
  it('needs a non-blank query', () => {
    expect(shouldOfferMultiComboboxCreate('', people, [])).toBe(false)
    expect(shouldOfferMultiComboboxCreate('   ', people, [])).toBe(false)
  })

  it('is offered when no label equals the query', () => {
    expect(shouldOfferMultiComboboxCreate('Ada', people, [])).toBe(true)
  })

  it('is hidden when an option or selected chip has the same label (case-insensitive)', () => {
    expect(shouldOfferMultiComboboxCreate(' ada lovelace ', people, [])).toBe(false)
    expect(shouldOfferMultiComboboxCreate('new person', [], [{ value: 'n', label: 'New Person' }])).toBe(
      false,
    )
  })
})

describe('buildMultiComboboxItems', () => {
  it('builds option items with prefixed keys and selected flags', () => {
    const items = buildMultiComboboxItems({ options: [ada, alan], selected: [alan], query: '' })
    expect(items.map((i) => i.key)).toEqual(['option:ada', 'option:alan'])
    expect(items.map((i) => i.selected)).toEqual([false, true])
    expect(items.every((i) => i.kind === 'option')).toBe(true)
  })

  it('keeps an option whose value is literally "create" distinct from the create item', () => {
    const items = buildMultiComboboxItems({
      options: [{ value: MULTI_COMBOBOX_CREATE_KEY, label: 'Create' }],
      selected: [],
      query: 'brand new',
      filter: false,
      creatable: true,
    })
    expect(items.map((i) => i.key)).toEqual(['option:create', MULTI_COMBOBOX_CREATE_KEY])
  })

  it('marks disabled options disabled', () => {
    const items = buildMultiComboboxItems({ options: [off], selected: [], query: '' })
    expect(items[0].disabled).toBe(true)
  })

  it('appends a trimmed create item when creatable and the query is new', () => {
    const items = buildMultiComboboxItems({
      options: people,
      selected: [],
      query: '  Katherine ',
      creatable: true,
    })
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ kind: 'create', query: 'Katherine', disabled: false })
  })

  it('omits the create item when not creatable', () => {
    const items = buildMultiComboboxItems({ options: people, selected: [], query: 'Katherine' })
    expect(items).toHaveLength(0)
  })

  it('disables unselected options and the create item once full, keeping selected ones enabled', () => {
    const items = buildMultiComboboxItems({
      options: [ada, alan, grace],
      selected: [ada],
      query: '',
      max: 1,
    })
    expect(items.map((i) => i.disabled)).toEqual([false, true, true])

    const withCreate = buildMultiComboboxItems({
      options: [],
      selected: [ada],
      query: 'new',
      creatable: true,
      max: 1,
    })
    expect(withCreate[0]).toMatchObject({ kind: 'create', disabled: true })
  })

  it('shows caller-filtered (async) results untouched with filter: false', () => {
    const items = buildMultiComboboxItems({ options: [ada], selected: [], query: 'zzz', filter: false })
    expect(items).toHaveLength(1)
  })
})

describe('resolveMultiComboboxActiveIndex', () => {
  const items = [item('a', true), item('b'), item('c')]

  it('falls back to the first enabled item', () => {
    expect(resolveMultiComboboxActiveIndex(items, null)).toBe(1)
    expect(resolveMultiComboboxActiveIndex(items, 'missing')).toBe(1)
  })

  it('keeps a remembered key that is still present and enabled', () => {
    expect(resolveMultiComboboxActiveIndex(items, 'c')).toBe(2)
  })

  it('ignores a remembered key that became disabled', () => {
    expect(resolveMultiComboboxActiveIndex(items, 'a')).toBe(1)
  })

  it('returns -1 when nothing is enabled or the list is empty', () => {
    expect(resolveMultiComboboxActiveIndex([item('a', true)], null)).toBe(-1)
    expect(resolveMultiComboboxActiveIndex([], 'a')).toBe(-1)
  })
})

describe('moveMultiComboboxActiveIndex', () => {
  const items = [item('a'), item('b', true), item('c'), item('d')]

  it('moves next, skipping disabled items and wrapping at the end', () => {
    expect(moveMultiComboboxActiveIndex(items, 0, 'next')).toBe(2)
    expect(moveMultiComboboxActiveIndex(items, 2, 'next')).toBe(3)
    expect(moveMultiComboboxActiveIndex(items, 3, 'next')).toBe(0)
  })

  it('moves prev, skipping disabled items and wrapping at the start', () => {
    expect(moveMultiComboboxActiveIndex(items, 2, 'prev')).toBe(0)
    expect(moveMultiComboboxActiveIndex(items, 0, 'prev')).toBe(3)
  })

  it('starts from outside the list when nothing is active', () => {
    expect(moveMultiComboboxActiveIndex(items, -1, 'next')).toBe(0)
    expect(moveMultiComboboxActiveIndex(items, -1, 'prev')).toBe(3)
    expect(moveMultiComboboxActiveIndex(items, 99, 'next')).toBe(0)
  })

  it('jumps to the first / last enabled item', () => {
    const edges = [item('a', true), item('b'), item('c'), item('d', true)]
    expect(moveMultiComboboxActiveIndex(edges, 2, 'first')).toBe(1)
    expect(moveMultiComboboxActiveIndex(edges, 1, 'last')).toBe(2)
  })

  it('returns -1 for an empty or fully disabled list', () => {
    expect(moveMultiComboboxActiveIndex([], 0, 'next')).toBe(-1)
    expect(moveMultiComboboxActiveIndex([item('a', true)], 0, 'next')).toBe(-1)
    expect(moveMultiComboboxActiveIndex([item('a', true)], 0, 'first')).toBe(-1)
    expect(moveMultiComboboxActiveIndex([item('a', true)], 0, 'last')).toBe(-1)
  })

  it('stays on the only enabled item', () => {
    expect(moveMultiComboboxActiveIndex([item('a')], 0, 'next')).toBe(0)
    expect(moveMultiComboboxActiveIndex([item('a')], 0, 'prev')).toBe(0)
  })
})

describe('getMultiComboboxKeyIntent', () => {
  const closed: MultiComboboxKeyContext = { open: false, query: '', hasActive: false, hasSelection: false }
  const open: MultiComboboxKeyContext = { open: true, query: '', hasActive: true, hasSelection: true }

  it('arrows open the popup when closed and move when open', () => {
    expect(getMultiComboboxKeyIntent('ArrowDown', closed)).toBe('open-first')
    expect(getMultiComboboxKeyIntent('ArrowUp', closed)).toBe('open-last')
    expect(getMultiComboboxKeyIntent('ArrowDown', open)).toBe('next')
    expect(getMultiComboboxKeyIntent('ArrowUp', open)).toBe('prev')
  })

  it('Home/End move only while open', () => {
    expect(getMultiComboboxKeyIntent('Home', open)).toBe('first')
    expect(getMultiComboboxKeyIntent('End', open)).toBe('last')
    expect(getMultiComboboxKeyIntent('Home', closed)).toBe('none')
    expect(getMultiComboboxKeyIntent('End', closed)).toBe('none')
  })

  it('Enter commits only with an active item in an open popup', () => {
    expect(getMultiComboboxKeyIntent('Enter', open)).toBe('commit')
    expect(getMultiComboboxKeyIntent('Enter', { ...open, hasActive: false })).toBe('none')
    expect(getMultiComboboxKeyIntent('Enter', closed)).toBe('none')
  })

  it('Escape closes, else clears a non-empty query', () => {
    expect(getMultiComboboxKeyIntent('Escape', open)).toBe('close')
    expect(getMultiComboboxKeyIntent('Escape', { ...closed, query: 'ad' })).toBe('clear-query')
    expect(getMultiComboboxKeyIntent('Escape', closed)).toBe('none')
  })

  it('Backspace removes the last chip only on an empty query with a selection', () => {
    expect(getMultiComboboxKeyIntent('Backspace', open)).toBe('remove-last')
    expect(getMultiComboboxKeyIntent('Backspace', { ...open, query: 'a' })).toBe('none')
    expect(getMultiComboboxKeyIntent('Backspace', { ...open, hasSelection: false })).toBe('none')
  })

  it('ignores other keys', () => {
    expect(getMultiComboboxKeyIntent('a', open)).toBe('none')
    expect(getMultiComboboxKeyIntent('Tab', open)).toBe('none')
  })
})

describe('messages + announcements', () => {
  it('has readable defaults', () => {
    const m = multiComboboxDefaultMessages
    expect(m.remove('Ada')).toBe('Remove Ada')
    expect(m.create('Kat')).toBe('Create "Kat"')
    expect(m.maxReached(3)).toBe('Maximum of 3 selected')
  })

  it('merges partial overrides', () => {
    const m = resolveMultiComboboxMessages({ empty: 'Nobody found' })
    expect(m.empty).toBe('Nobody found')
    expect(m.loading).toBe(multiComboboxDefaultMessages.loading)
  })

  it('diffs selections by value', () => {
    expect(diffMultiComboboxSelection([ada, alan], [alan, grace])).toEqual({
      added: [grace],
      removed: [ada],
    })
    expect(diffMultiComboboxSelection([ada], [{ ...ada }])).toEqual({ added: [], removed: [] })
  })

  it('names a single add or remove, otherwise reports the count', () => {
    expect(formatMultiComboboxAnnouncement({ added: [ada], removed: [] }, 2)).toBe(
      'Ada Lovelace added. 2 selected.',
    )
    expect(formatMultiComboboxAnnouncement({ added: [], removed: [alan] }, 0)).toBe(
      'Alan Turing removed. 0 selected.',
    )
    expect(formatMultiComboboxAnnouncement({ added: [ada, alan], removed: [] }, 2)).toBe('2 selected.')
    expect(formatMultiComboboxAnnouncement({ added: [ada], removed: [alan] }, 1)).toBe('1 selected.')
    expect(formatMultiComboboxAnnouncement({ added: [], removed: [] }, 1)).toBe('')
  })

  it('uses custom messages', () => {
    const m = resolveMultiComboboxMessages({ added: (l) => `+${l}` })
    expect(formatMultiComboboxAnnouncement({ added: [ada], removed: [] }, 1, m)).toBe('+Ada Lovelace')
  })
})

describe('createMultiCombobox', () => {
  it('wires the input as an ARIA 1.2 combobox', () => {
    const api = createMultiCombobox({ open: true, listboxId: 'lb', activeDescendantId: 'lb-1' })
    expect(api.inputAriaProps).toEqual({
      role: 'combobox',
      'aria-autocomplete': 'list',
      'aria-haspopup': 'listbox',
      'aria-expanded': true,
      'aria-controls': 'lb',
      'aria-activedescendant': 'lb-1',
    })
  })

  it('omits aria-activedescendant while closed or with no active option', () => {
    expect(
      createMultiCombobox({ open: false, listboxId: 'lb', activeDescendantId: 'lb-1' }).inputAriaProps,
    ).not.toHaveProperty('aria-activedescendant')
    expect(createMultiCombobox({ open: true, listboxId: 'lb' }).inputAriaProps).not.toHaveProperty(
      'aria-activedescendant',
    )
  })

  it('marks the listbox multi-selectable and busy while loading', () => {
    const api = createMultiCombobox({ open: true, listboxId: 'lb', loading: true })
    expect(api.listboxAriaProps).toEqual({
      role: 'listbox',
      id: 'lb',
      'aria-multiselectable': true,
      'aria-busy': true,
    })
    expect(createMultiCombobox({ open: true, listboxId: 'lb' }).listboxAriaProps).not.toHaveProperty(
      'aria-busy',
    )
  })

  it('exposes state data attributes', () => {
    expect(createMultiCombobox({ open: false, listboxId: 'lb' }).dataAttributes).toEqual({
      'data-state': 'closed',
    })
    expect(
      createMultiCombobox({ open: true, listboxId: 'lb', disabled: true, loading: true }).dataAttributes,
    ).toEqual({ 'data-state': 'open', 'data-disabled': '', 'data-loading': '' })
  })
})

describe('styles', () => {
  it('option variants take string booleans', () => {
    expect(multiComboboxOptionVariants({ active: 'true' })).toContain('bg-accent')
    expect(multiComboboxOptionVariants({ disabled: 'true' })).toContain('opacity-50')
    expect(multiComboboxOptionVariants()).not.toContain('bg-accent')
  })

  it('field draws a focus ring and a disabled state', () => {
    expect(multiComboboxFieldVariants()).toContain('focus-within:ring-2')
    expect(multiComboboxFieldVariants({ disabled: 'true' })).toContain('cursor-not-allowed')
  })

  it('remove button has a focus-visible ring and an extended 44px hit area', () => {
    expect(multiComboboxChipRemoveClass).toContain('focus-visible:ring-2')
    expect(multiComboboxChipRemoveClass).toContain('size-5')
    expect(multiComboboxChipRemoveClass).toContain('before:-inset-3')
  })

  it('motion stops under prefers-reduced-motion', () => {
    expect(multiComboboxSpinnerClass).toContain('motion-reduce:animate-none')
    expect(multiComboboxPopoverClass).toContain('motion-reduce:animate-none')
  })
})
