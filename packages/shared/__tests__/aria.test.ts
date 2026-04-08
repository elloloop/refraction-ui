import { describe, it, expect, beforeEach } from 'vitest'
import { mergeAriaProps, generateId, resetIdCounter } from '../src/aria.js'

describe('mergeAriaProps', () => {
  it('merges multiple prop objects', () => {
    const result = mergeAriaProps(
      { 'aria-label': 'hello' },
      { 'aria-expanded': true },
    )
    expect(result).toEqual({ 'aria-label': 'hello', 'aria-expanded': true })
  })

  it('later values override earlier ones', () => {
    const result = mergeAriaProps(
      { 'aria-label': 'first' },
      { 'aria-label': 'second' },
    )
    expect(result).toEqual({ 'aria-label': 'second' })
  })

  it('skips undefined values', () => {
    const result = mergeAriaProps(
      { 'aria-label': 'keep' },
      { 'aria-label': undefined },
    )
    expect(result).toEqual({ 'aria-label': 'keep' })
  })
})

describe('generateId', () => {
  beforeEach(() => resetIdCounter())

  it('generates unique ids', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })

  it('uses prefix', () => {
    const id = generateId('btn')
    expect(id).toMatch(/^btn-/)
  })

  it('sequential ids are unique', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(100)
  })
})

describe('mergeAriaProps - edge cases', () => {
  it('handles empty objects', () => {
    const result = mergeAriaProps({}, {})
    expect(result).toEqual({})
  })

  it('merges three or more objects', () => {
    const result = mergeAriaProps(
      { 'aria-label': 'first' },
      { 'aria-expanded': true },
      { role: 'button' },
      { 'aria-label': 'final' },
    )
    expect(result).toEqual({ 'aria-label': 'final', 'aria-expanded': true, role: 'button' })
  })
})
