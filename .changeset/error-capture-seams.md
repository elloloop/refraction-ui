---
"@refraction-ui/shared": minor
"@refraction-ui/react-logger": minor
"@refraction-ui/angular-logger": minor
"@refraction-ui/astro-logger": minor
---

feat: per-framework library-origin error capture seams (epic #247 wave 1, #249)

Error seams that tag ONLY errors whose stack originates in a `@refraction-ui/*`
package and route them to an OPTIONAL, consumer-wired telemetry sink (no-op if
none wired). App-origin errors pass through completely untouched — never
captured, tagged, or forwarded to the diagnostics sink.

- `@refraction-ui/shared`: `isLibraryOriginError(error)` predicate (the
  capture gate, reuses the existing `@refraction-ui/*` stack-frame rule) and
  `captureLibraryOriginError(error, identity, sink)` — the single filter →
  tag → optional-forward primitive shared by every seam. Built on the existing
  `libraryOriginError`/`stackFingerprint` envelope and the `DevFeedbackSink`
  contract; no new definitions, zero dependency on `@refraction-ui/logger`.
- `@refraction-ui/react-logger`: `LibraryErrorCaptureBoundary` (error boundary)
  + `captureReactLibraryError` imperative seam.
- `@refraction-ui/angular-logger`: `RefractionErrorHandler` (`ErrorHandler`)
  + `provideLibraryErrorCapture`; always delegates to the base handler so the
  app's default error behavior is preserved.
- `@refraction-ui/astro-logger`: `createLibraryErrorCapture` middleware hook
  + `captureAstroLibraryError`; always rethrows so Astro's error handling is
  unchanged.

The real `@refraction-ui/logger` `TelemetrySink` satisfies the structural
`DevFeedbackSink` sink contract — nothing phones home unless explicitly wired.
