import { describe, expect, it, vi } from 'vitest'
import type { EngineAdapter } from '../src/engine-adapter'

describe('EngineAdapter contract', () => {
  it('should define a standard headless UI adapter interface', () => {
    // This is essentially a type/contract test to ensure the interface supports
    // the generic shapes required for swapping implementations.
    const mockAdapter: EngineAdapter<{ open: boolean }, { toggle: () => void }> = {
      name: 'test-adapter',
      state: { open: false },
      methods: { toggle: vi.fn() },
      getProps: (elementName, props) => {
        if (elementName === 'trigger') {
          return { 'aria-expanded': false, ...props }
        }
        return props || {}
      },
    }

    expect(mockAdapter.name).toBe('test-adapter')
    expect(mockAdapter.state.open).toBe(false)
    expect(mockAdapter.getProps('trigger', { id: 'trigger-1' })).toEqual({
      'aria-expanded': false,
      id: 'trigger-1',
    })
  })
})
