// Angular analytics service + provider
export {
  AnalyticsService,
  ANALYTICS_INSTANCE,
  provideAnalytics,
} from './analytics.service.js'

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
  ConsentAPI,
  SessionAPI,
} from '@refraction-ui/analytics'
