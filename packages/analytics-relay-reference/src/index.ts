/**
 * @refraction-ui/analytics-relay-reference
 *
 * A minimal, dependency-free **reference server-relay backend** that
 * implements the @refraction-ui/analytics Segment HTTP Tracking API wire
 * contract and fans accepted events out, server-side, to GA4 (Measurement
 * Protocol) and Azure Application Insights.
 *
 * INTERNAL — never published (`"private": true`, version 0.0.0). It exists so
 * the core `http` sink can be conformance-tested against a real backend and
 * so the documented wire contract has an executable reference implementation.
 *
 * The browser only ever ships our neutral router to *your* `endpoint`; the
 * relay does the vendor fan-out — that is the recommended ad-blocker-proof
 * production topology.
 */

export {
  createRelay,
  MAX_BATCH_BYTES,
  MAX_EVENT_BYTES,
} from './collector.js'
export type {
  AnalyticsRelay,
  RelayOptions,
  RelayRequest,
  RelayResponse,
  RelayBatchEnvelope,
  QueuedEvent,
} from './collector.js'

export { createNodeRelayServer } from './server.js'
export type { NodeRelayServer } from './server.js'

export {
  createGA4Forwarder,
  createAzureForwarder,
} from './forwarders.js'
export type {
  Forwarder,
  ForwarderFetch,
  GA4ForwarderOptions,
  AzureForwarderOptions,
} from './forwarders.js'
