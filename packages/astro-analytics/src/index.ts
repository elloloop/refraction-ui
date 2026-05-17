export { default as AnalyticsScript } from './AnalyticsScript.astro'

// Re-export core factories and types for convenience. The Astro adapter is a
// thin island over the neutral router — no privileged engine, every vendor is
// a sink, and the recommended prod topology routes through your server relay.
export {
  createAnalytics,
  createHttpSink,
  createConsoleSink,
  createMockSink,
  createSession,
  createIdentity,
  createConsent,
  createRedactor,
  createMemoryStorage,
  createLocalStorageAdapter,
  createCookieAdapter,
  resolveStorage,
  campaignFingerprint,
  uuidv4,
  isUuidV4,
  UUID_V4_RE,
  PII_DENY_LIST,
  PII_EXACT_KEYS,
  REDACTED,
  SCHEMA_VERSION,
  DEFAULT_SESSION_TIMEOUT_MS,
  type Analytics,
  type AnalyticsConfig,
  type AnalyticsEvent,
  type AnalyticsEventType,
  type AnalyticsProperties,
  type AnalyticsContext,
  type AnalyticsSink,
  type AnalyticsStorage,
  type SinkInitContext,
  type SinkDeliverContext,
  type SessionConfig,
  type SessionAPI,
  type IdentityConfig,
  type ConsentConfig,
  type ConsentAPI,
  type HttpSinkOptions,
  type CallOptions,
  type ConsoleSinkOptions,
  type MockSink,
  type CreateMockSinkOptions,
  type Redactor,
} from '@refraction-ui/analytics'

// Re-export vendor sink factories so consumers of the public meta can fan
// out to GA4 / Azure App Insights / PostHog. The sink packages stay private;
// they reach consumers only through this adapter (and the meta's `export *`).
// Named re-exports only — `export *` would collide on shared mapping helpers
// (each sink re-exports its own `mapEvent`). Mapping helpers are intentionally
// not surfaced here; only the sink factories + their option/type contracts.
export {
  createGA4Sink,
  createGA4HttpSink,
  createGA4ClientSdkSink,
  type GA4SinkOptions,
  type GA4HttpOptions,
  type GA4ClientSdkOptions,
  type GA4ConsentBridge,
  type ConsentState,
  type GtagFn,
} from '@refraction-ui/analytics-sink-ga4'

export {
  createAppInsightsSink,
  type AppInsightsSinkOptions,
  type AppInsightsSinkMode,
  type ClientSdkOptions,
  type HttpOptions,
  type AppInsightsLike,
} from '@refraction-ui/analytics-sink-app-insights'

export {
  createPostHogSink,
  createPostHogHttpSink,
  createPostHogClientSdkSink,
  type PostHogSinkMode,
  type PostHogSinkOptions,
  type PostHogHttpSinkOptions,
  type PostHogClientSdkSinkOptions,
} from '@refraction-ui/analytics-sink-posthog'

// Optional, lazy PostHog session replay (separate `./replay` entry point of
// the sink package — never on the event path, tree-shaken when unused).
export {
  startSessionReplay,
  type SessionReplayOptions,
  type SessionReplayHandle,
} from '@refraction-ui/analytics-sink-posthog/replay'
