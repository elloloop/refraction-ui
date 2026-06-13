import { describe, it, expect } from 'vitest'
import { getInitials, orbColumns, createAudioRoom } from '../src/index.js'

describe('getInitials', () => {
  it('returns single initial for a single-word name', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('returns first + last initials for multi-word names', () => {
    expect(getInitials('Bob Smith')).toBe('BS')
    expect(getInitials('Jane Doe')).toBe('JD')
  })

  it('uppercases the result', () => {
    expect(getInitials('alice bob')).toBe('AB')
  })

  it('handles extra whitespace', () => {
    expect(getInitials('  Carol  ')).toBe('C')
  })

  it('returns empty string for blank input', () => {
    expect(getInitials('')).toBe('')
    expect(getInitials('   ')).toBe('')
  })
})

describe('orbColumns', () => {
  it('returns 1 for a single participant', () => {
    expect(orbColumns(1)).toBe(1)
    expect(orbColumns(0)).toBe(1)
  })

  it('returns 2 for 2–4 participants', () => {
    expect(orbColumns(2)).toBe(2)
    expect(orbColumns(4)).toBe(2)
  })

  it('returns 3 for 5–9 participants', () => {
    expect(orbColumns(5)).toBe(3)
    expect(orbColumns(9)).toBe(3)
  })

  it('returns 4 for 10+ participants', () => {
    expect(orbColumns(10)).toBe(4)
    expect(orbColumns(20)).toBe(4)
  })
})

describe('createAudioRoom', () => {
  it('returns role="group" aria prop', () => {
    const { ariaProps } = createAudioRoom()
    expect(ariaProps.role).toBe('group')
  })

  it('returns a data-component attribute', () => {
    const { dataAttributes } = createAudioRoom()
    expect(dataAttributes['data-component']).toBe('audio-room')
  })
})
