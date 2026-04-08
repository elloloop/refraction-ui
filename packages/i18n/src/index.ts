// Languages
export type { Language } from './languages.js'
export {
  LANGUAGES,
  getLanguage,
  getSupportedLanguages,
  getLanguagesByGroup,
  getLanguageName,
  isRTL,
  getTtsLang,
} from './languages.js'

// Countries
export type { Country } from './countries.js'
export {
  COUNTRIES,
  getCountry,
  getCountryFlag,
  getCountryName,
  getDefaultLanguagesForCountry,
} from './countries.js'

// Region detection
export {
  TIMEZONE_TO_COUNTRY,
  LOCALE_TO_COUNTRY,
  detectCountry,
  detectLanguage,
} from './detect-region.js'

// Voice registry
export type { VoiceOption } from './voice-registry.js'
export {
  VOICES,
  getVoicesForLanguage,
  getBestVoice,
  getVoicesByProvider,
} from './voice-registry.js'

// Locale utilities
export {
  LOCALE_DISPLAY_NAMES,
  getLocaleDisplayName,
  getStoredLocale,
  setStoredLocale,
  getLocalizedValue,
} from './locale-utils.js'
