/**
 * Region detection utilities.
 * Detects user country and language from browser/environment signals.
 */

/** Mapping of IANA timezone identifiers to ISO country codes */
export const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // United States
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Detroit': 'US',
  'America/Indiana/Indianapolis': 'US',
  'America/Boise': 'US',

  // Canada
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'America/Halifax': 'CA',
  'America/St_Johns': 'CA',

  // Mexico
  'America/Mexico_City': 'MX',
  'America/Cancun': 'MX',
  'America/Tijuana': 'MX',

  // UK & Ireland
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',

  // Western Europe
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Lisbon': 'PT',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Zurich': 'CH',
  'Europe/Vienna': 'AT',

  // Nordic
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI',

  // Eastern Europe
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Bucharest': 'RO',
  'Europe/Budapest': 'HU',
  'Europe/Sofia': 'BG',
  'Europe/Zagreb': 'HR',
  'Europe/Bratislava': 'SK',
  'Europe/Ljubljana': 'SI',
  'Europe/Belgrade': 'RS',
  'Europe/Kyiv': 'UA',
  'Europe/Moscow': 'RU',
  'Europe/Istanbul': 'TR',
  'Europe/Athens': 'GR',

  // South Asia
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Karachi': 'PK',
  'Asia/Dhaka': 'BD',
  'Asia/Colombo': 'LK',
  'Asia/Kathmandu': 'NP',

  // East Asia
  'Asia/Tokyo': 'JP',
  'Asia/Seoul': 'KR',
  'Asia/Shanghai': 'CN',
  'Asia/Hong_Kong': 'CN',
  'Asia/Taipei': 'TW',

  // Southeast Asia
  'Asia/Bangkok': 'TH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Jakarta': 'ID',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Manila': 'PH',
  'Asia/Singapore': 'SG',

  // Oceania
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU',
  'Pacific/Auckland': 'NZ',

  // South America
  'America/Sao_Paulo': 'BR',
  'America/Rio_Branco': 'BR',
  'America/Argentina/Buenos_Aires': 'AR',
  'America/Bogota': 'CO',
  'America/Santiago': 'CL',

  // Middle East
  'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE',
  'Asia/Jerusalem': 'IL',
  'Africa/Cairo': 'EG',
}

/** Mapping of BCP-47 locale strings to ISO country codes */
export const LOCALE_TO_COUNTRY: Record<string, string> = {
  'en-US': 'US',
  'en-GB': 'GB',
  'en-AU': 'AU',
  'en-CA': 'CA',
  'en-NZ': 'NZ',
  'en-IE': 'IE',
  'en-IN': 'IN',
  'en-SG': 'SG',
  'en-PH': 'PH',
  'en-MY': 'MY',
  'en-ZA': 'ZA',
  'hi-IN': 'IN',
  'te-IN': 'IN',
  'ta-IN': 'IN',
  'ur-PK': 'PK',
  'pa-IN': 'IN',
  'bn-IN': 'IN',
  'bn-BD': 'BD',
  'gu-IN': 'IN',
  'mr-IN': 'IN',
  'kn-IN': 'IN',
  'ml-IN': 'IN',
  'fr-FR': 'FR',
  'fr-CA': 'CA',
  'fr-BE': 'BE',
  'fr-CH': 'CH',
  'es-ES': 'ES',
  'es-MX': 'MX',
  'es-AR': 'AR',
  'es-CO': 'CO',
  'es-CL': 'CL',
  'de-DE': 'DE',
  'de-AT': 'AT',
  'de-CH': 'CH',
  'it-IT': 'IT',
  'it-CH': 'CH',
  'pt-PT': 'PT',
  'pt-BR': 'BR',
  'nl-NL': 'NL',
  'nl-BE': 'BE',
  'sv-SE': 'SE',
  'da-DK': 'DK',
  'nb-NO': 'NO',
  'nn-NO': 'NO',
  'fi-FI': 'FI',
  'pl-PL': 'PL',
  'cs-CZ': 'CZ',
  'ro-RO': 'RO',
  'hu-HU': 'HU',
  'bg-BG': 'BG',
  'hr-HR': 'HR',
  'sk-SK': 'SK',
  'sl-SI': 'SI',
  'sr-RS': 'SR',
  'uk-UA': 'UA',
  'el-GR': 'GR',
  'ru-RU': 'RU',
  'ja-JP': 'JP',
  'ko-KR': 'KR',
  'zh-CN': 'CN',
  'zh-TW': 'TW',
  'zh-HK': 'CN',
  'ar-SA': 'SA',
  'ar-AE': 'AE',
  'ar-EG': 'EG',
  'he-IL': 'IL',
  'tr-TR': 'TR',
  'th-TH': 'TH',
  'vi-VN': 'VN',
  'id-ID': 'ID',
  'ms-MY': 'MY',
}

/**
 * Detect the user's country from environment signals.
 * Strategy: timezone mapping -> navigator.languages locale mapping -> fallback 'US'
 */
export function detectCountry(): string {
  // 1. Try timezone mapping
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && TIMEZONE_TO_COUNTRY[tz]) {
      return TIMEZONE_TO_COUNTRY[tz]
    }
  } catch {
    // Intl may not be available
  }

  // 2. Try navigator.languages locale mapping
  try {
    if (typeof navigator !== 'undefined') {
      const languages = navigator.languages
      if (languages && languages.length > 0) {
        for (const locale of languages) {
          if (LOCALE_TO_COUNTRY[locale]) {
            return LOCALE_TO_COUNTRY[locale]
          }
        }
      }
    }
  } catch {
    // navigator may not be available
  }

  // 3. Fallback
  return 'US'
}

/**
 * Detect the user's preferred language from navigator.languages.
 * Returns the first language from navigator.languages, or 'en' as fallback.
 */
export function detectLanguage(): string {
  try {
    if (typeof navigator !== 'undefined') {
      const languages = (navigator as any).languages
      if (languages && languages.length > 0) {
        return languages[0]
      }
      if ((navigator as any).language) {
        return (navigator as any).language
      }
    }
  } catch {
    // navigator may not be available
  }
  return 'en'
}
