---
'@refraction-ui/react': patch
'@refraction-ui/astro': patch
---

API ergonomics + parity:

- **Button** — `<Button variant="primary">` now renders as the default (most-emphasized) button instead of silently falling through to the unstyled base. `primary` is a typed alias of `default`; behaviour is identical. Fixes muscle-memory regressions seen migrating from MUI/Chakra/Mantine. (issue #201)
- **StatusIndicator** — accepts composable `children` as a fallback for `label`, matching every other refraction-ui primitive. `<StatusIndicator type="success">Microphone · ready</StatusIndicator>` now renders the children instead of dropping them. `aria-label` is derived from children when they are a string. (issue #200)
- **ThemeScript** — gains `defaultMode` and `enableSystem` props so the pre-paint inline script stays in sync with `ThemeProvider` on the no-storage path. Setting `defaultMode="light"` (or `enableSystem={false}`) now skips the `prefers-color-scheme` fall-through, fixing dark→light flashes for brand-consistent apps. Defaults preserve the prior behaviour. (issue #317)
- **Astro meta** — wires up `@refraction-ui/astro-voice-pill` and `@refraction-ui/astro-waveform` so they're reachable from `@refraction-ui/astro` (they were listed as deps but not re-exported). (issues #191, #192)
