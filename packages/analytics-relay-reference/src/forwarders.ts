/**
 * Server-side fan-out forwarders.
 *
 * The reference relay accepts the canonical Segment-spec batch and then fans
 * each event out to downstream destinations *server-side* (ad-blocker-proof —
 * the browser only ever ships our neutral router to our own `endpoint`).
 *
 * Two reference forwarders are provided:
 *
 *   - GA4 Measurement Protocol  (`POST /mp/collect`)
 *   - Azure Application Insights (`POST /v2/track`)
 *
 * Both are deliberately thin and use only an injectable `fetch` so the
 * conformance suite can assert the exact downstream wire shape without any
 * network or vendor SDK. The mapping is *collection parity*: identity and the
 * canonical params map directly; reporting is delegated to the vendor.
 */

import type { AnalyticsEvent } from '@refraction-ui/analytics'

export type ForwarderFetch = (
  url: string,
  init: {
    method: string
    headers: Record<string, string>
    body: string
  },
) => Promise<{ status: number }>

/** A downstream destination the relay fans every accepted event out to. */
export interface Forwarder {
  /** Stable id (used in delivery reports / logs). */
  readonly name: string
  /** Forward a single canonical event. Never throws — returns ok/!ok. */
  forward(event: AnalyticsEvent): Promise<{ ok: boolean; status: number }>
}

/* ------------------------------------------------------------------ */
/* GA4 Measurement Protocol                                            */
/* ------------------------------------------------------------------ */

export interface GA4ForwarderOptions {
  measurementId: string
  apiSecret: string
  /** Override the MP base (defaults to the real Google endpoint). */
  baseUrl?: string
  fetchImpl: ForwarderFetch
}

/**
 * GA4 has no `screen` call; map screen→page-like and identify→a `login`
 * style event so collection parity holds. `userId` maps to GA4 `user_id`,
 * `anonymousId` to the MP `client_id`.
 */
function ga4EventName(ev: AnalyticsEvent): string {
  switch (ev.type) {
    case 'page':
      return 'page_view'
    case 'screen':
      return 'screen_view'
    case 'identify':
      return 'identify'
    case 'group':
      return 'group'
    case 'alias':
      return 'alias'
    case 'track':
    default:
      return sanitizeGa4Name(ev.event ?? 'track')
  }
}

/** GA4 event names must be snake_case-ish: [a-zA-Z0-9_], <=40 chars. */
function sanitizeGa4Name(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
    .toLowerCase()
}

export function createGA4Forwarder(opts: GA4ForwarderOptions): Forwarder {
  const base = (opts.baseUrl ?? 'https://www.google-analytics.com').replace(
    /\/+$/,
    '',
  )
  return {
    name: 'ga4',
    async forward(ev) {
      const url =
        `${base}/mp/collect` +
        `?measurement_id=${encodeURIComponent(opts.measurementId)}` +
        `&api_secret=${encodeURIComponent(opts.apiSecret)}`

      const params: Record<string, unknown> = {
        ...(ev.properties ?? {}),
        ...(ev.traits ?? {}),
        session_id: ev.sessionId,
        engagement_time_msec: 1,
      }

      const payload = {
        client_id: ev.anonymousId,
        ...(ev.userId ? { user_id: ev.userId } : {}),
        timestamp_micros: new Date(ev.timestamp).getTime() * 1000,
        non_personalized_ads: false,
        events: [{ name: ga4EventName(ev), params }],
      }

      try {
        const res = await opts.fetchImpl(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        return { ok: res.status >= 200 && res.status < 300, status: res.status }
      } catch {
        return { ok: false, status: 0 }
      }
    },
  }
}

/* ------------------------------------------------------------------ */
/* Azure Application Insights                                          */
/* ------------------------------------------------------------------ */

export interface AzureForwarderOptions {
  instrumentationKey: string
  /** Override the ingestion base (defaults to the real Azure endpoint). */
  baseUrl?: string
  fetchImpl: ForwarderFetch
}

/**
 * Azure App Insights ingests an `Envelope` with a typed `data.baseData`.
 * track/page → `EventData` / `PageViewData`; identify maps onto the
 * `ai.user.authUserId` / `ai.user.id` context tags. We keep only the
 * subset needed to demonstrate collection parity.
 */
export function createAzureForwarder(opts: AzureForwarderOptions): Forwarder {
  const base = (opts.baseUrl ?? 'https://dc.services.visualstudio.com').replace(
    /\/+$/,
    '',
  )
  return {
    name: 'azure-app-insights',
    async forward(ev) {
      const isPageView = ev.type === 'page' || ev.type === 'screen'
      const baseType = isPageView ? 'PageViewData' : 'EventData'
      const name = ev.event ?? ev.type

      const envelope = {
        name: `Microsoft.ApplicationInsights.${
          isPageView ? 'PageView' : 'Event'
        }`,
        time: ev.timestamp,
        iKey: opts.instrumentationKey,
        tags: {
          'ai.user.id': ev.anonymousId,
          ...(ev.userId ? { 'ai.user.authUserId': ev.userId } : {}),
          'ai.session.id': ev.sessionId,
          'ai.cloud.role': ev.context.app,
        },
        data: {
          baseType,
          baseData: {
            ver: 2,
            name,
            properties: stringifyValues({
              ...(ev.properties ?? {}),
              ...(ev.traits ?? {}),
              env: ev.context.env,
              messageId: ev.messageId,
            }),
          },
        },
      }

      try {
        const res = await opts.fetchImpl(`${base}/v2/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(envelope),
        })
        return { ok: res.status >= 200 && res.status < 300, status: res.status }
      } catch {
        return { ok: false, status: 0 }
      }
    },
  }
}

/** App Insights `properties` is a string→string map. */
function stringifyValues(o: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(o)) {
    out[k] = typeof v === 'string' ? v : JSON.stringify(v)
  }
  return out
}
