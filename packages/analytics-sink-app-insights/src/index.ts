// Azure Application Insights sink for @refraction-ui/analytics.
export { createAppInsightsSink } from './app-insights-sink.js'
export type {
  AppInsightsSinkOptions,
  AppInsightsSinkMode,
  ClientSdkOptions,
  HttpOptions,
  AppInsightsLike,
} from './app-insights-sink.js'
export { buildIngestEnvelope } from './app-insights-sink.js'

// Envelope → App Insights custom-event mapping (exported for advanced use).
export { mapEvent, eventName } from './mapping.js'
export type { AppInsightsEvent } from './mapping.js'
