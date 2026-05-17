---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
"@refraction-ui/angular": minor
---

feat: surface the GA4, Azure App Insights, and PostHog analytics sink factories through the per-framework meta packages

The framework analytics adapters now re-export `createGA4Sink`,
`createAppInsightsSink`, and `createPostHogSink` (plus their direct-mode
factories, option/type contracts, and the optional lazy PostHog
`startSessionReplay`), so consumers of `@refraction-ui/react|astro|angular`
can fan analytics out to GA4 / Azure / PostHog without depending on the
private sink packages directly.
