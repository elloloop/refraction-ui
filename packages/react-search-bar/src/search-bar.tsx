import * as React from 'react'
import {
  createSearchBar,
  searchBarVariants,
  searchResultVariants,
  type SearchBarAPI,
} from '@elloloop/search-bar'
import { cn } from '@elloloop/shared'

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface SearchBarContextValue {
  api: SearchBarAPI
  value: string
  isSearching: boolean
  setValue: (value: string) => void
  clear: () => void
}

const SearchBarContext = React.createContext<SearchBarContextValue | null>(null)

function useSearchBarContext(): SearchBarContextValue {
  const ctx = React.useContext(SearchBarContext)
  if (!ctx) {
    throw new Error('SearchBar compound components must be used within <SearchBar>')
  }
  return ctx
}

/* ------------------------------------------------------------------ */
/*  SearchBar (root provider + input)                                  */
/* ------------------------------------------------------------------ */

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSearch?: (value: string) => void
  debounceMs?: number
  loading?: boolean
  children?: React.ReactNode
}

export function SearchBar({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  onSearch,
  debounceMs = 300,
  loading = false,
  placeholder,
  className,
  children,
  ...inputProps
}: SearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(controlledValue ?? defaultValue)
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleValueChange = React.useCallback(
    (val: string) => {
      if (!isControlled) {
        setInternalValue(val)
      }
      onValueChange?.(val)
    },
    [isControlled, onValueChange],
  )

  const [isSearching, setIsSearching] = React.useState(loading)

  const handleSearch = React.useCallback(
    (val: string) => {
      if (debounceRef.current !== undefined) {
        clearTimeout(debounceRef.current)
      }
      if (val.length > 0) {
        setIsSearching(true)
        debounceRef.current = setTimeout(() => {
          onSearch?.(val)
          setIsSearching(false)
        }, debounceMs)
      } else {
        setIsSearching(false)
      }
    },
    [onSearch, debounceMs],
  )

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      handleValueChange(val)
      handleSearch(val)
    },
    [handleValueChange, handleSearch],
  )

  const clear = React.useCallback(() => {
    if (debounceRef.current !== undefined) {
      clearTimeout(debounceRef.current)
    }
    handleValueChange('')
    setIsSearching(false)
  }, [handleValueChange])

  const api = React.useMemo(
    () =>
      createSearchBar({
        value: currentValue,
        onValueChange: handleValueChange,
        onSearch,
        debounceMs,
        placeholder,
        loading,
      }),
    [currentValue, handleValueChange, onSearch, debounceMs, placeholder, loading],
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        clear()
      } else if (e.key === 'Enter') {
        if (debounceRef.current !== undefined) {
          clearTimeout(debounceRef.current)
        }
        onSearch?.(currentValue)
        setIsSearching(false)
      }
    },
    [clear, onSearch, currentValue],
  )

  const ctx = React.useMemo<SearchBarContextValue>(
    () => ({ api, value: currentValue, isSearching, setValue: handleValueChange, clear }),
    [api, currentValue, isSearching, handleValueChange, clear],
  )

  return React.createElement(
    SearchBarContext.Provider,
    { value: ctx },
    React.createElement(
      'div',
      { className: cn(searchBarVariants(), className) },
      React.createElement('span', { className: 'rfr-search-icon', 'aria-hidden': 'true' }, '\u{1F50D}'),
      React.createElement('input', {
        ...inputProps,
        role: api.inputProps.role,
        'aria-expanded': api.inputProps['aria-expanded'],
        'aria-controls': api.inputProps['aria-controls'],
        'aria-autocomplete': api.inputProps['aria-autocomplete'],
        value: currentValue,
        placeholder,
        onChange: handleChange,
        onKeyDown: handleKeyDown,
        className: 'rfr-search-input flex-1 bg-transparent outline-none',
      }),
      isSearching &&
        React.createElement('span', { className: 'rfr-search-spinner', 'aria-label': 'Loading' }, '\u{23F3}'),
      currentValue.length > 0 &&
        !isSearching &&
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'rfr-search-clear',
            onClick: clear,
            'aria-label': 'Clear search',
          },
          '\u{2715}',
        ),
    ),
    children,
  )
}

SearchBar.displayName = 'SearchBar'

/* ------------------------------------------------------------------ */
/*  SearchResults (dropdown list)                                      */
/* ------------------------------------------------------------------ */

export interface SearchResultsProps extends React.HTMLAttributes<HTMLUListElement> {}

export const SearchResults = React.forwardRef<HTMLUListElement, SearchResultsProps>(
  ({ className, children, ...props }, ref) => {
    const { api, value } = useSearchBarContext()

    if (value.length === 0) return null

    return React.createElement(
      'ul',
      {
        ref,
        role: api.listProps.role,
        id: api.listProps.id,
        className: cn(searchResultVariants(), className),
        ...props,
      },
      children,
    )
  },
)

SearchResults.displayName = 'SearchResults'

/* ------------------------------------------------------------------ */
/*  SearchResultItem                                                   */
/* ------------------------------------------------------------------ */

export interface SearchResultItemProps extends React.LiHTMLAttributes<HTMLLIElement> {}

export const SearchResultItem = React.forwardRef<HTMLLIElement, SearchResultItemProps>(
  ({ className, children, ...props }, ref) => {
    return React.createElement(
      'li',
      {
        ref,
        role: 'option',
        className: cn('px-3 py-2 cursor-pointer hover:bg-accent', className),
        ...props,
      },
      children,
    )
  },
)

SearchResultItem.displayName = 'SearchResultItem'
