---
"@refraction-ui/react-app-shell": patch
"@refraction-ui/status-indicator": patch
"@refraction-ui/slide-viewer": patch
"@refraction-ui/version-selector": patch
"@refraction-ui/react": patch
---

Eliminate internal `Card2` / `STATUS_COLORS2` / `progressBarVariants2` / `optionVariants2` symbols from the `@refraction-ui/react` bundled output.

When esbuild bundled the meta package, it had to disambiguate two top-level symbols with the same name across subpackages — even though the public export map already aliased them — so it appended digits to the local. Public APIs were unaffected, but the artifact was visible to anyone reading the dist.

Renamed the underlying internal locals so they no longer collide:

- `react-app-shell`: internal `Card` helper → `AuthShellCard` (the `<AuthShell.Card>` compound API is unchanged).
- `status-indicator`: internal `STATUS_COLORS` / `STATUS_LABELS` → `STATUS_INDICATOR_COLORS` / `STATUS_INDICATOR_LABELS`, re-exported under their original names.
- `slide-viewer`: internal `progressBarVariants` → `slideViewerProgressBarVariants`, re-exported as `progressBarVariants`.
- `version-selector`: internal `optionVariants` → `versionSelectorOptionVariants`, re-exported as `optionVariants`.

No public API change for any consumer; this is a pure bundle-hygiene patch.
