import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { createMockSink } from '@refraction-ui/logger'
import { stackFingerprint, type LibraryOriginIdentity } from '@refraction-ui/shared'
import {
  LibraryErrorCaptureBoundary,
  captureReactLibraryError,
} from '../src/library-error-capture.js'

/**
 * The React capture seam is exercised against the REAL `@refraction-ui/shared`
 * primitives and the REAL `@refraction-ui/logger` `createMockSink` (it
 * structurally satisfies the `DevFeedbackSink` contract) — no stubs of the
 * primitives, no mocked sink internals.
 *
 * `componentDidCatch` is not invoked during `renderToString` (React only
 * calls `getDerivedStateFromError` on the server) and this monorepo has no
 * DOM test infra, so the reporting path is driven directly against the real
 * lifecycle method — same approach as `error-boundary.test.tsx`.
 */

const IDENTITY: LibraryOriginIdentity = {
  package: '@refraction-ui/react',
  componentName: 'Dialog',
  version: '0.1.5',
  framework: 'react',
}

const REFRACTION_STACK = [
  'Error: render exploded',
  '    at Dialog (/abs/path/node_modules/@refraction-ui/react/dist/index.js:120:15)',
  '    at renderWithHooks (/abs/path/node_modules/react-dom/cjs/react-dom.development.js:14985:18)',
  '    at App (/Users/someuser/secret-project/src/App.tsx:42:7)',
].join('\n')

const APP_STACK = [
  'Error: app bug',
  '    at App (/Users/someuser/secret-project/src/App.tsx:42:7)',
  '    at main (/Users/someuser/secret-project/src/main.tsx:7:3)',
].join('\n')

function refractionError(): Error {
  return Object.assign(new Error('render exploded'), {
    stack: REFRACTION_STACK,
  })
}
function appError(): Error {
  return Object.assign(new Error('app bug'), { stack: APP_STACK })
}

const info = { componentStack: '\n    in Dialog' } as React.ErrorInfo

describe('LibraryErrorCaptureBoundary — render passthrough', () => {
  it('renders children when nothing throws', () => {
    const html = renderToString(
      React.createElement(
        LibraryErrorCaptureBoundary,
        { identity: IDENTITY },
        React.createElement('div', null, 'safe content'),
      ),
    )
    expect(html).toContain('safe content')
  })

  it('renders a node fallback after an error', () => {
    const boundary = new LibraryErrorCaptureBoundary({
      identity: IDENTITY,
      children: null,
      fallback: React.createElement('p', null, 'fallback shown'),
    })
    boundary.state = { error: new Error('x') }
    expect(boundary.render()).toEqual(
      React.createElement('p', null, 'fallback shown'),
    )
  })

  it('renders a render-prop fallback receiving the error', () => {
    const err = new Error('x')
    const boundary = new LibraryErrorCaptureBoundary({
      identity: IDENTITY,
      children: null,
      fallback: (e: Error) => React.createElement('p', null, e.message),
    })
    boundary.state = { error: err }
    expect(boundary.render()).toEqual(React.createElement('p', null, 'x'))
  })
})

describe('LibraryErrorCaptureBoundary — refraction-origin error', () => {
  it('captures + tags the error with the stack fingerprint and forwards it', () => {
    const sink = createMockSink('capture-sink')
    const boundary = new LibraryErrorCaptureBoundary({
      identity: IDENTITY,
      children: null,
      sink,
    })

    const err = refractionError()
    boundary.componentDidCatch(err, info)

    expect(sink.logs).toHaveLength(1)
    const record = sink.logs[0]
    expect(record.level).toBe('error')
    expect(record.context).toMatchObject({
      origin: 'refraction-ui',
      package: '@refraction-ui/react',
      componentName: 'Dialog',
      version: '0.1.5',
      framework: 'react',
      fingerprint: stackFingerprint(err),
    })
  })

  it('passes the tagged record (not null) to onError', () => {
    const sink = createMockSink('capture-sink-2')
    let received: unknown = 'unset'
    const boundary = new LibraryErrorCaptureBoundary({
      identity: IDENTITY,
      children: null,
      sink,
      onError: (_e, _i, record) => {
        received = record
      },
    })
    boundary.componentDidCatch(refractionError(), info)
    expect(received).not.toBeNull()
    expect((received as { context: Record<string, unknown> }).context.origin).toBe(
      'refraction-ui',
    )
  })

  it('forwards no app data beyond the fingerprint hash', () => {
    const sink = createMockSink('capture-sink-3')
    const boundary = new LibraryErrorCaptureBoundary({
      identity: IDENTITY,
      children: null,
      sink,
    })
    boundary.componentDidCatch(refractionError(), info)
    const serialized = JSON.stringify(sink.logs[0])
    expect(serialized).not.toContain('someuser')
    expect(serialized).not.toContain('secret-project')
    expect(serialized).not.toContain('App.tsx')
  })
})

describe('LibraryErrorCaptureBoundary — app-origin error is untouched', () => {
  it('does NOT capture or forward an app-origin error', () => {
    const sink = createMockSink('app-sink')
    const boundary = new LibraryErrorCaptureBoundary({
      identity: IDENTITY,
      children: null,
      sink,
    })
    boundary.componentDidCatch(appError(), info)
    expect(sink.logs).toHaveLength(0)
  })

  it('surfaces an app-origin error to onError with record === null', () => {
    const sink = createMockSink('app-sink-2')
    let record: unknown = 'unset'
    const boundary = new LibraryErrorCaptureBoundary({
      identity: IDENTITY,
      children: null,
      sink,
      onError: (_e, _i, r) => {
        record = r
      },
    })
    const err = appError()
    boundary.componentDidCatch(err, info)
    expect(record).toBeNull()
    expect(sink.logs).toHaveLength(0)
  })
})

describe('LibraryErrorCaptureBoundary — no sink wired (no-op)', () => {
  it('does not throw and reports nothing when no sink is provided', () => {
    const boundary = new LibraryErrorCaptureBoundary({
      identity: IDENTITY,
      children: null,
    })
    expect(() =>
      boundary.componentDidCatch(refractionError(), info),
    ).not.toThrow()
  })

  it('still surfaces the tagged record to onError without a sink', () => {
    let record: unknown = 'unset'
    const boundary = new LibraryErrorCaptureBoundary({
      identity: IDENTITY,
      children: null,
      onError: (_e, _i, r) => {
        record = r
      },
    })
    boundary.componentDidCatch(refractionError(), info)
    expect((record as { context: Record<string, unknown> }).context.origin).toBe(
      'refraction-ui',
    )
  })

  it('a throwing sink never breaks the boundary', () => {
    const boundary = new LibraryErrorCaptureBoundary({
      identity: IDENTITY,
      children: null,
      sink: {
        log: () => {
          throw new Error('sink down')
        },
      },
    })
    expect(() =>
      boundary.componentDidCatch(refractionError(), info),
    ).not.toThrow()
  })
})

describe('captureReactLibraryError — imperative seam', () => {
  it('tags + forwards a refraction-origin error', () => {
    const sink = createMockSink('imperative')
    const rec = captureReactLibraryError(refractionError(), IDENTITY, sink)
    expect(rec).not.toBeNull()
    expect(sink.logs).toHaveLength(1)
    expect(sink.logs[0].context.origin).toBe('refraction-ui')
  })

  it('returns null and forwards nothing for an app-origin error', () => {
    const sink = createMockSink('imperative-2')
    const rec = captureReactLibraryError(appError(), IDENTITY, sink)
    expect(rec).toBeNull()
    expect(sink.logs).toHaveLength(0)
  })

  it('is a no-op forward with no sink', () => {
    const rec = captureReactLibraryError(refractionError(), IDENTITY)
    expect(rec?.context.origin).toBe('refraction-ui')
  })
})
