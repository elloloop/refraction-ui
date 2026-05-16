// Unified factory (dispatches on `mode`).
export { createGA4Sink } from './ga4-sink.js'

// Direct mode factories (for explicit selection / tree-shaking).
export { createGA4HttpSink } from './http-sink.js'
export { createGA4ClientSdkSink } from './client-sdk-sink.js'

// Pure mapping (canonical envelope → GA4) — reusable / testable in isolation.
export { mapEvent, ga4EventName, toGa4Name } from './mapping.js'
export type { GA4Event, GA4Mapped } from './mapping.js'

// Option contracts.
export type {
  GA4SinkOptions,
  GA4HttpOptions,
  GA4ClientSdkOptions,
  GA4ConsentBridge,
  ConsentState,
  GtagFn,
} from './types.js'
