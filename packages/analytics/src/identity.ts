import type { AnalyticsStorage, IdentityConfig } from './types.js'
import { resolveStorage } from './storage.js'
import { uuidv4, isUuidV4 } from './uuid.js'

const DEFAULT_KEY = 'rfx:analytics:anon'

/**
 * Identity engine.
 *
 * - `anonymousId`: persistent, non-PII, resettable UUIDv4 stored cross-tab.
 * - `userId`: opaque, app-supplied; never persisted by the library (the app
 *   owns the user record) — kept only in memory for the active page.
 * - `alias`: records a previous→current stitch for the wire envelope.
 */
export function createIdentity(config?: IdentityConfig) {
  const storage: AnalyticsStorage = resolveStorage(config?.storage)
  const key = config?.storageKey ?? DEFAULT_KEY

  let userId: string | undefined

  function loadOrMintAnon(): string {
    const existing = storage.get(key)
    if (isUuidV4(existing)) return existing as string
    const fresh = uuidv4()
    storage.set(key, fresh)
    return fresh
  }

  let anonymousId = loadOrMintAnon()

  return {
    anonymousId(): string {
      return anonymousId
    },
    userId(): string | undefined {
      return userId
    },
    /** identify(): bind an opaque app user id (no validation, no persistence). */
    setUserId(id: string): void {
      userId = id
    },
    /**
     * alias(): returns the stitch pair for the envelope. `previousId`
     * defaults to the current user or anonymous id.
     */
    alias(nextUserId: string, previousId?: string): { userId: string; previousId: string } {
      const prev = previousId ?? userId ?? anonymousId
      userId = nextUserId
      return { userId: nextUserId, previousId: prev }
    },
    /**
     * reset(): privacy-safe logout. Drops the user binding and mints a brand
     * new anonymousId so the next visitor is not stitched to the old one.
     */
    reset(): string {
      userId = undefined
      anonymousId = uuidv4()
      storage.set(key, anonymousId)
      return anonymousId
    },
  }
}

export type Identity = ReturnType<typeof createIdentity>
