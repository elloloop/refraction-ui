import { describe, it, expect, vi } from 'vitest'
import { createConsoleSink } from '../src/console-sink.js'
import type { LogRecord, SpanRecord } from '../src/types.js'

function makeLog(overrides: Partial<LogRecord> = {}): LogRecord {
  return {
    level: 'info',
    message: 'hello',
    timestamp: 1_700_000_000_000,
    app: 'app',
    env: 'development',
    context: { a: 1 },
    ...overrides,
  }
}

function makeSpan(overrides: Partial<SpanRecord> = {}): SpanRecord {
  return {
    name: 'work',
    startTime: 0,
    endTime: 5,
    durationMs: 5,
    app: 'app',
    env: 'development',
    context: {},
    status: 'ok',
    ...overrides,
  }
}

describe('createConsoleSink', () => {
  it('maps levels to console methods', () => {
    const fake = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const sink = createConsoleSink({ console: fake })
    sink.log(makeLog({ level: 'debug' }))
    sink.log(makeLog({ level: 'info' }))
    sink.log(makeLog({ level: 'warn' }))
    sink.log(makeLog({ level: 'error' }))
    sink.log(makeLog({ level: 'fatal' }))
    expect(fake.debug).toHaveBeenCalledTimes(1)
    expect(fake.info).toHaveBeenCalledTimes(1)
    expect(fake.warn).toHaveBeenCalledTimes(1)
    // fatal maps to error
    expect(fake.error).toHaveBeenCalledTimes(2)
  })

  it('pretty mode writes a single readable line + context payload', () => {
    const fake = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const sink = createConsoleSink({ pretty: true, console: fake })
    sink.log(makeLog({ message: 'pretty please' }))
    const [line, payload] = fake.info.mock.calls[0]
    expect(String(line)).toContain('INFO')
    expect(String(line)).toContain('[app]')
    expect(String(line)).toContain('pretty please')
    expect(payload).toEqual({ a: 1 })
  })

  it('structured mode writes JSON', () => {
    const fake = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const sink = createConsoleSink({ pretty: false, console: fake })
    sink.log(makeLog())
    const [line] = fake.info.mock.calls[0]
    const parsed = JSON.parse(String(line))
    expect(parsed.type).toBe('log')
    expect(parsed.message).toBe('hello')
  })

  it('span ok uses debug, span error uses error', () => {
    const fake = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const sink = createConsoleSink({ console: fake })
    sink.span(makeSpan({ status: 'ok' }))
    sink.span(makeSpan({ status: 'error' }))
    expect(fake.debug).toHaveBeenCalledTimes(1)
    expect(fake.error).toHaveBeenCalledTimes(1)
  })

  it('flush resolves (nothing buffered)', async () => {
    const sink = createConsoleSink({ console: { debug() {}, info() {}, warn() {}, error() {} } })
    await expect(sink.flush()).resolves.toBeUndefined()
  })
})
