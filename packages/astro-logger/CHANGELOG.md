# @refraction-ui/astro-logger

## 0.2.0

### Minor Changes

- 9611723: feat: add @refraction-ui/astro-logger adapter wrapping the @refraction-ui/logger core

  Astro-idiomatic telemetry wiring over the headless `@refraction-ui/logger`
  core: a `<TelemetryScript />` client island that initializes
  `window.__rfr_telemetry` (Faro stays fully hidden — the only consumer wiring
  is the backend `endpoint`), and `createTelemetryMiddleware()`, a
  `defineMiddleware`-compatible server hook that exposes a per-request child
  logger on `context.locals`, records each request as a span, and flushes
  buffered records once the response is produced.

- bfeeb83: feat: per-framework library-origin error capture seams (epic #247 wave 1, #249)

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
    - `captureReactLibraryError` imperative seam.
  - `@refraction-ui/angular-logger`: `RefractionErrorHandler` (`ErrorHandler`)
    - `provideLibraryErrorCapture`; always delegates to the base handler so the
      app's default error behavior is preserved.
  - `@refraction-ui/astro-logger`: `createLibraryErrorCapture` middleware hook
    - `captureAstroLibraryError`; always rethrows so Astro's error handling is
      unchanged.

  The real `@refraction-ui/logger` `TelemetrySink` satisfies the structural
  `DevFeedbackSink` sink contract — nothing phones home unless explicitly wired.

### Patch Changes

- Updated dependencies [cf1d82e]
- Updated dependencies [bfeeb83]
- Updated dependencies [bad2ac7]
  - @refraction-ui/shared@0.2.0
  - @refraction-ui/logger@0.2.0
