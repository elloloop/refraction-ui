import { describe, it, expect } from 'vitest'
import {
  STICKY_NOTE_COLORS,
  nextStickyColor,
  createStickyNote,
} from '../src/index.js'

describe('STICKY_NOTE_COLORS', () => {
  it('contains exactly 6 colors in the canonical order', () => {
    expect(STICKY_NOTE_COLORS).toHaveLength(6)
    expect(STICKY_NOTE_COLORS).toEqual([
      'yellow',
      'pink',
      'blue',
      'green',
      'purple',
      'orange',
    ])
  })
})

describe('nextStickyColor', () => {
  it('advances to the next color', () => {
    expect(nextStickyColor('yellow')).toBe('pink')
    expect(nextStickyColor('pink')).toBe('blue')
    expect(nextStickyColor('blue')).toBe('green')
    expect(nextStickyColor('green')).toBe('purple')
    expect(nextStickyColor('purple')).toBe('orange')
  })

  it('wraps from the last color back to the first', () => {
    expect(nextStickyColor('orange')).toBe('yellow')
  })
})

describe('createStickyNote', () => {
  it('returns role=group', () => {
    const { ariaProps } = createStickyNote({ color: 'yellow' })
    expect(ariaProps.role).toBe('group')
  })

  it('sets data-color to the given color', () => {
    const { dataAttributes } = createStickyNote({ color: 'blue' })
    expect(dataAttributes['data-color']).toBe('blue')
  })

  it('reflects each color in data-color', () => {
    for (const color of ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'] as const) {
      expect(createStickyNote({ color }).dataAttributes['data-color']).toBe(color)
    }
  })
})
