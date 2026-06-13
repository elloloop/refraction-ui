import { describe, it, expect } from 'vitest'
import { getInitials, createVideoTile } from '../src/index.js'

describe('getInitials', () => {
  it('extracts two initials from a full name', () => {
    expect(getInitials('Maya Goldberg')).toBe('MG')
  })

  it('extracts a single initial from a single-word name', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('uppercases the initials', () => {
    expect(getInitials('john doe')).toBe('JD')
  })

  it('takes only the first two words when more are given', () => {
    expect(getInitials('Mary Anne Smith')).toBe('MA')
  })

  it('handles leading/trailing whitespace', () => {
    expect(getInitials('  Bob  ')).toBe('B')
  })
})

describe('createVideoTile', () => {
  it('defaults speaking and pinned to false', () => {
    const { dataAttributes, ariaProps } = createVideoTile()
    expect(dataAttributes['data-speaking']).toBe('false')
    expect(dataAttributes['data-pinned']).toBe('false')
    expect(ariaProps.role).toBe('group')
  })

  it('sets data-speaking to true when speaking', () => {
    const { dataAttributes } = createVideoTile({ speaking: true })
    expect(dataAttributes['data-speaking']).toBe('true')
  })

  it('sets data-pinned to true when pinned', () => {
    const { dataAttributes } = createVideoTile({ pinned: true })
    expect(dataAttributes['data-pinned']).toBe('true')
  })

  it('both flags can be true simultaneously', () => {
    const { dataAttributes } = createVideoTile({ speaking: true, pinned: true })
    expect(dataAttributes['data-speaking']).toBe('true')
    expect(dataAttributes['data-pinned']).toBe('true')
  })
})
