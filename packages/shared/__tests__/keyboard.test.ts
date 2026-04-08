import { describe, it, expect, vi } from 'vitest'
import { Keys, createKeyboardHandler } from '../src/keyboard.js'

describe('Keys', () => {
  it('has standard key constants', () => {
    expect(Keys.Enter).toBe('Enter')
    expect(Keys.Space).toBe(' ')
    expect(Keys.Escape).toBe('Escape')
    expect(Keys.ArrowDown).toBe('ArrowDown')
  })
})

describe('createKeyboardHandler', () => {
  it('calls matching handler', () => {
    const enterFn = vi.fn()
    const handler = createKeyboardHandler({ [Keys.Enter]: enterFn })
    handler({ key: 'Enter' } as KeyboardEvent)
    expect(enterFn).toHaveBeenCalled()
  })

  it('ignores unmatched keys', () => {
    const enterFn = vi.fn()
    const handler = createKeyboardHandler({ [Keys.Enter]: enterFn })
    handler({ key: 'Escape' } as KeyboardEvent)
    expect(enterFn).not.toHaveBeenCalled()
  })

  it('multiple handlers: only matching fires', () => {
    const enterFn = vi.fn()
    const escapeFn = vi.fn()
    const spaceFn = vi.fn()
    const handler = createKeyboardHandler({
      [Keys.Enter]: enterFn,
      [Keys.Escape]: escapeFn,
      [Keys.Space]: spaceFn,
    })
    handler({ key: 'Escape' } as KeyboardEvent)
    expect(enterFn).not.toHaveBeenCalled()
    expect(escapeFn).toHaveBeenCalledTimes(1)
    expect(spaceFn).not.toHaveBeenCalled()
  })
})

describe('Keys - completeness', () => {
  it('all keys are unique strings', () => {
    const values = Object.values(Keys)
    expect(values.length).toBeGreaterThan(0)
    // All values are strings
    for (const v of values) {
      expect(typeof v).toBe('string')
    }
    // All values are unique
    const unique = new Set(values)
    expect(unique.size).toBe(values.length)
  })
})
