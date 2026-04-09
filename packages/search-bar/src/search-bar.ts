import type { KeyboardHandlerMap } from '@refraction-ui/shared'
import { generateId, Keys, createKeyboardHandler } from '@refraction-ui/shared'

export interface SearchBarProps {
  value?: string
  onValueChange?: (value: string) => void
  onSearch?: (value: string) => void
  debounceMs?: number
  placeholder?: string
  loading?: boolean
}

export interface SearchBarAPI {
  /** Current state */
  state: { value: string; isSearching: boolean }
  /** Props to spread on the input element */
  inputProps: {
    role: 'combobox'
    'aria-expanded': boolean
    'aria-controls': string
    'aria-autocomplete': 'list'
  }
  /** Props to spread on the results list element */
  listProps: {
    role: 'listbox'
    id: string
  }
  /** Set the search value */
  setValue: (value: string) => void
  /** Clear the search value */
  clear: () => void
  /** Keyboard handler map */
  keyboardHandlers: KeyboardHandlerMap
  /** Pre-built keyboard event handler */
  handleKeyDown: (event: KeyboardEvent) => void
}

export function createSearchBar(props: SearchBarProps = {}): SearchBarAPI {
  const {
    value: initialValue = '',
    onValueChange,
    onSearch,
    debounceMs = 300,
    placeholder: _placeholder,
    loading = false,
  } = props

  const listId = generateId('rfr-search-list')

  let currentValue = initialValue
  let isSearching = loading
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  const state = { value: currentValue, isSearching }

  function setValue(value: string) {
    currentValue = value
    state.value = value
    onValueChange?.(value)

    if (debounceTimer !== undefined) {
      clearTimeout(debounceTimer)
    }

    if (value.length > 0) {
      isSearching = true
      state.isSearching = true
      debounceTimer = setTimeout(() => {
        onSearch?.(value)
        isSearching = false
        state.isSearching = false
      }, debounceMs)
    } else {
      isSearching = false
      state.isSearching = false
    }
  }

  function clear() {
    if (debounceTimer !== undefined) {
      clearTimeout(debounceTimer)
    }
    currentValue = ''
    state.value = ''
    isSearching = false
    state.isSearching = false
    onValueChange?.('')
  }

  const inputProps = {
    role: 'combobox' as const,
    'aria-expanded': currentValue.length > 0,
    'aria-controls': listId,
    'aria-autocomplete': 'list' as const,
  }

  const listProps = {
    role: 'listbox' as const,
    id: listId,
  }

  const keyboardHandlers: KeyboardHandlerMap = {
    [Keys.ArrowDown]: () => {
      // Focus first result - signaled via handler
    },
    [Keys.Escape]: () => {
      clear()
    },
    [Keys.Enter]: () => {
      if (debounceTimer !== undefined) {
        clearTimeout(debounceTimer)
      }
      onSearch?.(currentValue)
      isSearching = false
      state.isSearching = false
    },
  }

  const handleKeyDown = createKeyboardHandler(keyboardHandlers)

  return {
    state,
    inputProps,
    listProps,
    setValue,
    clear,
    keyboardHandlers,
    handleKeyDown,
  }
}
