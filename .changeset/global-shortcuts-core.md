---
"@refraction-ui/keyboard-shortcut": minor
"@refraction-ui/react-keyboard-shortcut": minor
"@refraction-ui/react-button": patch
"@refraction-ui/react": patch
---

feat(keyboard-shortcut): introduce global Alt-to-reveal shortcut system

- Added global `AltHintState` and `SANE_DEFAULTS` to the core `keyboard-shortcut` package.
- Created `ShortcutProvider`, `useShortcut` hook, and `ShortcutHint` component in `react-keyboard-shortcut`.
- Integrated `ShortcutHint` and `useShortcut` into `react-button`.
- Updated `docs-site` to use the global `ShortcutProvider`.
