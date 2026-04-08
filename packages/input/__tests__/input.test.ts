import { describe, it, expect } from 'vitest'
import { createInput, getInputAriaProps } from '../src/input.js'
import { inputVariants } from '../src/input.styles.js'

describe('createInput', () => {
  it('returns empty ariaProps and dataAttributes by default', () => {
    const api = createInput()
    expect(api.ariaProps).toEqual({})
    expect(api.dataAttributes).toEqual({})
  })

  it('sets aria-disabled and data-disabled when disabled', () => {
    const api = createInput({ disabled: true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.dataAttributes['data-disabled']).toBe('')
  })

  it('sets data-readonly when readOnly', () => {
    const api = createInput({ readOnly: true })
    expect(api.dataAttributes['data-readonly']).toBe('')
  })

  it('sets aria-required when required', () => {
    const api = createInput({ required: true })
    expect(api.ariaProps['aria-required']).toBe(true)
  })

  it('sets aria-invalid and data-invalid when aria-invalid is true', () => {
    const api = createInput({ 'aria-invalid': true })
    expect(api.ariaProps['aria-invalid']).toBe(true)
    expect(api.dataAttributes['data-invalid']).toBe('')
  })

  it('handles combined disabled and readOnly states', () => {
    const api = createInput({ disabled: true, readOnly: true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.dataAttributes['data-disabled']).toBe('')
    expect(api.dataAttributes['data-readonly']).toBe('')
  })
})

describe('getInputAriaProps', () => {
  it('returns empty object for default state', () => {
    expect(getInputAriaProps({})).toEqual({})
  })

  it('returns aria-disabled when disabled', () => {
    const props = getInputAriaProps({ disabled: true })
    expect(props['aria-disabled']).toBe(true)
  })

  it('returns aria-invalid when invalid', () => {
    const props = getInputAriaProps({ invalid: true })
    expect(props['aria-invalid']).toBe(true)
  })

  it('returns aria-required when required', () => {
    const props = getInputAriaProps({ required: true })
    expect(props['aria-required']).toBe(true)
  })
})

describe('inputVariants', () => {
  it('returns default size classes', () => {
    const classes = inputVariants()
    expect(classes).toContain('h-9')
    expect(classes).toContain('rounded-md')
  })

  it('returns sm size classes', () => {
    const classes = inputVariants({ size: 'sm' })
    expect(classes).toContain('h-8')
    expect(classes).toContain('text-xs')
  })

  it('returns lg size classes', () => {
    const classes = inputVariants({ size: 'lg' })
    expect(classes).toContain('h-10')
    expect(classes).toContain('text-base')
  })

  it('appends custom className', () => {
    const classes = inputVariants({ className: 'my-custom' })
    expect(classes).toContain('my-custom')
  })
})

describe('createInput - InputType coverage', () => {
  const inputTypes = ['text', 'password', 'email', 'number', 'tel', 'url', 'search'] as const

  it.each(inputTypes)('type "%s" can be passed without error', (type) => {
    const api = createInput({ type })
    expect(api.ariaProps).toEqual({})
    expect(api.dataAttributes).toEqual({})
  })
})

describe('createInput - combined states', () => {
  it('disabled + required + invalid sets all relevant props', () => {
    const api = createInput({ disabled: true, required: true, 'aria-invalid': true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.ariaProps['aria-required']).toBe(true)
    expect(api.ariaProps['aria-invalid']).toBe(true)
    expect(api.dataAttributes['data-disabled']).toBe('')
    expect(api.dataAttributes['data-invalid']).toBe('')
  })

  it('disabled + readOnly + required + invalid sets all states', () => {
    const api = createInput({ disabled: true, readOnly: true, required: true, 'aria-invalid': true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.ariaProps['aria-required']).toBe(true)
    expect(api.ariaProps['aria-invalid']).toBe(true)
    expect(api.dataAttributes['data-disabled']).toBe('')
    expect(api.dataAttributes['data-readonly']).toBe('')
    expect(api.dataAttributes['data-invalid']).toBe('')
  })
})

describe('createInput - default props produce clean output', () => {
  it('default call returns empty ariaProps', () => {
    const api = createInput()
    expect(Object.keys(api.ariaProps)).toHaveLength(0)
  })

  it('default call returns empty dataAttributes', () => {
    const api = createInput()
    expect(Object.keys(api.dataAttributes)).toHaveLength(0)
  })
})

describe('getInputAriaProps - all combinations', () => {
  it('all flags false returns empty object', () => {
    const props = getInputAriaProps({ disabled: false, readOnly: false, required: false, invalid: false })
    expect(props).toEqual({})
  })

  it('disabled + invalid returns both aria props', () => {
    const props = getInputAriaProps({ disabled: true, invalid: true })
    expect(props['aria-disabled']).toBe(true)
    expect(props['aria-invalid']).toBe(true)
  })

  it('required + invalid returns both aria props', () => {
    const props = getInputAriaProps({ required: true, invalid: true })
    expect(props['aria-required']).toBe(true)
    expect(props['aria-invalid']).toBe(true)
  })

  it('all flags true returns all aria props', () => {
    const props = getInputAriaProps({ disabled: true, readOnly: true, required: true, invalid: true })
    expect(props['aria-disabled']).toBe(true)
    expect(props['aria-required']).toBe(true)
    expect(props['aria-invalid']).toBe(true)
  })

  it('readOnly alone does not add any aria props', () => {
    const props = getInputAriaProps({ readOnly: true })
    expect(props).toEqual({})
  })
})
