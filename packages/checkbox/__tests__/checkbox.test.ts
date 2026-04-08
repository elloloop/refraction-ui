import { describe, it, expect } from 'vitest'
import { createCheckbox, checkIconPath, indeterminateIconPath } from '../src/checkbox.js'
import { checkboxVariants } from '../src/checkbox.styles.js'

describe('createCheckbox', () => {
  it('returns interactive state by default', () => {
    const api = createCheckbox()
    expect(api.isInteractive).toBe(true)
  })

  it('defaults to unchecked', () => {
    const api = createCheckbox()
    expect(api.state.checked).toBe(false)
  })

  it('sets role to checkbox', () => {
    const api = createCheckbox()
    expect(api.ariaProps.role).toBe('checkbox')
  })

  it('sets aria-checked to false by default', () => {
    const api = createCheckbox()
    expect(api.ariaProps['aria-checked']).toBe(false)
  })

  it('sets aria-checked to true when checked', () => {
    const api = createCheckbox({ checked: true })
    expect(api.ariaProps['aria-checked']).toBe(true)
  })

  it('sets aria-checked to mixed when indeterminate', () => {
    const api = createCheckbox({ checked: 'indeterminate' })
    expect(api.ariaProps['aria-checked']).toBe('mixed')
  })

  it('sets data-state to unchecked by default', () => {
    const api = createCheckbox()
    expect(api.dataAttributes['data-state']).toBe('unchecked')
  })

  it('sets data-state to checked when checked', () => {
    const api = createCheckbox({ checked: true })
    expect(api.dataAttributes['data-state']).toBe('checked')
  })

  it('sets data-state to indeterminate when indeterminate', () => {
    const api = createCheckbox({ checked: 'indeterminate' })
    expect(api.dataAttributes['data-state']).toBe('indeterminate')
  })

  it('sets aria-disabled when disabled', () => {
    const api = createCheckbox({ disabled: true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.isInteractive).toBe(false)
  })

  it('sets data-disabled when disabled', () => {
    const api = createCheckbox({ disabled: true })
    expect(api.dataAttributes['data-disabled']).toBe('')
  })

  it('does not set data-disabled when enabled', () => {
    const api = createCheckbox()
    expect(api.dataAttributes['data-disabled']).toBeUndefined()
  })

  it('prevents Space keyboard when disabled', () => {
    const api = createCheckbox({ disabled: true })
    expect(api.keyboardHandlers[' ']).toBeDefined()
  })

  it('does not block keyboard when enabled', () => {
    const api = createCheckbox()
    expect(api.keyboardHandlers[' ']).toBeUndefined()
  })

  it('Space handler calls preventDefault when disabled', () => {
    const api = createCheckbox({ disabled: true })
    let called = false
    const mockEvent = { preventDefault: () => { called = true } } as unknown as KeyboardEvent
    api.keyboardHandlers[' ']!(mockEvent)
    expect(called).toBe(true)
  })

  it('state reflects disabled correctly', () => {
    expect(createCheckbox({ disabled: true }).state.disabled).toBe(true)
    expect(createCheckbox({ disabled: false }).state.disabled).toBe(false)
  })

  it('indeterminate + disabled sets both attributes', () => {
    const api = createCheckbox({ checked: 'indeterminate', disabled: true })
    expect(api.ariaProps['aria-checked']).toBe('mixed')
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.dataAttributes['data-state']).toBe('indeterminate')
    expect(api.dataAttributes['data-disabled']).toBe('')
  })
})

describe('icon paths', () => {
  it('checkIconPath is a valid SVG path string', () => {
    expect(typeof checkIconPath).toBe('string')
    expect(checkIconPath.length).toBeGreaterThan(0)
  })

  it('indeterminateIconPath is a valid SVG path string', () => {
    expect(typeof indeterminateIconPath).toBe('string')
    expect(indeterminateIconPath.length).toBeGreaterThan(0)
  })
})

describe('checkboxVariants', () => {
  it('returns base classes', () => {
    const classes = checkboxVariants()
    expect(classes).toContain('rounded-sm')
    expect(classes).toContain('border')
  })

  it('checked true returns bg-primary', () => {
    const classes = checkboxVariants({ checked: 'true' })
    expect(classes).toContain('bg-primary')
  })

  it('checked false returns bg-background', () => {
    const classes = checkboxVariants({ checked: 'false' })
    expect(classes).toContain('bg-background')
  })

  it('indeterminate returns bg-primary', () => {
    const classes = checkboxVariants({ checked: 'indeterminate' })
    expect(classes).toContain('bg-primary')
  })

  it('default size returns h-4 w-4', () => {
    const classes = checkboxVariants({ size: 'default' })
    expect(classes).toContain('h-4')
    expect(classes).toContain('w-4')
  })

  it('sm size returns h-3.5 w-3.5', () => {
    const classes = checkboxVariants({ size: 'sm' })
    expect(classes).toContain('h-3.5')
    expect(classes).toContain('w-3.5')
  })

  it('lg size returns h-5 w-5', () => {
    const classes = checkboxVariants({ size: 'lg' })
    expect(classes).toContain('h-5')
    expect(classes).toContain('w-5')
  })

  it('appends custom className', () => {
    const classes = checkboxVariants({ className: 'my-custom' })
    expect(classes).toContain('my-custom')
  })

  it('checked and unchecked states produce different classes', () => {
    const checked = checkboxVariants({ checked: 'true' })
    const unchecked = checkboxVariants({ checked: 'false' })
    expect(checked).not.toBe(unchecked)
  })

  it('checked true and indeterminate both contain bg-primary', () => {
    const checked = checkboxVariants({ checked: 'true' })
    const indeterminate = checkboxVariants({ checked: 'indeterminate' })
    expect(checked).toContain('bg-primary')
    expect(indeterminate).toContain('bg-primary')
  })
})
