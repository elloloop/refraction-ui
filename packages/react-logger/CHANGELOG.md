# @refraction-ui/react-logger

## 0.2.0

### Minor Changes

- 15676eb: feat: devWarn footgun rollout — Batch 1A (epic #254 Wave 1, issue #256)

  Add dev-only, warn-once `devWarn` (from `@refraction-ui/shared`) at every
  provider/required-context misuse seam in the React provider-context-throw
  footgun packages, per `docs/instrumentation/policy.md`. The existing `throw`
  is KEPT in every case — runtime behavior is unchanged, and `devWarn` is
  env-guarded so it is stripped in production.

  Seams instrumented:

  - `@refraction-ui/react-ai`: `useAI` / `useTTS` called outside their providers.
  - `@refraction-ui/react-auth`: `<AuthProvider>` rendered without the required
    `adapter`; `useAuth` called outside `<AuthProvider>`.
  - `@refraction-ui/react-analytics`: `useAnalytics` called outside
    `<AnalyticsProvider>`.
  - `@refraction-ui/react-theme`: `useTheme` called outside `<ThemeProvider>`.
  - `@refraction-ui/react-toast`: `useToast` called outside `<ToastProvider>`.
  - `@refraction-ui/react-logger`: `useTelemetry` / `useSpan` called outside
    `<TelemetryProvider>`.

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

- bad2ac7: feat: add @refraction-ui/logger telemetry core and @refraction-ui/react-logger adapter

### Patch Changes

- Updated dependencies [cf1d82e]
- Updated dependencies [bfeeb83]
- Updated dependencies [bad2ac7]
  - @refraction-ui/shared@0.2.0
  - @refraction-ui/logger@0.2.0
