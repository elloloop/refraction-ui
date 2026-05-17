# @refraction-ui/shared

## 0.2.0

### Minor Changes

- cf1d82e: feat: add zero-dep devWarn/devError dev-feedback primitives + library-origin error envelope

  - `devWarn(code, message, detail?)` / `devError(...)`: `process.env.NODE_ENV !== 'production'` guarded (dead-code-strippable), warn-once dedupe per code, no dependency on `@refraction-ui/logger`; optional forwarding to a consumer-injected telemetry sink via `setDevFeedbackSink` (inversion of control — never an import, off until explicitly wired).
  - `libraryOriginError` / `libraryOriginEnvelope` / `stackFingerprint`: build the redacted library-origin envelope (package, componentName, version, normalized app-data-free stack fingerprint hash, framework) expressed through the existing telemetry record contract — contract reused, not redefined.

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

## 0.1.4

### Patch Changes

- 6319dc8: Trigger full publish cycle to synchronize npm latest tag

## 0.1.3

### Patch Changes

- dabcbd6: chore: force release to update latest npm tags

## 0.1.2

### Patch Changes

- c083c7d: docs: update readme to reflect supported and planned frameworks and trigger a final release test

## 0.1.1

### Patch Changes

- 30d38ee: chore: test new changesets + oidc release workflow
