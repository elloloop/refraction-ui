import { describe, it, expect } from 'vitest'
import { uuidv4, isUuidV4, UUID_V4_RE } from '../src/uuid.js'

describe('uuidv4', () => {
  it('produces an RFC 4122 v4 shaped string', () => {
    const id = uuidv4()
    expect(id).toMatch(UUID_V4_RE)
  })

  it('sets the version nibble to 4', () => {
    for (let i = 0; i < 50; i++) {
      expect(uuidv4()[14]).toBe('4')
    }
  })

  it('sets the variant nibble to 8/9/a/b', () => {
    for (let i = 0; i < 50; i++) {
      expect('89ab').toContain(uuidv4()[19])
    }
  })

  it('is collision-free across many draws', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 5000; i++) seen.add(uuidv4())
    expect(seen.size).toBe(5000)
  })
})

describe('isUuidV4', () => {
  it('accepts valid v4 uuids', () => {
    expect(isUuidV4(uuidv4())).toBe(true)
  })

  it('rejects non-uuid strings and non-strings', () => {
    expect(isUuidV4('not-a-uuid')).toBe(false)
    expect(isUuidV4('')).toBe(false)
    expect(isUuidV4(undefined)).toBe(false)
    expect(isUuidV4(123)).toBe(false)
    // v1-style (version nibble 1) must be rejected
    expect(isUuidV4('00000000-0000-1000-8000-000000000000')).toBe(false)
  })
})
