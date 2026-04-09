import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSearchBar } from '../src/search-bar.js'
import { searchBarVariants, searchResultVariants } from '../src/search-bar.styles.js'
import { resetIdCounter } from '@refraction-ui/shared'

beforeEach(() => {
  resetIdCounter()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createSearchBar', () => {
  it('defaults to empty value and not searching', () => {
    const api = createSearchBar()
    expect(api.state.value).toBe('')
    expect(api.state.isSearching).toBe(false)
  })

  it('respects initial value', () => {
    const api = createSearchBar({ value: 'hello' })
    expect(api.state.value).toBe('hello')
  })

  it('provides input props with combobox role', () => {
    const api = createSearchBar()
    expect(api.inputProps.role).toBe('combobox')
    expect(api.inputProps['aria-autocomplete']).toBe('list')
    expect(api.inputProps['aria-controls']).toMatch(/^rfr-search-list-/)
  })

  it('provides list props with listbox role', () => {
    const api = createSearchBar()
    expect(api.listProps.role).toBe('listbox')
    expect(api.listProps.id).toMatch(/^rfr-search-list-/)
  })

  it('input aria-controls matches list id', () => {
    const api = createSearchBar()
    expect(api.inputProps['aria-controls']).toBe(api.listProps.id)
  })

  it('setValue updates state and calls onValueChange', () => {
    const onValueChange = vi.fn()
    const api = createSearchBar({ onValueChange })
    api.setValue('test')
    expect(api.state.value).toBe('test')
    expect(onValueChange).toHaveBeenCalledWith('test')
  })

  it('setValue triggers debounced onSearch', () => {
    const onSearch = vi.fn()
    const api = createSearchBar({ onSearch, debounceMs: 300 })
    api.setValue('test')
    expect(api.state.isSearching).toBe(true)
    expect(onSearch).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(onSearch).toHaveBeenCalledWith('test')
    expect(api.state.isSearching).toBe(false)
  })

  it('debounce resets on rapid setValue calls', () => {
    const onSearch = vi.fn()
    const api = createSearchBar({ onSearch, debounceMs: 300 })
    api.setValue('a')
    vi.advanceTimersByTime(100)
    api.setValue('ab')
    vi.advanceTimersByTime(100)
    api.setValue('abc')
    vi.advanceTimersByTime(300)

    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('abc')
  })

  it('clear resets value and stops searching', () => {
    const onValueChange = vi.fn()
    const api = createSearchBar({ onValueChange })
    api.setValue('test')
    api.clear()
    expect(api.state.value).toBe('')
    expect(api.state.isSearching).toBe(false)
    expect(onValueChange).toHaveBeenLastCalledWith('')
  })

  it('Escape key clears the search', () => {
    const api = createSearchBar()
    api.setValue('test')
    api.keyboardHandlers['Escape']!({} as KeyboardEvent)
    expect(api.state.value).toBe('')
  })

  it('Enter key submits search immediately', () => {
    const onSearch = vi.fn()
    const api = createSearchBar({ onSearch, debounceMs: 300 })
    api.setValue('query')
    api.keyboardHandlers['Enter']!({} as KeyboardEvent)
    expect(onSearch).toHaveBeenCalledWith('query')
  })

  it('ArrowDown keyboard handler exists', () => {
    const api = createSearchBar()
    expect(api.keyboardHandlers['ArrowDown']).toBeDefined()
  })

  it('provides handleKeyDown function', () => {
    const api = createSearchBar()
    expect(typeof api.handleKeyDown).toBe('function')
  })

  it('empty setValue does not trigger searching state', () => {
    const api = createSearchBar()
    api.setValue('')
    expect(api.state.isSearching).toBe(false)
  })

  it('respects loading prop for initial isSearching', () => {
    const api = createSearchBar({ loading: true })
    expect(api.state.isSearching).toBe(true)
  })
})

describe('searchBarVariants', () => {
  it('returns base classes', () => {
    const classes = searchBarVariants()
    expect(classes).toContain('relative')
    expect(classes).toContain('flex')
    expect(classes).toContain('items-center')
  })

  it('appends custom className', () => {
    const classes = searchBarVariants({ className: 'my-search' })
    expect(classes).toContain('my-search')
  })
})

describe('searchResultVariants', () => {
  it('returns base classes', () => {
    const classes = searchResultVariants()
    expect(classes).toContain('absolute')
    expect(classes).toContain('z-50')
  })
})

// ── Additional tests ──

describe('createSearchBar - clear behavior', () => {
  it('clear resets value after multiple setValues', () => {
    const api = createSearchBar()
    api.setValue('first')
    api.setValue('second')
    api.setValue('third')
    api.clear()
    expect(api.state.value).toBe('')
    expect(api.state.isSearching).toBe(false)
  })

  it('clear cancels pending debounce timer', () => {
    const onSearch = vi.fn()
    const api = createSearchBar({ onSearch, debounceMs: 300 })
    api.setValue('query')
    api.clear()
    vi.advanceTimersByTime(300)
    expect(onSearch).not.toHaveBeenCalled()
  })
})

describe('createSearchBar - debounce behavior', () => {
  it('debounce fires after specified delay', () => {
    const onSearch = vi.fn()
    const api = createSearchBar({ onSearch, debounceMs: 500 })
    api.setValue('hello')
    expect(onSearch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(499)
    expect(onSearch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onSearch).toHaveBeenCalledWith('hello')
  })

  it('multiple rapid searches only fire the last one', () => {
    const onSearch = vi.fn()
    const api = createSearchBar({ onSearch, debounceMs: 300 })
    api.setValue('a')
    vi.advanceTimersByTime(50)
    api.setValue('ab')
    vi.advanceTimersByTime(50)
    api.setValue('abc')
    vi.advanceTimersByTime(50)
    api.setValue('abcd')
    vi.advanceTimersByTime(300)
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('abcd')
  })

  it('isSearching stays true during debounce period', () => {
    const api = createSearchBar({ onSearch: vi.fn(), debounceMs: 300 })
    api.setValue('test')
    expect(api.state.isSearching).toBe(true)
    vi.advanceTimersByTime(150)
    expect(api.state.isSearching).toBe(true)
    vi.advanceTimersByTime(150)
    expect(api.state.isSearching).toBe(false)
  })

  it('custom debounceMs=0 fires immediately after timer tick', () => {
    const onSearch = vi.fn()
    const api = createSearchBar({ onSearch, debounceMs: 0 })
    api.setValue('instant')
    vi.advanceTimersByTime(0)
    expect(onSearch).toHaveBeenCalledWith('instant')
  })
})

describe('createSearchBar - Enter key', () => {
  it('Enter bypasses debounce and fires onSearch immediately', () => {
    const onSearch = vi.fn()
    const api = createSearchBar({ onSearch, debounceMs: 5000 })
    api.setValue('query')
    api.keyboardHandlers['Enter']!({} as KeyboardEvent)
    expect(onSearch).toHaveBeenCalledWith('query')
    // Should not fire again after timer
    vi.advanceTimersByTime(5000)
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('Enter sets isSearching to false', () => {
    const api = createSearchBar({ onSearch: vi.fn(), debounceMs: 300 })
    api.setValue('query')
    expect(api.state.isSearching).toBe(true)
    api.keyboardHandlers['Enter']!({} as KeyboardEvent)
    expect(api.state.isSearching).toBe(false)
  })
})

describe('createSearchBar - ArrowDown key', () => {
  it('ArrowDown handler is callable', () => {
    const api = createSearchBar()
    expect(() => api.keyboardHandlers['ArrowDown']!({} as KeyboardEvent)).not.toThrow()
  })
})

describe('createSearchBar - Escape key additional', () => {
  it('Escape clears value and stops searching', () => {
    const api = createSearchBar({ onSearch: vi.fn(), debounceMs: 300 })
    api.setValue('something')
    expect(api.state.isSearching).toBe(true)
    api.keyboardHandlers['Escape']!({} as KeyboardEvent)
    expect(api.state.value).toBe('')
    expect(api.state.isSearching).toBe(false)
  })

  it('Escape cancels pending debounced search', () => {
    const onSearch = vi.fn()
    const api = createSearchBar({ onSearch, debounceMs: 300 })
    api.setValue('test')
    api.keyboardHandlers['Escape']!({} as KeyboardEvent)
    vi.advanceTimersByTime(300)
    expect(onSearch).not.toHaveBeenCalled()
  })
})

describe('createSearchBar - aria-expanded', () => {
  it('aria-expanded is false when value is empty', () => {
    const api = createSearchBar()
    expect(api.inputProps['aria-expanded']).toBe(false)
  })

  it('aria-expanded is true when initial value is provided', () => {
    const api = createSearchBar({ value: 'test' })
    expect(api.inputProps['aria-expanded']).toBe(true)
  })
})
