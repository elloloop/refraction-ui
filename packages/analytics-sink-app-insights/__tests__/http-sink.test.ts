import { describe, it, expect, vi } from 'vitest'
import type { AnalyticsEvent } from '@refraction-ui/analytics'
import { SCHEMA_VERSION } from '@refraction-ui/analytics'
import {
  createAppInsightsSink,
  buildIngestEnvelope,
} from '../src/app-insights-sink.js'

const CTX = { unload: false }

function makeEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    type: 'track',
    event: 'Signup Clicked',
    messageId: 'mid-1',
    anonymousId: 'anon-1',
    sessionId: 'sess-1',
    properties: { plan: 'pro', revenue: 42 },
    context: {
      app: 'my-app',
      env: 'production',
      library: { name: '@refraction-ui/analytics', version: '0.1.0' },
    },
    timestamp: '2026-05-16T12:00:00.000Z',
    schemaVersion: SCHEMA_VERSION,
    ...overrides,
  }
}

/** A mock App Insights ingestion backend — records calls, no network. */
function mockIngest(
  responder: (n: number) => { status: number } = () => ({ status: 200 }),
) {
  const calls: Array<{
    url: string
    method: string
    headers: Record<string, string>
    body: unknown
  }> = []
  let n = 0
  const fetchImpl = vi.fn(
    async (url: string, init?: RequestInit): Promise<Response> => {
      calls.push({
        url,
        method: init?.method ?? 'GET',
        headers: (init?.headers ?? {}) as Record<string, string>,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      })
      const { status } = responder(n++)
      return { status, ok: status >= 200 && status < 300 } as Response
    },
  )
  return { calls, fetchImpl: fetchImpl as unknown as typeof fetch }
}

describe('http sink — /v2/track ingestion envelope', () => {
  it('POSTs a JSON array of Breeze envelopes to {endpoint}/v2/track', async () => {
    const be = mockIngest()
    const sink = createAppInsightsSink({
      mode: 'http',
      instrumentationKey: 'IKEY-123',
      endpoint: 'https://dc.example.com/',
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([makeEvent({ event: 'A' }), makeEvent({ event: 'B' })], CTX)

    expect(be.calls).toHaveLength(1)
    const call = be.calls[0]
    expect(call.method).toBe('POST')
    expect(call.url).toBe('https://dc.example.com/v2/track')
    expect(call.headers['Content-Type']).toBe('application/json')
    const body = call.body as Array<{
      name: string
      iKey: string
      data: { baseType: string; baseData: { name: string } }
    }>
    expect(body).toHaveLength(2)
    expect(body[0].name).toBe('Microsoft.ApplicationInsights.Event')
    expect(body[0].iKey).toBe('IKEY-123')
    expect(body[0].data.baseType).toBe('EventData')
    expect(body[0].data.baseData.name).toBe('A')
    expect(body[1].data.baseData.name).toBe('B')
  })

  it('defaults to the public global ingestion endpoint', async () => {
    const be = mockIngest()
    const sink = createAppInsightsSink({
      mode: 'http',
      instrumentationKey: 'k',
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([makeEvent()], CTX)
    expect(be.calls[0].url).toBe(
      'https://dc.services.visualstudio.com/v2/track',
    )
  })

  it('splits properties vs measurements in baseData', async () => {
    const be = mockIngest()
    const sink = createAppInsightsSink({
      mode: 'http',
      instrumentationKey: 'k',
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([makeEvent()], CTX)
    const env = (be.calls[0].body as Array<{
      data: {
        baseData: {
          properties: Record<string, string>
          measurements: Record<string, number>
        }
      }
    }>)[0]
    expect(env.data.baseData.properties.plan).toBe('pro')
    expect(env.data.baseData.measurements.revenue).toBe(42)
  })

  it('carries session/user/operation correlation tags', async () => {
    const be = mockIngest()
    const sink = createAppInsightsSink({
      mode: 'http',
      instrumentationKey: 'k',
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([makeEvent({ userId: 'user_42' })], CTX)
    const env = (be.calls[0].body as Array<{ tags: Record<string, string> }>)[0]
    expect(env.tags['ai.session.id']).toBe('sess-1')
    expect(env.tags['ai.user.id']).toBe('anon-1')
    expect(env.tags['ai.operation.id']).toBe('mid-1')
    expect(env.tags['ai.user.authUserId']).toBe('user_42')
    expect(env.tags['ai.cloud.role']).toBe('my-app')
  })

  it('emits PageViewData for page events', async () => {
    const be = mockIngest()
    const sink = createAppInsightsSink({
      mode: 'http',
      instrumentationKey: 'k',
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([makeEvent({ type: 'page', event: 'Pricing' })], CTX)
    const env = (be.calls[0].body as Array<{
      name: string
      data: { baseType: string; baseData: { name: string } }
    }>)[0]
    expect(env.name).toBe('Microsoft.ApplicationInsights.PageView')
    expect(env.data.baseType).toBe('PageViewData')
    expect(env.data.baseData.name).toBe('Page View: Pricing')
  })

  it('does nothing for an empty batch', async () => {
    const be = mockIngest()
    const sink = createAppInsightsSink({
      mode: 'http',
      instrumentationKey: 'k',
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([], CTX)
    expect(be.calls).toHaveLength(0)
  })

  it('never loads the browser SDK in http mode', async () => {
    // No @microsoft/applicationinsights-web is installed; if http mode tried
    // to import it this would throw. It must not.
    const be = mockIngest()
    const sink = createAppInsightsSink({
      mode: 'http',
      instrumentationKey: 'k',
      fetchImpl: be.fetchImpl,
    })
    await expect(sink.deliver([makeEvent()], CTX)).resolves.toBeUndefined()
  })
})

describe('http sink — response codes', () => {
  it('200 → no retry', async () => {
    const be = mockIngest(() => ({ status: 200 }))
    const sink = createAppInsightsSink({
      mode: 'http',
      instrumentationKey: 'k',
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([makeEvent()], CTX)
    expect(be.calls).toHaveLength(1)
  })

  it('400/401/403/413 → drop, never retry', async () => {
    for (const status of [400, 401, 403, 413]) {
      const be = mockIngest(() => ({ status }))
      const sink = createAppInsightsSink({
        mode: 'http',
        instrumentationKey: 'k',
        maxRetries: 5,
        fetchImpl: be.fetchImpl,
      })
      await sink.deliver([makeEvent()], CTX)
      expect(be.calls).toHaveLength(1)
    }
  })

  it('429 → exponential backoff retry, then give up after maxRetries', async () => {
    vi.useFakeTimers()
    const be = mockIngest(() => ({ status: 429 }))
    const sink = createAppInsightsSink({
      mode: 'http',
      instrumentationKey: 'k',
      maxRetries: 3,
      backoffBaseMs: 10,
      fetchImpl: be.fetchImpl,
    })
    const p = sink.deliver([makeEvent()], CTX)
    await vi.runAllTimersAsync()
    await p
    expect(be.calls).toHaveLength(4) // initial + 3 retries
    vi.useRealTimers()
  })

  it('5xx → retried until the backend recovers', async () => {
    vi.useFakeTimers()
    const be = mockIngest((n) => ({ status: n < 2 ? 503 : 200 }))
    const sink = createAppInsightsSink({
      mode: 'http',
      instrumentationKey: 'k',
      maxRetries: 5,
      backoffBaseMs: 10,
      fetchImpl: be.fetchImpl,
    })
    const p = sink.deliver([makeEvent()], CTX)
    await vi.runAllTimersAsync()
    await p
    expect(be.calls).toHaveLength(3)
    vi.useRealTimers()
  })

  it('network error is treated as transient and retried', async () => {
    vi.useFakeTimers()
    let n = 0
    const fetchImpl = vi.fn(async () => {
      if (n++ < 1) throw new Error('network down')
      return { status: 200, ok: true } as Response
    }) as unknown as typeof fetch
    const sink = createAppInsightsSink({
      mode: 'http',
      instrumentationKey: 'k',
      maxRetries: 3,
      backoffBaseMs: 10,
      fetchImpl,
    })
    const p = sink.deliver([makeEvent()], CTX)
    await vi.runAllTimersAsync()
    await p
    expect(
      (fetchImpl as unknown as { mock: { calls: unknown[] } }).mock.calls,
    ).toHaveLength(2)
    vi.useRealTimers()
  })
})

describe('buildIngestEnvelope — identity surface', () => {
  it('anonymous event has anonymous="true" and no authUserId tag', () => {
    const env = buildIngestEnvelope(makeEvent(), 'k')
    expect(env.data.baseData.properties.anonymous).toBe('true')
    expect('ai.user.authUserId' in env.tags).toBe(false)
  })

  it('identified event sets authenticatedUserId + authUserId tag', () => {
    const env = buildIngestEnvelope(makeEvent({ userId: 'u9' }), 'k')
    expect(env.data.baseData.properties.authenticatedUserId).toBe('u9')
    expect(env.data.baseData.properties.anonymous).toBe('false')
    expect(env.tags['ai.user.authUserId']).toBe('u9')
  })

  it('stamps iKey, time and schema version', () => {
    const env = buildIngestEnvelope(makeEvent(), 'IKEY')
    expect(env.iKey).toBe('IKEY')
    expect(env.time).toBe('2026-05-16T12:00:00.000Z')
    expect(env.data.baseData.ver).toBe(2)
    expect(env.data.baseData.measurements.schemaVersion).toBe(SCHEMA_VERSION)
  })
})
