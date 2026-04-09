---
id: MIGRATE-FEATUREDOCS
track: migration
depends_on: ["PKG-REACT", "PKG-TAILWIND"]
size: L
labels: [migration]
status: pending
---

## Summary

Migrate elloloop/featuredocs to use @elloloop/* packages.

## Repository Details

- **Repo**: `elloloop/featuredocs` (public)
- **Stack**: Next.js 16 (static export), React 19, Tailwind CSS v4, ConnectRPC, Cloudflare Turnstile
- **Pages**: Home (products), Product features, Feature docs, Changelog, Admin feedback

## Components to Replace

| Current Location | Replace With |
|-----------------|-------------|
| `src/components/Header.tsx` | `@elloloop/react/navbar` |
| `src/components/FeatureCard.tsx` | Keep (app-specific) or adapt Card from refraction-ui |
| `src/components/FeedbackBadge.tsx` | `@elloloop/react/badge` |
| `src/components/DeviceFrame.tsx` | `@elloloop/react/device-frame` |
| `src/components/DraftBanner.tsx` | Keep (app-specific) |
| `src/components/VideoPlayer.tsx` | `@elloloop/react/video-player` |
| `src/components/VersionSelector.tsx` | `@elloloop/react/version-selector` |
| `src/components/LocaleSwitcher.tsx` | `@elloloop/react/locale-switcher` |
| `src/components/MarkdownRenderer.tsx` | `@elloloop/react/markdown-renderer` |
| `src/components/FeedbackDialog.tsx` | `@elloloop/react/feedback-dialog` |
| `src/components/FeedbackButton.tsx` | `@elloloop/react/feedback-button` |
| `src/components/TextSelectionFeedback.tsx` | `@elloloop/react/text-selection-feedback` |
| `src/components/AdminFeedbackTable.tsx` | `@elloloop/react/data-table` |
| `src/components/FeatureDocContent.tsx` | `@elloloop/react/inline-editor` |
| `src/components/InlineEditor.tsx` | `@elloloop/react/inline-editor` (remove duplicate) |
| `src/lib/markdown.ts` | `@elloloop/react/markdown-renderer` (utils) |
| `src/lib/types.ts` (LOCALE_DISPLAY_NAMES) | `@elloloop/i18n` |

## Also: Deduplicate

- `getLocalizedValue()` is duplicated in 3 files → use `@elloloop/react/utils/locale`
- `InlineEditor` and `FeatureDocContent` are near-identical → use single refraction-ui `InlineEditor`

## Tasks

- [ ] Add @elloloop/* packages
- [ ] Replace all component imports (see table above)
- [ ] Deduplicate `getLocalizedValue()` across 3 files
- [ ] Remove `InlineEditor.tsx` (keep `FeatureDocContent` adapted to refraction-ui)
- [ ] Update Tailwind v4 config to use refraction preset
- [ ] Remove replaced local component files
- [ ] Test all pages and feedback flow
