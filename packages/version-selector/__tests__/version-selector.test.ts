import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createVersionSelector } from '../src/version-selector.js'
import {
  versionSelectorVariants,
  optionVariants,
  latestBadgeVariants,
} from '../src/version-selector.styles.js'
import { resetIdCounter } from '@refraction-ui/shared'

const versions = [
  { value: '3.0.0', label: 'v3.0.0', isLatest: true },
  { value: '2.1.0', label: 'v2.1.0' },
  { value: '2.0.0', label: 'v2.0.0' },
  { value: '1.0.0', label: 'v1.0.0' },
]

beforeEach(() => {
  resetIdCounter()
})

describe('createVersionSelector', () => {
  it('defaults to no selection and closed', () => {
    const api = createVersionSelector({ versions })
    expect(api.state.selectedVersion).toBe('')
    expect(api.state.isOpen).toBe(false)
  })

  it('respects initial value', () => {
    const api = createVersionSelector({ value: '2.1.0', versions })
    expect(api.state.selectedVersion).toBe('2.1.0')
  })

  it('provides trigger props with combobox role', () => {
    const api = createVersionSelector({ versions })
    expect(api.triggerProps.role).toBe('combobox')
    expect(api.triggerProps['aria-expanded']).toBe(false)
    expect(api.triggerProps['aria-haspopup']).toBe('listbox')
    expect(api.triggerProps['aria-controls']).toMatch(/^rfr-ver-sel-/)
  })

  it('provides content props with listbox role', () => {
    const api = createVersionSelector({ versions })
    expect(api.contentProps.role).toBe('listbox')
    expect(api.contentProps.id).toMatch(/^rfr-ver-sel-/)
  })

  it('trigger aria-controls matches content id', () => {
    const api = createVersionSelector({ versions })
    expect(api.triggerProps['aria-controls']).toBe(api.contentProps.id)
  })

  it('getOptionProps returns correct props for selected option', () => {
    const api = createVersionSelector({ value: '3.0.0', versions })
    const props = api.getOptionProps('3.0.0')
    expect(props.role).toBe('option')
    expect(props['aria-selected']).toBe(true)
    expect(props['data-value']).toBe('3.0.0')
  })

  it('getOptionProps returns aria-selected false for unselected', () => {
    const api = createVersionSelector({ value: '3.0.0', versions })
    const props = api.getOptionProps('2.1.0')
    expect(props['aria-selected']).toBe(false)
  })

  it('getOptionProps includes data-latest for latest version', () => {
    const api = createVersionSelector({ versions })
    const props = api.getOptionProps('3.0.0')
    expect(props['data-latest']).toBe('true')
  })

  it('getOptionProps omits data-latest for non-latest version', () => {
    const api = createVersionSelector({ versions })
    const props = api.getOptionProps('2.1.0')
    expect(props['data-latest']).toBeUndefined()
  })

  it('select updates state and calls onValueChange', () => {
    const onValueChange = vi.fn()
    const api = createVersionSelector({ versions, onValueChange })
    api.open()
    api.select('2.1.0')
    expect(api.state.selectedVersion).toBe('2.1.0')
    expect(api.state.isOpen).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith('2.1.0')
  })

  it('select closes the dropdown', () => {
    const api = createVersionSelector({ versions })
    api.open()
    api.select('1.0.0')
    expect(api.state.isOpen).toBe(false)
  })

  it('open/close control isOpen state', () => {
    const api = createVersionSelector({ versions })
    api.open()
    expect(api.state.isOpen).toBe(true)
    api.close()
    expect(api.state.isOpen).toBe(false)
  })

  it('Escape keyboard handler closes', () => {
    const api = createVersionSelector({ versions })
    api.open()
    api.keyboardHandlers['Escape']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(false)
  })

  it('Enter keyboard handler toggles open', () => {
    const api = createVersionSelector({ versions })
    api.keyboardHandlers['Enter']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(true)
  })

  it('ArrowDown opens when closed', () => {
    const api = createVersionSelector({ versions })
    api.keyboardHandlers['ArrowDown']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(true)
  })

  it('provides handleKeyDown function', () => {
    const api = createVersionSelector({ versions })
    expect(typeof api.handleKeyDown).toBe('function')
  })
})

describe('versionSelectorVariants', () => {
  it('returns base classes', () => {
    const classes = versionSelectorVariants()
    expect(classes).toContain('relative')
    expect(classes).toContain('inline-flex')
  })

  it('appends custom className', () => {
    const classes = versionSelectorVariants({ className: 'my-selector' })
    expect(classes).toContain('my-selector')
  })
})

describe('optionVariants', () => {
  it('returns base classes', () => {
    const classes = optionVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('items-center')
  })

  it('applies selected variant', () => {
    const classes = optionVariants({ selected: 'true' })
    expect(classes).toContain('font-medium')
  })
})

describe('latestBadgeVariants', () => {
  it('returns base classes', () => {
    const classes = latestBadgeVariants()
    expect(classes).toContain('inline-flex')
    expect(classes).toContain('rounded-full')
  })

  it('applies default variant', () => {
    const classes = latestBadgeVariants()
    expect(classes).toContain('bg-primary/10')
  })

  it('appends custom className', () => {
    const classes = latestBadgeVariants({ className: 'my-badge' })
    expect(classes).toContain('my-badge')
  })
})

// ── Additional tests ──

describe('createVersionSelector - latest badge logic', () => {
  it('data-latest is only on the version marked isLatest', () => {
    const api = createVersionSelector({ versions })
    // 3.0.0 is latest
    expect(api.getOptionProps('3.0.0')['data-latest']).toBe('true')
    // All others should not have it
    expect(api.getOptionProps('2.1.0')['data-latest']).toBeUndefined()
    expect(api.getOptionProps('2.0.0')['data-latest']).toBeUndefined()
    expect(api.getOptionProps('1.0.0')['data-latest']).toBeUndefined()
  })

  it('no version has data-latest when none is marked', () => {
    const noLatest = [
      { value: '2.0.0', label: 'v2.0.0' },
      { value: '1.0.0', label: 'v1.0.0' },
    ]
    const api = createVersionSelector({ versions: noLatest })
    expect(api.getOptionProps('2.0.0')['data-latest']).toBeUndefined()
    expect(api.getOptionProps('1.0.0')['data-latest']).toBeUndefined()
  })

  it('multiple versions marked isLatest all get data-latest', () => {
    const multiLatest = [
      { value: '3.0.0', label: 'v3.0.0', isLatest: true },
      { value: '2.0.0', label: 'v2.0.0', isLatest: true },
      { value: '1.0.0', label: 'v1.0.0' },
    ]
    const api = createVersionSelector({ versions: multiLatest })
    expect(api.getOptionProps('3.0.0')['data-latest']).toBe('true')
    expect(api.getOptionProps('2.0.0')['data-latest']).toBe('true')
    expect(api.getOptionProps('1.0.0')['data-latest']).toBeUndefined()
  })
})

describe('createVersionSelector - selection closes dropdown', () => {
  it('select closes the dropdown', () => {
    const api = createVersionSelector({ versions })
    api.open()
    expect(api.state.isOpen).toBe(true)
    api.select('2.0.0')
    expect(api.state.isOpen).toBe(false)
  })

  it('selecting different versions in sequence always closes', () => {
    const api = createVersionSelector({ versions })
    api.open()
    api.select('2.0.0')
    expect(api.state.isOpen).toBe(false)
    api.open()
    api.select('1.0.0')
    expect(api.state.isOpen).toBe(false)
    expect(api.state.selectedVersion).toBe('1.0.0')
  })
})

describe('createVersionSelector - keyboard Escape', () => {
  it('Escape closes open dropdown without changing selection', () => {
    const api = createVersionSelector({ value: '2.1.0', versions })
    api.open()
    api.keyboardHandlers['Escape']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(false)
    expect(api.state.selectedVersion).toBe('2.1.0')
  })

  it('Escape on already closed dropdown keeps it closed', () => {
    const api = createVersionSelector({ versions })
    api.keyboardHandlers['Escape']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(false)
  })
})

describe('createVersionSelector - Space keyboard handler', () => {
  it('Space toggles open', () => {
    const api = createVersionSelector({ versions })
    api.keyboardHandlers[' ']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(true)
    api.keyboardHandlers[' ']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(false)
  })
})

describe('createVersionSelector - ArrowUp', () => {
  it('ArrowUp opens when closed', () => {
    const api = createVersionSelector({ versions })
    api.keyboardHandlers['ArrowUp']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(true)
  })
})

describe('createVersionSelector - onValueChange', () => {
  it('onValueChange is not called on initial creation', () => {
    const onValueChange = vi.fn()
    createVersionSelector({ versions, onValueChange })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('onValueChange receives selected value', () => {
    const onValueChange = vi.fn()
    const api = createVersionSelector({ versions, onValueChange })
    api.select('1.0.0')
    expect(onValueChange).toHaveBeenCalledWith('1.0.0')
  })
})

describe('createVersionSelector - trigger reflects open state', () => {
  it('trigger aria-expanded starts as false', () => {
    const api = createVersionSelector({ versions })
    expect(api.triggerProps['aria-expanded']).toBe(false)
  })
})
