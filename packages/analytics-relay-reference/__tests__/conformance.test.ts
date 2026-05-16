/**
 * Conformance suite: the core `@refraction-ui/analytics` `http` sink
 * round-tripped against the reference server-relay backend over a real
 * Node HTTP socket.
 *
 * This is the contract test the issue calls for — it proves the sink and
 * the documented wire contract actually agree on:
 *   - the batch format + Basic-auth standard path
 *   - the sendBeacon `?writeKey=` + text/plain unload path
 *   - accept-and-queue 200 / 400 / 401 / 413 / 429 / 5xx semantics
 *   - messageId idempotency (dedupe across batches)
 *   - clock-skew correction (corrected = timestamp + (receivedAt − sentAt))
 *   - server-side fan-out to GA4 + Azure (vendor endpoints mocked)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHttpSink } from '@refraction-ui/analytics'
import { SCHEMA_VERSION } from '@refraction-ui/analytics'
import type { AnalyticsEvent, SinkDeliverContext } from '@refraction-ui/analytics'
import { createNodeRelayServer, type NodeRelayServer } from '../src/server.js'
import {
  createGA4Forwarder,
  createAzureForwarder,
  type ForwarderFetch,
} from '../src/forwarders.js'

const CTX_ONLINE: SinkDeliverContext = { unload: false }
const CTX_UNLOAD: SinkDeliverContext = { unload: true }
const WRITE_KEY = 'WK_conformance'

function makeEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    type: 'track',
    event: 'Signup Clicked',
    messageId: 'mid-' + Math.random().toString(36).slice(2),
    anonymousId: 'anon-1',
    sessionId: 'sess-1',
    properties: { plan: 'pro' },
    context: {
      app: 'conformance-app',
      env: 'test',
      library: { name: '@refraction-ui/analytics', version: '0.1.0' },
    },
    timestamp: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    ...overrides,
  }
}

/** A real `node:http` beacon: POST text/plain to `?writeKey=` (no auth). */
function nodeBeacon(base: string): (url: string, body: string) => boolean {
  return (url, body) => {
    // Fire-and-forget exactly like navigator.sendBeacon.
    void fetch(url.startsWith('http') ? url : base + url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    })
    return true
  }
}

describe('conformance: http sink ↔ reference relay (real socket)', () => {
  let srv: NodeRelayServer
  let base: string

  beforeEach(async () => {
    srv = createNodeRelayServer({ writeKeys: [WRITE_KEY] })
    base = await srv.listen()
  })
  afterEach(async () => {
    await srv.close()
  })

  it('batch path: POST /v{n}/batch, Basic auth, accept-and-queue 200', async () => {
    const sink = createHttpSink({ endpoint: base, writeKey: WRITE_KEY })
    const events = [
      makeEvent({ event: 'A' }),
      makeEvent({ event: 'B', type: 'page' }),
    ]
    await sink.deliver(events, CTX_ONLINE)

    expect(srv.relay.queued).toHaveLength(2)
    expect(srv.relay.queued.map((q) => q.event.event)).toEqual(['A', 'B'])
    // The canonical envelope survived the round-trip verbatim.
    expect(srv.relay.queued[0].event.context.app).toBe('conformance-app')
    expect(srv.relay.queued[0].event.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('beacon path: ?writeKey= + text/plain (no Authorization header)', async () => {
    const sink = createHttpSink({
      endpoint: base,
      writeKey: WRITE_KEY,
      beaconImpl: nodeBeacon(base),
    })
    await sink.deliver([makeEvent({ event: 'unload-ev' })], CTX_UNLOAD)

    // Beacon is fire-and-forget; poll until the relay has queued it.
    await vi.waitFor(() => {
      expect(srv.relay.queued).toHaveLength(1)
    })
    expect(srv.relay.queued[0].event.event).toBe('unload-ev')
  })

  it('401: a bad write key is rejected (client drops, never retries)', async () => {
    const sink = createHttpSink({
      endpoint: base,
      writeKey: 'WRONG_KEY',
      maxRetries: 5,
      backoffBaseMs: 1,
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(srv.relay.queued).toHaveLength(0)
  })

  it('413: an over-cap event never reaches the relay (sink pre-drops)', async () => {
    const sink = createHttpSink({
      endpoint: base,
      writeKey: WRITE_KEY,
      maxEventBytes: 80, // smaller than any real event → sink drops it
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(srv.relay.queued).toHaveLength(0)
  })

  it('413: a batch the sink does send but exceeds the server cap is rejected', async () => {
    await srv.close()
    srv = createNodeRelayServer({
      writeKeys: [WRITE_KEY],
      maxBatchBytes: 300, // server rejects; sink does NOT pre-split (its cap is high)
    })
    base = await srv.listen()
    const sink = createHttpSink({
      endpoint: base,
      writeKey: WRITE_KEY,
      maxBatchBytes: 1_000_000,
      maxRetries: 0,
    })
    await sink.deliver([makeEvent(), makeEvent(), makeEvent()], CTX_ONLINE)
    expect(srv.relay.queued).toHaveLength(0)
  })

  it('429 then 200: sink backs off and the relay finally queues it', async () => {
    await srv.close()
    let calls = 0
    // Wrap the relay server to 429 the first two requests.
    const wrapped = createNodeRelayServer({ writeKeys: [WRITE_KEY] })
    const realHandle = wrapped.relay.handleRequest.bind(wrapped.relay)
    ;(wrapped.relay as { handleRequest: typeof realHandle }).handleRequest =
      async (r) => {
        if (calls++ < 2) {
          return { status: 429, body: { success: false, error: 'slow down' } }
        }
        return realHandle(r)
      }
    srv = wrapped
    base = await srv.listen()

    const sink = createHttpSink({
      endpoint: base,
      writeKey: WRITE_KEY,
      maxRetries: 5,
      backoffBaseMs: 5,
    })
    await sink.deliver([makeEvent({ event: 'eventually' })], CTX_ONLINE)
    expect(calls).toBe(3) // 429, 429, 200
    expect(srv.relay.queued).toHaveLength(1)
    expect(srv.relay.queued[0].event.event).toBe('eventually')
  })

  it('5xx then 200: transient server failure is retried to success', async () => {
    await srv.close()
    let calls = 0
    const wrapped = createNodeRelayServer({ writeKeys: [WRITE_KEY] })
    const realHandle = wrapped.relay.handleRequest.bind(wrapped.relay)
    ;(wrapped.relay as { handleRequest: typeof realHandle }).handleRequest =
      async (r) => {
        if (calls++ < 1) {
          return { status: 503, body: { success: false, error: 'down' } }
        }
        return realHandle(r)
      }
    srv = wrapped
    base = await srv.listen()

    const sink = createHttpSink({
      endpoint: base,
      writeKey: WRITE_KEY,
      maxRetries: 5,
      backoffBaseMs: 5,
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(calls).toBe(2)
    expect(srv.relay.queued).toHaveLength(1)
  })

  it('idempotency: a replayed messageId is deduped across batches', async () => {
    const sink = createHttpSink({ endpoint: base, writeKey: WRITE_KEY })
    const shared = makeEvent({ messageId: 'fixed-mid-1', event: 'once' })

    await sink.deliver([shared], CTX_ONLINE)
    await sink.deliver([shared], CTX_ONLINE) // exact replay (retry scenario)
    await sink.deliver(
      [shared, makeEvent({ messageId: 'fixed-mid-2', event: 'new' })],
      CTX_ONLINE,
    )

    expect(srv.relay.queued).toHaveLength(2)
    expect(srv.relay.queued.map((q) => q.event.event)).toEqual(['once', 'new'])
  })

  it('clock skew: relay applies corrected = timestamp + (receivedAt − sentAt)', async () => {
    // Capture the honest `sentAt` the sink stamps so we can assert the
    // exact wire-contract formula end-to-end (sink → relay).
    let sentAt = ''
    let receivedAt = 0
    const baseFetch = globalThis.fetch
    const spy: typeof fetch = async (input, init) => {
      sentAt = JSON.parse(init?.body as string).sentAt as string
      receivedAt = Date.now()
      return baseFetch(input, init)
    }
    const sink = createHttpSink({
      endpoint: base,
      writeKey: WRITE_KEY,
      fetchImpl: spy,
    })
    const eventTs = new Date(Date.now() - 10 * 60_000).toISOString()
    await sink.deliver([makeEvent({ timestamp: eventTs })], CTX_ONLINE)

    expect(srv.relay.queued).toHaveLength(1)
    const q = srv.relay.queued[0]
    expect(q.event.timestamp).toBe(eventTs) // original preserved verbatim

    // corrected == timestamp + (receivedAt − sentAt). The relay's receivedAt
    // is its own Date.now(); allow a few ms for the in-process round-trip.
    const expected =
      new Date(eventTs).getTime() + (receivedAt - new Date(sentAt).getTime())
    const correctedMs = new Date(q.correctedTimestamp).getTime()
    expect(Math.abs(correctedMs - expected)).toBeLessThan(1_000)
  })

  it('server-side fan-out: GA4 + Azure receive every accepted event', async () => {
    const ga4Hits: Array<{ url: string; body: unknown }> = []
    const azureHits: Array<{ url: string; body: unknown }> = []
    const ga4Fetch: ForwarderFetch = async (url, init) => {
      ga4Hits.push({ url, body: JSON.parse(init.body) })
      return { status: 204 }
    }
    const azureFetch: ForwarderFetch = async (url, init) => {
      azureHits.push({ url, body: JSON.parse(init.body) })
      return { status: 200 }
    }

    await srv.close()
    srv = createNodeRelayServer({
      writeKeys: [WRITE_KEY],
      forwarders: [
        createGA4Forwarder({
          measurementId: 'G-TEST',
          apiSecret: 'secret',
          fetchImpl: ga4Fetch,
        }),
        createAzureForwarder({
          instrumentationKey: 'ikey-1',
          fetchImpl: azureFetch,
        }),
      ],
    })
    base = await srv.listen()

    const sink = createHttpSink({ endpoint: base, writeKey: WRITE_KEY })
    await sink.deliver(
      [
        makeEvent({ event: 'Purchase', userId: 'user_42' }),
        makeEvent({ type: 'page', event: 'Pricing' }),
      ],
      CTX_ONLINE,
    )

    expect(srv.relay.queued).toHaveLength(2)
    expect(ga4Hits).toHaveLength(2)
    expect(azureHits).toHaveLength(2)

    // GA4 Measurement Protocol shape.
    const ga4 = ga4Hits[0]
    expect(ga4.url).toContain('/mp/collect')
    expect(ga4.url).toContain('measurement_id=G-TEST')
    const ga4Body = ga4.body as {
      client_id: string
      user_id?: string
      events: Array<{ name: string; params: Record<string, unknown> }>
    }
    expect(ga4Body.client_id).toBe('anon-1')
    expect(ga4Body.user_id).toBe('user_42')
    expect(ga4Body.events[0].name).toBe('purchase')
    expect(ga4Body.events[0].params.session_id).toBe('sess-1')

    // Azure App Insights envelope shape.
    const az = azureHits[1].body as {
      name: string
      iKey: string
      data: { baseType: string; baseData: { name: string } }
    }
    expect(az.iKey).toBe('ikey-1')
    expect(az.name).toBe('Microsoft.ApplicationInsights.PageView')
    expect(az.data.baseType).toBe('PageViewData')
    expect(az.data.baseData.name).toBe('Pricing')

    // Fan-out results recorded; everything succeeded.
    expect(srv.relay.forwarded.filter((f) => f.name === 'ga4')).toHaveLength(2)
    expect(
      srv.relay.forwarded.every((f) => f.ok),
    ).toBe(true)
  })

  it('malformed JSON body → 400 (client drops, relay queues nothing)', async () => {
    // Drive the relay directly with a corrupt body the sink would never send,
    // proving the 400-no-retry branch of the contract.
    const res = await srv.relay.handleRequest({
      method: 'POST',
      url: `/v${SCHEMA_VERSION}/batch`,
      headers: {
        authorization:
          'Basic ' + Buffer.from(`${WRITE_KEY}:`).toString('base64'),
      },
      rawBody: '{ not json',
      receivedAt: Date.now(),
    })
    expect(res.status).toBe(400)
    expect(srv.relay.queued).toHaveLength(0)
  })
})
