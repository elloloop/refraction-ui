import { describe, it, expect } from 'vitest'
import { createOtpInput } from '../src/otp-input.js'
import { otpInputContainerVariants, otpInputSlotVariants } from '../src/otp-input.styles.js'

describe('createOtpInput', () => {
  it('defaults to length 6', () => {
    const api = createOtpInput()
    expect(api.state.length).toBe(6)
    expect(api.state.values).toHaveLength(6)
  })

  it('respects custom length', () => {
    const api = createOtpInput({ length: 4 })
    expect(api.state.length).toBe(4)
    expect(api.state.values).toHaveLength(4)
  })

  it('initializes values from value string', () => {
    const api = createOtpInput({ length: 4, value: '1234' })
    expect(api.state.values).toEqual(['1', '2', '3', '4'])
  })

  it('pads values with empty strings when value is short', () => {
    const api = createOtpInput({ length: 4, value: '12' })
    expect(api.state.values).toEqual(['1', '2', '', ''])
  })

  it('truncates values when value is longer than length', () => {
    const api = createOtpInput({ length: 2, value: '1234' })
    expect(api.state.values).toEqual(['1', '2'])
  })

  it('defaults to interactive', () => {
    const api = createOtpInput()
    expect(api.isInteractive).toBe(true)
  })

  it('disabled blocks interaction', () => {
    const api = createOtpInput({ disabled: true })
    expect(api.isInteractive).toBe(false)
    expect(api.state.disabled).toBe(true)
  })

  it('rootAriaProps has role group', () => {
    const api = createOtpInput()
    expect(api.rootAriaProps.role).toBe('group')
  })

  it('rootAriaProps has aria-label', () => {
    const api = createOtpInput()
    expect(api.rootAriaProps['aria-label']).toBe('One-time password input')
  })

  it('focusedIndex is 0 when autoFocus', () => {
    const api = createOtpInput({ autoFocus: true })
    expect(api.state.focusedIndex).toBe(0)
  })

  it('focusedIndex is -1 when not autoFocus', () => {
    const api = createOtpInput()
    expect(api.state.focusedIndex).toBe(-1)
  })
})

describe('createOtpInput - setValue', () => {
  it('sets value at index and returns new array', () => {
    const api = createOtpInput({ length: 4 })
    const result = api.setValue(0, '5')
    expect(result[0]).toBe('5')
    expect(result).toHaveLength(4)
  })

  it('filters non-numeric characters in number mode', () => {
    const api = createOtpInput({ length: 4, type: 'number' })
    const result = api.setValue(0, 'a')
    expect(result[0]).toBe('')
  })

  it('allows any characters in text mode', () => {
    const api = createOtpInput({ length: 4, type: 'text' })
    const result = api.setValue(0, 'a')
    expect(result[0]).toBe('a')
  })

  it('takes only first character', () => {
    const api = createOtpInput({ length: 4, type: 'text' })
    const result = api.setValue(0, 'abc')
    expect(result[0]).toBe('a')
  })

  it('handles out-of-bounds index gracefully', () => {
    const api = createOtpInput({ length: 4 })
    const result = api.setValue(-1, '5')
    expect(result).toEqual(['', '', '', ''])
  })

  it('handles index beyond length', () => {
    const api = createOtpInput({ length: 4 })
    const result = api.setValue(10, '5')
    expect(result).toEqual(['', '', '', ''])
  })

  it('clears a value with empty string', () => {
    const api = createOtpInput({ length: 4, value: '1234' })
    const result = api.setValue(1, '')
    expect(result[1]).toBe('')
  })
})

describe('createOtpInput - getValue', () => {
  it('returns joined values', () => {
    const api = createOtpInput({ length: 4, value: '1234' })
    expect(api.getValue()).toBe('1234')
  })

  it('returns empty for empty inputs', () => {
    const api = createOtpInput({ length: 4 })
    expect(api.getValue()).toBe('')
  })

  it('reflects setValue changes', () => {
    const api = createOtpInput({ length: 4 })
    api.setValue(0, '1')
    api.setValue(1, '2')
    expect(api.getValue()).toBe('12')
  })
})

describe('createOtpInput - moveFocus', () => {
  it('moves focus right', () => {
    const api = createOtpInput({ autoFocus: true, length: 4 })
    expect(api.moveFocus('right')).toBe(1)
  })

  it('moves focus left', () => {
    const api = createOtpInput({ autoFocus: true, length: 4 })
    api.moveFocus('right')
    expect(api.moveFocus('left')).toBe(0)
  })

  it('clamps at 0 when moving left from 0', () => {
    const api = createOtpInput({ autoFocus: true, length: 4 })
    expect(api.moveFocus('left')).toBe(0)
  })

  it('clamps at length-1 when moving right at end', () => {
    const api = createOtpInput({ autoFocus: true, length: 4 })
    api.moveFocus('right')
    api.moveFocus('right')
    api.moveFocus('right')
    expect(api.moveFocus('right')).toBe(3)
  })
})

describe('createOtpInput - getSlotProps', () => {
  it('returns aria-label with position', () => {
    const api = createOtpInput({ length: 4 })
    const props = api.getSlotProps(0)
    expect(props.ariaProps['aria-label']).toBe('Digit 1 of 4')
  })

  it('returns data-slot otp-slot', () => {
    const api = createOtpInput()
    expect(api.getSlotProps(0).dataAttributes['data-slot']).toBe('otp-slot')
  })

  it('sets inputMode numeric for number type', () => {
    const api = createOtpInput({ type: 'number' })
    expect(api.getSlotProps(0).inputProps.inputMode).toBe('numeric')
  })

  it('sets inputMode text for text type', () => {
    const api = createOtpInput({ type: 'text' })
    expect(api.getSlotProps(0).inputProps.inputMode).toBe('text')
  })

  it('sets pattern for number type', () => {
    const api = createOtpInput({ type: 'number' })
    expect(api.getSlotProps(0).inputProps.pattern).toBe('[0-9]*')
  })

  it('no pattern for text type', () => {
    const api = createOtpInput({ type: 'text' })
    expect(api.getSlotProps(0).inputProps.pattern).toBeUndefined()
  })

  it('first slot has autocomplete one-time-code', () => {
    const api = createOtpInput()
    expect(api.getSlotProps(0).inputProps.autoComplete).toBe('one-time-code')
  })

  it('other slots have autocomplete off', () => {
    const api = createOtpInput()
    expect(api.getSlotProps(1).inputProps.autoComplete).toBe('off')
  })

  it('disabled prop propagates to inputProps', () => {
    const api = createOtpInput({ disabled: true })
    expect(api.getSlotProps(0).inputProps.disabled).toBe(true)
  })

  it('maxLength is always 1', () => {
    const api = createOtpInput()
    expect(api.getSlotProps(0).inputProps.maxLength).toBe(1)
  })
})

describe('createOtpInput - parsePaste', () => {
  it('parses numeric paste in number mode', () => {
    const api = createOtpInput({ length: 4, type: 'number' })
    expect(api.parsePaste('1234')).toEqual(['1', '2', '3', '4'])
  })

  it('filters non-numeric in number mode', () => {
    const api = createOtpInput({ length: 4, type: 'number' })
    expect(api.parsePaste('12ab')).toEqual(['1', '2', '', ''])
  })

  it('allows any chars in text mode', () => {
    const api = createOtpInput({ length: 4, type: 'text' })
    expect(api.parsePaste('abcd')).toEqual(['a', 'b', 'c', 'd'])
  })

  it('pads short paste with empty strings', () => {
    const api = createOtpInput({ length: 4, type: 'number' })
    expect(api.parsePaste('12')).toEqual(['1', '2', '', ''])
  })

  it('truncates long paste to length', () => {
    const api = createOtpInput({ length: 4, type: 'number' })
    expect(api.parsePaste('123456')).toEqual(['1', '2', '3', '4'])
  })
})

describe('createOtpInput - getKeyboardHandlers', () => {
  it('returns handlers when enabled', () => {
    const api = createOtpInput()
    const handlers = api.getKeyboardHandlers(0)
    expect(handlers['Backspace']).toBeDefined()
    expect(handlers['ArrowLeft']).toBeDefined()
    expect(handlers['ArrowRight']).toBeDefined()
  })

  it('returns blocking handlers when disabled', () => {
    const api = createOtpInput({ disabled: true })
    const handlers = api.getKeyboardHandlers(0)
    let called = false
    handlers['Backspace']!({ preventDefault: () => { called = true } } as unknown as KeyboardEvent)
    expect(called).toBe(true)
  })
})

describe('otpInputContainerVariants', () => {
  it('returns base container classes', () => {
    const classes = otpInputContainerVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('items-center')
    expect(classes).toContain('gap-2')
  })

  it('sm size returns gap-1.5', () => {
    expect(otpInputContainerVariants({ size: 'sm' })).toContain('gap-1.5')
  })

  it('lg size returns gap-3', () => {
    expect(otpInputContainerVariants({ size: 'lg' })).toContain('gap-3')
  })
})

describe('otpInputSlotVariants', () => {
  it('returns base slot classes', () => {
    const classes = otpInputSlotVariants()
    expect(classes).toContain('rounded-md')
    expect(classes).toContain('border')
    expect(classes).toContain('text-center')
  })

  it('default size has h-10 w-10', () => {
    const classes = otpInputSlotVariants({ size: 'default' })
    expect(classes).toContain('h-10')
    expect(classes).toContain('w-10')
  })

  it('sm size has h-8 w-8', () => {
    const classes = otpInputSlotVariants({ size: 'sm' })
    expect(classes).toContain('h-8')
    expect(classes).toContain('w-8')
  })

  it('lg size has h-12 w-12', () => {
    const classes = otpInputSlotVariants({ size: 'lg' })
    expect(classes).toContain('h-12')
    expect(classes).toContain('w-12')
  })

  it('focused true has ring classes', () => {
    const classes = otpInputSlotVariants({ focused: 'true' })
    expect(classes).toContain('ring-2')
    expect(classes).toContain('ring-ring')
  })

  it('filled true has border-primary', () => {
    const classes = otpInputSlotVariants({ filled: 'true' })
    expect(classes).toContain('border-primary')
  })
})
