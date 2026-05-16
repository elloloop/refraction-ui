import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { createMockSink } from '@refraction-ui/logger'
import { TelemetryProvider, useTelemetry } from '../src/telemetry-provider.js'
import { useSpan, type UseSpanAPI } from '../src/use-span.js'

/**
 * `renderToString` does not run effects/state updates, so we capture the
 * hook's API and the telemetry instance during render and exercise the span
 * lifecycle against the real `@refraction-ui/logger` core afterwards.
 */
function renderSpanHarness(): {
  api: UseSpanAPI
  sink: ReturnType<typeof createMockSink>
} {
  let api!: UseSpanAPI
  const sink = createMockSink('test-span-sink')

  function Harness() {
    const telemetry = useTelemetry()
    // Register the recording sink once, on first render.
    if (!telemetry.sinks.includes('test-span-sink')) {
      telemetry.addSink(sink)
    }
    api = useSpan()
    return React.createElement('span', null, 'span-harness')
  }

  const html = renderToString(
    React.createElement(
      TelemetryProvider,
      // development preset: sync delivery, no batching/sampling.
      { app: 'test-app', env: 'development' },
      React.createElement(Harness),
    ),
  )
  expect(html).toContain('span-harness')
  return { api, sink }
}

describe('useSpan', () => {
  it('provides start/end and isActive', () => {
    const { api } = renderSpanHarness()
    expect(typeof api.start).toBe('function')
    expect(typeof api.end).toBe('function')
    expect(api.isActive).toBe(false)
  })

  it('opens and closes a span, emitting a span record to the sink', () => {
    const { api, sink } = renderSpanHarness()

    api.start('llm-call', { model: 'gpt' })
    expect(sink.spans).toHaveLength(0)

    api.end()
    expect(sink.spans).toHaveLength(1)
    const span = sink.spans[0]
    expect(span.name).toBe('llm-call')
    expect(span.status).toBe('ok')
    expect(span.context.model).toBe('gpt')
    expect(span.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('records an error span when ended with an error', () => {
    const { api, sink } = renderSpanHarness()

    api.start('failing-op')
    api.end({ error: new Error('boom') })

    expect(sink.spans).toHaveLength(1)
    expect(sink.spans[0].status).toBe('error')
    expect(sink.spans[0].error).toEqual({ name: 'Error', message: 'boom' })
  })

  it('ends the previous span before starting a new one', () => {
    const { api, sink } = renderSpanHarness()

    api.start('first')
    api.start('second')
    expect(sink.spans).toHaveLength(1)
    expect(sink.spans[0].name).toBe('first')

    api.end()
    expect(sink.spans).toHaveLength(2)
    expect(sink.spans[1].name).toBe('second')
  })

  it('end() is a no-op when no span is in flight', () => {
    const { api, sink } = renderSpanHarness()
    api.end()
    expect(sink.spans).toHaveLength(0)
  })
})
