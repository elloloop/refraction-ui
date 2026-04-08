import { describe, it, expect } from 'vitest'
import { createTextarea } from '../src/textarea.js'
import { textareaVariants } from '../src/textarea.styles.js'

describe('createTextarea', () => {
  it('returns empty ariaProps and dataAttributes by default', () => {
    const api = createTextarea()
    expect(api.ariaProps).toEqual({})
    expect(api.dataAttributes).toEqual({})
  })

  it('sets aria-disabled and data-disabled when disabled', () => {
    const api = createTextarea({ disabled: true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.dataAttributes['data-disabled']).toBe('')
  })

  it('sets data-readonly when readOnly', () => {
    const api = createTextarea({ readOnly: true })
    expect(api.dataAttributes['data-readonly']).toBe('')
  })

  it('sets aria-required when required', () => {
    const api = createTextarea({ required: true })
    expect(api.ariaProps['aria-required']).toBe(true)
  })

  it('sets aria-invalid and data-invalid when aria-invalid is true', () => {
    const api = createTextarea({ 'aria-invalid': true })
    expect(api.ariaProps['aria-invalid']).toBe(true)
    expect(api.dataAttributes['data-invalid']).toBe('')
  })

  it('handles combined disabled and readOnly states', () => {
    const api = createTextarea({ disabled: true, readOnly: true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.dataAttributes['data-disabled']).toBe('')
    expect(api.dataAttributes['data-readonly']).toBe('')
  })

  it('accepts rows and maxRows without error', () => {
    const api = createTextarea({ rows: 5, maxRows: 10 })
    expect(api.ariaProps).toEqual({})
    expect(api.dataAttributes).toEqual({})
  })
})

describe('textareaVariants', () => {
  it('returns default size classes', () => {
    const classes = textareaVariants()
    expect(classes).toContain('min-h-[60px]')
    expect(classes).toContain('rounded-md')
  })

  it('returns sm size classes', () => {
    const classes = textareaVariants({ size: 'sm' })
    expect(classes).toContain('min-h-[40px]')
    expect(classes).toContain('text-xs')
  })

  it('returns lg size classes', () => {
    const classes = textareaVariants({ size: 'lg' })
    expect(classes).toContain('min-h-[80px]')
    expect(classes).toContain('text-base')
  })

  it('appends custom className', () => {
    const classes = textareaVariants({ className: 'my-custom' })
    expect(classes).toContain('my-custom')
  })
})

describe('createTextarea - rows prop', () => {
  it('rows prop does not affect ariaProps', () => {
    const api = createTextarea({ rows: 3 })
    expect(api.ariaProps).toEqual({})
  })

  it('rows prop does not affect dataAttributes', () => {
    const api = createTextarea({ rows: 10 })
    expect(api.dataAttributes).toEqual({})
  })
})

describe('createTextarea - maxRows prop', () => {
  it('maxRows prop does not affect ariaProps', () => {
    const api = createTextarea({ maxRows: 20 })
    expect(api.ariaProps).toEqual({})
  })

  it('maxRows prop does not affect dataAttributes', () => {
    const api = createTextarea({ maxRows: 15 })
    expect(api.dataAttributes).toEqual({})
  })

  it('rows and maxRows together do not affect state', () => {
    const api = createTextarea({ rows: 3, maxRows: 10 })
    expect(api.ariaProps).toEqual({})
    expect(api.dataAttributes).toEqual({})
  })
})

describe('createTextarea - combined disabled + readOnly + required + invalid', () => {
  it('all four states set all relevant aria and data attributes', () => {
    const api = createTextarea({
      disabled: true,
      readOnly: true,
      required: true,
      'aria-invalid': true,
    })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.ariaProps['aria-required']).toBe(true)
    expect(api.ariaProps['aria-invalid']).toBe(true)
    expect(api.dataAttributes['data-disabled']).toBe('')
    expect(api.dataAttributes['data-readonly']).toBe('')
    expect(api.dataAttributes['data-invalid']).toBe('')
  })

  it('disabled + required sets both without readonly or invalid', () => {
    const api = createTextarea({ disabled: true, required: true })
    expect(api.ariaProps['aria-disabled']).toBe(true)
    expect(api.ariaProps['aria-required']).toBe(true)
    expect(api.ariaProps['aria-invalid']).toBeUndefined()
    expect(api.dataAttributes['data-disabled']).toBe('')
    expect(api.dataAttributes['data-readonly']).toBeUndefined()
    expect(api.dataAttributes['data-invalid']).toBeUndefined()
  })
})

describe('createTextarea - default state is clean', () => {
  it('default state returns no ariaProps keys', () => {
    const api = createTextarea()
    expect(Object.keys(api.ariaProps)).toHaveLength(0)
  })

  it('default state returns no dataAttributes keys', () => {
    const api = createTextarea()
    expect(Object.keys(api.dataAttributes)).toHaveLength(0)
  })

  it('default state with empty object is also clean', () => {
    const api = createTextarea({})
    expect(api.ariaProps).toEqual({})
    expect(api.dataAttributes).toEqual({})
  })
})
