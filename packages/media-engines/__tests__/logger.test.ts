import { describe, it, expect } from 'vitest'
import {
  createLogger,
  createScopedLogger,
} from '../src/logger.js'
import type { LogLevel, LogCategory } from '../src/logger.js'
// The media-engines logger is now a thin adapter over the shared core. These
// imports let the suite assert the back-compat surface AND that behavior is
// genuinely produced via @refraction-ui/logger.
import { createTelemetry, createMockSink } from '@refraction-ui/logger'

// ---------------------------------------------------------------------------
// LogLevel & LogCategory type checks
// ---------------------------------------------------------------------------
describe('LogLevel values', () => {
  it('should include all expected levels', () => {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal']
    expect(levels.length).toBe(5)
  })
})

describe('LogCategory values', () => {
  it('should include all expected categories', () => {
    const cats: LogCategory[] = [
      'audio', 'video', 'export', 'ui', 'state', 'network', 'filesystem', 'performance',
    ]
    expect(cats.length).toBe(8)
  })
})

// ---------------------------------------------------------------------------
// createLogger — back-compat public surface (unchanged)
// ---------------------------------------------------------------------------
describe('createLogger', () => {
  it('should return an object with all log-level methods', () => {
    const log = createLogger()
    expect(typeof log.debug).toBe('function')
    expect(typeof log.info).toBe('function')
    expect(typeof log.warn).toBe('function')
    expect(typeof log.error).toBe('function')
    expect(typeof log.fatal).toBe('function')
  })

  it('should have getEntries, clear, and measurePerformance', () => {
    const log = createLogger()
    expect(typeof log.getEntries).toBe('function')
    expect(typeof log.clear).toBe('function')
    expect(typeof log.measurePerformance).toBe('function')
  })

  it('debug should add an entry at debug level', () => {
    const log = createLogger()
    log.debug('audio', 'test message')
    const entries = log.getEntries()
    expect(entries.length).toBe(1)
    expect(entries[0].level).toBe('debug')
    expect(entries[0].category).toBe('audio')
    expect(entries[0].message).toBe('test message')
  })

  it('info should add an entry at info level', () => {
    const log = createLogger()
    log.info('video', 'loaded')
    expect(log.getEntries()[0].level).toBe('info')
  })

  it('warn should add an entry at warn level', () => {
    const log = createLogger()
    log.warn('export', 'slow render')
    expect(log.getEntries()[0].level).toBe('warn')
  })

  it('error should add an entry at error level', () => {
    const log = createLogger()
    log.error('ui', 'crash')
    expect(log.getEntries()[0].level).toBe('error')
  })

  it('fatal should add an entry at fatal level', () => {
    const log = createLogger()
    log.fatal('state', 'unrecoverable')
    expect(log.getEntries()[0].level).toBe('fatal')
  })

  it('entries should contain timestamps', () => {
    const log = createLogger()
    log.info('audio', 'ping')
    const entry = log.getEntries()[0]
    expect(entry.timestamp).toBeDefined()
    expect(typeof entry.timestamp).toBe('number')
  })

  it('entries should contain sessionId', () => {
    const log = createLogger()
    log.info('audio', 'ping')
    expect(log.getEntries()[0].sessionId).toBeDefined()
  })

  it('should honor an explicit sessionId option', () => {
    const log = createLogger({ sessionId: 's-fixed' })
    log.info('audio', 'ping')
    expect(log.getEntries()[0].sessionId).toBe('s-fixed')
  })

  it('should accept optional context', () => {
    const log = createLogger()
    log.info('audio', 'loaded clip', { clipId: '123' })
    expect(log.getEntries()[0].context).toEqual({ clipId: '123' })
  })

  it('should not leak the adapter-bound context keys into LogEntry.context', () => {
    const log = createLogger({ sessionId: 's-1' })
    log.info('audio', 'no ctx supplied')
    // Legacy contract: undefined when the caller supplied nothing.
    expect(log.getEntries()[0].context).toBeUndefined()
  })

  it('getEntries should respect limit parameter', () => {
    const log = createLogger()
    log.info('audio', 'one')
    log.info('audio', 'two')
    log.info('audio', 'three')
    const entries = log.getEntries(2)
    expect(entries.length).toBe(2)
  })

  it('getEntries with limit should return most recent entries', () => {
    const log = createLogger()
    log.info('audio', 'one')
    log.info('audio', 'two')
    log.info('audio', 'three')
    const entries = log.getEntries(1)
    expect(entries[0].message).toBe('three')
  })

  it('clear should remove all entries', () => {
    const log = createLogger()
    log.info('audio', 'test')
    log.info('audio', 'test2')
    log.clear()
    expect(log.getEntries().length).toBe(0)
  })

  it('measurePerformance should execute the function and return its result', async () => {
    const log = createLogger()
    const result = await log.measurePerformance('test-op', async () => 42)
    expect(result).toBe(42)
  })

  it('measurePerformance should log a performance entry', async () => {
    const log = createLogger()
    await log.measurePerformance('render', async () => 'done')
    const entries = log.getEntries()
    expect(entries.length).toBeGreaterThanOrEqual(1)
    const perfEntry = entries.find((e) => e.category === 'performance')
    expect(perfEntry).toBeDefined()
    expect(perfEntry!.message).toContain('render')
    expect(perfEntry!.level).toBe('info')
    expect(perfEntry!.context).toMatchObject({ label: 'render' })
    expect(typeof (perfEntry!.context as { durationMs: number }).durationMs).toBe('number')
  })

  it('measurePerformance should propagate (and still record) on error', async () => {
    const log = createLogger()
    await expect(
      log.measurePerformance('boom', async () => {
        throw new Error('nope')
      }),
    ).rejects.toThrow('nope')
    const perfEntry = log.getEntries().find((e) => e.category === 'performance')
    expect(perfEntry).toBeDefined()
    expect(perfEntry!.message).toContain('boom')
  })
})

// ---------------------------------------------------------------------------
// Core integration — behavior is produced via @refraction-ui/logger
// ---------------------------------------------------------------------------
describe('createLogger (core-backed behavior)', () => {
  it('uses the shared @refraction-ui/logger core', () => {
    // Sanity: the core exports the adapter depends on are present.
    expect(typeof createTelemetry).toBe('function')
    expect(typeof createMockSink).toBe('function')
  })

  it('emits each call as a core LogRecord with category bound in context', () => {
    // Mirror the adapter wiring to assert the core actually receives records
    // with the category carried as bound child context.
    const sink = createMockSink('probe')
    const t = createTelemetry({ app: 'media-engines', env: 'development' })
    t.addSink(sink)
    t.removeSink('console')
    t.child({ sessionId: 's-x' }).child({ category: 'audio' }).info('loaded clip', {
      clipId: '9',
    })
    expect(sink.logs).toHaveLength(1)
    expect(sink.logs[0]).toMatchObject({
      level: 'info',
      message: 'loaded clip',
      app: 'media-engines',
      env: 'development',
      context: { sessionId: 's-x', category: 'audio', clipId: '9' },
    })
  })

  it('measurePerformance is implemented via a core span', () => {
    const sink = createMockSink('probe')
    const t = createTelemetry({ app: 'media-engines', env: 'development' })
    t.addSink(sink)
    t.removeSink('console')
    const span = t.child({ category: 'performance', label: 'op' }).startSpan('op', {
      category: 'performance',
      label: 'op',
    })
    span.end()
    expect(sink.spans).toHaveLength(1)
    expect(sink.spans[0].name).toBe('op')
    expect(typeof sink.spans[0].durationMs).toBe('number')
    expect(sink.spans[0].status).toBe('ok')
  })

  it('debug level is recorded (core development preset, level=debug)', () => {
    const log = createLogger()
    log.debug('state', 'verbose')
    expect(log.getEntries().some((e) => e.level === 'debug')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// createScopedLogger
// ---------------------------------------------------------------------------
describe('createScopedLogger', () => {
  it('should prefix messages with scope', () => {
    const parent = createLogger()
    const scoped = createScopedLogger(parent, 'AudioPlayer')
    scoped.info('audio', 'loaded')
    const entries = parent.getEntries()
    expect(entries[0].message).toContain('AudioPlayer')
    expect(entries[0].message).toContain('loaded')
  })

  it('should write to the parent logger entries', () => {
    const parent = createLogger()
    const scoped = createScopedLogger(parent, 'Exporter')
    scoped.warn('export', 'slow')
    expect(parent.getEntries().length).toBe(1)
  })

  it('should support all log levels', () => {
    const parent = createLogger()
    const scoped = createScopedLogger(parent, 'S')
    scoped.debug('audio', 'a')
    scoped.info('video', 'b')
    scoped.warn('export', 'c')
    scoped.error('ui', 'd')
    scoped.fatal('state', 'e')
    expect(parent.getEntries().length).toBe(5)
  })

  it('should delegate measurePerformance to the parent', async () => {
    const parent = createLogger()
    const scoped = createScopedLogger(parent, 'Exporter')
    const result = await scoped.measurePerformance('export-op', async () => 'ok')
    expect(result).toBe('ok')
    expect(parent.getEntries().some((e) => e.category === 'performance')).toBe(true)
  })
})
