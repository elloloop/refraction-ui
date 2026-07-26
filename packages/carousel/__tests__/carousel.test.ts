import { describe, it, expect, vi } from 'vitest'
import { createCarousel, isItemOpen } from '../src/index.js'

// The carousel core shares the accordion disclosure state machine (see the
// package's honest note), so these tests pin the shipped behavior: single /
// multiple open panels with an optional collapsible toggle.

describe('createCarousel', () => {
  it('behaves as a single-expand disclosure store by default', () => {
    const api = createCarousel()
    expect(api.getState().value).toBe('')

    api.toggleItem('shipping')
    expect(api.getState().value).toBe('shipping')
    expect(api.isOpen('shipping')).toBe(true)

    api.toggleItem('returns')
    expect(api.getState().value).toBe('returns')
    expect(api.isOpen('shipping')).toBe(false)
  })

  it('collapses the open item when collapsible', () => {
    const api = createCarousel({ collapsible: true })
    api.toggleItem('a')
    api.toggleItem('a')
    expect(api.getState().value).toBe('')
  })

  it('tracks multiple open items independently', () => {
    const api = createCarousel({ type: 'multiple', defaultValue: ['a'] })
    api.toggleItem('b')
    expect(api.getState().value).toEqual(['a', 'b'])
    api.toggleItem('a')
    expect(api.getState().value).toEqual(['b'])
  })

  it('supports controlled value + onValueChange', () => {
    const onValueChange = vi.fn()
    const api = createCarousel({ value: 'a', onValueChange })
    api.toggleItem('b')
    expect(api.getState().value).toBe('a')
    expect(onValueChange).toHaveBeenCalledWith('b')
    api.setValue('b')
    expect(api.isOpen('b')).toBe(true)
  })

  it('notifies subscribers on change', () => {
    const listener = vi.fn()
    const api = createCarousel()
    api.subscribe(listener)
    api.toggleItem('a')
    expect(listener).toHaveBeenCalledTimes(1)
  })
})

describe('isItemOpen (re-export)', () => {
  it('checks open state for both modes', () => {
    expect(isItemOpen({ type: 'single', collapsible: false, value: 'x' }, 'x')).toBe(true)
    expect(
      isItemOpen({ type: 'multiple', collapsible: false, value: ['x', 'y'] }, 'y'),
    ).toBe(true)
    expect(
      isItemOpen({ type: 'multiple', collapsible: false, value: ['x', 'y'] }, 'z'),
    ).toBe(false)
  })
})
