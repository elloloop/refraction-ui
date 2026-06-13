import { describe, it, expect } from 'vitest'
import { createEditorTabs, getNextTabIndex } from '../src/index.js'

describe('createEditorTabs', () => {
  it('exposes tablist role', () => {
    const { ariaProps } = createEditorTabs({})
    expect(ariaProps.role).toBe('tablist')
  })

  it('emits data-active-id when activeId is set', () => {
    const { dataAttributes } = createEditorTabs({ activeId: 'tab-1' })
    expect(dataAttributes['data-active-id']).toBe('tab-1')
  })

  it('omits data-active-id when activeId is not set', () => {
    const { dataAttributes } = createEditorTabs({})
    expect(dataAttributes['data-active-id']).toBeUndefined()
  })
})

describe('getNextTabIndex', () => {
  it('wraps ArrowRight from last to first', () => {
    expect(getNextTabIndex(2, 'ArrowRight', 3)).toBe(0)
  })

  it('wraps ArrowLeft from first to last', () => {
    expect(getNextTabIndex(0, 'ArrowLeft', 3)).toBe(2)
  })

  it('moves within range', () => {
    expect(getNextTabIndex(0, 'ArrowRight', 3)).toBe(1)
    expect(getNextTabIndex(2, 'ArrowLeft', 3)).toBe(1)
  })

  it('Home jumps to first, End jumps to last', () => {
    expect(getNextTabIndex(2, 'Home', 3)).toBe(0)
    expect(getNextTabIndex(0, 'End', 3)).toBe(2)
  })

  it('returns current for unhandled keys', () => {
    expect(getNextTabIndex(1, 'Enter', 3)).toBe(1)
  })

  it('returns current for empty tab list', () => {
    expect(getNextTabIndex(0, 'ArrowRight', 0)).toBe(0)
  })
})
