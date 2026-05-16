/**
 * GA4 `http` adapter — Measurement Protocol (`/mp/collect`).
 *
 * Server-relay friendly: this path NEVER loads gtag.js or any browser
 * library. It only POSTs JSON to the Measurement Protocol endpoint:
 *
 *   POST {endpoint}/mp/collect?measurement_id={id}&api_secret={secret}
 *   Content-Type: application/json
 *   { client_id, user_id?, user_properties?, events: [{ name, params }] }
 *
 * GA4 Measurement Protocol constraints honoured here:
 *   - up to 25 events per request → batches are chunked.
 *   - `identify` envelopes carry no event; they still POST so user_id /
 *     user_properties propagate (events array may be empty for a user-props
 *     only ping, which GA4 accepts).
 *   - 2xx (incl. 204) = accepted. The MP endpoint always returns 2xx for
 *     well-formed requests; the `debug` endpoint returns validation messages.
 */

import type {
  AnalyticsEvent,
  AnalyticsSink,
  SinkInitContext,
} from '@refraction-ui/analytics'
import type { GA4HttpOptions } from './types.js'
import { mapEvent } from './mapping.js'

const DEFAULT_ENDPOINT = 'https://www.google-analytics.com'
const MAX_EVENTS_PER_REQUEST = 25

interface MPPayload {
  client_id: string
  user_id?: string
  user_properties?: Record<string, { value: unknown }>
  events: Array<{ name: string; params: Record<string, unknown> }>
}

function resolveFetch(opts: GA4HttpOptions): typeof fetch {
  if (opts.fetchImpl) return opts.fetchImpl
  const f = (globalThis as unknown as { fetch?: typeof fetch }).fetch
  if (!f) throw new Error('GA4 http sink: no fetch implementation available')
  return f
}

/**
 * Group consecutive envelopes by GA4 identity (client_id + user_id) so each
 * Measurement Protocol request carries a single identity, then chunk to the
 * 25-event limit.
 */
function buildPayloads(batch: AnalyticsEvent[]): MPPayload[] {
  const payloads: MPPayload[] = []

  for (const ev of batch) {
    const m = mapEvent(ev)
    const last = payloads[payloads.length - 1]
    const sameIdentity =
      last &&
      last.client_id === m.clientId &&
      last.user_id === m.userId &&
      last.events.length < MAX_EVENTS_PER_REQUEST &&
      // user_properties must not silently differ within one request
      JSON.stringify(last.user_properties) ===
        JSON.stringify(m.userProperties)

    const target: MPPayload = sameIdentity
      ? last
      : (() => {
          const p: MPPayload = { client_id: m.clientId, events: [] }
          if (m.userId) p.user_id = m.userId
          if (m.userProperties) p.user_properties = m.userProperties
          payloads.push(p)
          return p
        })()

    if (m.event) {
      target.events.push(m.event)
    }
  }

  // Drop empty payloads that carry neither an event nor user identity
  // signal (nothing to send to GA4).
  return payloads.filter(
    (p) =>
      p.events.length > 0 ||
      p.user_id !== undefined ||
      p.user_properties !== undefined,
  )
}

/**
 * Create the GA4 Measurement-Protocol (`http`) sink.
 *
 * No vendor library is loaded on this path under any circumstance.
 */
export function createGA4HttpSink(options: GA4HttpOptions): AnalyticsSink {
  const {
    measurementId,
    apiSecret,
    consentCategories = ['analytics'],
    name = 'ga4',
    debug = false,
  } = options
  const base = (options.endpoint ?? DEFAULT_ENDPOINT).replace(/\/+$/, '')
  const path = debug ? '/debug/mp/collect' : '/mp/collect'
  const url =
    `${base}${path}?measurement_id=${encodeURIComponent(measurementId)}` +
    `&api_secret=${encodeURIComponent(apiSecret)}`

  return {
    name,
    consentCategories,

    init(_ctx: SinkInitContext): void {
      // No-op: the Measurement Protocol is stateless and credential-driven.
      // Explicitly NO vendor script / SDK is loaded here.
      void _ctx
    },

    async deliver(batch: AnalyticsEvent[]): Promise<void> {
      if (batch.length === 0) return
      const payloads = buildPayloads(batch)
      if (payloads.length === 0) return
      const doFetch = resolveFetch(options)

      for (const payload of payloads) {
        try {
          await doFetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
          })
          // GA4 MP returns 2xx (204) for well-formed requests and never
          // asks for client-side retries; transient failures are dropped.
        } catch {
          // Network failure — GA4 MP is fire-and-forget; drop silently.
        }
      }
    },
  }
}
