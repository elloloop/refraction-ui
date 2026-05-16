import { describe, it, expect } from 'vitest'
import { redact } from '../src/redact.js'

describe('redact', () => {
  it('returns the same reference when no keys configured', () => {
    const input = { a: 1 }
    expect(redact(input, [])).toBe(input)
  })

  it('replaces matching top-level keys', () => {
    expect(redact({ user: 'a', password: 'p' }, ['password'])).toEqual({
      user: 'a',
      password: '[REDACTED]',
    })
  })

  it('is case-insensitive', () => {
    expect(redact({ Token: 'x' }, ['token'])).toEqual({ Token: '[REDACTED]' })
  })

  it('redacts nested objects and arrays', () => {
    const out = redact(
      { list: [{ secret: 1, ok: 2 }], deep: { inner: { secret: 3 } } },
      ['secret'],
    )
    expect(out).toEqual({
      list: [{ secret: '[REDACTED]', ok: 2 }],
      deep: { inner: { secret: '[REDACTED]' } },
    })
  })

  it('does not mutate the input', () => {
    const input = { password: 'p', nested: { token: 't' } }
    const out = redact(input, ['password', 'token'])
    expect(input).toEqual({ password: 'p', nested: { token: 't' } })
    expect(out).not.toBe(input)
  })

  it('guards against circular references', () => {
    const input: Record<string, unknown> = { a: 1 }
    input.self = input
    const out = redact(input, ['nope']) as Record<string, unknown>
    expect(out.a).toBe(1)
    expect(out.self).toBe('[Circular]')
  })

  it('passes primitives through untouched', () => {
    expect(redact({ n: 1, s: 'x', b: true, z: null }, ['secret'])).toEqual({
      n: 1,
      s: 'x',
      b: true,
      z: null,
    })
  })
})
