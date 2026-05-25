import type {
  CookieCategory,
  CookieConsentAPI,
  CookieConsentConfig,
  CookieConsentState,
  ConsentPreferences,
} from './types.js'

const DEFAULT_KEY = 'rfr-cookie-consent'

/** Popular default GDPR-style categories. */
export const DEFAULT_CATEGORIES: CookieCategory[] = [
  { id: 'necessary', label: 'Strictly necessary', description: 'Required for the site to function. Always on.', required: true },
  { id: 'preferences', label: 'Preferences', description: 'Remembers your settings and choices.' },
  { id: 'analytics', label: 'Analytics', description: 'Helps us understand how the site is used.' },
  { id: 'marketing', label: 'Marketing', description: 'Used to personalize ads and measure campaigns.' },
]

interface Persisted {
  version?: string
  preferences: ConsentPreferences
}

/** Preferences with only required categories granted. */
function baseline(categories: CookieCategory[]): ConsentPreferences {
  const p: ConsentPreferences = {}
  for (const c of categories) p[c.id] = !!c.required
  return p
}

/**
 * createCookieConsent — headless consent store. Reads any persisted choice on
 * init (re-prompting if the `version` changed), and exposes accept/reject/save
 * plus banner visibility. Persistence is via the optional storage adapter.
 */
export function createCookieConsent(config: CookieConsentConfig = {}): CookieConsentAPI {
  const categories = config.categories ?? DEFAULT_CATEGORIES
  const storage = config.storage
  const key = config.storageKey ?? DEFAULT_KEY
  const version = config.version

  let preferences = baseline(categories)
  let consented = false

  // Hydrate from storage.
  const raw = storage?.get(key) ?? null
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Persisted
      if ((parsed.version ?? undefined) === version) {
        preferences = { ...baseline(categories), ...parsed.preferences }
        // required stay on regardless of stored value
        for (const c of categories) if (c.required) preferences[c.id] = true
        consented = true
      }
    } catch {
      // ignore corrupt storage
    }
  }

  let open = !consented

  const listeners = new Set<() => void>()
  let snapshot = build()

  function build(): CookieConsentState {
    return { consented, preferences: { ...preferences }, open, categories }
  }
  function emit(): void {
    snapshot = build()
    for (const l of listeners) l()
  }

  function persist(): void {
    storage?.set(key, JSON.stringify({ version, preferences } satisfies Persisted))
    config.onChange?.({ ...preferences })
  }

  function save(next: ConsentPreferences): void {
    const merged = { ...baseline(categories), ...next }
    for (const c of categories) if (c.required) merged[c.id] = true
    preferences = merged
    consented = true
    open = false
    persist()
    emit()
  }

  return {
    getState() {
      return snapshot
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    acceptAll() {
      const all: ConsentPreferences = {}
      for (const c of categories) all[c.id] = true
      save(all)
    },
    rejectAll() {
      save(baseline(categories))
    },
    savePreferences(prefs) {
      save(prefs)
    },
    setPreference(id, value) {
      const cat = categories.find((c) => c.id === id)
      if (!cat || cat.required) return
      preferences = { ...preferences, [id]: value }
      emit()
    },
    reset() {
      storage?.remove(key)
      preferences = baseline(categories)
      consented = false
      open = true
      emit()
    },
    openSettings() {
      if (open) return
      open = true
      emit()
    },
    close() {
      if (!open) return
      open = false
      emit()
    },
  }
}
