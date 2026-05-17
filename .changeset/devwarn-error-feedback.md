---
"@refraction-ui/shared": minor
---

feat: add zero-dep devWarn/devError dev-feedback primitives + library-origin error envelope

- `devWarn(code, message, detail?)` / `devError(...)`: `process.env.NODE_ENV !== 'production'` guarded (dead-code-strippable), warn-once dedupe per code, no dependency on `@refraction-ui/logger`; optional forwarding to a consumer-injected telemetry sink via `setDevFeedbackSink` (inversion of control — never an import, off until explicitly wired).
- `libraryOriginError` / `libraryOriginEnvelope` / `stackFingerprint`: build the redacted library-origin envelope (package, componentName, version, normalized app-data-free stack fingerprint hash, framework) expressed through the existing telemetry record contract — contract reused, not redefined.
