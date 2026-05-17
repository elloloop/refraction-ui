---
"@refraction-ui/react": minor
---

react-logger: `useTelemetry`/`useLogger`/`useSpan` no longer throw when used
outside a `<TelemetryProvider>` — they return a shared `createNoopTelemetry()`
(a dev-only warn-once hint is still emitted). Components/hooks instrumented
with logging render safely without a provider (tests, standalone usage);
telemetry activates when a provider is mounted. Instrumentation must never
crash the host.
