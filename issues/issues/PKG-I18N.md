---
id: PKG-I18N
track: packages
depends_on: ["PKG-REACT"]
size: S
labels: [feat]
status: pending
---

## Summary

Create `@elloloop/i18n` package — language configuration, voice registry, region detection, and locale utilities. Consolidates internationalization code from elloloop/learnloop, elloloop/stream-mind, and elloloop/featuredocs.

## Source References

### Language & Voice Configuration
From **elloloop/learnloop** `lib/i18n/`:
- `language-config.ts` — 10+ supported languages (English UK/US/Indian, Hindi, Hinglish, Telugu, Tamil, Urdu, Punjabi), `getSupportedLanguages()`, `getLanguagesByGroup()`, `getTtsLang()`
- `voice-registry.ts` — Voice definitions for Google/ElevenLabs/OpenAI, `getVoicesForLanguage()`, `getBestVoice()`

### Region Detection & Languages
From **elloloop/stream-mind** `frontend/src/lib/`:
- `detect-region.ts` — Auto-detect country from timezone (60+ mappings), navigator.languages (50+ locale mappings), `getCountryFlag()`, `getCountryName()`
- `languages.ts` — 40+ language definitions, 55+ country definitions (with flags and default languages), `getDefaultLanguagesForCountry()`, `getLanguageName()`

### Locale Utilities
From **elloloop/featuredocs** `src/components/LocaleSwitcher.tsx`:
- `getStoredLocale()` — Read locale preference from localStorage
- `LOCALE_DISPLAY_NAMES` from `src/lib/types.ts` — locale code to display name mapping

## Acceptance Criteria

- [ ] `getSupportedLanguages()` returns all languages across all projects (union)
- [ ] `getLanguagesByGroup()` groups languages (English variants, Indian, etc.)
- [ ] `detectCountry()` auto-detects from timezone and navigator
- [ ] `getCountryFlag(code)`, `getCountryName(code)` for 55+ countries
- [ ] `getDefaultLanguagesForCountry(code)` returns defaults per country
- [ ] Voice registry with provider-specific voices (Google, ElevenLabs, OpenAI)
- [ ] `getBestVoice(language, provider)` returns optimal voice
- [ ] Locale display names and stored locale persistence
- [ ] Unit tests for detection, language lookups, voice selection
- [ ] TypeScript strict types

## Package Structure

```
packages/i18n/
  src/
    languages.ts         # 40+ language definitions
    countries.ts         # 55+ country definitions with flags
    detect-region.ts     # Auto-detect from timezone/navigator
    voice-registry.ts    # TTS voice definitions per provider
    locale-utils.ts      # Locale persistence, display names
    index.ts
```
