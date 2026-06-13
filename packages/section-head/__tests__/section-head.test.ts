import { describe, it, expect } from 'vitest'
import { createSectionHead } from '../src/index.js'

describe('createSectionHead', () => {
  it('defaults to center align', () => {
    const { dataAttributes } = createSectionHead()
    expect(dataAttributes['data-align']).toBe('center')
  })

  it('emits data-align=center when align is center', () => {
    const { dataAttributes } = createSectionHead({ align: 'center' })
    expect(dataAttributes['data-align']).toBe('center')
  })

  it('emits data-align=left when align is left', () => {
    const { dataAttributes } = createSectionHead({ align: 'left' })
    expect(dataAttributes['data-align']).toBe('left')
  })
})
