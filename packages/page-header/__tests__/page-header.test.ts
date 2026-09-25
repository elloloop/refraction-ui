import { describe, it, expect } from 'vitest'
import { createPageHeader } from '../src/index.js'

describe('createPageHeader', () => {
  it('marks the slot and that no actions are present by default', () => {
    expect(createPageHeader().dataAttributes).toEqual({
      'data-slot': 'page-header',
      'data-has-actions': 'false',
    })
  })

  it('flags when actions are present', () => {
    expect(createPageHeader({ hasActions: true }).dataAttributes['data-has-actions']).toBe('true')
  })
})
