import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { createTelemetry, createMockSink } from '@refraction-ui/logger'
import { TelemetryErrorBoundary } from '../src/error-boundary.js'
import { TelemetryProvider } from '../src/telemetry-provider.js'

function Boom(): React.ReactElement {
  throw new Error('render exploded')
}

describe('TelemetryErrorBoundary (SSR)', () => {
  it('renders children when nothing throws', () => {
    const html = renderToString(
      React.createElement(
        TelemetryProvider,
        { app: 'test-app', env: 'development' },
        React.createElement(
          TelemetryErrorBoundary,
          null,
          React.createElement('div', null, 'safe content'),
        ),
      ),
    )
    expect(html).toContain('safe content')
  })
})

/**
 * React 19's legacy `renderToString` rethrows synchronous render errors
 * instead of letting an error boundary recover (boundary recovery requires a
 * browser/DOM commit, or a streaming renderer). The boundary's state + render
 * logic is therefore covered directly here; a jsdom mount would additionally
 * exercise the React commit wiring, but no DOM test infra exists in this
 * monorepo and adding one is out of scope for this package.
 */
describe('TelemetryErrorBoundary fallback rendering', () => {
  it('derives error state via getDerivedStateFromError', () => {
    const error = new Error('render exploded')
    expect(TelemetryErrorBoundary.getDerivedStateFromError(error)).toEqual({
      error,
    })
  })

  it('renders children while no error is held', () => {
    const boundary = new TelemetryErrorBoundary({
      children: React.createElement('div', null, 'safe content'),
    })
    expect(boundary.render()).toEqual(
      React.createElement('div', null, 'safe content'),
    )
  })

  it('renders a node fallback after an error', () => {
    const boundary = new TelemetryErrorBoundary({
      children: React.createElement(Boom),
      fallback: React.createElement('p', null, 'fallback shown'),
    })
    boundary.state = { error: new Error('render exploded') }
    expect(boundary.render()).toEqual(
      React.createElement('p', null, 'fallback shown'),
    )
  })

  it('renders a render-prop fallback receiving the error and reset', () => {
    const error = new Error('render exploded')
    const boundary = new TelemetryErrorBoundary({
      children: React.createElement(Boom),
      fallback: (e: Error) =>
        React.createElement('p', null, `caught: ${e.message}`),
    })
    boundary.state = { error }
    expect(boundary.render()).toEqual(
      React.createElement('p', null, 'caught: render exploded'),
    )
  })

  it('renders null fallback by default after an error', () => {
    const boundary = new TelemetryErrorBoundary({
      children: React.createElement(Boom),
    })
    boundary.state = { error: new Error('render exploded') }
    expect(boundary.render()).toBeNull()
  })
})

/**
 * `componentDidCatch` is not invoked during `renderToString` (React only
 * calls `getDerivedStateFromError` on the server). The reporting path is
 * therefore exercised directly against the real `@refraction-ui/logger`
 * core + a recording sink — no stubs. A full DOM mount (jsdom + RTL) would
 * additionally cover the lifecycle wiring, but no DOM test infra exists in
 * this monorepo and adding one is out of scope for this package.
 */
describe('TelemetryErrorBoundary reporting (componentDidCatch)', () => {
  it('reports a captured error to the telemetry sink at error level', () => {
    const telemetry = createTelemetry({ app: 'test-app', env: 'development' })
    const sink = createMockSink('boundary-sink')
    telemetry.addSink(sink)

    const boundary = new TelemetryErrorBoundary({
      children: null,
      context: { sessionId: 's-9' },
    })
    boundary.context = { telemetry }

    const error = new Error('render exploded')
    boundary.componentDidCatch(error, {
      componentStack: '\n    in Boom\n    in TelemetryErrorBoundary',
    } as React.ErrorInfo)

    expect(sink.logs).toHaveLength(1)
    const record = sink.logs[0]
    expect(record.level).toBe('error')
    expect(record.message).toBe('render exploded')
    expect(record.context.name).toBe('Error')
    expect(record.context.sessionId).toBe('s-9')
    expect(record.context.componentStack).toContain('in Boom')
  })

  it('invokes the onError callback after reporting', () => {
    const telemetry = createTelemetry({ app: 'test-app', env: 'development' })
    const sink = createMockSink('boundary-sink-2')
    telemetry.addSink(sink)

    let received: Error | null = null
    const boundary = new TelemetryErrorBoundary({
      children: null,
      onError: (err) => {
        received = err
      },
    })
    boundary.context = { telemetry }

    const error = new Error('callback path')
    boundary.componentDidCatch(error, {
      componentStack: '',
    } as React.ErrorInfo)

    expect(received).toBe(error)
    expect(sink.logs).toHaveLength(1)
  })

  it('does not throw when rendered without a TelemetryProvider', () => {
    const boundary = new TelemetryErrorBoundary({ children: null })
    boundary.context = null
    expect(() =>
      boundary.componentDidCatch(new Error('no provider'), {
        componentStack: '',
      } as React.ErrorInfo),
    ).not.toThrow()
  })
})
