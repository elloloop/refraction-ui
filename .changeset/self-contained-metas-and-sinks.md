---
"@refraction-ui/react": minor
"@refraction-ui/astro": minor
"@refraction-ui/angular": minor
---

feat: re-surface the GA4 / Azure App Insights / PostHog analytics sinks through the per-framework metas, embedded so no meta ships a private package reference

The framework analytics adapters again re-export `createGA4Sink`,
`createAppInsightsSink`, and `createPostHogSink` (plus their direct-mode
factories, option/type contracts, and the optional lazy PostHog
`startSessionReplay`). Consumers of `@refraction-ui/react|astro|angular`
can fan analytics out to GA4 / Azure / PostHog without depending on the
private sink packages directly.

Unlike the reverted attempt, the sinks are now genuinely **embedded** by the
metas:

- `@refraction-ui/react`: `embed-internal-types` now rewrites subpath
  specifiers (e.g. `@refraction-ui/analytics-sink-posthog/replay`) to the
  embedded declaration entry, so the shipped `.d.ts`/`.d.cts` and bundled JS
  contain zero `@refraction-ui/*` references.
- `@refraction-ui/astro`: the meta build now rewrites subpath specifiers to
  the copied source, so the shipped `dist/` contains zero bare
  `@refraction-ui/*` import/export/require references (Astro components ship
  as raw `.astro`/`.ts` source by necessity — the consumer's Astro toolchain
  compiles them).

Each meta now carries a `__tests__/meta.test.ts` self-contained guardrail to
prevent this drift from recurring.
