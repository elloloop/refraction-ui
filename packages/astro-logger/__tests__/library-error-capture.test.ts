import { describe, it, expect } from 'vitest'
import { createMockSink } from '@refraction-ui/logger'
import { stackFingerprint, type LibraryOriginIdentity } from '@refraction-ui/shared'
import {
  createLibraryErrorCapture,
  captureAstroLibraryError,
  type LibraryErrorCaptureContext,
} from '../src/library-error-capture.js'

/**
 * Exercises the Astro capture seam against the REAL `@refraction-ui/shared`
 * primitives and the REAL `@refraction-ui/logger` `createMockSink` (it
 * structurally satisfies `DevFeedbackSink`) — no stubs of the primitives,
 * mirroring `telemetry-middleware.test.ts`.
 */

const IDENTITY: LibraryOriginIdentity = {
  package: '@refraction-ui/astro',
  componentName: 'Dialog',
  version: '0.1.5',
  framework: 'astro',
}

const REFRACTION_STACK = [
  'Error: boom',
  '    at Dialog (/abs/node_modules/@refraction-ui/astro/dist/index.js:120:15)',
  '    at Page (/Users/someuser/secret-project/src/pages/index.astro:42:7)',
].join('\n')
const APP_STACK = [
  'Error: app bug',
  '    at Page (/Users/someuser/secret-project/src/pages/index.astro:42:7)',
].join('\n')

const refractionError = (): Error =>
  Object.assign(new Error('boom'), { stack: REFRACTION_STACK })
const appError = (): Error =>
  Object.assign(new Error('app bug'), { stack: APP_STACK })

function ctx(url = 'https://example.test/'): LibraryErrorCaptureContext {
  return { request: new Request(url), locals: {} }
}

describe('createLibraryErrorCapture — happy path passthrough', () => {
  it('returns an onRequest handler', () => {
    expect(typeof createLibraryErrorCapture({ identity: IDENTITY })).toBe(
      'function',
    )
  })

  it('returns the downstream response unchanged when nothing throws', async () => {
    const sink = createMockSink('astro-ok')
    const onRequest = createLibraryErrorCapture({ identity: IDENTITY, sink })
    const res = new Response('payload', { status: 201 })
    const out = await onRequest(ctx(), () => res)
    expect(out).toBe(res)
    expect(sink.logs).toHaveLength(0)
  })
})

describe('createLibraryErrorCapture — refraction-origin error', () => {
  it('captures + tags with the fingerprint, forwards, and rethrows', async () => {
    const sink = createMockSink('astro-capture')
    let captured: unknown = null
    const onRequest = createLibraryErrorCapture({
      identity: IDENTITY,
      sink,
      onCapture: (r) => {
        captured = r
      },
    })
    const err = refractionError()

    await expect(
      onRequest(ctx(), () => {
        throw err
      }),
    ).rejects.toBe(err)

    expect(sink.logs).toHaveLength(1)
    expect(sink.logs[0].context).toMatchObject({
      origin: 'refraction-ui',
      package: '@refraction-ui/astro',
      componentName: 'Dialog',
      version: '0.1.5',
      framework: 'astro',
      fingerprint: stackFingerprint(err),
    })
    expect(captured).toBe(sink.logs[0])
  })

  it('forwards no app data beyond the fingerprint hash', async () => {
    const sink = createMockSink('astro-capture-2')
    const onRequest = createLibraryErrorCapture({ identity: IDENTITY, sink })
    await onRequest(ctx(), () => {
      throw refractionError()
    }).catch(() => {})
    const serialized = JSON.stringify(sink.logs[0])
    expect(serialized).not.toContain('someuser')
    expect(serialized).not.toContain('secret-project')
    expect(serialized).not.toContain('index.astro')
  })
})

describe('createLibraryErrorCapture — app-origin error is untouched', () => {
  it('does NOT capture or forward, and still rethrows', async () => {
    const sink = createMockSink('astro-app')
    let onCaptureCalled = false
    const onRequest = createLibraryErrorCapture({
      identity: IDENTITY,
      sink,
      onCapture: () => {
        onCaptureCalled = true
      },
    })
    const err = appError()
    await expect(
      onRequest(ctx(), () => {
        throw err
      }),
    ).rejects.toBe(err)
    expect(sink.logs).toHaveLength(0)
    expect(onCaptureCalled).toBe(false)
  })
})

describe('createLibraryErrorCapture — no sink wired (no-op)', () => {
  it('does not throw extra, forwards nothing, still rethrows', async () => {
    const onRequest = createLibraryErrorCapture({ identity: IDENTITY })
    const err = refractionError()
    await expect(
      onRequest(ctx(), () => {
        throw err
      }),
    ).rejects.toBe(err)
  })

  it('a throwing sink never masks the original error', async () => {
    const onRequest = createLibraryErrorCapture({
      identity: IDENTITY,
      sink: {
        log: () => {
          throw new Error('sink down')
        },
      },
    })
    const err = refractionError()
    await expect(
      onRequest(ctx(), () => {
        throw err
      }),
    ).rejects.toBe(err)
  })
})

describe('captureAstroLibraryError — imperative seam', () => {
  it('tags + forwards a refraction-origin error', () => {
    const sink = createMockSink('astro-imperative')
    const rec = captureAstroLibraryError(refractionError(), IDENTITY, sink)
    expect(rec).not.toBeNull()
    expect(sink.logs).toHaveLength(1)
    expect(sink.logs[0].context.origin).toBe('refraction-ui')
  })

  it('returns null and forwards nothing for an app-origin error', () => {
    const sink = createMockSink('astro-imperative-2')
    expect(captureAstroLibraryError(appError(), IDENTITY, sink)).toBeNull()
    expect(sink.logs).toHaveLength(0)
  })

  it('is a no-op forward with no sink', () => {
    expect(
      captureAstroLibraryError(refractionError(), IDENTITY)?.context.origin,
    ).toBe('refraction-ui')
  })
})
