import { describe, it, expect, vi } from 'vitest'
import { createRadioGroup } from '../src/radio.js'
import { radioGroupVariants, radioCircleVariants } from '../src/radio.styles.js'

describe('createRadioGroup', () => {
  it('starts with no selection by default', () => {
    const api = createRadioGroup()
    expect(api.state.selectedValue).toBeUndefined()
  })

  it('starts with defaultValue', () => {
    const api = createRadioGroup({ defaultValue: 'a' })
    expect(api.state.selectedValue).toBe('a')
  })

  it('respects controlled value', () => {
    const api = createRadioGroup({ value: 'b' })
    expect(api.state.selectedValue).toBe('b')
  })

  it('select() calls onValueChange', () => {
    const fn = vi.fn()
    const api = createRadioGroup({ onValueChange: fn })
    api.select('x')
    expect(fn).toHaveBeenCalledWith('x')
  })

  it('disabled group prevents selection', () => {
    const fn = vi.fn()
    const api = createRadioGroup({ disabled: true, onValueChange: fn })
    api.select('x')
    expect(fn).not.toHaveBeenCalled()
  })

  it('groupProps has role=radiogroup', () => {
    const api = createRadioGroup()
    expect(api.groupProps.role).toBe('radiogroup')
  })

  it('groupProps has aria-orientation', () => {
    const api = createRadioGroup({ orientation: 'horizontal' })
    expect(api.groupProps['aria-orientation']).toBe('horizontal')
  })

  it('getItemProps marks selected item', () => {
    const api = createRadioGroup({ defaultValue: 'a' })
    expect(api.getItemProps('a')['aria-checked']).toBe(true)
    expect(api.getItemProps('b')['aria-checked']).toBe(false)
  })

  it('getItemProps sets tabIndex 0 on selected, -1 on others', () => {
    const api = createRadioGroup({ defaultValue: 'a' })
    expect(api.getItemProps('a').tabIndex).toBe(0)
    expect(api.getItemProps('b').tabIndex).toBe(-1)
  })

  it('getItemProps includes data-state', () => {
    const api = createRadioGroup({ defaultValue: 'a' })
    expect(api.getItemProps('a')['data-state']).toBe('checked')
    expect(api.getItemProps('b')['data-state']).toBe('unchecked')
  })

  it('getItemProps marks disabled items', () => {
    const api = createRadioGroup()
    expect(api.getItemProps('a', true)['aria-disabled']).toBe(true)
    expect(api.getItemProps('a', true)['data-disabled']).toBe('')
  })

  it('getItemProps includes name when provided', () => {
    const api = createRadioGroup({ name: 'color' })
    expect(api.getItemProps('red').name).toBe('color')
  })
})

describe('radioGroupVariants', () => {
  it('vertical is flex-col', () => {
    expect(radioGroupVariants({ orientation: 'vertical' })).toContain('flex-col')
  })
  it('horizontal is flex-row', () => {
    expect(radioGroupVariants({ orientation: 'horizontal' })).toContain('flex-row')
  })
})

describe('radioCircleVariants', () => {
  it('checked has bg-primary', () => {
    expect(radioCircleVariants({ checked: 'true' })).toContain('bg-primary')
  })
  it('unchecked has border-input', () => {
    expect(radioCircleVariants({ checked: 'false' })).toContain('border-input')
  })
})
