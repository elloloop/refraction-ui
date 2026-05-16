import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  TelemetryProvider,
  useTelemetry,
  useLogger,
} from '../src/telemetry-provider.js'

describe('TelemetryProvider (SSR)', () => {
  it('renders children', () => {
    const html = renderToString(
      React.createElement(
        TelemetryProvider,
        { app: 'test-app', env: 'development' },
        React.createElement('div', null, 'Telemetry App'),
      ),
    )
    expect(html).toContain('Telemetry App')
  })

  it('renders with development config', () => {
    const html = renderToString(
      React.createElement(
        TelemetryProvider,
        { app: 'test-app', env: 'development' },
        React.createElement('span', null, 'Hello Telemetry'),
      ),
    )
    expect(html).toContain('Hello Telemetry')
  })

  it('renders with production config', () => {
    const html = renderToString(
      React.createElement(
        TelemetryProvider,
        { app: 'test-app', env: 'production', sampleRate: 0.5 },
        React.createElement('span', null, 'Configured Telemetry'),
      ),
    )
    expect(html).toContain('Configured Telemetry')
  })

  it('renders with enabled:false (kill switch)', () => {
    const html = renderToString(
      React.createElement(
        TelemetryProvider,
        { app: 'test-app', env: 'development', enabled: false },
        React.createElement('span', null, 'Noop Telemetry'),
      ),
    )
    expect(html).toContain('Noop Telemetry')
  })
})

describe('useTelemetry (SSR)', () => {
  function TestConsumer() {
    const telemetry = useTelemetry()
    return React.createElement(
      'div',
      null,
      React.createElement('span', {
        'data-sinks': JSON.stringify(telemetry.sinks),
      }),
      React.createElement(
        'span',
        null,
        typeof telemetry.info === 'function' ? 'has-info' : 'missing',
      ),
      React.createElement(
        'span',
        null,
        typeof telemetry.child === 'function' ? 'has-child' : 'missing',
      ),
      React.createElement(
        'span',
        null,
        typeof telemetry.startSpan === 'function' ? 'has-startSpan' : 'missing',
      ),
    )
  }

  it('provides the telemetry logger API', () => {
    const html = renderToString(
      React.createElement(
        TelemetryProvider,
        { app: 'test-app', env: 'development' },
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('has-info')
    expect(html).toContain('has-child')
    expect(html).toContain('has-startSpan')
  })

  it('exposes the default console sink', () => {
    const html = renderToString(
      React.createElement(
        TelemetryProvider,
        { app: 'test-app', env: 'development' },
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('console')
  })

  it('throws when used outside TelemetryProvider', () => {
    expect(() => {
      renderToString(React.createElement(TestConsumer))
    }).toThrow(/useTelemetry.*TelemetryProvider/i)
  })
})

describe('useLogger (SSR)', () => {
  function ScopedConsumer({ scope }: { scope?: Record<string, unknown> }) {
    const logger = useLogger(scope)
    const root = useTelemetry()
    return React.createElement(
      'div',
      null,
      React.createElement(
        'span',
        null,
        typeof logger.info === 'function' ? 'has-info' : 'missing',
      ),
      React.createElement('span', {
        'data-is-root': String(logger === root),
      }),
    )
  }

  it('returns the root logger when no scope is given', () => {
    const html = renderToString(
      React.createElement(
        TelemetryProvider,
        { app: 'test-app', env: 'development' },
        React.createElement(ScopedConsumer),
      ),
    )
    expect(html).toContain('has-info')
    expect(html).toContain('data-is-root="true"')
  })

  it('returns a distinct scoped child logger when a scope is given', () => {
    const html = renderToString(
      React.createElement(
        TelemetryProvider,
        { app: 'test-app', env: 'development' },
        React.createElement(ScopedConsumer, { scope: { sessionId: 's-1' } }),
      ),
    )
    expect(html).toContain('has-info')
    expect(html).toContain('data-is-root="false"')
  })

  it('throws when used outside TelemetryProvider', () => {
    expect(() => {
      renderToString(React.createElement(ScopedConsumer))
    }).toThrow(/useTelemetry.*TelemetryProvider/i)
  })
})
