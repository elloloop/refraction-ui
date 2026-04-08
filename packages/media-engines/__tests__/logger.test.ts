import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createLogger,
  createScopedLogger,
} from '../src/logger.js'
import type { LogLevel, LogCategory, LogEntry, Logger } from '../src/logger.js'

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
// createLogger
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

  it('should accept optional context', () => {
    const log = createLogger()
    log.info('audio', 'loaded clip', { clipId: '123' })
    expect(log.getEntries()[0].context).toEqual({ clipId: '123' })
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
})
