import { describe, it, expect, vi } from 'vitest'
import { createFaroSink } from '../src/faro-engine.js'
import type { LogRecord, SpanRecord } from '../src/types.js'

function makeLog(overrides: Partial<LogRecord> = {}): LogRecord {
  return {
    level: 'warn',
    message: 'faro msg',
    timestamp: 1,
    app: 'app',
    env: 'production',
    context: { sessionId: 's1' },
    ...overrides,
  }
}

function makeSpan(overrides: Partial<SpanRecord> = {}): SpanRecord {
  return {
    name: 'turn',
    startTime: 0,
    endTime: 10,
    durationMs: 10,
    app: 'app',
    env: 'production',
    context: { turnId: 't1' },
    status: 'ok',
    ...overrides,
  }
}

describe('createFaroSink (mock transport, no network)', () => {
  it('returns a sink that forwards logs to the injected transport', async () => {
    const push = vi.fn()
    const sink = await createFaroSink({
      app: 'app',
      endpoint: 'https://collector.example/ingest',
      transport: { push },
    })
    expect(sink).not.toBeNull()
    expect(sink!.name).toBe('faro')

    const record = makeLog()
    sink!.log(record)
    expect(push).toHaveBeenCalledWith({ kind: 'log', record })
  })

  it('forwards spans to the injected transport', async () => {
    const push = vi.fn()
    const sink = await createFaroSink({
      app: 'app',
      endpoint: 'https://collector.example/ingest',
      transport: { push },
    })
    const record = makeSpan()
    sink!.span(record)
    expect(push).toHaveBeenCalledWith({ kind: 'span', record })
  })

  it('flush resolves without I/O', async () => {
    const sink = await createFaroSink({
      app: 'app',
      endpoint: 'https://x',
      transport: { push: vi.fn() },
    })
    await expect(sink!.flush()).resolves.toBeUndefined()
  })

  it('returns null when Faro peers are absent and no transport injected', async () => {
    // The optional @grafana/faro-* peers are NOT installed in this repo, so
    // the dynamic import inside the engine fails and the factory yields null.
    const sink = await createFaroSink({
      app: 'app',
      endpoint: 'https://collector.example/ingest',
    })
    expect(sink).toBeNull()
  })

  it('never leaks Faro/Grafana names through its public surface', async () => {
    const sink = await createFaroSink({
      app: 'app',
      endpoint: 'https://x',
      transport: { push: vi.fn() },
    })
    // Public sink shape is exactly the vendor-neutral TelemetrySink.
    expect(Object.keys(sink!).sort()).toEqual(['flush', 'log', 'name', 'span'])
    expect(sink!.name).toBe('faro')
  })
})
