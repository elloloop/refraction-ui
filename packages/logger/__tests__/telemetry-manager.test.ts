import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTelemetry } from '../src/telemetry-manager.js'
import { createMockSink } from '../src/mock-sink.js'
import type { TelemetryConfig } from '../src/types.js'

const baseDev: TelemetryConfig = { app: 'test-app', env: 'development' }
const baseProd: TelemetryConfig = { app: 'test-app', env: 'production' }

describe('createTelemetry', () => {
  // --- Construction / config ---
  describe('config', () => {
    it('returns a logger with all level methods', () => {
      const t = createTelemetry(baseDev)
      expect(typeof t.debug).toBe('function')
      expect(typeof t.info).toBe('function')
      expect(typeof t.warn).toBe('function')
      expect(typeof t.error).toBe('function')
      expect(typeof t.fatal).toBe('function')
      expect(typeof t.child).toBe('function')
      expect(typeof t.startSpan).toBe('function')
      expect(typeof t.flush).toBe('function')
    })

    it('registers a console sink by default (no endpoint)', () => {
      const t = createTelemetry(baseDev)
      expect(t.sinks).toEqual(['console'])
    })

    it('addSink / removeSink manage extra sinks in order', () => {
      const t = createTelemetry(baseDev)
      t.addSink(createMockSink('a'))
      t.addSink(createMockSink('b'))
      expect(t.sinks).toEqual(['console', 'a', 'b'])
      t.removeSink('a')
      expect(t.sinks).toEqual(['console', 'b'])
    })

    it('removeSink is a no-op for unknown sink', () => {
      const t = createTelemetry(baseDev)
      t.removeSink('nope')
      expect(t.sinks).toEqual(['console'])
    })

    it('addSink with same name replaces in place', () => {
      const t = createTelemetry(baseDev)
      const a1 = createMockSink('x')
      const a2 = createMockSink('x')
      t.addSink(a1)
      t.addSink(a2)
      expect(t.sinks).toEqual(['console', 'x'])
    })
  })

  // --- Preset selection ---
  describe('preset selection', () => {
    it('development preset emits debug-level records synchronously', () => {
      const t = createTelemetry(baseDev)
      const sink = createMockSink()
      t.addSink(sink)
      t.debug('hello')
      expect(sink.logs).toHaveLength(1)
      expect(sink.logs[0].level).toBe('debug')
      expect(sink.logs[0].app).toBe('test-app')
      expect(sink.logs[0].env).toBe('development')
    })

    it('production preset drops records below warn', async () => {
      const t = createTelemetry({ ...baseProd, sampleRate: 1 })
      const sink = createMockSink()
      t.addSink(sink)
      t.debug('drop me')
      t.info('drop me too')
      t.warn('keep me')
      t.error('keep me too')
      // Production batches — flush to deliver buffered (>= warn) records.
      await t.flush()
      expect(sink.logs.map((l) => l.level)).toEqual(['warn', 'error'])
    })

    it('explicit sampleRate overrides preset default', async () => {
      const rnd = vi.spyOn(Math, 'random').mockReturnValue(0.9)
      const t = createTelemetry({ ...baseProd, sampleRate: 0 })
      const sink = createMockSink()
      t.addSink(sink)
      t.error('sampled out')
      await t.flush()
      // sampleRate:0 drops before buffering — flush yields nothing.
      expect(sink.logs).toHaveLength(0)
      rnd.mockRestore()
    })

    it('sampleRate=1 keeps everything', () => {
      const t = createTelemetry({ ...baseDev, sampleRate: 1 })
      const sink = createMockSink()
      t.addSink(sink)
      for (let i = 0; i < 10; i++) t.info(`m${i}`)
      expect(sink.logs).toHaveLength(10)
    })
  })

  // --- Child-logger context binding ---
  describe('child context binding', () => {
    it('child binds context onto every record', () => {
      const t = createTelemetry(baseDev)
      const sink = createMockSink()
      t.addSink(sink)
      const child = t.child({ sessionId: 's1', interviewId: 'i1' })
      child.info('joined', { turnId: 't1' })
      expect(sink.logs[0].context).toEqual({
        sessionId: 's1',
        interviewId: 'i1',
        turnId: 't1',
      })
    })

    it('nested children merge and override parent context', () => {
      const t = createTelemetry(baseDev)
      const sink = createMockSink()
      t.addSink(sink)
      const a = t.child({ sessionId: 's1', role: 'root' })
      const b = a.child({ interviewId: 'i1', role: 'child' })
      b.warn('nested')
      expect(sink.logs[0].context).toEqual({
        sessionId: 's1',
        interviewId: 'i1',
        role: 'child',
      })
    })

    it('parent logger is unaffected by child context', () => {
      const t = createTelemetry(baseDev)
      const sink = createMockSink()
      t.addSink(sink)
      t.child({ sessionId: 's1' })
      t.info('root only')
      expect(sink.logs[0].context).toEqual({})
    })

    it('child shares the same sink registry as the parent', () => {
      const t = createTelemetry(baseDev)
      const sink = createMockSink('shared')
      t.addSink(sink)
      const child = t.child({ a: 1 })
      expect(child.sinks).toEqual(['console', 'shared'])
    })
  })

  // --- Span lifecycle ---
  describe('span lifecycle', () => {
    it('startSpan/end emits a span record with duration', () => {
      const t = createTelemetry(baseDev)
      const sink = createMockSink()
      t.addSink(sink)
      const span = t.startSpan('load-model', { model: 'gpt' })
      span.end()
      expect(sink.spans).toHaveLength(1)
      expect(sink.spans[0].name).toBe('load-model')
      expect(sink.spans[0].status).toBe('ok')
      expect(sink.spans[0].context).toMatchObject({ model: 'gpt' })
      expect(sink.spans[0].durationMs).toBeGreaterThanOrEqual(0)
    })

    it('span end is idempotent', () => {
      const t = createTelemetry(baseDev)
      const sink = createMockSink()
      t.addSink(sink)
      const span = t.startSpan('once')
      span.end()
      span.end()
      expect(sink.spans).toHaveLength(1)
    })

    it('span end with error sets status=error and captures message', () => {
      const t = createTelemetry(baseDev)
      const sink = createMockSink()
      t.addSink(sink)
      const span = t.startSpan('risky')
      span.end({ error: new Error('boom') })
      expect(sink.spans[0].status).toBe('error')
      expect(sink.spans[0].error).toEqual({ name: 'Error', message: 'boom' })
    })

    it('span inherits bound child context', () => {
      const t = createTelemetry(baseDev)
      const sink = createMockSink()
      t.addSink(sink)
      const child = t.child({ sessionId: 's1' })
      child.startSpan('work', { step: 1 }).end({ attributes: { step: 2 } })
      expect(sink.spans[0].context).toEqual({ sessionId: 's1', step: 2 })
    })
  })

  // --- Redaction ---
  describe('redaction', () => {
    it('strips configured keys from log context', () => {
      const t = createTelemetry({ ...baseDev, redactKeys: ['password', 'token'] })
      const sink = createMockSink()
      t.addSink(sink)
      t.info('login', { user: 'a', password: 'hunter2', token: 'abc' })
      expect(sink.logs[0].context).toEqual({
        user: 'a',
        password: '[REDACTED]',
        token: '[REDACTED]',
      })
    })

    it('redacts deeply and case-insensitively', () => {
      const t = createTelemetry({ ...baseDev, redactKeys: ['secret'] })
      const sink = createMockSink()
      t.addSink(sink)
      t.info('m', { nested: { SECRET: 'x', ok: 1 } })
      expect(sink.logs[0].context).toEqual({ nested: { SECRET: '[REDACTED]', ok: 1 } })
    })

    it('redacts span context too', () => {
      const t = createTelemetry({ ...baseDev, redactKeys: ['apikey'] })
      const sink = createMockSink()
      t.addSink(sink)
      t.startSpan('call', { apikey: 'sk-1', endpoint: '/x' }).end()
      expect(sink.spans[0].context).toEqual({
        apikey: '[REDACTED]',
        endpoint: '/x',
      })
    })
  })

  // --- Behavior: disabled => zero emissions ---
  describe('disabled kill switch', () => {
    it('enabled:false produces zero emissions and no sinks', () => {
      const t = createTelemetry({ ...baseDev, enabled: false })
      const sink = createMockSink()
      t.addSink(sink)
      t.info('nope')
      t.error('still nope')
      t.startSpan('x').end()
      expect(sink.logs).toHaveLength(0)
      expect(sink.spans).toHaveLength(0)
      expect(t.sinks).toEqual([])
    })

    it('disabled child loggers are also silent', () => {
      const t = createTelemetry({ ...baseDev, enabled: false })
      const sink = createMockSink()
      t.addSink(sink)
      t.child({ a: 1 }).warn('quiet')
      expect(sink.logs).toHaveLength(0)
    })
  })

  // --- Behavior: no endpoint => console only ---
  describe('no endpoint => console only', () => {
    let logSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      logSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    })
    afterEach(() => logSpy.mockRestore())

    it('uses only the console sink and writes to console', () => {
      const t = createTelemetry(baseDev)
      expect(t.sinks).toEqual(['console'])
      t.info('to console')
      expect(logSpy).toHaveBeenCalledTimes(1)
      expect(String(logSpy.mock.calls[0][0])).toContain('to console')
    })
  })

  // --- Behavior: prod preset batches & flushes on pagehide ---
  describe('prod preset batching + pagehide flush', () => {
    const listeners = new Map<string, Array<() => void>>()
    const g = globalThis as unknown as {
      addEventListener?: unknown
      document?: unknown
    }
    let hadAdd: boolean
    let hadDoc: boolean

    beforeEach(() => {
      listeners.clear()
      // Node env has no DOM — stub the page lifecycle surface the manager
      // probes (window.addEventListener + document.visibilityState).
      hadAdd = 'addEventListener' in g
      hadDoc = 'document' in g
      g.addEventListener = (type: string, fn: () => void) => {
        const arr = listeners.get(type) ?? []
        arr.push(fn)
        listeners.set(type, arr)
      }
      g.document = { visibilityState: 'hidden' }
    })
    afterEach(() => {
      if (!hadAdd) delete g.addEventListener
      if (!hadDoc) delete g.document
    })

    it('buffers records until batchSize, then flushes', async () => {
      const t = createTelemetry({ ...baseProd, sampleRate: 1 })
      const sink = createMockSink()
      t.addSink(sink)
      // batchSize is 20; emit 19 warns -> still buffered
      for (let i = 0; i < 19; i++) t.warn(`w${i}`)
      expect(sink.logs).toHaveLength(0)
      // 20th triggers an automatic flush
      t.warn('w19')
      await Promise.resolve()
      expect(sink.logs).toHaveLength(20)
    })

    it('explicit flush() delivers buffered records and calls sink.flush', async () => {
      const t = createTelemetry({ ...baseProd, sampleRate: 1 })
      const sink = createMockSink()
      t.addSink(sink)
      t.error('buffered')
      expect(sink.logs).toHaveLength(0)
      await t.flush()
      expect(sink.logs).toHaveLength(1)
      expect(sink.flushCalls).toBeGreaterThanOrEqual(1)
    })

    it('registers pagehide + visibilitychange listeners and flushes on pagehide', async () => {
      const t = createTelemetry({ ...baseProd, sampleRate: 1 })
      const sink = createMockSink()
      t.addSink(sink)
      t.warn('pending')
      expect(listeners.has('pagehide')).toBe(true)
      expect(listeners.has('visibilitychange')).toBe(true)
      // Fire pagehide -> buffered record should be delivered.
      for (const fn of listeners.get('pagehide')!) fn()
      await Promise.resolve()
      expect(sink.logs).toHaveLength(1)
      expect(sink.logs[0].message).toBe('pending')
    })
  })
})
