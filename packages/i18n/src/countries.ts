/**
 * Country type and registry for i18n support.
 */

export interface Country {
  code: string
  name: string
  flag: string
  defaultLanguages: string[]
  timezone?: string
}

export const COUNTRIES: Record<string, Country> = {
  // North America
  'US': { code: 'US', name: 'United States',  flag: '🇺🇸', defaultLanguages: ['en'], timezone: 'America/New_York' },
  'CA': { code: 'CA', name: 'Canada',         flag: '🇨🇦', defaultLanguages: ['en', 'fr'], timezone: 'America/Toronto' },
  'MX': { code: 'MX', name: 'Mexico',         flag: '🇲🇽', defaultLanguages: ['es'], timezone: 'America/Mexico_City' },

  // UK & Ireland
  'GB': { code: 'GB', name: 'United Kingdom',  flag: '🇬🇧', defaultLanguages: ['en'], timezone: 'Europe/London' },
  'IE': { code: 'IE', name: 'Ireland',         flag: '🇮🇪', defaultLanguages: ['en'], timezone: 'Europe/Dublin' },

  // Oceania
  'AU': { code: 'AU', name: 'Australia',       flag: '🇦🇺', defaultLanguages: ['en'], timezone: 'Australia/Sydney' },
  'NZ': { code: 'NZ', name: 'New Zealand',     flag: '🇳🇿', defaultLanguages: ['en'], timezone: 'Pacific/Auckland' },

  // South Asia
  'IN': { code: 'IN', name: 'India',           flag: '🇮🇳', defaultLanguages: ['hi', 'en'], timezone: 'Asia/Kolkata' },
  'PK': { code: 'PK', name: 'Pakistan',        flag: '🇵🇰', defaultLanguages: ['ur', 'en'], timezone: 'Asia/Karachi' },
  'BD': { code: 'BD', name: 'Bangladesh',      flag: '🇧🇩', defaultLanguages: ['bn'], timezone: 'Asia/Dhaka' },
  'LK': { code: 'LK', name: 'Sri Lanka',       flag: '🇱🇰', defaultLanguages: ['ta', 'en'], timezone: 'Asia/Colombo' },
  'NP': { code: 'NP', name: 'Nepal',           flag: '🇳🇵', defaultLanguages: ['hi', 'en'], timezone: 'Asia/Kathmandu' },

  // Western Europe
  'FR': { code: 'FR', name: 'France',          flag: '🇫🇷', defaultLanguages: ['fr'], timezone: 'Europe/Paris' },
  'DE': { code: 'DE', name: 'Germany',         flag: '🇩🇪', defaultLanguages: ['de'], timezone: 'Europe/Berlin' },
  'ES': { code: 'ES', name: 'Spain',           flag: '🇪🇸', defaultLanguages: ['es'], timezone: 'Europe/Madrid' },
  'IT': { code: 'IT', name: 'Italy',           flag: '🇮🇹', defaultLanguages: ['it'], timezone: 'Europe/Rome' },
  'PT': { code: 'PT', name: 'Portugal',        flag: '🇵🇹', defaultLanguages: ['pt'], timezone: 'Europe/Lisbon' },
  'NL': { code: 'NL', name: 'Netherlands',     flag: '🇳🇱', defaultLanguages: ['nl'], timezone: 'Europe/Amsterdam' },
  'BE': { code: 'BE', name: 'Belgium',         flag: '🇧🇪', defaultLanguages: ['nl', 'fr', 'de'], timezone: 'Europe/Brussels' },
  'CH': { code: 'CH', name: 'Switzerland',     flag: '🇨🇭', defaultLanguages: ['de', 'fr', 'it'], timezone: 'Europe/Zurich' },
  'AT': { code: 'AT', name: 'Austria',         flag: '🇦🇹', defaultLanguages: ['de'], timezone: 'Europe/Vienna' },

  // Nordic
  'SE': { code: 'SE', name: 'Sweden',          flag: '🇸🇪', defaultLanguages: ['sv'], timezone: 'Europe/Stockholm' },
  'NO': { code: 'NO', name: 'Norway',          flag: '🇳🇴', defaultLanguages: ['no'], timezone: 'Europe/Oslo' },
  'DK': { code: 'DK', name: 'Denmark',         flag: '🇩🇰', defaultLanguages: ['da'], timezone: 'Europe/Copenhagen' },
  'FI': { code: 'FI', name: 'Finland',         flag: '🇫🇮', defaultLanguages: ['fi'], timezone: 'Europe/Helsinki' },

  // Eastern Europe
  'PL': { code: 'PL', name: 'Poland',          flag: '🇵🇱', defaultLanguages: ['pl'], timezone: 'Europe/Warsaw' },
  'CZ': { code: 'CZ', name: 'Czech Republic',  flag: '🇨🇿', defaultLanguages: ['cs'], timezone: 'Europe/Prague' },
  'RO': { code: 'RO', name: 'Romania',         flag: '🇷🇴', defaultLanguages: ['ro'], timezone: 'Europe/Bucharest' },
  'HU': { code: 'HU', name: 'Hungary',         flag: '🇭🇺', defaultLanguages: ['hu'], timezone: 'Europe/Budapest' },
  'BG': { code: 'BG', name: 'Bulgaria',        flag: '🇧🇬', defaultLanguages: ['bg'], timezone: 'Europe/Sofia' },
  'HR': { code: 'HR', name: 'Croatia',         flag: '🇭🇷', defaultLanguages: ['hr'], timezone: 'Europe/Zagreb' },
  'SK': { code: 'SK', name: 'Slovakia',        flag: '🇸🇰', defaultLanguages: ['sk'], timezone: 'Europe/Bratislava' },
  'SI': { code: 'SI', name: 'Slovenia',        flag: '🇸🇮', defaultLanguages: ['sl'], timezone: 'Europe/Ljubljana' },
  'RS': { code: 'RS', name: 'Serbia',          flag: '🇷🇸', defaultLanguages: ['sr'], timezone: 'Europe/Belgrade' },
  'UA': { code: 'UA', name: 'Ukraine',         flag: '🇺🇦', defaultLanguages: ['uk'], timezone: 'Europe/Kyiv' },
  'RU': { code: 'RU', name: 'Russia',          flag: '🇷🇺', defaultLanguages: ['ru'], timezone: 'Europe/Moscow' },
  'TR': { code: 'TR', name: 'Turkey',          flag: '🇹🇷', defaultLanguages: ['tr'], timezone: 'Europe/Istanbul' },
  'GR': { code: 'GR', name: 'Greece',          flag: '🇬🇷', defaultLanguages: ['el'], timezone: 'Europe/Athens' },

  // East Asia
  'JP': { code: 'JP', name: 'Japan',           flag: '🇯🇵', defaultLanguages: ['ja'], timezone: 'Asia/Tokyo' },
  'KR': { code: 'KR', name: 'South Korea',     flag: '🇰🇷', defaultLanguages: ['ko'], timezone: 'Asia/Seoul' },
  'CN': { code: 'CN', name: 'China',           flag: '🇨🇳', defaultLanguages: ['zh'], timezone: 'Asia/Shanghai' },
  'TW': { code: 'TW', name: 'Taiwan',          flag: '🇹🇼', defaultLanguages: ['zh'], timezone: 'Asia/Taipei' },

  // Southeast Asia
  'TH': { code: 'TH', name: 'Thailand',        flag: '🇹🇭', defaultLanguages: ['th'], timezone: 'Asia/Bangkok' },
  'VN': { code: 'VN', name: 'Vietnam',         flag: '🇻🇳', defaultLanguages: ['vi'], timezone: 'Asia/Ho_Chi_Minh' },
  'ID': { code: 'ID', name: 'Indonesia',       flag: '🇮🇩', defaultLanguages: ['id'], timezone: 'Asia/Jakarta' },
  'MY': { code: 'MY', name: 'Malaysia',        flag: '🇲🇾', defaultLanguages: ['ms', 'en'], timezone: 'Asia/Kuala_Lumpur' },
  'PH': { code: 'PH', name: 'Philippines',     flag: '🇵🇭', defaultLanguages: ['en'], timezone: 'Asia/Manila' },
  'SG': { code: 'SG', name: 'Singapore',       flag: '🇸🇬', defaultLanguages: ['en', 'ms', 'zh'], timezone: 'Asia/Singapore' },

  // South America
  'BR': { code: 'BR', name: 'Brazil',          flag: '🇧🇷', defaultLanguages: ['pt'], timezone: 'America/Sao_Paulo' },
  'AR': { code: 'AR', name: 'Argentina',       flag: '🇦🇷', defaultLanguages: ['es'], timezone: 'America/Argentina/Buenos_Aires' },
  'CO': { code: 'CO', name: 'Colombia',        flag: '🇨🇴', defaultLanguages: ['es'], timezone: 'America/Bogota' },
  'CL': { code: 'CL', name: 'Chile',           flag: '🇨🇱', defaultLanguages: ['es'], timezone: 'America/Santiago' },

  // Middle East & North Africa
  'SA': { code: 'SA', name: 'Saudi Arabia',    flag: '🇸🇦', defaultLanguages: ['ar'], timezone: 'Asia/Riyadh' },
  'AE': { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', defaultLanguages: ['ar', 'en'], timezone: 'Asia/Dubai' },
  'IL': { code: 'IL', name: 'Israel',          flag: '🇮🇱', defaultLanguages: ['he'], timezone: 'Asia/Jerusalem' },
  'EG': { code: 'EG', name: 'Egypt',           flag: '🇪🇬', defaultLanguages: ['ar'], timezone: 'Africa/Cairo' },
}

/**
 * Get a country by its code.
 */
export function getCountry(code: string): Country | undefined {
  return COUNTRIES[code]
}

/**
 * Get the flag emoji for a country code.
 * Returns empty string if the code is not found.
 */
export function getCountryFlag(code: string): string {
  return COUNTRIES[code]?.flag ?? ''
}

/**
 * Get the display name for a country code.
 * Returns empty string if the code is not found.
 */
export function getCountryName(code: string): string {
  return COUNTRIES[code]?.name ?? ''
}

/**
 * Get default languages for a country.
 * Returns empty array if the country is not found.
 */
export function getDefaultLanguagesForCountry(code: string): string[] {
  return COUNTRIES[code]?.defaultLanguages ?? []
}
