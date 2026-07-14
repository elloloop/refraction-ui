---
'@refraction-ui/react': minor
'@refraction-ui/astro': minor
---

Add Composer — a headless-core chat composer (`RefractionComposer`) with auto-grow and viewport cap, IME-safe Enter-to-send with Shift+Enter newline, `@`/`/`/`:`/`#`/custom trigger suggestion menus with atomic mention/emoji/tag tokens and structured output, grapheme-safe max-length clamping, typed attachments with paste/drag-drop capture, draft persistence, edit-in-place, busy/stop state for AI surfaces, density-aware theming, RTL, and full combobox/listbox ARIA. Also generalizes trigger detection into a single `detectTriggerInText` in `rich-editor` (consumed by mentions, slash commands, and the conversation composer).
