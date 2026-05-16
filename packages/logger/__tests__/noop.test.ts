import { describe, it, expect, vi } from 'vitest'
import { createNoopTelemetry } from '../src/noop.js'

describe('createNoopTelemetry', () => {
  it('exposes the full Telemetry surface', () => {
    const t = createNoopTelemetry()
    expect(typeof t.debug).toBe('function')
    expect(typeof t.info).toBe('function')
    expect(typeof t.warn).toBe('function')
    expect(typeof t.error).toBe('function')
    expect(typeof t.fatal).toBe('function')
    expect(typeof t.child).toBe('function')
    expect(typeof t.startSpan).toBe('function')
    expect(typeof t.flush).toBe('function')
    expect(typeof t.addSink).toBe('function')
    expect(typeof t.removeSink).toBe('function')
  })

  it('never writes to console', () => {
    const spies = (['debug', 'info', 'warn', 'error'] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {}),
    )
    const t = createNoopTelemetry()
    t.debug('x')
    t.info('x')
    t.warn('x')
    t.error('x')
    t.fatal('x')
    for (const s of spies) {
      expect(s).not.toHaveBeenCalled()
      s.mockRestore()
    }
  })

  it('reports zero sinks and addSink is inert', () => {
    const t = createNoopTelemetry()
    expect(t.sinks).toEqual([])
    t.addSink({ name: 'x', log() {}, span() {}, flush: async () => {} })
    expect(t.sinks).toEqual([])
  })

  it('child returns a noop logger', () => {
    const t = createNoopTelemetry()
    const child = t.child({ a: 1 })
    expect(child.sinks).toEqual([])
    expect(() => child.info('x')).not.toThrow()
  })

  it('span end and flush resolve without effect', async () => {
    const t = createNoopTelemetry()
    expect(() => t.startSpan('x').end()).not.toThrow()
    await expect(t.flush()).resolves.toBeUndefined()
  })
})
