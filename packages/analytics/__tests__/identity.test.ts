import { describe, it, expect } from 'vitest'
import { createIdentity } from '../src/identity.js'
import { createMemoryStorage } from '../src/storage.js'
import { isUuidV4 } from '../src/uuid.js'

describe('createIdentity — anonymousId', () => {
  it('mints a UUIDv4 anonymousId on first use', () => {
    const id = createIdentity({ storage: createMemoryStorage() })
    expect(isUuidV4(id.anonymousId())).toBe(true)
  })

  it('persists the anonymousId across instances (cross-tab)', () => {
    const storage = createMemoryStorage()
    const a = createIdentity({ storage })
    const b = createIdentity({ storage })
    expect(b.anonymousId()).toBe(a.anonymousId())
  })

  it('ignores a corrupt persisted value and re-mints', () => {
    const storage = createMemoryStorage()
    storage.set('rfx:analytics:anon', 'garbage-not-a-uuid')
    const id = createIdentity({ storage })
    expect(isUuidV4(id.anonymousId())).toBe(true)
  })
})

describe('createIdentity — userId (opaque, app-supplied)', () => {
  it('is undefined until identify()', () => {
    const id = createIdentity({ storage: createMemoryStorage() })
    expect(id.userId()).toBeUndefined()
  })

  it('stores the opaque user id verbatim and does not persist it', () => {
    const storage = createMemoryStorage()
    const id = createIdentity({ storage })
    id.setUserId('user_42')
    expect(id.userId()).toBe('user_42')
    // userId must NOT be written to durable storage (app owns the record).
    expect(storage.get('rfx:analytics:anon')).not.toContain('user_42')
  })
})

describe('createIdentity — alias stitching', () => {
  it('stitches anonymous → user when no prior user', () => {
    const id = createIdentity({ storage: createMemoryStorage() })
    const anon = id.anonymousId()
    const stitch = id.alias('user_1')
    expect(stitch.previousId).toBe(anon)
    expect(stitch.userId).toBe('user_1')
    expect(id.userId()).toBe('user_1')
  })

  it('stitches old user → new user', () => {
    const id = createIdentity({ storage: createMemoryStorage() })
    id.setUserId('old')
    const stitch = id.alias('new')
    expect(stitch.previousId).toBe('old')
    expect(stitch.userId).toBe('new')
  })

  it('honours an explicit previousId', () => {
    const id = createIdentity({ storage: createMemoryStorage() })
    const stitch = id.alias('new', 'explicit-prev')
    expect(stitch.previousId).toBe('explicit-prev')
  })
})

describe('createIdentity — reset (privacy-safe logout)', () => {
  it('mints a fresh anonymousId and clears the user binding', () => {
    const storage = createMemoryStorage()
    const id = createIdentity({ storage })
    const before = id.anonymousId()
    id.setUserId('user_1')
    const fresh = id.reset()
    expect(fresh).not.toBe(before)
    expect(id.anonymousId()).toBe(fresh)
    expect(id.userId()).toBeUndefined()
    // The new id is what is now persisted (no stitch to the old visitor).
    expect(storage.get('rfx:analytics:anon')).toBe(fresh)
  })
})
