import { COUNTRIES, LANGUAGES, detectCountry, detectLanguage } from '@refraction-ui/i18n'
import { generateId } from '@refraction-ui/shared'

export interface LocationSelectorState {
  country: string
  language: string
}

export interface LocationSelectorOptions {
  defaultCountry?: string
  defaultLanguage?: string
  onCountryChange?: (country: string) => void
  onLanguageChange?: (language: string) => void
}

export function createLocationSelector(options: LocationSelectorOptions = {}) {
  const {
    defaultCountry = 'US',
    defaultLanguage = 'en',
    onCountryChange,
    onLanguageChange,
  } = options

  let state: LocationSelectorState = {
    country: defaultCountry,
    language: defaultLanguage,
  }

  const countryId = generateId('location-sel-country')
  const languageId = generateId('location-sel-language')

  function setCountry(country: string) {
    state.country = country
    onCountryChange?.(country)
  }

  function setLanguage(language: string) {
    state.language = language
    onLanguageChange?.(language)
  }

  const countries = Array.isArray(COUNTRIES) ? COUNTRIES : Object.values(COUNTRIES)
  const languages = Array.isArray(LANGUAGES) ? LANGUAGES : Object.values(LANGUAGES)

  return {
    state,
    setCountry,
    setLanguage,
    countries,
    languages,
    countryProps: {
      id: countryId,
      name: 'country',
    },
    languageProps: {
      id: languageId,
      name: 'language',
    },
  }
}