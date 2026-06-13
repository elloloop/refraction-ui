import { describe, it, expect } from 'vitest'
import { createMarqueeStrip } from '../src/index.js'

describe('createMarqueeStrip', () => {
  it('defaults to non-scrolling with group role', () => {
    const { ariaProps, dataAttributes } = createMarqueeStrip()
    expect(ariaProps.role).toBe('group')
    expect(dataAttributes['data-scroll']).toBe('false')
  })

  it('sets data-scroll to "true" when scroll is enabled', () => {
    const { dataAttributes } = createMarqueeStrip({ scroll: true })
    expect(dataAttributes['data-scroll']).toBe('true')
  })

  it('sets data-scroll to "false" when scroll is explicitly disabled', () => {
    const { dataAttributes } = createMarqueeStrip({ scroll: false })
    expect(dataAttributes['data-scroll']).toBe('false')
  })

  it('always returns group role regardless of scroll', () => {
    expect(createMarqueeStrip({ scroll: true }).ariaProps.role).toBe('group')
    expect(createMarqueeStrip({ scroll: false }).ariaProps.role).toBe('group')
  })
})
