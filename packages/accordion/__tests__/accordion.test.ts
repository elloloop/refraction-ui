import { describe, it, expect, vi } from 'vitest'
import { createAccordion, isItemOpen } from '../src/index.js'

describe('createAccordion (single)', () => {
  it('starts fully closed by default', () => {
    const api = createAccordion()
    expect(api.getState().value).toBe('')
    expect(api.isOpen('a')).toBe(false)
  })

  it('opens the toggled item and closes it only when collapsible', () => {
    const api = createAccordion()
    api.toggleItem('a')
    expect(api.getState().value).toBe('a')
    // Not collapsible: re-toggling the open item keeps it open.
    api.toggleItem('a')
    expect(api.getState().value).toBe('a')

    const collapsible = createAccordion({ collapsible: true })
    collapsible.toggleItem('a')
    collapsible.toggleItem('a')
    expect(collapsible.getState().value).toBe('')
  })

  it('keeps only one item open at a time', () => {
    const api = createAccordion()
    api.toggleItem('a')
    api.toggleItem('b')
    expect(api.getState().value).toBe('b')
    expect(api.isOpen('a')).toBe(false)
    expect(api.isOpen('b')).toBe(true)
  })

  it('honors defaultValue for uncontrolled usage', () => {
    const api = createAccordion({ defaultValue: 'b' })
    expect(api.getState().value).toBe('b')
  })
})

describe('createAccordion (multiple)', () => {
  it('defaults to an empty array', () => {
    const api = createAccordion({ type: 'multiple' })
    expect(api.getState().value).toEqual([])
  })

  it('toggles items independently', () => {
    const api = createAccordion({ type: 'multiple' })
    api.toggleItem('a')
    api.toggleItem('b')
    expect(api.getState().value).toEqual(['a', 'b'])
    api.toggleItem('a')
    expect(api.getState().value).toEqual(['b'])
  })

  it('honors an array defaultValue', () => {
    const api = createAccordion({ type: 'multiple', defaultValue: ['a', 'c'] })
    expect(api.isOpen('a')).toBe(true)
    expect(api.isOpen('b')).toBe(false)
    expect(api.isOpen('c')).toBe(true)
  })
})

describe('createAccordion (controlled)', () => {
  it('uses the controlled value and reports changes without mutating it', () => {
    const onValueChange = vi.fn()
    const api = createAccordion({ value: 'a', onValueChange })
    expect(api.getState().value).toBe('a')

    api.toggleItem('b')
    // Still the controlled value until the consumer syncs the new one.
    expect(api.getState().value).toBe('a')
    expect(onValueChange).toHaveBeenCalledWith('b')

    api.setValue('b')
    expect(api.getState().value).toBe('b')
  })

  it('setValue is a no-op (no emit) when the value is unchanged', () => {
    const listener = vi.fn()
    const api = createAccordion({ value: ['a'] })
    api.subscribe(listener)
    api.setValue(['a'])
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('createAccordion (subscription)', () => {
  it('notifies listeners on change and stops after unsubscribe', () => {
    const listener = vi.fn()
    const api = createAccordion()
    const unsubscribe = api.subscribe(listener)
    api.toggleItem('a')
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    api.toggleItem('b')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('setOptions updates type/collapsible and the change callback', () => {
    const onValueChange = vi.fn()
    const api = createAccordion()
    api.setOptions({ type: 'multiple', onValueChange })
    expect(api.getState().type).toBe('multiple')
    api.toggleItem('a')
    api.toggleItem('b')
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b'])
  })
})

describe('isItemOpen', () => {
  it('matches single values and multiple membership', () => {
    expect(isItemOpen({ type: 'single', collapsible: false, value: 'a' }, 'a')).toBe(true)
    expect(isItemOpen({ type: 'single', collapsible: false, value: 'a' }, 'b')).toBe(false)
    expect(
      isItemOpen({ type: 'multiple', collapsible: false, value: ['a', 'b'] }, 'b'),
    ).toBe(true)
    expect(
      isItemOpen({ type: 'multiple', collapsible: false, value: ['a', 'b'] }, 'c'),
    ).toBe(false)
  })

  it('tolerates a mismatched value shape for the mode', () => {
    expect(isItemOpen({ type: 'multiple', collapsible: false, value: 'a' }, 'a')).toBe(false)
  })
})
