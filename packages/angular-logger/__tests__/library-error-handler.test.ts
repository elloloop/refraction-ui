import { describe, it, expect } from 'vitest'
import { ErrorHandler } from '@angular/core'
import { createMockSink } from '@refraction-ui/logger'
import { stackFingerprint, type LibraryOriginIdentity } from '@refraction-ui/shared'
import {
  RefractionErrorHandler,
  provideLibraryErrorCapture,
  LIBRARY_ORIGIN_IDENTITY,
  LIBRARY_ERROR_SINK,
} from '../src/library-error-handler.js'

/**
 * Exercises the Angular capture seam against the REAL `@refraction-ui/shared`
 * primitives and the REAL `@refraction-ui/logger` `createMockSink` (it
 * structurally satisfies `DevFeedbackSink`) — no stubs. The DI provider
 * factory wiring is verified directly without bootstrapping a browser
 * platform, mirroring `telemetry.service.test.ts`.
 */

const IDENTITY: LibraryOriginIdentity = {
  package: '@refraction-ui/angular',
  componentName: 'Dialog',
  version: '0.1.5',
  framework: 'angular',
}

const REFRACTION_STACK = [
  'Error: boom',
  '    at Dialog (/abs/node_modules/@refraction-ui/angular/dist/index.js:120:15)',
  '    at App (/Users/someuser/secret-project/src/app.component.ts:42:7)',
].join('\n')
const APP_STACK = [
  'Error: app bug',
  '    at App (/Users/someuser/secret-project/src/app.component.ts:42:7)',
].join('\n')

const refractionError = (): Error =>
  Object.assign(new Error('boom'), { stack: REFRACTION_STACK })
const appError = (): Error =>
  Object.assign(new Error('app bug'), { stack: APP_STACK })

/** A spy base handler so we can assert default behavior is preserved. */
function spyDelegate(): ErrorHandler & { handled: unknown[] } {
  const handled: unknown[] = []
  return Object.assign(new ErrorHandler(), {
    handled,
    handleError(e: unknown) {
      handled.push(e)
    },
  })
}

describe('RefractionErrorHandler — refraction-origin error', () => {
  it('captures + tags with the stack fingerprint and forwards to the sink', () => {
    const sink = createMockSink('ng-capture')
    const handler = new RefractionErrorHandler(IDENTITY, sink, spyDelegate())

    const err = refractionError()
    handler.handleError(err)

    expect(sink.logs).toHaveLength(1)
    expect(sink.logs[0].level).toBe('error')
    expect(sink.logs[0].context).toMatchObject({
      origin: 'refraction-ui',
      package: '@refraction-ui/angular',
      componentName: 'Dialog',
      version: '0.1.5',
      framework: 'angular',
      fingerprint: stackFingerprint(err),
    })
  })

  it('still delegates the error to the base handler (default behavior kept)', () => {
    const sink = createMockSink('ng-capture-2')
    const delegate = spyDelegate()
    const handler = new RefractionErrorHandler(IDENTITY, sink, delegate)
    const err = refractionError()
    handler.handleError(err)
    expect(delegate.handled).toEqual([err])
  })

  it('forwards no app data beyond the fingerprint hash', () => {
    const sink = createMockSink('ng-capture-3')
    new RefractionErrorHandler(IDENTITY, sink, spyDelegate()).handleError(
      refractionError(),
    )
    const serialized = JSON.stringify(sink.logs[0])
    expect(serialized).not.toContain('someuser')
    expect(serialized).not.toContain('secret-project')
    expect(serialized).not.toContain('app.component.ts')
  })
})

describe('RefractionErrorHandler — app-origin error is untouched', () => {
  it('does NOT capture or forward an app-origin error', () => {
    const sink = createMockSink('ng-app')
    const handler = new RefractionErrorHandler(IDENTITY, sink, spyDelegate())
    expect(handler.tryCapture(appError())).toBeNull()
    expect(sink.logs).toHaveLength(0)
  })

  it('still delegates an app-origin error to the base handler', () => {
    const sink = createMockSink('ng-app-2')
    const delegate = spyDelegate()
    const handler = new RefractionErrorHandler(IDENTITY, sink, delegate)
    const err = appError()
    handler.handleError(err)
    expect(sink.logs).toHaveLength(0)
    expect(delegate.handled).toEqual([err])
  })
})

describe('RefractionErrorHandler — no sink wired (no-op)', () => {
  it('does not throw and forwards nothing with sink=null', () => {
    const handler = new RefractionErrorHandler(IDENTITY, null, spyDelegate())
    expect(() => handler.handleError(refractionError())).not.toThrow()
    expect(handler.tryCapture(refractionError())?.context.origin).toBe(
      'refraction-ui',
    )
  })

  it('a throwing sink never breaks the handler', () => {
    const handler = new RefractionErrorHandler(
      IDENTITY,
      {
        log: () => {
          throw new Error('sink down')
        },
      },
      spyDelegate(),
    )
    expect(() => handler.handleError(refractionError())).not.toThrow()
  })
})

describe('provideLibraryErrorCapture — DI wiring', () => {
  it('returns the identity token, sink token, and ErrorHandler factory', () => {
    const sink = createMockSink('ng-di')
    const providers = provideLibraryErrorCapture(IDENTITY, sink)
    expect(providers).toHaveLength(3)

    const idP = providers.find(
      (p): p is { provide: unknown; useValue: unknown } =>
        typeof p === 'object' &&
        p !== null &&
        'provide' in p &&
        p.provide === LIBRARY_ORIGIN_IDENTITY,
    )
    const sinkP = providers.find(
      (p): p is { provide: unknown; useValue: unknown } =>
        typeof p === 'object' &&
        p !== null &&
        'provide' in p &&
        p.provide === LIBRARY_ERROR_SINK,
    )
    const handlerP = providers.find(
      (p): p is {
        provide: unknown
        useFactory: (...a: unknown[]) => unknown
        deps: unknown[]
      } =>
        typeof p === 'object' &&
        p !== null &&
        'provide' in p &&
        p.provide === ErrorHandler,
    )

    expect(idP?.useValue).toBe(IDENTITY)
    expect(sinkP?.useValue).toBe(sink)
    expect(handlerP?.deps).toEqual([LIBRARY_ORIGIN_IDENTITY, LIBRARY_ERROR_SINK])

    const handler = handlerP!.useFactory(IDENTITY, sink) as RefractionErrorHandler
    handler.handleError(refractionError())
    expect(sink.logs).toHaveLength(1)
    expect(sink.logs[0].context.origin).toBe('refraction-ui')
  })

  it('defaults the sink to null (nothing phones home unless wired)', () => {
    const providers = provideLibraryErrorCapture(IDENTITY)
    const sinkP = providers.find(
      (p): p is { provide: unknown; useValue: unknown } =>
        typeof p === 'object' &&
        p !== null &&
        'provide' in p &&
        p.provide === LIBRARY_ERROR_SINK,
    )
    expect(sinkP?.useValue).toBeNull()
  })
})
