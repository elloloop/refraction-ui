---
'@refraction-ui/react': minor
---

Add `ShortcutsDialog` to `@refraction-ui/react`: keyboard shortcut help generated from the shortcut registry, opened by ⌘/ (Ctrl+/) or `?`, grouped and searchable, with platform-aware Keycaps. `useShortcut` gains optional `description` and `group` options, and `globalShortcutRegistry` now lists them through `subscribe` / `getSnapshot` (with `SANE_DEFAULT_SHORTCUT_INFO` describing every `SANE_DEFAULTS` action). (#594)
