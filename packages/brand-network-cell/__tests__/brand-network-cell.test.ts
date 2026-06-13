import { describe, it, expect } from 'vitest'
import { createBrandNetworkCell } from '../src/index.js'

describe('createBrandNetworkCell', () => {
  it('exposes group role', () => {
    const { ariaProps } = createBrandNetworkCell()
    expect(ariaProps.role).toBe('group')
  })

  it('emits data-current="false" by default', () => {
    const { dataAttributes } = createBrandNetworkCell()
    expect(dataAttributes['data-current']).toBe('false')
  })

  it('emits data-current="true" when current is true', () => {
    const { dataAttributes } = createBrandNetworkCell({ current: true })
    expect(dataAttributes['data-current']).toBe('true')
  })

  it('emits data-current="false" when current is explicitly false', () => {
    const { dataAttributes } = createBrandNetworkCell({ current: false })
    expect(dataAttributes['data-current']).toBe('false')
  })
})
