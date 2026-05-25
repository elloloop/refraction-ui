import * as React from 'react'
import {
  createCookieConsent,
  type CookieConsentAPI,
  type CookieConsentConfig,
  type CookieConsentState,
  type CookieStorage,
} from '@refraction-ui/cookie-consent'

/** Default browser persistence (SSR-safe — guards localStorage access). */
const localStorageAdapter: CookieStorage = {
  get(k) {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null
    } catch {
      return null
    }
  },
  set(k, v) {
    try {
      localStorage?.setItem(k, v)
    } catch {
      /* ignore */
    }
  },
  remove(k) {
    try {
      localStorage?.removeItem(k)
    } catch {
      /* ignore */
    }
  },
}

export interface UseCookieConsentResult {
  state: CookieConsentState
  api: CookieConsentAPI
  acceptAll: CookieConsentAPI['acceptAll']
  rejectAll: CookieConsentAPI['rejectAll']
  savePreferences: CookieConsentAPI['savePreferences']
  setPreference: CookieConsentAPI['setPreference']
  reset: CookieConsentAPI['reset']
  openSettings: CookieConsentAPI['openSettings']
  close: CookieConsentAPI['close']
}

/**
 * useCookieConsent — binds the headless cookie-consent store to React via
 * `useSyncExternalStore`, defaulting persistence to localStorage.
 */
export function useCookieConsent(config?: CookieConsentConfig): UseCookieConsentResult {
  const apiRef = React.useRef<CookieConsentAPI | null>(null)
  if (apiRef.current === null) {
    apiRef.current = createCookieConsent({ storage: localStorageAdapter, ...config })
  }
  const api = apiRef.current
  const state = React.useSyncExternalStore(api.subscribe, api.getState, api.getState)
  return {
    state,
    api,
    acceptAll: api.acceptAll,
    rejectAll: api.rejectAll,
    savePreferences: api.savePreferences,
    setPreference: api.setPreference,
    reset: api.reset,
    openSettings: api.openSettings,
    close: api.close,
  }
}
