import { describe, it, expect } from 'vitest'
import { createMockSink } from '@refraction-ui/logger'
import {
  TelemetryService,
  provideTelemetry,
  TELEMETRY,
  TELEMETRY_CONFIG,
} from '../src/telemetry.service.js'

/**
 * These tests exercise the *real* `@refraction-ui/logger` core through the
 * Angular adapter's public surface (no mocking of the engine), mirroring how
 * `packages/react-ai` tests its provider against the real `@refraction-ui/ai`
 * core. The Angular DI provider factory wiring is verified directly without
 * bootstrapping a browser platform.
 */

/** Resolve the provider array the way Angular's injector would. */
function resolveService(
  config: Parameters<typeof provideTelemetry>[0],
): TelemetryService {
  const providers = provideTelemetry(config)

  const configProvider = providers.find(
    (p): p is { provide: unknown; useValue: unknown } =>
      typeof p === 'object' && p !== null && 'provide' in p && p.provide === TELEMETRY_CONFIG,
  )
  const telemetryProvider = providers.find(
    (p): p is { provide: unknown; useFactory: (...a: unknown[]) => unknown; deps: unknown[] } =>
      typeof p === 'object' && p !== null && 'provide' in p && p.provide === TELEMETRY,
  )

  expect(configProvider).toBeDefined()
  expect(telemetryProvider).toBeDefined()

  const cfg = (configProvider as { useValue: unknown }).useValue
  const telemetry = (
    telemetryProvider as { useFactory: (c: unknown) => unknown }
  ).useFactory(cfg)

  return new TelemetryService(telemetry as never)
}

describe('provideTelemetry', () => {
  it('returns the config token, the telemetry factory, and the service', () => {
    const providers = provideTelemetry({ app: 'test', env: 'development' })
    expect(providers).toHaveLength(3)

    const hasConfig = providers.some(
      (p) => typeof p === 'object' && p !== null && 'provide' in p && p.provide === TELEMETRY_CONFIG,
    )
    const hasTelemetry = providers.some(
      (p) => typeof p === 'object' && p !== null && 'provide' in p && p.provide === TELEMETRY,
    )
    expect(hasConfig).toBe(true)
    expect(hasTelemetry).toBe(true)
    expect(providers).toContain(TelemetryService)
  })

  it('the telemetry factory depends on the config token', () => {
    const providers = provideTelemetry({ app: 'test', env: 'development' })
    const telemetryProvider = providers.find(
      (p): p is { provide: unknown; deps: unknown[] } =>
        typeof p === 'object' && p !== null && 'provide' in p && p.provide === TELEMETRY,
    )
    expect(telemetryProvider?.deps).toEqual([TELEMETRY_CONFIG])
  })

  it('constructs a single telemetry instance from the supplied config', () => {
    const svc = resolveService({ app: 'interview', env: 'development' })
    expect(svc.telemetry).toBeDefined()
    expect(Array.isArray(svc.sinks)).toBe(true)
    // Zero-config dev → console-only transport is always present.
    expect(svc.sinks).toContain('console')
  })
})

describe('TelemetryService (real core)', () => {
  it('forwards every level to the underlying telemetry sinks', () => {
    const svc = resolveService({ app: 'app', env: 'development' })
    const sink = createMockSink('capture')
    svc.telemetry.addSink(sink)

    svc.debug('d', { a: 1 })
    svc.info('i')
    svc.warn('w')
    svc.error('e')
    svc.fatal('f')

    const levels = sink.logs.map((r) => r.level)
    expect(levels).toEqual(['debug', 'info', 'warn', 'error', 'fatal'])
    expect(sink.logs[0]?.context).toMatchObject({ a: 1 })
    expect(sink.logs[0]?.app).toBe('app')
  })

  it('scope() / child() produce loggers with bound context', () => {
    const svc = resolveService({ app: 'app', env: 'development' })
    const sink = createMockSink('capture')
    svc.telemetry.addSink(sink)

    const scoped = svc.scope({ sessionId: 's1', interviewId: 'iv1' })
    const turn = scoped.child({ turnId: 't1' })
    turn.info('turn started')

    expect(sink.logs).toHaveLength(1)
    expect(sink.logs[0]?.context).toMatchObject({
      sessionId: 's1',
      interviewId: 'iv1',
      turnId: 't1',
    })
  })

  it('startSpan() emits a span record on end()', () => {
    const svc = resolveService({ app: 'app', env: 'development' })
    const sink = createMockSink('capture')
    svc.telemetry.addSink(sink)

    const span = svc.startSpan('load', { phase: 'init' })
    span.end()

    expect(sink.spans).toHaveLength(1)
    expect(sink.spans[0]?.name).toBe('load')
    expect(sink.spans[0]?.status).toBe('ok')
    expect(sink.spans[0]?.context).toMatchObject({ phase: 'init' })
  })

  it('span end({ error }) records an error status', () => {
    const svc = resolveService({ app: 'app', env: 'development' })
    const sink = createMockSink('capture')
    svc.telemetry.addSink(sink)

    const span = svc.startSpan('risky')
    span.end({ error: new Error('boom') })

    expect(sink.spans).toHaveLength(1)
    expect(sink.spans[0]?.status).toBe('error')
    expect(sink.spans[0]?.error).toMatchObject({ message: 'boom' })
  })

  it('flush() resolves and reaches every sink', async () => {
    const svc = resolveService({ app: 'app', env: 'development' })
    const sink = createMockSink('capture')
    svc.telemetry.addSink(sink)

    await svc.flush()
    expect(sink.flushCalls).toBeGreaterThanOrEqual(1)
  })

  it('enabled: false yields a noop telemetry (kill switch)', () => {
    const svc = resolveService({ app: 'app', env: 'production', enabled: false })
    const sink = createMockSink('capture')
    svc.telemetry.addSink(sink)

    svc.error('should not be recorded')
    svc.startSpan('noop').end()

    expect(sink.logs).toHaveLength(0)
    expect(sink.spans).toHaveLength(0)
  })

  it('redactKeys strips sensitive context before emission', () => {
    const svc = resolveService({
      app: 'app',
      env: 'development',
      redactKeys: ['password'],
    })
    const sink = createMockSink('capture')
    svc.telemetry.addSink(sink)

    svc.info('login', { user: 'a', password: 'secret' })

    expect(sink.logs[0]?.context.password).toBe('[REDACTED]')
    expect(sink.logs[0]?.context).toMatchObject({ user: 'a' })
  })
})
