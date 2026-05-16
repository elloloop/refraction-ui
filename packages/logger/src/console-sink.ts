import type { LogLevel, LogRecord, SpanRecord, TelemetrySink } from './types.js'

/** Console method used for each level. */
const METHOD: Record<LogLevel, 'debug' | 'info' | 'warn' | 'error'> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'error',
}

export interface ConsoleSinkOptions {
  /** Single-line pretty output (vs. structured JSON). */
  pretty?: boolean
  /** Console to write to (injectable for tests). Defaults to global console. */
  console?: Pick<Console, 'debug' | 'info' | 'warn' | 'error'>
}

/**
 * Default zero-dependency transport. Used whenever no `endpoint` is set.
 * Synchronous; `flush()` is a resolved no-op (nothing is buffered).
 */
export function createConsoleSink(opts?: ConsoleSinkOptions): TelemetrySink {
  const pretty = opts?.pretty ?? true
  const out = opts?.console ?? console

  function emit(level: LogLevel, line: string, payload: unknown): void {
    out[METHOD[level]](line, payload)
  }

  return {
    name: 'console',

    log(record: LogRecord): void {
      if (pretty) {
        const ts = new Date(record.timestamp).toISOString()
        emit(
          record.level,
          `${ts} ${record.level.toUpperCase()} [${record.app}] ${record.message}`,
          record.context,
        )
      } else {
        emit(record.level, JSON.stringify({ type: 'log', ...record }), record.context)
      }
    },

    span(record: SpanRecord): void {
      const level: LogLevel = record.status === 'error' ? 'error' : 'debug'
      if (pretty) {
        emit(
          level,
          `[span] ${record.name} ${record.durationMs.toFixed(2)}ms (${record.status})`,
          record.context,
        )
      } else {
        emit(level, JSON.stringify({ type: 'span', ...record }), record.context)
      }
    },

    async flush(): Promise<void> {
      // Console is synchronous — nothing buffered.
    },
  }
}
