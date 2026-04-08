import { describe, it, expect } from 'vitest'
import { cn } from '../src/cn.js'

describe('cn', () => {
  it('joins string classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters falsy values', () => {
    expect(cn('foo', false, null, undefined, '', 'bar')).toBe('foo bar')
  })

  it('handles conditional objects', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })

  it('handles nested arrays', () => {
    expect(cn('a', ['b', 'c'])).toBe('a b c')
  })

  it('handles numbers', () => {
    expect(cn('a', 0, 1)).toBe('a 1')
  })

  it('returns empty string for no args', () => {
    expect(cn()).toBe('')
  })

  it('handles deeply nested arrays', () => {
    expect(cn('a', [['b', ['c']]])).toBe('a b c')
  })

  it('object with all false values returns empty', () => {
    expect(cn({ a: false, b: false, c: false })).toBe('')
  })

  it('handles mixed objects and strings', () => {
    const result = cn('base', { active: true }, 'extra', { hidden: false })
    expect(result).toBe('base active extra')
  })
})
