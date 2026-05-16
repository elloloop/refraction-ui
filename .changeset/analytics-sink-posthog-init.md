---
"@refraction-ui/analytics-sink-posthog": minor
---

feat: add @refraction-ui/analytics-sink-posthog — PostHog AnalyticsSink with default `http` mode (PostHog /capture + /batch API, no browser library), optional lazy `client-sdk` mode (dynamic `posthog-js` import), and a separate optional rrweb session-replay module (off by default, never on the event path, privacy/consent gated, tree-shaken when unused)
