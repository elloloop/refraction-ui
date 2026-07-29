---
"@refraction-ui/react": patch
---

Fix six issues surfaced by the test-backfill waves:

- **DiffViewer**: the sidebar heading (`Files (N)`) and per-file stats (`+additions` / `-deletions`) now render as single template literals, so SSR no longer splits them with `<!-- -->` comment nodes (the same bug class previously fixed in the status bar).
- **FileUpload**: the drop zone no longer emits a dangling `aria-describedby` pointing at a generated label id that nothing renders; it keeps its `aria-label`.
- **DatePicker**: the `format` prop is now honored — the selected date renders as adjacent display text via the core's `formatDate` (the native input value stays ISO).
- **CommandInput**: the core's `handleKeyDown` now takes a structural `CommandKeyEvent` (`{ preventDefault(): void }`) instead of `Event`, so the React adapter passes its synthetic event without an `as any` cast.
- **HttpClient**: per-request `headers` given as a `Headers` instance or tuple array are normalized and merged instead of being silently dropped, and the default `Content-Type` dedup now compares header names case-insensitively (a caller's lowercase `content-type` no longer gets a duplicate).
- **location-selector core**: removed unused `detectCountry`/`detectLanguage` imports and a `let` that should be `const`; added the missing `lint` scripts to `@refraction-ui/http`, `@refraction-ui/location-selector`, and `@refraction-ui/react-location-selector` so CI lint actually covers them.
