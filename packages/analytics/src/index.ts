// Types
export type {
  Analytics,
  AnalyticsConfig,
  AnalyticsEvent,
  AnalyticsEventType,
  AnalyticsProperties,
  AnalyticsContext,
  AnalyticsSink,
  AnalyticsStorage,
  SinkInitContext,
  SinkDeliverContext,
  SessionConfig,
  SessionAPI,
  IdentityConfig,
  ConsentConfig,
  ConsentAPI,
  HttpSinkOptions,
  CallOptions,
} from './types.js'
export { SCHEMA_VERSION } from './types.js'

// Manager
export { createAnalytics } from './analytics-manager.js'

// Built-in sinks
export { createHttpSink } from './http-sink.js'
export { createConsoleSink } from './console-sink.js'
export type { ConsoleSinkOptions } from './console-sink.js'

// Mock sink (for testing)
export { createMockSink } from './mock-sink.js'
export type { MockSink, CreateMockSinkOptions } from './mock-sink.js'

// Engines (advanced / standalone use)
export {
  createSession,
  campaignFingerprint,
  DEFAULT_SESSION_TIMEOUT_MS,
} from './session.js'
export { createIdentity } from './identity.js'
export { createConsent } from './consent.js'
export {
  createRedactor,
  PII_DENY_LIST,
  PII_EXACT_KEYS,
  REDACTED,
} from './redaction.js'
export type { Redactor } from './redaction.js'

// Storage adapters
export {
  createMemoryStorage,
  createLocalStorageAdapter,
  createCookieAdapter,
  resolveStorage,
} from './storage.js'

// Utilities
export { uuidv4, isUuidV4, UUID_V4_RE } from './uuid.js'
