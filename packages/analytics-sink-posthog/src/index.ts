/**
 * @refraction-ui/analytics-sink-posthog
 *
 * A PostHog `AnalyticsSink` for `@refraction-ui/analytics`. PostHog is *just
 * a sink* — register it via `config.sinks` or `analytics.addSink(...)`.
 *
 * - `http` mode (DEFAULT): pure protocol adapter against PostHog's
 *   `/capture` + `/batch` API. No `posthog-js`. Server-relay friendly.
 * - `client-sdk` mode (OPTIONAL): lazily dynamic-imports `posthog-js`.
 *
 * Session replay is intentionally NOT exported here. Import the separate
 * `@refraction-ui/analytics-sink-posthog/replay` module to opt in — it is
 * never on the event path and tree-shakes away when unused.
 */

export { createPostHogSink } from './sink.js'
export type { PostHogSinkMode, PostHogSinkOptions } from './sink.js'

export { createPostHogHttpSink } from './http-sink.js'
export type { PostHogHttpSinkOptions } from './http-sink.js'

export { createPostHogClientSdkSink } from './client-sdk-sink.js'
export type { PostHogClientSdkSinkOptions } from './client-sdk-sink.js'

export { toPostHogEvent, toPostHogBatch, distinctId } from './mapping.js'
export type { PostHogEvent } from './mapping.js'
