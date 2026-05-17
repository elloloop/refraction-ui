// Analytics Provider and hooks
export {
  AnalyticsProvider,
  useAnalytics,
  useTrackEvent,
} from './analytics-provider.js'
export type {
  AnalyticsProviderProps,
  UseAnalyticsOptions,
} from './analytics-provider.js'

// Re-export core types/factory for convenience
export { createAnalytics } from '@refraction-ui/analytics'
export type {
  Analytics,
  AnalyticsConfig,
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsProperties,
  AnalyticsContext,
  AnalyticsSink,
  CallOptions,
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
} from '@refraction-ui/analytics-sink-ga4'
export type {
  GA4SinkOptions,
  GA4HttpOptions,
  GA4ClientSdkOptions,
  GA4ConsentBridge,
  ConsentState,
  GtagFn,
} from '@refraction-ui/analytics-sink-ga4'

export { createAppInsightsSink } from '@refraction-ui/analytics-sink-app-insights'
export type {
  AppInsightsSinkOptions,
  AppInsightsSinkMode,
  ClientSdkOptions,
  HttpOptions,
  AppInsightsLike,
} from '@refraction-ui/analytics-sink-app-insights'

export {
  createPostHogSink,
  createPostHogHttpSink,
  createPostHogClientSdkSink,
} from '@refraction-ui/analytics-sink-posthog'
export type {
  PostHogSinkMode,
  PostHogSinkOptions,
  PostHogHttpSinkOptions,
  PostHogClientSdkSinkOptions,
} from '@refraction-ui/analytics-sink-posthog'

// Optional, lazy PostHog session replay (separate `./replay` entry point of
// the sink package — never on the event path, tree-shaken when unused).
export { startSessionReplay } from '@refraction-ui/analytics-sink-posthog/replay'
export type {
  SessionReplayOptions,
  SessionReplayHandle,
} from '@refraction-ui/analytics-sink-posthog/replay'
