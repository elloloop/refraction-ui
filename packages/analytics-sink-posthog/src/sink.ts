import type { AnalyticsSink } from '@refraction-ui/analytics'
import {
  createPostHogHttpSink,
  type PostHogHttpSinkOptions,
} from './http-sink.js'
import {
  createPostHogClientSdkSink,
  type PostHogClientSdkSinkOptions,
} from './client-sdk-sink.js'

/** PostHog fan-out mode. `http` is the default (no browser library). */
export type PostHogSinkMode = 'http' | 'client-sdk'

export type PostHogSinkOptions =
  | ({ mode?: 'http' } & PostHogHttpSinkOptions)
  | ({ mode: 'client-sdk' } & PostHogClientSdkSinkOptions)

/**
 * Create a PostHog `AnalyticsSink`.
 *
 * - `mode: 'http'` (DEFAULT) — pure protocol adapter against PostHog's
 *   `/capture` + `/batch` API. No `posthog-js`. Server-relay friendly.
 * - `mode: 'client-sdk'` — OPTIONAL. Lazily dynamic-imports `posthog-js`
 *   for client-exclusive features. Only loaded if this mode is selected.
 *
 * Session replay is NOT configurable here — import the separate
 * `@refraction-ui/analytics-sink-posthog/replay` module to opt in. It is
 * never on the event path and tree-shakes away when unused.
 */
export function createPostHogSink(
  options: PostHogSinkOptions,
): AnalyticsSink {
  if (options.mode === 'client-sdk') {
    return createPostHogClientSdkSink(options)
  }
  return createPostHogHttpSink(options)
}
