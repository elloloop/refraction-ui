import type { AnalyticsStorage } from './types.js'

/**
 * Storage adapters.
 *
 * Order of preference for the cross-tab default: localStorage → cookie →
 * in-memory. The package is environment-agnostic; consumers can inject any
 * `AnalyticsStorage` (e.g. an RN AsyncStorage shim) via config.
 */

/** Volatile per-process store (SSR / Node / no-DOM fallback). */
export function createMemoryStorage(): AnalyticsStorage {
  const map = new Map<string, string>()
  return {
    get: (k) => (map.has(k) ? (map.get(k) as string) : null),
    set: (k, v) => {
      map.set(k, v)
    },
    remove: (k) => {
      map.delete(k)
    },
  }
}

/** `window.localStorage` adapter (cross-tab via the storage event). */
export function createLocalStorageAdapter(
  ls: Storage,
): AnalyticsStorage {
  return {
    get: (k) => {
      try {
        return ls.getItem(k)
      } catch {
        return null
      }
    },
    set: (k, v) => {
      try {
        ls.setItem(k, v)
      } catch {
        /* quota / disabled — degrade silently */
      }
    },
    remove: (k) => {
      try {
        ls.removeItem(k)
      } catch {
        /* ignore */
      }
    },
  }
}

interface CookieDoc {
  cookie: string
}

/** `document.cookie` adapter (cross-tab + cross-subdomain capable). */
export function createCookieAdapter(
  doc: CookieDoc,
  maxAgeSeconds = 60 * 60 * 24 * 365,
): AnalyticsStorage {
  const read = (k: string): string | null => {
    const target = encodeURIComponent(k) + '='
    const parts = doc.cookie ? doc.cookie.split(';') : []
    for (const part of parts) {
      const c = part.trim()
      if (c.startsWith(target)) {
        return decodeURIComponent(c.slice(target.length))
      }
    }
    return null
  }
  return {
    get: read,
    set: (k, v) => {
      doc.cookie = `${encodeURIComponent(k)}=${encodeURIComponent(
        v,
      )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`
    },
    remove: (k) => {
      doc.cookie = `${encodeURIComponent(k)}=; path=/; max-age=0; SameSite=Lax`
    },
  }
}

/**
 * Resolve the default storage for the current environment. A caller-supplied
 * storage always wins. Browser → localStorage (falls back to cookie if
 * localStorage throws), otherwise in-memory.
 */
export function resolveStorage(
  override?: AnalyticsStorage,
): AnalyticsStorage {
  if (override) return override

  const g = globalThis as unknown as {
    localStorage?: Storage
    document?: CookieDoc
  }

  if (g.localStorage) {
    try {
      // Probe — Safari private mode throws on setItem.
      const probe = '__rfx_a_probe__'
      g.localStorage.setItem(probe, '1')
      g.localStorage.removeItem(probe)
      return createLocalStorageAdapter(g.localStorage)
    } catch {
      /* fall through to cookie */
    }
  }

  if (g.document && typeof g.document.cookie === 'string') {
    return createCookieAdapter(g.document)
  }

  return createMemoryStorage()
}
