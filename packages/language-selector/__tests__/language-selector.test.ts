import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLanguageSelector } from '../src/language-selector.js'
import { selectorVariants, optionVariants } from '../src/language-selector.styles.js'
import { resetIdCounter } from '@elloloop/shared'

const options = [
  { value: 'en', label: 'English', group: 'Popular' },
  { value: 'es', label: 'Spanish', group: 'Popular' },
  { value: 'fr', label: 'French', group: 'European' },
  { value: 'de', label: 'German', group: 'European' },
  { value: 'ja', label: 'Japanese' },
]

beforeEach(() => {
  resetIdCounter()
})

describe('createLanguageSelector', () => {
  it('defaults to no selection and closed', () => {
    const api = createLanguageSelector({ options })
    expect(api.state.selectedValues).toEqual([])
    expect(api.state.isOpen).toBe(false)
  })

  it('respects initial single value', () => {
    const api = createLanguageSelector({ value: 'en', options })
    expect(api.state.selectedValues).toEqual(['en'])
  })

  it('respects initial array value for multiple mode', () => {
    const api = createLanguageSelector({ value: ['en', 'fr'], options, multiple: true })
    expect(api.state.selectedValues).toEqual(['en', 'fr'])
  })

  it('provides trigger props with combobox role', () => {
    const api = createLanguageSelector({ options })
    expect(api.triggerProps.role).toBe('combobox')
    expect(api.triggerProps['aria-expanded']).toBe(false)
    expect(api.triggerProps['aria-haspopup']).toBe('listbox')
    expect(api.triggerProps['aria-controls']).toMatch(/^rfr-lang-sel-/)
  })

  it('provides content props with listbox role', () => {
    const api = createLanguageSelector({ options })
    expect(api.contentProps.role).toBe('listbox')
    expect(api.contentProps.id).toMatch(/^rfr-lang-sel-/)
  })

  it('trigger aria-controls matches content id', () => {
    const api = createLanguageSelector({ options })
    expect(api.triggerProps['aria-controls']).toBe(api.contentProps.id)
  })

  it('content has aria-multiselectable in multiple mode', () => {
    const api = createLanguageSelector({ options, multiple: true })
    expect(api.contentProps['aria-multiselectable']).toBe(true)
  })

  it('content does not have aria-multiselectable in single mode', () => {
    const api = createLanguageSelector({ options })
    expect(api.contentProps['aria-multiselectable']).toBeUndefined()
  })

  it('getOptionProps returns correct props', () => {
    const api = createLanguageSelector({ value: 'en', options })
    const enProps = api.getOptionProps('en')
    expect(enProps.role).toBe('option')
    expect(enProps['aria-selected']).toBe(true)
    expect(enProps['data-value']).toBe('en')

    const frProps = api.getOptionProps('fr')
    expect(frProps['aria-selected']).toBe(false)
  })

  it('single select: toggle selects and closes', () => {
    const onValueChange = vi.fn()
    const api = createLanguageSelector({ options, onValueChange })
    api.open()
    api.toggle('fr')
    expect(api.state.selectedValues).toEqual(['fr'])
    expect(api.state.isOpen).toBe(false)
    expect(onValueChange).toHaveBeenCalledWith('fr')
  })

  it('single select: toggle replaces previous selection', () => {
    const api = createLanguageSelector({ value: 'en', options })
    api.open()
    api.toggle('fr')
    expect(api.state.selectedValues).toEqual(['fr'])
  })

  it('multi-select: toggle adds and removes', () => {
    const onValueChange = vi.fn()
    const api = createLanguageSelector({ options, multiple: true, onValueChange })
    api.toggle('en')
    expect(api.state.selectedValues).toEqual(['en'])
    expect(onValueChange).toHaveBeenCalledWith(['en'])

    api.toggle('fr')
    expect(api.state.selectedValues).toEqual(['en', 'fr'])

    api.toggle('en')
    expect(api.state.selectedValues).toEqual(['fr'])
  })

  it('multi-select: toggle does not close dropdown', () => {
    const api = createLanguageSelector({ options, multiple: true })
    api.open()
    api.toggle('en')
    expect(api.state.isOpen).toBe(true)
  })

  it('open/close control isOpen state', () => {
    const api = createLanguageSelector({ options })
    api.open()
    expect(api.state.isOpen).toBe(true)
    api.close()
    expect(api.state.isOpen).toBe(false)
  })

  it('Escape keyboard handler closes', () => {
    const api = createLanguageSelector({ options })
    api.open()
    api.keyboardHandlers['Escape']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(false)
  })

  it('Enter keyboard handler toggles open', () => {
    const api = createLanguageSelector({ options })
    api.keyboardHandlers['Enter']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(true)
  })

  it('ArrowDown opens when closed', () => {
    const api = createLanguageSelector({ options })
    api.keyboardHandlers['ArrowDown']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(true)
  })

  it('provides handleKeyDown function', () => {
    const api = createLanguageSelector({ options })
    expect(typeof api.handleKeyDown).toBe('function')
  })
})

describe('selectorVariants', () => {
  it('returns base classes', () => {
    const classes = selectorVariants()
    expect(classes).toContain('relative')
    expect(classes).toContain('inline-flex')
  })

  it('appends custom className', () => {
    const classes = selectorVariants({ className: 'my-selector' })
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

// ── Additional tests ──

describe('createLanguageSelector - multi-select toggle on/off', () => {
  it('toggling same value twice in multi-select removes it', () => {
    const api = createLanguageSelector({ options, multiple: true })
    api.toggle('en')
    expect(api.state.selectedValues).toEqual(['en'])
    api.toggle('en')
    expect(api.state.selectedValues).toEqual([])
  })

  it('toggling multiple values accumulates them', () => {
    const api = createLanguageSelector({ options, multiple: true })
    api.toggle('en')
    api.toggle('fr')
    api.toggle('de')
    expect(api.state.selectedValues).toEqual(['en', 'fr', 'de'])
  })

  it('toggling middle value removes only that value', () => {
    const api = createLanguageSelector({ options, multiple: true })
    api.toggle('en')
    api.toggle('fr')
    api.toggle('de')
    api.toggle('fr')
    expect(api.state.selectedValues).toEqual(['en', 'de'])
  })
})

describe('createLanguageSelector - grouped options', () => {
  it('options with group property are accepted', () => {
    const api = createLanguageSelector({ options })
    // All options should be selectable regardless of group
    api.toggle('en')
    api.open()
    expect(api.state.selectedValues).toEqual(['en'])
  })

  it('options without group property work fine', () => {
    const api = createLanguageSelector({ options })
    api.toggle('ja')
    expect(api.state.selectedValues).toEqual(['ja'])
  })
})

describe('createLanguageSelector - single select mode', () => {
  it('selecting replaces previous value', () => {
    const api = createLanguageSelector({ options })
    api.open()
    api.toggle('en')
    expect(api.state.selectedValues).toEqual(['en'])
    api.open()
    api.toggle('fr')
    expect(api.state.selectedValues).toEqual(['fr'])
  })

  it('single select closes dropdown after toggle', () => {
    const api = createLanguageSelector({ options })
    api.open()
    expect(api.state.isOpen).toBe(true)
    api.toggle('en')
    expect(api.state.isOpen).toBe(false)
  })

  it('single select calls onValueChange with string (not array)', () => {
    const onValueChange = vi.fn()
    const api = createLanguageSelector({ options, onValueChange })
    api.toggle('de')
    expect(onValueChange).toHaveBeenCalledWith('de')
  })
})

describe('createLanguageSelector - keyboard navigation', () => {
  it('Space toggles open', () => {
    const api = createLanguageSelector({ options })
    api.keyboardHandlers[' ']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(true)
    api.keyboardHandlers[' ']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(false)
  })

  it('ArrowUp opens when closed', () => {
    const api = createLanguageSelector({ options })
    api.keyboardHandlers['ArrowUp']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(true)
  })

  it('Enter toggles open state', () => {
    const api = createLanguageSelector({ options })
    api.keyboardHandlers['Enter']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(true)
    api.keyboardHandlers['Enter']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(false)
  })
})

describe('createLanguageSelector - click-outside / close', () => {
  it('close method sets isOpen to false', () => {
    const api = createLanguageSelector({ options })
    api.open()
    expect(api.state.isOpen).toBe(true)
    api.close()
    expect(api.state.isOpen).toBe(false)
  })

  it('Escape closes open dropdown', () => {
    const api = createLanguageSelector({ options })
    api.open()
    api.keyboardHandlers['Escape']!({} as KeyboardEvent)
    expect(api.state.isOpen).toBe(false)
  })
})

describe('createLanguageSelector - getOptionProps after toggle', () => {
  it('reflects updated selection in option props', () => {
    const api = createLanguageSelector({ options, multiple: true })
    api.toggle('en')
    api.toggle('fr')
    expect(api.getOptionProps('en')['aria-selected']).toBe(true)
    expect(api.getOptionProps('fr')['aria-selected']).toBe(true)
    expect(api.getOptionProps('de')['aria-selected']).toBe(false)
  })
})
