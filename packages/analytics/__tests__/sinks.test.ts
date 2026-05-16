import { describe, it, expect, vi } from 'vitest'
import { createConsoleSink } from '../src/console-sink.js'
import { createMockSink } from '../src/mock-sink.js'
import { createNoopAnalytics } from '../src/noop.js'
import { SCHEMA_VERSION } from '../src/types.js'
import type { AnalyticsEvent } from '../src/types.js'

function ev(event: string): AnalyticsEvent {
  return {
    type: 'track',
    event,
    messageId: 'm',
    anonymousId: 'a',
    sessionId: 's',
    properties: {},
    context: {
      app: 'app',
      env: 'test',
      library: { name: '@refraction-ui/analytics', version: '0.1.0' },
    },
    timestamp: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
  }
}

describe('createConsoleSink', () => {
  it('groups and logs each canonical envelope', () => {
    const logger = {
      log: vi.fn(),
      groupCollapsed: vi.fn(),
      groupEnd: vi.fn(),
    }
    const sink = createConsoleSink({ logger })
    sink.deliver([ev('A'), ev('B')], { unload: false })
    expect(logger.groupCollapsed).toHaveBeenCalledTimes(2)
    expect(logger.log).toHaveBeenCalledTimes(2)
    expect(logger.groupCollapsed).toHaveBeenCalledWith('[analytics] track A')
  })

  it('falls back to plain log when grouping is unavailable', () => {
    const log = vi.fn()
    const sink = createConsoleSink({
      logger: { log } as never,
    })
    sink.deliver([ev('Solo')], { unload: false })
    expect(log).toHaveBeenCalledWith(
      '[analytics] track Solo',
      expect.objectContaining({ event: 'Solo' }),
    )
  })

  it('passes through configured consent categories', () => {
    const sink = createConsoleSink({ consentCategories: ['debug'] })
    expect(sink.consentCategories).toEqual(['debug'])
  })
})

describe('createMockSink', () => {
  it('captures init/deliver/flush/shutdown for assertions', async () => {
    const sink = createMockSink({ name: 's1', consentCategories: ['x'] })
    expect(sink.name).toBe('s1')
    expect(sink.consentCategories).toEqual(['x'])

    sink.init?.({ app: 'a', env: 'e' })
    sink.deliver([ev('A')], { unload: false })
    sink.deliver([ev('B'), ev('C')], { unload: true })
    await sink.flush?.()
    await sink.shutdown?.()

    expect(sink.initCalls).toHaveLength(1)
    expect(sink.deliveries).toHaveLength(2)
    expect(sink.deliveries[1].ctx.unload).toBe(true)
    expect(sink.events.map((e) => e.event)).toEqual(['A', 'B', 'C'])
    expect(sink.flushCalls).toBe(1)
    expect(sink.shutdownCalls).toBe(1)
  })
})

describe('createNoopAnalytics', () => {
  it('exposes the full Analytics surface, all inert', () => {
    const a = createNoopAnalytics()
    expect(a.enabled).toBe(false)
    expect(a.sinks).toEqual([])
    expect(a.userId()).toBeUndefined()
    expect(a.anonymousId()).toMatch(/^0{8}-0{4}-4/)
    expect(typeof a.session.id()).toBe('string')
    expect(a.consent.granted()).toEqual([])
    expect(a.consent.isGranted('analytics')).toBe(false)
    expect(a.with({})).toBe(a)
    expect(() => {
      a.track('x')
      a.identify('u')
      a.page()
      a.screen()
      a.group('g')
      a.alias('u2')
      a.session.start()
      a.session.end()
      a.session.set({})
      a.consent.grant('a')
      a.consent.revoke('a')
      a.addSink(createMockSink())
      a.removeSink('mock')
      a.reset()
    }).not.toThrow()
  })

  it('flush resolves without doing anything', async () => {
    const a = createNoopAnalytics()
    await expect(a.flush()).resolves.toBeUndefined()
  })
})
