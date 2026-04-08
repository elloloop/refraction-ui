// ---------------------------------------------------------------------------
// Types
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
// Implementation
// ---------------------------------------------------------------------------

let sessionCounter = 0

function makeSessionId(): string {
  sessionCounter++
  return `session-${sessionCounter}`
}

export function createLogger(opts?: LoggerOptions): Logger {
  const sessionId = opts?.sessionId ?? makeSessionId()
  const entries: LogEntry[] = []

  function log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    entries.push({
      level,
      category,
      message,
      timestamp: Date.now(),
      sessionId,
      context,
    })
  }

  return {
    debug(cat, msg, ctx?) { log('debug', cat, msg, ctx) },
    info(cat, msg, ctx?) { log('info', cat, msg, ctx) },
    warn(cat, msg, ctx?) { log('warn', cat, msg, ctx) },
    error(cat, msg, ctx?) { log('error', cat, msg, ctx) },
    fatal(cat, msg, ctx?) { log('fatal', cat, msg, ctx) },

    getEntries(limit?: number): LogEntry[] {
      if (limit === undefined) return [...entries]
      return entries.slice(-limit)
    },

    clear(): void {
      entries.length = 0
    },

    async measurePerformance<T>(label: string, fn: () => Promise<T>): Promise<T> {
      const start = performance.now()
      const result = await fn()
      const elapsed = performance.now() - start
      log('info', 'performance', `${label} completed in ${elapsed.toFixed(2)}ms`, {
        label,
        durationMs: elapsed,
      })
      return result
    },
  }
}

// ---------------------------------------------------------------------------
// Scoped logger
// ---------------------------------------------------------------------------

/**
 * Create a logger that prefixes all messages with a scope string and
 * delegates to the parent logger.
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
