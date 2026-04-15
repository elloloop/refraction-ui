---
"@refraction-ui/app-shell": patch
"@refraction-ui/tailwind-config": patch
---

fix: resolve core styling, layout, and typography bugs

- Fixed `app-shell`, `auth-shell`, and `page-shell` factories where `undefined` config values incorrectly overwrote default settings.
- Added `@tailwindcss/typography` plugin to the `refractionPreset` to ensure proper markdown styling.
- Upgraded the documentation site's code blocks to use `shiki` for proper syntax highlighting.
