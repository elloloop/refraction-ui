---
"@refraction-ui/astro-logger": minor
---

feat: add @refraction-ui/astro-logger adapter wrapping the @refraction-ui/logger core

Astro-idiomatic telemetry wiring over the headless `@refraction-ui/logger`
core: a `<TelemetryScript />` client island that initializes
`window.__rfr_telemetry` (Faro stays fully hidden — the only consumer wiring
is the backend `endpoint`), and `createTelemetryMiddleware()`, a
`defineMiddleware`-compatible server hook that exposes a per-request child
logger on `context.locals`, records each request as a span, and flushes
buffered records once the response is produced.
