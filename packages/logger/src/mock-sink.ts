import type { LogRecord, SpanRecord, TelemetrySink } from './types.js'

export interface MockSinkExtended extends TelemetrySink {
  /** Every log record received, in order. */
  logs: LogRecord[]
  /** Every span record received, in order. */
  spans: SpanRecord[]
  /** Number of times {@link TelemetrySink.flush} was called. */
  flushCalls: number
}

/**
 * createMockSink — a {@link TelemetrySink} that records everything for
 * assertions instead of doing I/O. Used to test the manager and the Faro
 * engine without any network. Mirrors `createMockAIProvider` in `packages/ai`.
 */
export function createMockSink(name: string = 'mock'): MockSinkExtended {
  const sink: MockSinkExtended = {
    name,
    logs: [],
    spans: [],
    flushCalls: 0,

    log(record: LogRecord): void {
      sink.logs.push(record)
    },

    span(record: SpanRecord): void {
      sink.spans.push(record)
    },

    async flush(): Promise<void> {
      sink.flushCalls++
    },
  }

  return sink
}
