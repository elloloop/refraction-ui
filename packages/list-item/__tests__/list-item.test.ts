import { describe, it, expect } from 'vitest'
import {
  createListItem,
  createListItemGroup,
  getNextListItemIndex,
  getInitialListItemIndex,
  isListItemRovingKey,
  isListItemActivationKey,
  LIST_ITEM_DEFAULT_CONTEXT,
  LIST_ITEM_CURRENT_TOKEN,
  listItemVariants,
  listItemContentVariants,
  listItemTitleVariants,
  listItemMetaVariants,
  listItemSubtitleVariants,
  listItemTrailingClass,
  listItemActionButtonClass,
} from '../src/index.js'

describe('createListItem — listbox context', () => {
  it('makes the row an option carrying aria-selected', () => {
    const api = createListItem({ context: 'listbox', selected: true })
    expect(api.ariaProps).toEqual({ role: 'option', 'aria-selected': true })
    expect(api.ariaTarget).toBe('row')
    expect(api.rowIsControl).toBe(true)
    expect(api.rendersControl).toBe(false)
  })

  it('states aria-selected="false" explicitly on unselected options', () => {
    expect(createListItem({ context: 'listbox' }).ariaProps['aria-selected']).toBe(false)
  })

  it('never sets aria-current in a listbox', () => {
    const api = createListItem({ context: 'listbox', selected: true })
    expect(api.ariaProps['aria-current']).toBeUndefined()
  })

  it('disallows a nested action (options have presentational children)', () => {
    expect(createListItem({ context: 'listbox', interactive: true }).allowsAction).toBe(false)
  })
})

describe('createListItem — navigation context', () => {
  it('maps selected to aria-current on the inner control', () => {
    const api = createListItem({ context: 'navigation', selected: true, interactive: true })
    expect(api.ariaProps).toEqual({ 'aria-current': LIST_ITEM_CURRENT_TOKEN })
    expect(api.ariaTarget).toBe('control')
    expect(api.rendersControl).toBe(true)
    expect(api.rowIsControl).toBe(false)
  })

  it('never sets a role or aria-selected in navigation', () => {
    const api = createListItem({ context: 'navigation', selected: true, interactive: true })
    expect(api.ariaProps.role).toBeUndefined()
    expect(api.ariaProps['aria-selected']).toBeUndefined()
  })

  it('omits aria-current when not selected', () => {
    expect(createListItem({ context: 'navigation', interactive: true }).ariaProps).toEqual({})
  })

  it('renders no control and targets the row when not interactive', () => {
    const api = createListItem({ context: 'navigation', selected: true })
    expect(api.rendersControl).toBe(false)
    expect(api.ariaTarget).toBe('row')
    expect(api.ariaProps['aria-current']).toBe(LIST_ITEM_CURRENT_TOKEN)
  })

  it('allows a sibling action', () => {
    expect(createListItem({ context: 'navigation', interactive: true }).allowsAction).toBe(true)
  })

  it('is the default context', () => {
    expect(LIST_ITEM_DEFAULT_CONTEXT).toBe('navigation')
    expect(createListItem().dataAttributes['data-context']).toBe('navigation')
  })
})

describe('createListItem — data attributes', () => {
  it('reports slot, density and selection state', () => {
    const { dataAttributes } = createListItem({ density: 'compact', selected: true })
    expect(dataAttributes).toMatchObject({
      'data-slot': 'list-item',
      'data-density': 'compact',
      'data-state': 'selected',
    })
  })

  it('defaults to comfortable and unselected', () => {
    const { dataAttributes } = createListItem()
    expect(dataAttributes['data-density']).toBe('comfortable')
    expect(dataAttributes['data-state']).toBe('unselected')
  })

  it('emits data-emphasized only for unread rows', () => {
    expect(createListItem({ emphasized: true }).dataAttributes['data-emphasized']).toBe('')
    expect(createListItem().dataAttributes['data-emphasized']).toBeUndefined()
  })
})

describe('createListItemGroup', () => {
  it('is a roving listbox in listbox context', () => {
    const api = createListItemGroup({ context: 'listbox' })
    expect(api.ariaProps).toEqual({ role: 'listbox' })
    expect(api.roving).toBe(true)
    expect(api.dataAttributes['data-context']).toBe('listbox')
  })

  it('adds aria-multiselectable only when asked', () => {
    expect(createListItemGroup({ context: 'listbox', multiselectable: true }).ariaProps).toEqual({
      role: 'listbox',
      'aria-multiselectable': true,
    })
  })

  it('is an explicit role="list" without roving in navigation context', () => {
    const api = createListItemGroup({ context: 'navigation', multiselectable: true })
    expect(api.ariaProps).toEqual({ role: 'list' })
    expect(api.roving).toBe(false)
  })
})

describe('getNextListItemIndex', () => {
  it('moves down and up by one', () => {
    expect(getNextListItemIndex(1, 'ArrowDown', 4)).toBe(2)
    expect(getNextListItemIndex(2, 'ArrowUp', 4)).toBe(1)
  })

  it('clamps at the ends instead of wrapping', () => {
    expect(getNextListItemIndex(3, 'ArrowDown', 4)).toBe(3)
    expect(getNextListItemIndex(0, 'ArrowUp', 4)).toBe(0)
  })

  it('jumps to the extremes with Home / End', () => {
    expect(getNextListItemIndex(2, 'Home', 4)).toBe(0)
    expect(getNextListItemIndex(1, 'End', 4)).toBe(3)
  })

  it('enters an unfocused list (-1) at the first row', () => {
    expect(getNextListItemIndex(-1, 'ArrowDown', 3)).toBe(0)
    expect(getNextListItemIndex(-1, 'ArrowUp', 3)).toBe(0)
  })

  it('pulls an out-of-range index back into the list', () => {
    expect(getNextListItemIndex(9, 'ArrowUp', 3)).toBe(2)
    expect(getNextListItemIndex(9, 'ArrowDown', 3)).toBe(2)
  })

  it('ignores horizontal and unrelated keys', () => {
    expect(getNextListItemIndex(1, 'ArrowRight', 4)).toBe(1)
    expect(getNextListItemIndex(1, 'ArrowLeft', 4)).toBe(1)
    expect(getNextListItemIndex(1, 'a', 4)).toBe(1)
  })

  it('returns current unchanged for an empty list', () => {
    expect(getNextListItemIndex(0, 'ArrowDown', 0)).toBe(0)
    expect(getNextListItemIndex(-1, 'End', 0)).toBe(-1)
  })

  it('stays put in a single-row list', () => {
    expect(getNextListItemIndex(0, 'ArrowDown', 1)).toBe(0)
    expect(getNextListItemIndex(0, 'End', 1)).toBe(0)
  })
})

describe('getInitialListItemIndex', () => {
  it('starts on the first selected row', () => {
    expect(getInitialListItemIndex([false, true, true])).toBe(1)
  })

  it('falls back to the first row when nothing is selected', () => {
    expect(getInitialListItemIndex([false, false])).toBe(0)
  })

  it('returns -1 for an empty list', () => {
    expect(getInitialListItemIndex([])).toBe(-1)
  })
})

describe('key predicates', () => {
  it('recognises exactly the roving keys', () => {
    for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) expect(isListItemRovingKey(key)).toBe(true)
    for (const key of ['ArrowLeft', 'Tab', 'Enter', ' ']) expect(isListItemRovingKey(key)).toBe(false)
  })

  it('activates with Enter and Space only', () => {
    expect(isListItemActivationKey('Enter')).toBe(true)
    expect(isListItemActivationKey(' ')).toBe(true)
    expect(isListItemActivationKey('Spacebar')).toBe(false)
    expect(isListItemActivationKey('ArrowDown')).toBe(false)
  })
})

describe('styles', () => {
  it('shows selection with a shape (leading bar), not colour alone', () => {
    const selected = listItemVariants({ selected: 'true' })
    expect(selected).toContain('before:bg-primary')
    expect(selected).toContain('before:w-1')
    expect(listItemVariants()).toContain('before:bg-transparent')
  })

  it('stops transitions under prefers-reduced-motion', () => {
    expect(listItemVariants()).toContain('motion-reduce:transition-none')
    expect(listItemActionButtonClass).toContain('motion-reduce:transition-none')
  })

  it('truncates title and subtitle but keeps meta and trailing whole', () => {
    expect(listItemTitleVariants()).toContain('truncate')
    expect(listItemSubtitleVariants()).toContain('truncate')
    expect(listItemMetaVariants()).toContain('flex-none')
    expect(listItemMetaVariants()).toContain('whitespace-nowrap')
    expect(listItemTrailingClass).toContain('flex-none')
  })

  it('emphasis bolds the title and puts subtitle and meta in full colour', () => {
    expect(listItemTitleVariants({ emphasized: 'true' })).toContain('font-bold')
    expect(listItemSubtitleVariants({ emphasized: 'true' })).toContain('text-foreground')
    expect(listItemMetaVariants({ emphasized: 'true' })).toContain('text-foreground')
    expect(listItemSubtitleVariants()).toContain('text-muted-foreground')
    expect(listItemMetaVariants()).toContain('text-muted-foreground')
  })

  it('keeps compact rows and the action at a 44px target', () => {
    expect(listItemContentVariants({ density: 'compact' })).toContain('min-h-11')
    expect(listItemContentVariants({ density: 'comfortable' })).toContain('min-h-14')
    expect(listItemActionButtonClass).toContain('size-11')
  })

  it('adds the focus-visible ring only to interactive content', () => {
    expect(listItemContentVariants({ interactive: 'true' })).toContain('focus-visible:ring-2')
    expect(listItemContentVariants()).not.toContain('focus-visible:ring-2')
    expect(listItemActionButtonClass).toContain('focus-visible:ring-ring')
  })
})
