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
