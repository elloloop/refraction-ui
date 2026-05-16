// ---------------------------------------------------------------------------
// media-engines logger
//
// This module preserves the historical media-engines logging surface
// (`LogLevel` / `LogCategory` / `LogEntry` / `createLogger` /
// `createScopedLogger` / `measurePerformance`) but is now a thin adapter over
// the shared `@refraction-ui/logger` core (dogfooding — see epic #206, #211).
//
// Mapping:
//   - `LogCategory`       -> a scoped child logger (bound `{ category }` ctx)
//   - `measurePerformance`-> a core span; on completion an `info`/`performance`
//                            entry is still emitted for back-compat.
//   - `getEntries`/`clear`-> backed by a recording sink owned by the logger.
//
// The public types/behavior are intentionally unchanged: callers that used the
// old ad-hoc logger keep working byte-for-byte.
// ---------------------------------------------------------------------------

import {
  createTelemetry,
  createMockSink,
  type LogRecord,
  type SpanRecord,
  type Telemetry,
} from '@refraction-ui/logger'

// ---------------------------------------------------------------------------
// Types (unchanged public surface)
// ---------------------------------------------------------------------------

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export type LogCategory =
  | 'audio'
  | 'video'
  | 'export'
  | 'ui'
  | 'state'
  | 'network'
  | 'filesystem'
  | 'performance'

export interface LogEntry {
  level: LogLevel
  category: LogCategory
  message: string
  timestamp: number
  sessionId: string
  context?: Record<string, unknown>
}

export interface Logger {
  debug(category: LogCategory, message: string, context?: Record<string, unknown>): void
  info(category: LogCategory, message: string, context?: Record<string, unknown>): void
  warn(category: LogCategory, message: string, context?: Record<string, unknown>): void
  error(category: LogCategory, message: string, context?: Record<string, unknown>): void
  fatal(category: LogCategory, message: string, context?: Record<string, unknown>): void
  getEntries(limit?: number): LogEntry[]
  clear(): void
  measurePerformance<T>(label: string, fn: () => Promise<T>): Promise<T>
}

export interface LoggerOptions {
  sessionId?: string
}

// ---------------------------------------------------------------------------
// Implementation (backed by @refraction-ui/logger)
// ---------------------------------------------------------------------------

let sessionCounter = 0

function makeSessionId(): string {
  sessionCounter++
  return `session-${sessionCounter}`
}

/** Reserved context keys the adapter injects; not surfaced in `LogEntry.context`. */
const RESERVED_CONTEXT_KEYS = new Set(['category', 'sessionId'])

/**
 * Re-derive the historical `LogEntry.context` shape from a core record's
 * merged context: strip the adapter-bound keys (`category`, `sessionId`).
 * Returns `undefined` when no caller-supplied context was present, exactly
 * like the legacy logger.
 */
function extractContext(
  merged: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const keys = Object.keys(merged).filter((k) => !RESERVED_CONTEXT_KEYS.has(k))
  if (keys.length === 0) return undefined
  const out: Record<string, unknown> = {}
  for (const k of keys) out[k] = merged[k]
  return out
}

export function createLogger(opts?: LoggerOptions): Logger {
  const sessionId = opts?.sessionId ?? makeSessionId()

  // The core fans records to a recording sink we own. `development` env keeps
  // delivery synchronous, level=debug, sampleRate=1 — matching the legacy
  // logger's "record everything immediately" semantics.
  const sink = createMockSink('media-engines')
  const telemetry: Telemetry = createTelemetry({
    app: 'media-engines',
    env: 'development',
  })
  telemetry.addSink(sink)
  // The console sink is part of the core's zero-config baseline; drop it so the
  // adapter stays a pure in-memory recorder (legacy behavior: no console I/O).
  telemetry.removeSink('console')

  // Bind the session id once; per-call we layer the category as a child ctx.
  const root = telemetry.child({ sessionId })

  function logRecordToEntry(rec: LogRecord): LogEntry {
    return {
      level: rec.level,
      category: (rec.context.category as LogCategory) ?? 'state',
      message: rec.message,
      timestamp: rec.timestamp,
      sessionId: (rec.context.sessionId as string) ?? sessionId,
      context: extractContext(rec.context),
    }
  }

  function spanRecordToEntry(rec: SpanRecord): LogEntry {
    const label = (rec.context.label as string) ?? rec.name
    return {
      level: 'info',
      category: 'performance',
      message: `${label} completed in ${rec.durationMs.toFixed(2)}ms`,
      timestamp: rec.endTime,
      sessionId: (rec.context.sessionId as string) ?? sessionId,
      context: { label, durationMs: rec.durationMs },
    }
  }

  /** Ordered, derived view over everything the sink has recorded. */
  function allEntries(): LogEntry[] {
    const out: LogEntry[] = []
    for (const r of sink.logs) out.push(logRecordToEntry(r))
    for (const s of sink.spans) out.push(spanRecordToEntry(s))
    // Preserve emission order: logs + the performance entry from each span are
    // appended in call order. Spans complete after their logs, and the legacy
    // logger appended the perf entry last, so stable sort by timestamp keeps
    // back-compat ordering for `getEntries`.
    return out
      .map((e, i) => [e, i] as const)
      .sort((a, b) => a[0].timestamp - b[0].timestamp || a[1] - b[1])
      .map(([e]) => e)
  }

  function emit(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    root.child({ category })[level](message, context)
  }

  return {
    debug(cat, msg, ctx?) { emit('debug', cat, msg, ctx) },
    info(cat, msg, ctx?) { emit('info', cat, msg, ctx) },
    warn(cat, msg, ctx?) { emit('warn', cat, msg, ctx) },
    error(cat, msg, ctx?) { emit('error', cat, msg, ctx) },
    fatal(cat, msg, ctx?) { emit('fatal', cat, msg, ctx) },

    getEntries(limit?: number): LogEntry[] {
      const entries = allEntries()
      if (limit === undefined) return entries
      return entries.slice(-limit)
    },

    clear(): void {
      sink.logs.length = 0
      sink.spans.length = 0
    },

    async measurePerformance<T>(label: string, fn: () => Promise<T>): Promise<T> {
      const span = root.startSpan(label, { category: 'performance', label })
      try {
        const result = await fn()
        span.end()
        return result
      } catch (err) {
        span.end({ error: err })
        throw err
      }
    },
  }
}

// ---------------------------------------------------------------------------
// Scoped logger
// ---------------------------------------------------------------------------

/**
 * Create a logger that prefixes all messages with a scope string and
 * delegates to the parent logger. Behavior is unchanged from the legacy
 * implementation; the parent is now core-backed.
 */
export function createScopedLogger(parent: Logger, scope: string): Logger {
  function prefixed(msg: string): string {
    return `[${scope}] ${msg}`
  }

  return {
    debug(cat, msg, ctx?) { parent.debug(cat, prefixed(msg), ctx) },
    info(cat, msg, ctx?) { parent.info(cat, prefixed(msg), ctx) },
    warn(cat, msg, ctx?) { parent.warn(cat, prefixed(msg), ctx) },
    error(cat, msg, ctx?) { parent.error(cat, prefixed(msg), ctx) },
    fatal(cat, msg, ctx?) { parent.fatal(cat, prefixed(msg), ctx) },
    getEntries(limit?) { return parent.getEntries(limit) },
    clear() { parent.clear() },
    measurePerformance(label, fn) { return parent.measurePerformance(label, fn) },
  }
}
