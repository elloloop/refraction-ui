import { describe, it, expect } from 'vitest'
import { controlTone, createCallControls } from '../src/index.js'

describe('controlTone', () => {
  it('returns destructive for leave', () => {
    expect(controlTone('leave', undefined)).toBe('destructive')
    expect(controlTone('Leave', undefined)).toBe('destructive')
  })

  it('returns destructive for end', () => {
    expect(controlTone('end', undefined)).toBe('destructive')
    expect(controlTone('End', 'on')).toBe('destructive')
  })

  it('returns destructive when state is off (muted control)', () => {
    expect(controlTone('mic', 'off')).toBe('destructive')
    expect(controlTone('camera', 'off')).toBe('destructive')
  })

  it('returns active when state is on', () => {
    expect(controlTone('mic', 'on')).toBe('active')
    expect(controlTone('screen-share', 'on')).toBe('active')
  })

  it('returns default for neutral controls without state', () => {
    expect(controlTone('more', undefined)).toBe('default')
    expect(controlTone('react', undefined)).toBe('default')
  })
})

describe('createCallControls', () => {
  it('exposes toolbar role', () => {
    const { ariaProps } = createCallControls()
    expect(ariaProps.role).toBe('toolbar')
  })

  it('exposes aria-label "Call controls"', () => {
    const { ariaProps } = createCallControls()
    expect(ariaProps['aria-label']).toBe('Call controls')
  })

  it('returns data-component attribute', () => {
    const { dataAttributes } = createCallControls()
    expect(dataAttributes['data-component']).toBe('call-controls')
  })
})
