import { describe, it, expect } from 'vitest'
import {
  CURSOR_COLORS,
  assignCursorColor,
  createLiveCursors,
} from '../src/index.js'

describe('CURSOR_COLORS', () => {
  it('is non-empty', () => {
    expect(CURSOR_COLORS.length).toBeGreaterThan(0)
  })

  it('contains valid hex color strings', () => {
    for (const color of CURSOR_COLORS) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

describe('assignCursorColor', () => {
  it('returns a color within the palette', () => {
    expect(CURSOR_COLORS).toContain(assignCursorColor('user-1'))
    expect(CURSOR_COLORS).toContain(assignCursorColor('user-2'))
  })

  it('is deterministic — same id always returns same color', () => {
    const a = assignCursorColor('maya')
    const b = assignCursorColor('maya')
    expect(a).toBe(b)
  })

  it('varies by id (different ids should not all map to one color)', () => {
    const ids = ['alice', 'bob', 'charlie', 'diana', 'evan', 'fiona', 'george', 'hannah']
    const colors = ids.map((id) => assignCursorColor(id))
    const unique = new Set(colors)
    // With 8 ids and 8 palette entries we expect more than 1 distinct color
    expect(unique.size).toBeGreaterThan(1)
  })

  it('uses index when provided (index % palette length)', () => {
    expect(assignCursorColor('any', 0)).toBe(CURSOR_COLORS[0])
    expect(assignCursorColor('any', 3)).toBe(CURSOR_COLORS[3])
    expect(assignCursorColor('any', CURSOR_COLORS.length)).toBe(CURSOR_COLORS[0])
  })

  it('index-based colors vary by index', () => {
    const c0 = assignCursorColor('x', 0)
    const c1 = assignCursorColor('x', 1)
    expect(c0).not.toBe(c1)
  })
})

describe('createLiveCursors', () => {
  it('exposes group role', () => {
    const { ariaProps } = createLiveCursors()
    expect(ariaProps.role).toBe('group')
  })

  it('sets aria-hidden true (decorative overlay)', () => {
    const { ariaProps } = createLiveCursors()
    expect(ariaProps['aria-hidden']).toBe(true)
  })

  it('sets aria-label for semantic correctness', () => {
    const { ariaProps } = createLiveCursors()
    expect(ariaProps['aria-label']).toBe('Collaborators')
  })

  it('emits a data-live-cursors attribute', () => {
    const { dataAttributes } = createLiveCursors()
    expect('data-live-cursors' in dataAttributes).toBe(true)
  })
})
