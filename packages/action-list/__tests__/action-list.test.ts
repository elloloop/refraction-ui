import { describe, it, expect } from 'vitest'
import { createActionListItem, actionListItemVariants } from '../src/index.js'

describe('createActionListItem', () => {
  it('defaults to an enabled, default-density row', () => {
    const api = createActionListItem()
    expect(api.dataAttributes).toEqual({
      'data-slot': 'action-list-item',
      'data-density': 'default',
    })
    expect(api.ariaProps).toEqual({})
  })

  it('marks disabled rows and carries the density', () => {
    const api = createActionListItem({ disabled: true, density: 'compact' })
    expect(api.dataAttributes['data-disabled']).toBe('')
    expect(api.dataAttributes['data-density']).toBe('compact')
    expect(api.ariaProps['aria-disabled']).toBe(true)
  })
})

describe('actionListItemVariants', () => {
  it('pads by density', () => {
    expect(actionListItemVariants()).toContain('py-3')
    expect(actionListItemVariants({ density: 'compact' })).toContain('py-2')
  })
})
