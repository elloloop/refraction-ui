/**
 * Locale utilities for display names, storage, and localized value resolution.
 */

/** Display names for common locale codes (in their native language) */
export const LOCALE_DISPLAY_NAMES: Record<string, string> = {
  'en': 'English',
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'en-IN': 'English (India)',
  'hi': 'हिन्दी',
  'te': 'తెలుగు',
  'ta': 'தமிழ்',
  'ur': 'اردو',
  'pa': 'ਪੰਜਾਬੀ',
  'bn': 'বাংলা',
  'gu': 'ગુજરાતી',
  'mr': 'मराठी',
  'kn': 'ಕನ್ನಡ',
  'ml': 'മലയാളം',
  'fr': 'Français',
  'es': 'Español',
  'de': 'Deutsch',
  'it': 'Italiano',
  'pt': 'Português',
  'pt-BR': 'Português (Brasil)',
  'nl': 'Nederlands',
  'sv': 'Svenska',
  'da': 'Dansk',
  'no': 'Norsk',
  'fi': 'Suomi',
  'pl': 'Polski',
  'cs': 'Čeština',
  'ro': 'Română',
  'hu': 'Magyar',
  'bg': 'Български',
  'hr': 'Hrvatski',
  'sk': 'Slovenčina',
  'sl': 'Slovenščina',
  'sr': 'Srpski',
  'uk': 'Українська',
  'el': 'Ελληνικά',
  'ru': 'Русский',
  'ja': '日本語',
  'ko': '한국어',
  'zh': '中文',
  'zh-TW': '中文（繁體）',
  'ar': 'العربية',
  'he': 'עברית',
  'tr': 'Türkçe',
  'th': 'ไทย',
  'vi': 'Tiếng Việt',
  'id': 'Bahasa Indonesia',
  'ms': 'Bahasa Melayu',
}

const DEFAULT_STORAGE_KEY = 'refraction-ui-locale'

/**
 * Get the display name for a locale code.
 * Returns the code itself if not found in the display names map.
 */
export function getLocaleDisplayName(code: string): string {
  return LOCALE_DISPLAY_NAMES[code] ?? code
}

/**
 * Get the stored locale from localStorage (or compatible storage).
 * Returns null if not stored or localStorage is not available.
 */
export function getStoredLocale(storageKey?: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(storageKey ?? DEFAULT_STORAGE_KEY)
    }
  } catch {
    // localStorage may not be available
  }
  return null
}

/**
 * Store a locale code in localStorage (or compatible storage).
 * Does nothing if localStorage is not available.
 */
export function setStoredLocale(code: string, storageKey?: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey ?? DEFAULT_STORAGE_KEY, code)
    }
  } catch {
    // localStorage may not be available
  }
}

/**
 * Resolve a localized value from a record of locale -> value.
 * Tries exact locale, then base language code (for regional variants like 'en-US' -> 'en'),
 * then the fallback locale.
 */
export function getLocalizedValue<T>(
  localized: Record<string, T>,
  locale: string,
  fallbackLocale?: string,
): T | undefined {
  // 1. Exact match
  if (locale in localized) {
    return localized[locale]
  }

  // 2. Try base language code (e.g., 'en-US' -> 'en')
  const baseLang = locale.split('-')[0]
  if (baseLang !== locale && baseLang in localized) {
    return localized[baseLang]
  }

  // 3. Fallback locale
  if (fallbackLocale && fallbackLocale in localized) {
    return localized[fallbackLocale]
  }

  return undefined
}
