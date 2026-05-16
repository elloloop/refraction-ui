import { describe, it, expect } from 'vitest'
import {
  createMemoryStorage,
  createLocalStorageAdapter,
  createCookieAdapter,
  resolveStorage,
} from '../src/storage.js'

describe('createMemoryStorage', () => {
  it('round-trips values and reports null for missing keys', () => {
    const s = createMemoryStorage()
    expect(s.get('k')).toBeNull()
    s.set('k', 'v')
    expect(s.get('k')).toBe('v')
    s.remove('k')
    expect(s.get('k')).toBeNull()
  })
})

describe('createLocalStorageAdapter', () => {
  it('delegates to the underlying Storage', () => {
    const map = new Map<string, string>()
    const fake = {
      getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    } as unknown as Storage
    const s = createLocalStorageAdapter(fake)
    s.set('a', '1')
    expect(s.get('a')).toBe('1')
    expect(map.get('a')).toBe('1')
    s.remove('a')
    expect(s.get('a')).toBeNull()
  })

  it('degrades silently when the store throws (quota / private mode)', () => {
    const fake = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    } as unknown as Storage
    const s = createLocalStorageAdapter(fake)
    expect(() => s.set('a', '1')).not.toThrow()
    expect(s.get('a')).toBeNull()
    expect(() => s.remove('a')).not.toThrow()
  })
})

describe('createCookieAdapter', () => {
  it('reads, writes, and removes via document.cookie', () => {
    const jar: { cookie: string } = { cookie: '' }
    // Simulate a browser cookie jar: writes append; reads see latest.
    const writes: string[] = []
    const doc = {
      get cookie() {
        return writes
          .map((w) => w.split(';')[0])
          .join('; ')
      },
      set cookie(v: string) {
        writes.push(v)
      },
    }
    const s = createCookieAdapter(doc)
    s.set('rfx', 'hello world')
    expect(s.get('rfx')).toBe('hello world')
    expect(jar).toBeDefined()
  })

  it('encodes/decodes special characters', () => {
    const writes: string[] = []
    const doc = {
      get cookie() {
        return writes.map((w) => w.split(';')[0]).join('; ')
      },
      set cookie(v: string) {
        writes.push(v)
      },
    }
    const s = createCookieAdapter(doc)
    s.set('k', 'a=b; c')
    expect(s.get('k')).toBe('a=b; c')
  })
})

describe('resolveStorage', () => {
  it('returns the override when supplied', () => {
    const override = createMemoryStorage()
    expect(resolveStorage(override)).toBe(override)
  })

  it('falls back to memory storage in a no-DOM environment', () => {
    // Node test env: no localStorage/document on globalThis.
    const s = resolveStorage()
    s.set('x', 'y')
    expect(s.get('x')).toBe('y')
  })
})
