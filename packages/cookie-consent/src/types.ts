/**
 * @refraction-ui/cookie-consent — headless cookie-consent store.
 *
 * Owns consent categories + the user's per-category opt-in and banner state.
 * Persistence is backend-agnostic via a {@link CookieStorage} adapter (the React
 * adapter defaults to localStorage); no DOM/cookie access in the core.
 */

/** A consent category the user can opt into. */
export interface CookieCategory {
  id: string
  label: string
  description?: string
  /** Required categories are always on and cannot be toggled off. */
  required?: boolean
}

/** Per-category opt-in map (categoryId → granted). */
export type ConsentPreferences = Record<string, boolean>

/** Persistence adapter — implement over localStorage, cookies, a backend, etc. */
export interface CookieStorage {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
}

/** Options for `createCookieConsent`. */
export interface CookieConsentConfig {
  /** Consent categories (default: necessary*, analytics, marketing, preferences) */
  categories?: CookieCategory[]
  /** Persistence adapter; omit for in-memory (non-persistent) */
  storage?: CookieStorage
  /** Storage key (default 'rfr-cookie-consent') */
  storageKey?: string
  /** Consent version — bump to re-prompt users after a policy change */
  version?: string
  /** Called whenever consent is saved, with the resolved preferences */
  onChange?: (preferences: ConsentPreferences) => void
}

/** Immutable store snapshot. */
export interface CookieConsentState {
  /** Whether the user has made a choice (false → show the banner) */
  consented: boolean
  /** Per-category opt-in */
  preferences: ConsentPreferences
  /** Banner/dialog visibility */
  open: boolean
  /** The configured categories */
  categories: CookieCategory[]
}

/** The framework-agnostic store. */
export interface CookieConsentAPI {
  getState(): CookieConsentState
  subscribe(listener: () => void): () => void
  /** Grant every category and persist */
  acceptAll(): void
  /** Grant only required categories and persist */
  rejectAll(): void
  /** Persist the given preferences (required categories are forced on) */
  savePreferences(preferences: ConsentPreferences): void
  /** Toggle a single (non-required) category in the working preferences */
  setPreference(id: string, value: boolean): void
  /** Clear stored consent and re-open the banner */
  reset(): void
  /** Open the banner/settings */
  openSettings(): void
  /** Close the banner without changing stored consent */
  close(): void
}
