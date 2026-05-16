import type {
  AnalyticsEvent,
  AnalyticsSink,
  SinkDeliverContext,
  SinkInitContext,
} from './types.js'

/** A mock sink that records every call — used for testing the router. */
export interface MockSink extends AnalyticsSink {
  /** All events received across all deliver() calls (flattened). */
  events: AnalyticsEvent[]
  /** Each deliver() call's batch + context. */
  deliveries: Array<{ batch: AnalyticsEvent[]; ctx: SinkDeliverContext }>
  /** init() call contexts. */
  initCalls: SinkInitContext[]
  /** flush() invocation count. */
  flushCalls: number
  /** shutdown() invocation count. */
  shutdownCalls: number
}

export interface CreateMockSinkOptions {
  name?: string
  consentCategories?: string[]
}

/**
 * createMockSink — an `AnalyticsSink` that captures everything for assertion.
 * Mirrors the testing ergonomics of `@refraction-ui/ai`'s mock providers.
 */
export function createMockSink(
  options: CreateMockSinkOptions = {},
): MockSink {
  const sink: MockSink = {
    name: options.name ?? 'mock',
    consentCategories: options.consentCategories,
    events: [],
    deliveries: [],
    initCalls: [],
    flushCalls: 0,
    shutdownCalls: 0,

    init(ctx: SinkInitContext): void {
      sink.initCalls.push(ctx)
    },

    deliver(batch: AnalyticsEvent[], ctx: SinkDeliverContext): void {
      sink.deliveries.push({ batch, ctx })
      for (const ev of batch) sink.events.push(ev)
    },

    flush(): void {
      sink.flushCalls++
    },

    shutdown(): void {
      sink.shutdownCalls++
    },
  }

  return sink
}
