import type { Span, Telemetry } from './types.js'

/** Shared no-op span — emits nothing, allocates nothing per call. */
const NOOP_SPAN: Span = {
  end(): void {
    /* no-op */
  },
}

/**
 * Returned by {@link createTelemetry} when `enabled: false`. Every method is
 * an empty stub, so a bundler can dead-code-eliminate call sites and the
 * engines (console/Faro) are never imported at runtime. Zero emissions.
 */
export function createNoopTelemetry(): Telemetry {
  const noop: Telemetry = {
    debug(): void {
      /* no-op */
    },
    info(): void {
      /* no-op */
    },
    warn(): void {
      /* no-op */
    },
    error(): void {
      /* no-op */
    },
    fatal(): void {
      /* no-op */
    },
    child(): Telemetry {
      return noop
    },
    startSpan(): Span {
      return NOOP_SPAN
    },
    async flush(): Promise<void> {
      /* no-op */
    },
    get sinks(): string[] {
      return []
    },
    addSink(): void {
      /* no-op */
    },
    removeSink(): void {
      /* no-op */
    },
  }
  return noop
}
