/**
 * `createGA4Sink` — the single entry point. Dispatches on `mode`:
 *   - `mode: 'client-sdk'` → lazy gtag.js adapter
 *   - `mode: 'http'` (default) → Measurement Protocol adapter, no vendor lib
 *
 * Default is `http` to honour the epic's "default = protocol adapters (no
 * vendor libs in the browser)" stance. GA4 is just a sink — register it via
 * `createAnalytics({ sinks: [createGA4Sink(...)] })` or `analytics.addSink`.
 *
 * Both factories are independent modules. The `http` factory has ZERO
 * references to gtag.js / DOM-script code, and the `client-sdk` factory only
 * touches the vendor script lazily (first delivery). Selecting one mode never
 * executes the other's load path; consumers that only ever construct an
 * `http` sink never run any vendor code.
 */

import type { AnalyticsSink } from '@refraction-ui/analytics'
import type { GA4SinkOptions } from './types.js'
import { createGA4HttpSink } from './http-sink.js'
import { createGA4ClientSdkSink } from './client-sdk-sink.js'

export function createGA4Sink(options: GA4SinkOptions): AnalyticsSink {
  if (options.mode === 'client-sdk') {
    return createGA4ClientSdkSink(options)
  }
  return createGA4HttpSink(options)
}
