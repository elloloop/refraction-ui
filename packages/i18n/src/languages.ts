/**
 * Language type and registry for i18n support.
 */

export interface Language {
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  group?: string
}

export const LANGUAGES: Record<string, Language> = {
  // English variants
  'en':    { code: 'en',    name: 'English',                 nativeName: 'English',        direction: 'ltr', group: 'English' },
  'en-US': { code: 'en-US', name: 'English (US)',            nativeName: 'English (US)',   direction: 'ltr', group: 'English' },
  'en-GB': { code: 'en-GB', name: 'English (UK)',            nativeName: 'English (UK)',   direction: 'ltr', group: 'English' },
  'en-IN': { code: 'en-IN', name: 'English (India)',         nativeName: 'English (India)',direction: 'ltr', group: 'English' },

  // Indian languages
  'hi': { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी',    direction: 'ltr', group: 'Indian' },
  'te': { code: 'te', name: 'Telugu',     nativeName: 'తెలుగు',    direction: 'ltr', group: 'Indian' },
  'ta': { code: 'ta', name: 'Tamil',      nativeName: 'தமிழ்',     direction: 'ltr', group: 'Indian' },
  'ur': { code: 'ur', name: 'Urdu',       nativeName: 'اردو',      direction: 'rtl', group: 'Indian' },
  'pa': { code: 'pa', name: 'Punjabi',    nativeName: 'ਪੰਜਾਬੀ',    direction: 'ltr', group: 'Indian' },
  'bn': { code: 'bn', name: 'Bengali',    nativeName: 'বাংলা',     direction: 'ltr', group: 'Indian' },
  'gu': { code: 'gu', name: 'Gujarati',   nativeName: 'ગુજરાતી',   direction: 'ltr', group: 'Indian' },
  'mr': { code: 'mr', name: 'Marathi',    nativeName: 'मराठी',      direction: 'ltr', group: 'Indian' },
  'kn': { code: 'kn', name: 'Kannada',    nativeName: 'ಕನ್ನಡ',     direction: 'ltr', group: 'Indian' },
  'ml': { code: 'ml', name: 'Malayalam',   nativeName: 'മലയാളം',    direction: 'ltr', group: 'Indian' },

  // Western European
  'fr': { code: 'fr', name: 'French',     nativeName: 'Français',   direction: 'ltr', group: 'European' },
  'es': { code: 'es', name: 'Spanish',    nativeName: 'Español',    direction: 'ltr', group: 'European' },
  'de': { code: 'de', name: 'German',     nativeName: 'Deutsch',    direction: 'ltr', group: 'European' },
  'it': { code: 'it', name: 'Italian',    nativeName: 'Italiano',   direction: 'ltr', group: 'European' },
  'pt': { code: 'pt', name: 'Portuguese', nativeName: 'Português',  direction: 'ltr', group: 'European' },
  'pt-BR': { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', direction: 'ltr', group: 'European' },
  'nl': { code: 'nl', name: 'Dutch',      nativeName: 'Nederlands',  direction: 'ltr', group: 'European' },

  // Nordic
  'sv': { code: 'sv', name: 'Swedish',    nativeName: 'Svenska',    direction: 'ltr', group: 'European' },
  'da': { code: 'da', name: 'Danish',     nativeName: 'Dansk',      direction: 'ltr', group: 'European' },
  'no': { code: 'no', name: 'Norwegian',  nativeName: 'Norsk',      direction: 'ltr', group: 'European' },
  'fi': { code: 'fi', name: 'Finnish',    nativeName: 'Suomi',      direction: 'ltr', group: 'European' },

  // Eastern European
  'pl': { code: 'pl', name: 'Polish',     nativeName: 'Polski',     direction: 'ltr', group: 'European' },
  'cs': { code: 'cs', name: 'Czech',      nativeName: 'Čeština',    direction: 'ltr', group: 'European' },
  'ro': { code: 'ro', name: 'Romanian',   nativeName: 'Română',     direction: 'ltr', group: 'European' },
  'hu': { code: 'hu', name: 'Hungarian',  nativeName: 'Magyar',     direction: 'ltr', group: 'European' },
  'bg': { code: 'bg', name: 'Bulgarian',  nativeName: 'Български',  direction: 'ltr', group: 'European' },
  'hr': { code: 'hr', name: 'Croatian',   nativeName: 'Hrvatski',   direction: 'ltr', group: 'European' },
  'sk': { code: 'sk', name: 'Slovak',     nativeName: 'Slovenčina',  direction: 'ltr', group: 'European' },
  'sl': { code: 'sl', name: 'Slovenian',  nativeName: 'Slovenščina', direction: 'ltr', group: 'European' },
  'sr': { code: 'sr', name: 'Serbian',    nativeName: 'Srpski',     direction: 'ltr', group: 'European' },
  'uk': { code: 'uk', name: 'Ukrainian',  nativeName: 'Українська', direction: 'ltr', group: 'European' },
  'el': { code: 'el', name: 'Greek',      nativeName: 'Ελληνικά',   direction: 'ltr', group: 'European' },
  'ru': { code: 'ru', name: 'Russian',    nativeName: 'Русский',    direction: 'ltr', group: 'European' },

  // East Asian
  'ja': { code: 'ja', name: 'Japanese',   nativeName: '日本語',     direction: 'ltr', group: 'East Asian' },
  'ko': { code: 'ko', name: 'Korean',     nativeName: '한국어',     direction: 'ltr', group: 'East Asian' },
  'zh': { code: 'zh', name: 'Chinese (Simplified)',  nativeName: '中文（简体）', direction: 'ltr', group: 'East Asian' },
  'zh-TW': { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文（繁體）', direction: 'ltr', group: 'East Asian' },

  // Middle Eastern
  'ar': { code: 'ar', name: 'Arabic',     nativeName: 'العربية',    direction: 'rtl', group: 'Middle Eastern' },
  'he': { code: 'he', name: 'Hebrew',     nativeName: 'עברית',      direction: 'rtl', group: 'Middle Eastern' },
  'tr': { code: 'tr', name: 'Turkish',    nativeName: 'Türkçe',     direction: 'ltr', group: 'Middle Eastern' },

  // Southeast Asian
  'th': { code: 'th', name: 'Thai',       nativeName: 'ไทย',        direction: 'ltr', group: 'Southeast Asian' },
  'vi': { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr', group: 'Southeast Asian' },
  'id': { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', group: 'Southeast Asian' },
  'ms': { code: 'ms', name: 'Malay',      nativeName: 'Bahasa Melayu',    direction: 'ltr', group: 'Southeast Asian' },
}

/** BCP-47 TTS language tag mappings for base language codes */
const TTS_LANG_MAP: Record<string, string> = {
  'en':    'en-US',
  'en-US': 'en-US',
  'en-GB': 'en-GB',
  'en-IN': 'en-IN',
  'hi':    'hi-IN',
  'te':    'te-IN',
  'ta':    'ta-IN',
  'ur':    'ur-PK',
  'pa':    'pa-IN',
  'bn':    'bn-IN',
  'gu':    'gu-IN',
  'mr':    'mr-IN',
  'kn':    'kn-IN',
  'ml':    'ml-IN',
  'fr':    'fr-FR',
  'es':    'es-ES',
  'de':    'de-DE',
  'it':    'it-IT',
  'pt':    'pt-PT',
  'pt-BR': 'pt-BR',
  'nl':    'nl-NL',
  'sv':    'sv-SE',
  'da':    'da-DK',
  'no':    'nb-NO',
  'fi':    'fi-FI',
  'pl':    'pl-PL',
  'cs':    'cs-CZ',
  'ro':    'ro-RO',
  'hu':    'hu-HU',
  'bg':    'bg-BG',
  'hr':    'hr-HR',
  'sk':    'sk-SK',
  'sl':    'sl-SI',
  'sr':    'sr-RS',
  'uk':    'uk-UA',
  'el':    'el-GR',
  'ru':    'ru-RU',
  'ja':    'ja-JP',
  'ko':    'ko-KR',
  'zh':    'zh-CN',
  'zh-TW': 'zh-TW',
  'ar':    'ar-SA',
  'he':    'he-IL',
  'tr':    'tr-TR',
  'th':    'th-TH',
  'vi':    'vi-VN',
  'id':    'id-ID',
  'ms':    'ms-MY',
}

/**
 * Get a language by its code.
 */
export function getLanguage(code: string): Language | undefined {
  return LANGUAGES[code]
}

/**
 * Get all supported languages as an array.
 */
export function getSupportedLanguages(): Language[] {
  return Object.values(LANGUAGES)
}

/**
 * Get languages grouped by their language family/group.
 */
export function getLanguagesByGroup(): Record<string, Language[]> {
  const groups: Record<string, Language[]> = {}
  for (const lang of Object.values(LANGUAGES)) {
    const group = lang.group ?? 'Other'
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(lang)
  }
  return groups
}

/**
 * Get the display name for a language code.
 * Returns empty string if the code is not found.
 */
export function getLanguageName(code: string): string {
  return LANGUAGES[code]?.name ?? ''
}

/**
 * Check if a language code represents a right-to-left language.
 */
export function isRTL(code: string): boolean {
  return LANGUAGES[code]?.direction === 'rtl'
}

/**
 * Get the BCP-47 language tag suitable for TTS engines.
 * Returns the code itself if no mapping exists.
 */
export function getTtsLang(code: string): string {
  return TTS_LANG_MAP[code] ?? code
}
