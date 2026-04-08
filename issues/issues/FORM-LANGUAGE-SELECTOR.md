---
id: FORM-LANGUAGE-SELECTOR
track: forms
depends_on: ["COMP-DROPDOWN", "PKG-I18N"]
size: S
labels: [feat, a11y]
status: pending
---

## Summary

Build LanguageSelector and LocaleSwitcher — dropdown selectors for programming languages and spoken locales.

### Packages

| Package | Type | Description |
|---------|------|-------------|
| `@refraction-ui/language-selector` | Headless core | State machine, ARIA, keyboard handlers, CSS token contract |
| `@refraction-ui/react-language-selector` | React wrapper | React component with hooks binding |
| `@refraction-ui/angular-language-selector` | Angular wrapper | Angular standalone component |
| `@refraction-ui/astro-language-selector` | Astro wrapper | Astro component (static or island) |

## Source References

| Project | File | Description |
|---------|------|-------------|
| **elloloop/easyloops** | `src/features/auth/components/LanguageSelector.tsx` | Custom dropdown for 7 programming languages. Checkmark on selected. Click-outside-to-close. |
| **elloloop/featuredocs** | `src/components/LocaleSwitcher.tsx` | Dropdown `<select>` for locale switching. Persists to localStorage. Rewrites URL locale segment. Returns null if only one locale. |
| **elloloop/learnloop** | `components/settings/LanguageVoiceSelector.tsx` | Two-tier: language groups (English/Regional/Hybrid) then voices per language. Auto-selects best voice. |
| **elloloop/stream-mind** | `frontend/src/packages/ui/RegionPicker.tsx` | Compact picker using Popover + Command. Two tabs: Region (searchable country list) and Languages (checkbox list). |

## Acceptance Criteria

- [ ] `<LanguageSelector>` — single-select dropdown with checkmark on active
- [ ] `<LocaleSwitcher>` — locale dropdown that persists to localStorage and updates URL
- [ ] `<RegionPicker>` — Popover + Command combo with searchable countries and checkbox languages
- [ ] Custom dropdown (not native `<select>`) for consistent styling
- [ ] Click-outside-to-close
- [ ] Returns null when only one option available
- [ ] Group support (language families)
- [ ] Keyboard accessible
- [ ] Unit tests + Storybook stories
