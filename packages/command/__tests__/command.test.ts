import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@elloloop/shared'
import { createCommand, type CommandItemData } from '../src/command.js'
import {
  commandVariants,
  commandInputVariants,
  commandItemVariants,
  commandGroupVariants,
} from '../src/command.styles.js'

beforeEach(() => {
  resetIdCounter()
})

const sampleItems: CommandItemData[] = [
  { id: '1', label: 'File', value: 'file', group: 'actions' },
  { id: '2', label: 'Edit', value: 'edit', group: 'actions' },
  { id: '3', label: 'View', value: 'view', group: 'actions' },
  { id: '4', label: 'Settings', value: 'settings', group: 'preferences' },
  { id: '5', label: 'Disabled Item', value: 'disabled', disabled: true },
]

describe('createCommand', () => {
  it('returns all items when no search', () => {
    const api = createCommand({}, sampleItems)
    expect(api.state.filteredItems).toHaveLength(5)
    expect(api.state.search).toBe('')
  })

  it('defaults selectedIndex to 0', () => {
    const api = createCommand({}, sampleItems)
    expect(api.state.selectedIndex).toBe(0)
  })

  it('defaults open to true when no prop', () => {
    const api = createCommand({}, sampleItems)
    expect(api.state.open).toBe(true)
  })

  it('respects controlled open prop', () => {
    const api = createCommand({ open: false }, sampleItems)
    expect(api.state.open).toBe(false)
  })
})

describe('filtering', () => {
  it('filters items by search query (case-insensitive)', () => {
    const api = createCommand({}, sampleItems)
    api.search('file')
    expect(api.state.filteredItems).toHaveLength(1)
    expect(api.state.filteredItems[0].id).toBe('1')
  })

  it('filters case-insensitively', () => {
    const api = createCommand({}, sampleItems)
    api.search('FILE')
    expect(api.state.filteredItems).toHaveLength(1)
    expect(api.state.filteredItems[0].value).toBe('file')
  })

  it('returns all items for empty search', () => {
    const api = createCommand({}, sampleItems)
    api.search('xyz')
    expect(api.state.filteredItems).toHaveLength(0)
    api.search('')
    expect(api.state.filteredItems).toHaveLength(5)
  })

  it('matches partial strings', () => {
    const api = createCommand({}, sampleItems)
    api.search('set')
    expect(api.state.filteredItems).toHaveLength(1)
    expect(api.state.filteredItems[0].value).toBe('settings')
  })

  it('resets selectedIndex on search', () => {
    const api = createCommand({}, sampleItems)
    // Navigate down to change selected index
    api.keyboardHandlers['ArrowDown']!({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent)
    expect(api.state.selectedIndex).toBe(1)
    // Search resets
    api.search('edit')
    expect(api.state.selectedIndex).toBe(0)
  })

  it('supports custom filter function', () => {
    const customFilter = (value: string, search: string) => value.startsWith(search)
    const api = createCommand({ filter: customFilter }, sampleItems)
    api.search('e')
    expect(api.state.filteredItems).toHaveLength(1)
    expect(api.state.filteredItems[0].value).toBe('edit')
  })
})

describe('keyboard navigation', () => {
  it('ArrowDown moves selectedIndex forward', () => {
    const api = createCommand({}, sampleItems)
    const event = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['ArrowDown']!(event)
    expect(api.state.selectedIndex).toBe(1)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('ArrowUp moves selectedIndex backward', () => {
    const api = createCommand({}, sampleItems)
    // Move down first
    api.keyboardHandlers['ArrowDown']!({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent)
    api.keyboardHandlers['ArrowDown']!({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent)
    expect(api.state.selectedIndex).toBe(2)
    // Now move up
    const event = { key: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['ArrowUp']!(event)
    expect(api.state.selectedIndex).toBe(1)
  })

  it('ArrowDown wraps around to the start', () => {
    const api = createCommand({}, sampleItems)
    for (let i = 0; i < 5; i++) {
      api.keyboardHandlers['ArrowDown']!({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as KeyboardEvent)
    }
    expect(api.state.selectedIndex).toBe(0) // Wrapped from 4 to 0
  })

  it('ArrowUp wraps around to the end', () => {
    const api = createCommand({}, sampleItems)
    const event = { key: 'ArrowUp', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['ArrowUp']!(event)
    expect(api.state.selectedIndex).toBe(4) // Wrapped from 0 to last
  })

  it('Enter calls preventDefault', () => {
    const api = createCommand({}, sampleItems)
    const event = { key: 'Enter', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['Enter']!(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('Escape calls onOpenChange with false', () => {
    const onOpenChange = vi.fn()
    const api = createCommand({ onOpenChange }, sampleItems)
    const event = { key: 'Escape', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['Escape']!(event)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('selection', () => {
  it('select returns the currently highlighted item', () => {
    const api = createCommand({}, sampleItems)
    const item = api.select()
    expect(item).toBeDefined()
    expect(item!.id).toBe('1')
  })

  it('select returns item at specified index', () => {
    const api = createCommand({}, sampleItems)
    const item = api.select(2)
    expect(item).toBeDefined()
    expect(item!.id).toBe('3')
  })

  it('select returns undefined for disabled items', () => {
    const api = createCommand({}, sampleItems)
    const item = api.select(4) // "Disabled Item"
    expect(item).toBeUndefined()
  })

  it('select returns undefined for out-of-range index', () => {
    const api = createCommand({}, sampleItems)
    const item = api.select(99)
    expect(item).toBeUndefined()
  })
})

describe('ARIA props', () => {
  it('provides root aria props', () => {
    const api = createCommand({}, sampleItems)
    expect(api.ariaProps.role).toBe('combobox')
    expect(api.ariaProps['aria-expanded']).toBe(true)
    expect(api.ariaProps['aria-haspopup']).toBe('listbox')
    expect(api.ariaProps['aria-owns']).toBe(api.ids.list)
  })

  it('provides input aria props', () => {
    const api = createCommand({}, sampleItems)
    expect(api.inputAriaProps.role).toBe('searchbox')
    expect(api.inputAriaProps['aria-autocomplete']).toBe('list')
    expect(api.inputAriaProps['aria-controls']).toBe(api.ids.list)
  })

  it('provides list aria props', () => {
    const api = createCommand({}, sampleItems)
    expect(api.listAriaProps.role).toBe('listbox')
    expect(api.listAriaProps.id).toBe(api.ids.list)
  })

  it('provides item aria props', () => {
    const api = createCommand({}, sampleItems)
    const item = sampleItems[0]
    const itemProps = api.getItemAriaProps(item, 0)
    expect(itemProps.role).toBe('option')
    expect(itemProps['aria-selected']).toBe(true)
    expect(itemProps['aria-disabled']).toBe(false)
  })

  it('marks non-selected items', () => {
    const api = createCommand({}, sampleItems)
    const itemProps = api.getItemAriaProps(sampleItems[1], 1)
    expect(itemProps['aria-selected']).toBe(false)
  })

  it('marks disabled items', () => {
    const api = createCommand({}, sampleItems)
    const itemProps = api.getItemAriaProps(sampleItems[4], 4)
    expect(itemProps['aria-disabled']).toBe(true)
  })

  it('generates unique IDs', () => {
    const api = createCommand({}, sampleItems)
    expect(api.ids.root).toMatch(/^rfr-cmd-/)
    expect(api.ids.input).toMatch(/^rfr-cmd-input-/)
    expect(api.ids.list).toMatch(/^rfr-cmd-list-/)
    expect(api.ids.root).not.toBe(api.ids.input)
    expect(api.ids.root).not.toBe(api.ids.list)
  })
})

describe('command styles', () => {
  it('exports commandVariants', () => {
    const classes = commandVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('rounded-md')
  })

  it('exports commandInputVariants', () => {
    const classes = commandInputVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('bg-transparent')
  })

  it('exports commandItemVariants with states', () => {
    expect(commandItemVariants({ state: 'selected' })).toContain('bg-accent')
    expect(commandItemVariants({ state: 'disabled' })).toContain('opacity-50')
  })

  it('exports commandGroupVariants', () => {
    const classes = commandGroupVariants()
    expect(classes).toContain('overflow-hidden')
    expect(classes).toContain('p-1')
  })
})
