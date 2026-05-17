---
"@refraction-ui/react": patch
---

react-analytics: `useAnalytics()` and `useTrackEvent()` no longer throw when
used outside an `<AnalyticsProvider>`. They now return a shared no-op
`Analytics` (via `createNoopAnalytics()`) and emit a dev-only warn-once hint,
mirroring the `react-logger` behaviour shipped in 0.9.0. Instrumenting a
component with analytics must never crash the host (including in tests).
