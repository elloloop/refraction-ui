import { describe, it, expect } from 'vitest'
import { createSwitch } from '../src/switch.js'
import { switchVariants, switchThumbVariants } from '../src/switch.styles.js'

describe('createSwitch', () => {
  it('returns interactive state by default', () => {
    const api = createSwitch()
    expect(api.isInteractive).toBe(true)
  })

  it('defaults to unchecked', () => {
    const api = createSwitch()
    expect(api.state.checked).toBe(false)
  })

  it('sets role to switch', () => {
    const api = createSwitch()
    expect(api.ariaProps.role).toBe('switch')
  })

  it('sets aria-checked to false by default', () => {
    const api = createSwitch()
    expect(api.ariaProps['aria-checked']).toBe(false)
  })

  it('sets aria-checked to true when checked', () => {
    const api = createSwitch({ checked: true })
    expect(api.ariaProps['aria-checked']).toBe(true)
  })

  it('sets data-state to unchecked by default', () => {
    const api = createSwitch()
    expect(api.dataAttributes['data-state']).toBe('unchecked')
  })

  it('sets data-state to checked when checked', () => {
    const api = createSwitch({ checked: true })
    expect(api.dataAttributes['data-state']).toBe('checked')
  })

  it('sets aria-disabled when disabled', () => {
    const api = createSwitch({ disabled: true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.isInteractive).toBe(false)
  })

  it('sets data-disabled when disabled', () => {
    const api = createSwitch({ disabled: true })
    expect(api.dataAttributes['data-disabled']).toBe('')
  })

  it('does not set data-disabled when enabled', () => {
    const api = createSwitch()
    expect(api.dataAttributes['data-disabled']).toBeUndefined()
  })

  it('prevents Space keyboard when disabled', () => {
    const api = createSwitch({ disabled: true })
    expect(api.keyboardHandlers[' ']).toBeDefined()
  })

  it('does not block keyboard when enabled', () => {
    const api = createSwitch()
    expect(api.keyboardHandlers[' ']).toBeUndefined()
  })

  it('Space handler calls preventDefault when disabled', () => {
    const api = createSwitch({ disabled: true })
    let called = false
    const mockEvent = { preventDefault: () => { called = true } } as unknown as KeyboardEvent
    api.keyboardHandlers[' ']!(mockEvent)
    expect(called).toBe(true)
  })

  it('state reflects disabled correctly', () => {
    expect(createSwitch({ disabled: true }).state.disabled).toBe(true)
    expect(createSwitch({ disabled: false }).state.disabled).toBe(false)
  })

  it('checked + disabled sets both aria attributes', () => {
    const api = createSwitch({ checked: true, disabled: true })
    expect(api.ariaProps['aria-checked']).toBe(true)
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.dataAttributes['data-state']).toBe('checked')
    expect(api.dataAttributes['data-disabled']).toBe('')
  })
})

describe('switchVariants', () => {
  it('returns base classes', () => {
    const classes = switchVariants()
    expect(classes).toContain('inline-flex')
    expect(classes).toContain('rounded-full')
  })

  it('checked true returns bg-primary', () => {
    const classes = switchVariants({ checked: 'true' })
    expect(classes).toContain('bg-primary')
  })

  it('checked false returns bg-input', () => {
    const classes = switchVariants({ checked: 'false' })
    expect(classes).toContain('bg-input')
  })

  it('default size returns h-5 w-9', () => {
    const classes = switchVariants({ size: 'default' })
    expect(classes).toContain('h-5')
    expect(classes).toContain('w-9')
  })

  it('sm size returns h-4 w-7', () => {
    const classes = switchVariants({ size: 'sm' })
    expect(classes).toContain('h-4')
    expect(classes).toContain('w-7')
  })

  it('lg size returns h-6 w-11', () => {
    const classes = switchVariants({ size: 'lg' })
    expect(classes).toContain('h-6')
    expect(classes).toContain('w-11')
  })

  it('appends custom className', () => {
    const classes = switchVariants({ className: 'my-class' })
    expect(classes).toContain('my-class')
  })
})

describe('switchThumbVariants', () => {
  it('returns base classes', () => {
    const classes = switchThumbVariants()
    expect(classes).toContain('rounded-full')
    expect(classes).toContain('bg-background')
  })

  it('unchecked default has translate-x-0', () => {
    const classes = switchThumbVariants({ checked: 'false', size: 'default' })
    expect(classes).toContain('translate-x-0')
  })

  it('checked default has translate-x-4', () => {
    const classes = switchThumbVariants({ checked: 'true', size: 'default' })
    expect(classes).toContain('translate-x-4')
  })

  it('checked sm has translate-x-3', () => {
    const classes = switchThumbVariants({ checked: 'true', size: 'sm' })
    expect(classes).toContain('translate-x-3')
  })

  it('checked lg has translate-x-5', () => {
    const classes = switchThumbVariants({ checked: 'true', size: 'lg' })
    expect(classes).toContain('translate-x-5')
  })

  it('default size has h-4 w-4', () => {
    const classes = switchThumbVariants({ size: 'default' })
    expect(classes).toContain('h-4')
    expect(classes).toContain('w-4')
  })

  it('sm size has h-3 w-3', () => {
    const classes = switchThumbVariants({ size: 'sm' })
    expect(classes).toContain('h-3')
    expect(classes).toContain('w-3')
  })

  it('lg size has h-5 w-5', () => {
    const classes = switchThumbVariants({ size: 'lg' })
    expect(classes).toContain('h-5')
    expect(classes).toContain('w-5')
  })
})
