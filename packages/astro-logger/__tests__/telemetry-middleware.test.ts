import { describe, it, expect, vi } from 'vitest'
import {
  createTelemetryMiddleware,
  type TelemetryMiddlewareContext,
} from '../src/telemetry-middleware.js'
import { createTelemetry, createMockSink } from '@refraction-ui/logger'

/**
 * These tests exercise the REAL @refraction-ui/logger core through the Astro
 * middleware adapter — no stubs of the core. We attach a real `createMockSink`
 * (shipped by the core) to assert the records the core actually produced.
 */

function makeContext(
  url = 'https://example.test/dashboard',
  method = 'GET',
): TelemetryMiddlewareContext {
  return {
    request: new Request(url, { method }),
    locals: {},
  }
}

describe('createTelemetryMiddleware (real core)', () => {
  it('returns an onRequest handler', () => {
    const onRequest = createTelemetryMiddleware({ app: 'web', env: 'development' })
    expect(typeof onRequest).toBe('function')
  })

  it('exposes a per-request child logger on context.locals (default key)', async () => {
    const onRequest = createTelemetryMiddleware({ app: 'web', env: 'development' })
    const ctx = makeContext()
    await onRequest(ctx, () => new Response('ok'))
    const logger = ctx.locals.telemetry as { info: unknown; child: unknown }
    expect(logger).toBeDefined()
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.child).toBe('function')
  })

  it('honors a custom localsKey', async () => {
    const onRequest = createTelemetryMiddleware({
      app: 'web',
      env: 'development',
      localsKey: 'log',
    })
    const ctx = makeContext()
    await onRequest(ctx, () => new Response('ok'))
    expect(ctx.locals.log).toBeDefined()
    expect(ctx.locals.telemetry).toBeUndefined()
  })

  it('returns the downstream response unchanged', async () => {
    const onRequest = createTelemetryMiddleware({ app: 'web', env: 'development' })
    const res = new Response('payload', { status: 201 })
    const out = await onRequest(makeContext(), () => res)
    expect(out).toBe(res)
    expect(out.status).toBe(201)
    expect(await out.text()).toBe('payload')
  })

  it('records a request span on the real core with method/path + status', async () => {
    const sink = createMockSink()
    // Reuse a provided telemetry instance so we can attach our sink and read it.
    const telemetry = createTelemetry({ app: 'web', env: 'development' })
    telemetry.addSink(sink)
    const onRequest = createTelemetryMiddleware({
      app: 'web',
      env: 'development',
      telemetry,
    })

    await onRequest(
      makeContext('https://example.test/api/users?page=2', 'POST'),
      () => new Response('ok', { status: 200 }),
    )

    expect(sink.spans).toHaveLength(1)
    const span = sink.spans[0]
    expect(span.name).toBe('astro.request')
    expect(span.status).toBe('ok')
    expect(span.context).toMatchObject({
      method: 'POST',
      path: '/api/users',
      status: 200,
    })
    expect(span.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('marks the span as errored and logs when downstream throws', async () => {
    const sink = createMockSink()
    const telemetry = createTelemetry({ app: 'web', env: 'development' })
    telemetry.addSink(sink)
    const onRequest = createTelemetryMiddleware({
      app: 'web',
      env: 'development',
      telemetry,
    })

    const boom = new Error('downstream failed')
    await expect(
      onRequest(makeContext('https://example.test/x'), () => {
        throw boom
      }),
    ).rejects.toThrow('downstream failed')

    expect(sink.spans).toHaveLength(1)
    expect(sink.spans[0].status).toBe('error')
    expect(sink.spans[0].error).toEqual({
      name: 'Error',
      message: 'downstream failed',
    })
    const errorLog = sink.logs.find((l) => l.level === 'error')
    expect(errorLog?.message).toBe('astro.request.error')
    expect(errorLog?.context).toMatchObject({
      method: 'GET',
      path: '/x',
      message: 'downstream failed',
    })
  })

  it('flushes the real core after the response (production batched preset)', async () => {
    const sink = createMockSink()
    // Production preset batches; flush() must drain the buffer to the sink.
    const telemetry = createTelemetry({
      app: 'web',
      env: 'production',
      sampleRate: 1,
    })
    telemetry.addSink(sink)
    const onRequest = createTelemetryMiddleware({
      app: 'web',
      env: 'production',
      telemetry,
    })

    await onRequest(makeContext(), () => new Response('ok', { status: 500 }))
    // Allow the fire-and-forget flush() microtask to settle.
    await new Promise((r) => setTimeout(r, 0))

    expect(sink.flushCalls).toBeGreaterThanOrEqual(1)
    expect(sink.spans).toHaveLength(1)
    expect(sink.spans[0].context).toMatchObject({ status: 500 })
  })

  it('builds its own telemetry from config when none is provided', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    try {
      const onRequest = createTelemetryMiddleware({
        app: 'svc',
        env: 'development',
      })
      const ctx = makeContext()
      await onRequest(ctx, () => new Response('ok'))
      const logger = ctx.locals.telemetry as {
        info: (m: string) => void
      }
      logger.info('hello from request scope')
      // The real console sink (from the core) wrote the record.
      expect(infoSpy).toHaveBeenCalled()
      expect(String(infoSpy.mock.calls.at(-1)?.[0])).toContain(
        'hello from request scope',
      )
    } finally {
      infoSpy.mockRestore()
    }
  })

  it('enabled:false yields a real noop logger (zero emissions)', async () => {
    const sink = createMockSink()
    const telemetry = createTelemetry({
      app: 'web',
      env: 'development',
      enabled: false,
    })
    telemetry.addSink(sink)
    const onRequest = createTelemetryMiddleware({
      app: 'web',
      env: 'development',
      telemetry,
    })
    await onRequest(makeContext(), () => new Response('ok'))
    expect(sink.logs).toHaveLength(0)
    expect(sink.spans).toHaveLength(0)
  })
})
