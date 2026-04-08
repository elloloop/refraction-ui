import { describe, it, expect } from 'vitest'
import { createSelect } from '../src/select.js'
import { selectTriggerVariants, selectContentVariants, selectItemVariants } from '../src/select.styles.js'

const testOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
]

describe('createSelect', () => {
  it('returns interactive state by default', () => {
    const api = createSelect()
    expect(api.isInteractive).toBe(true)
  })

  it('defaults to closed', () => {
    const api = createSelect()
    expect(api.state.open).toBe(false)
  })

  it('sets trigger role to combobox', () => {
    const api = createSelect()
    expect(api.triggerProps.ariaProps.role).toBe('combobox')
  })

  it('sets content role to listbox', () => {
    const api = createSelect()
    expect(api.contentProps.ariaProps.role).toBe('listbox')
  })

  it('sets aria-expanded based on open state', () => {
    expect(createSelect({ open: false }).triggerProps.ariaProps['aria-expanded']).toBe(false)
    expect(createSelect({ open: true }).triggerProps.ariaProps['aria-expanded']).toBe(true)
  })

  it('sets trigger data-state based on open', () => {
    expect(createSelect({ open: false }).triggerProps.dataAttributes['data-state']).toBe('closed')
    expect(createSelect({ open: true }).triggerProps.dataAttributes['data-state']).toBe('open')
  })

  it('sets content data-state based on open', () => {
    expect(createSelect({ open: false }).contentProps.dataAttributes['data-state']).toBe('closed')
    expect(createSelect({ open: true }).contentProps.dataAttributes['data-state']).toBe('open')
  })

  it('resolves selected option', () => {
    const api = createSelect({ value: 'banana', options: testOptions })
    expect(api.state.selectedValue).toBe('banana')
    expect(api.state.selectedLabel).toBe('Banana')
  })

  it('returns undefined for unmatched value', () => {
    const api = createSelect({ value: 'grape', options: testOptions })
    expect(api.state.selectedValue).toBeUndefined()
    expect(api.state.selectedLabel).toBeUndefined()
  })

  it('defaults placeholder', () => {
    const api = createSelect()
    expect(api.state.placeholder).toBe('Select an option')
  })

  it('accepts custom placeholder', () => {
    const api = createSelect({ placeholder: 'Choose fruit' })
    expect(api.state.placeholder).toBe('Choose fruit')
  })

  it('disabled sets aria-disabled on trigger', () => {
    const api = createSelect({ disabled: true })
    expect(api.triggerProps.ariaProps['aria-disabled']).toBe(true)
    expect(api.isInteractive).toBe(false)
  })

  it('disabled sets data-disabled on trigger', () => {
    const api = createSelect({ disabled: true })
    expect(api.triggerProps.dataAttributes['data-disabled']).toBe('')
  })

  it('disabled blocks keyboard handlers', () => {
    const api = createSelect({ disabled: true })
    expect(api.triggerProps.keyboardHandlers['Enter']).toBeDefined()
    expect(api.triggerProps.keyboardHandlers[' ']).toBeDefined()
    expect(api.triggerProps.keyboardHandlers['ArrowDown']).toBeDefined()
    expect(api.triggerProps.keyboardHandlers['ArrowUp']).toBeDefined()
  })

  it('enabled has no blocking keyboard handlers', () => {
    const api = createSelect()
    expect(api.triggerProps.keyboardHandlers['Enter']).toBeUndefined()
  })

  it('generates unique ids', () => {
    const api = createSelect()
    expect(api.ids.trigger).toContain('select-trigger')
    expect(api.ids.content).toContain('select-content')
    expect(api.ids.trigger).not.toBe(api.ids.content)
  })

  it('trigger aria-controls points to content id', () => {
    const api = createSelect()
    expect(api.triggerProps.ariaProps['aria-controls']).toBe(api.ids.content)
  })
})

describe('createSelect - getOptionProps', () => {
  it('returns role option', () => {
    const api = createSelect({ value: 'apple', options: testOptions })
    const props = api.getOptionProps(testOptions[0])
    expect(props.ariaProps.role).toBe('option')
  })

  it('marks selected option with aria-selected', () => {
    const api = createSelect({ value: 'apple', options: testOptions })
    const props = api.getOptionProps(testOptions[0])
    expect(props.ariaProps['aria-selected']).toBe(true)
    expect(props.isSelected).toBe(true)
  })

  it('marks unselected option correctly', () => {
    const api = createSelect({ value: 'apple', options: testOptions })
    const props = api.getOptionProps(testOptions[1])
    expect(props.ariaProps['aria-selected']).toBe(false)
    expect(props.isSelected).toBe(false)
  })

  it('sets data-state checked for selected option', () => {
    const api = createSelect({ value: 'apple', options: testOptions })
    const props = api.getOptionProps(testOptions[0])
    expect(props.dataAttributes['data-state']).toBe('checked')
  })

  it('disabled option sets aria-disabled', () => {
    const api = createSelect({ options: testOptions })
    const props = api.getOptionProps(testOptions[2])
    expect(props.ariaProps['aria-disabled']).toBe(true)
    expect(props.dataAttributes['data-disabled']).toBe('')
  })

  it('non-disabled option has no aria-disabled', () => {
    const api = createSelect({ options: testOptions })
    const props = api.getOptionProps(testOptions[0])
    expect(props.ariaProps['aria-disabled']).toBeUndefined()
    expect(props.dataAttributes['data-disabled']).toBeUndefined()
  })
})

describe('selectTriggerVariants', () => {
  it('returns base trigger classes', () => {
    const classes = selectTriggerVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('border')
    expect(classes).toContain('rounded-md')
  })

  it('default size has h-9', () => {
    expect(selectTriggerVariants({ size: 'default' })).toContain('h-9')
  })

  it('sm size has h-8', () => {
    expect(selectTriggerVariants({ size: 'sm' })).toContain('h-8')
  })

  it('lg size has h-10', () => {
    expect(selectTriggerVariants({ size: 'lg' })).toContain('h-10')
  })
})

describe('selectContentVariants', () => {
  it('returns base content classes', () => {
    const classes = selectContentVariants()
    expect(classes).toContain('rounded-md')
    expect(classes).toContain('border')
    expect(classes).toContain('shadow-md')
  })
})

describe('selectItemVariants', () => {
  it('returns base item classes', () => {
    const classes = selectItemVariants()
    expect(classes).toContain('cursor-default')
    expect(classes).toContain('select-none')
  })

  it('selected true has bg-accent/50', () => {
    const classes = selectItemVariants({ selected: 'true' })
    expect(classes).toContain('bg-accent/50')
  })
})
