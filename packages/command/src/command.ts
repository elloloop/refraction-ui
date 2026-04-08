import type { KeyboardHandlerMap } from '@refraction-ui/shared'
import { Keys, generateId } from '@refraction-ui/shared'

export interface CommandProps {
  /** Whether the command palette is open (controlled) */
  open?: boolean
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
  /** Custom filter function — receives item value and search query, returns true to include */
  filter?: (value: string, search: string) => boolean
}

export interface CommandItemData {
  /** Unique identifier for the item */
  id: string
  /** Display label */
  label: string
  /** Searchable value */
  value: string
  /** Whether the item is disabled */
  disabled?: boolean
  /** Optional group the item belongs to */
  group?: string
}

export interface CommandState {
  /** Current search query */
  search: string
  /** Items after filtering */
  filteredItems: CommandItemData[]
  /** Index of the currently highlighted item in filteredItems */
  selectedIndex: number
  /** Whether the palette is open */
  open: boolean
}

export interface CommandAPI {
  /** Current command state */
  state: CommandState
  /** Update the search query and re-filter items */
  search(query: string): void
  /** Select the item at the given index (or the currently highlighted item) */
  select(index?: number): CommandItemData | undefined
  /** Keyboard handlers for the command palette */
  keyboardHandlers: KeyboardHandlerMap
  /** ARIA attributes for the command root */
  ariaProps: Record<string, unknown>
  /** ARIA attributes for the input */
  inputAriaProps: Record<string, unknown>
  /** ARIA attributes for the list */
  listAriaProps: Record<string, unknown>
  /** Get ARIA attributes for a specific item */
  getItemAriaProps(item: CommandItemData, index: number): Record<string, unknown>
  /** Generated IDs */
  ids: {
    root: string
    input: string
    list: string
  }
}

/** Default filter: case-insensitive includes */
function defaultFilter(value: string, search: string): boolean {
  return value.toLowerCase().includes(search.toLowerCase())
}

export function createCommand(
  props: CommandProps = {},
  items: CommandItemData[] = [],
): CommandAPI {
  const {
    open: controlledOpen,
    onOpenChange,
    filter = defaultFilter,
  } = props

  const rootId = generateId('rfr-cmd')
  const inputId = generateId('rfr-cmd-input')
  const listId = generateId('rfr-cmd-list')

  let searchQuery = ''
  let selectedIndex = 0
  let filteredItems = [...items]
  const isOpen = controlledOpen ?? true

  function applyFilter(query: string): CommandItemData[] {
    if (!query) return [...items]
    return items.filter((item) => filter(item.value, query))
  }

  function doSearch(query: string): void {
    searchQuery = query
    filteredItems = applyFilter(query)
    selectedIndex = 0
  }

  function doSelect(index?: number): CommandItemData | undefined {
    const idx = index ?? selectedIndex
    const item = filteredItems[idx]
    if (!item || item.disabled) return undefined
    return item
  }

  const keyboardHandlers: KeyboardHandlerMap = {
    [Keys.ArrowDown]: (e) => {
      e.preventDefault()
      if (filteredItems.length > 0) {
        selectedIndex = (selectedIndex + 1) % filteredItems.length
      }
    },
    [Keys.ArrowUp]: (e) => {
      e.preventDefault()
      if (filteredItems.length > 0) {
        selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length
      }
    },
    [Keys.Enter]: (e) => {
      e.preventDefault()
      doSelect()
    },
    [Keys.Escape]: (e) => {
      e.preventDefault()
      onOpenChange?.(false)
    },
  }

  const ariaProps: Record<string, unknown> = {
    role: 'combobox',
    'aria-expanded': isOpen,
    'aria-haspopup': 'listbox',
    'aria-owns': listId,
    id: rootId,
  }

  const inputAriaProps: Record<string, unknown> = {
    role: 'searchbox',
    'aria-autocomplete': 'list',
    'aria-controls': listId,
    id: inputId,
  }

  const listAriaProps: Record<string, unknown> = {
    role: 'listbox',
    id: listId,
    'aria-label': 'Command suggestions',
  }

  function getItemAriaProps(item: CommandItemData, index: number): Record<string, unknown> {
    return {
      role: 'option',
      'aria-selected': index === selectedIndex,
      'aria-disabled': item.disabled ?? false,
      id: `${listId}-item-${item.id}`,
    }
  }

  return {
    get state(): CommandState {
      return {
        search: searchQuery,
        filteredItems,
        selectedIndex,
        open: isOpen,
      }
    },
    search: doSearch,
    select: doSelect,
    keyboardHandlers,
    ariaProps,
    inputAriaProps,
    listAriaProps,
    getItemAriaProps,
    ids: {
      root: rootId,
      input: inputId,
      list: listId,
    },
  }
}
