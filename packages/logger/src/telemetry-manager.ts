import { createConsoleSink } from './console-sink.js'
import { createNoopTelemetry } from './noop.js'
import { resolvePreset, type TelemetryPreset } from './presets.js'
import { redact } from './redact.js'
import {
  LEVEL_ORDER,
  type LogContext,
  type LogLevel,
  type LogRecord,
  type Span,
  type SpanRecord,
  type Telemetry,
  type TelemetryConfig,
  type TelemetrySink,
} from './types.js'

/**
 * createTelemetry — creates a telemetry manager that fans records out to
 * registered sinks. Manager/provider pattern, mirroring `createAI`.
 *
 * - `enabled: false` -> tree-shakeable noop (zero emissions, no engines).
 * - no `endpoint` -> console-only transport.
 * - `endpoint` set -> async Faro engine is registered when the optional
 *   peers exist; console stays as a safe fallback until then.
 *
 * The returned object IS a logger (root context = `{}`); `child()` derives
 * loggers with bound context (sessionId / interviewId / turnId / ...).
 */
export function createTelemetry(config: TelemetryConfig): Telemetry {
  if (config.enabled === false) {
    return createNoopTelemetry()
  }

  const preset = resolvePreset(config.env)
  const sampleRate = config.sampleRate ?? preset.sampleRate
  const redactKeys = config.redactKeys ?? []

  const sinks = new Map<string, TelemetrySink>()
  /** Insertion-ordered sink names. */
  const sinkOrder: string[] = []
  /** Batch buffer (production preset only). */
  const buffer: Array<{ kind: 'log'; record: LogRecord } | { kind: 'span'; record: SpanRecord }> = []

  function addSinkInternal(sink: TelemetrySink): void {
    if (sinks.has(sink.name)) {
      sinks.set(sink.name, sink)
    } else {
      sinks.set(sink.name, sink)
      sinkOrder.push(sink.name)
    }
  }

  // Console transport is always present as the zero-dependency baseline.
  addSinkInternal(createConsoleSink({ pretty: preset.pretty }))

  // When an endpoint is configured, attempt to attach the Faro engine. The
  // import is lazy + dynamic so the optional peers never become required and
  // Faro names stay out of the public API.
  if (config.endpoint) {
    const endpoint = config.endpoint
    void import('./faro-engine.js')
      .then(({ createFaroSink }) => createFaroSink({ app: config.app, endpoint }))
      .then((faro) => {
        if (faro) addSinkInternal(faro)
      })
      .catch(() => {
        /* peers absent or init failed — console remains */
      })
  }

  function shouldSample(): boolean {
    if (sampleRate >= 1) return true
    if (sampleRate <= 0) return false
    return Math.random() < sampleRate
  }

  function dispatch(
    entry: { kind: 'log'; record: LogRecord } | { kind: 'span'; record: SpanRecord },
  ): void {
    if (preset.batch) {
      buffer.push(entry)
      if (buffer.length >= preset.batchSize) {
        void flushBuffer()
      }
      return
    }
    deliver(entry)
  }

  function deliver(
    entry: { kind: 'log'; record: LogRecord } | { kind: 'span'; record: SpanRecord },
  ): void {
    for (const name of sinkOrder) {
      const sink = sinks.get(name)
      if (!sink) continue
      if (entry.kind === 'log') sink.log(entry.record)
      else sink.span(entry.record)
    }
  }

  async function flushBuffer(): Promise<void> {
    if (buffer.length > 0) {
      const pending = buffer.splice(0, buffer.length)
      for (const entry of pending) deliver(entry)
    }
    await Promise.all(
      sinkOrder.map((name) => sinks.get(name)?.flush() ?? Promise.resolve()),
    )
  }

  // ---- page-exit beacon flush (production preset) -------------------------
  // Browser only — `navigator.sendBeacon` is used by the underlying engine
  // transport; here we just trigger a flush on the page-exit signals.
  const root = globalThis as {
    addEventListener?: (type: string, listener: () => void) => void
    document?: { visibilityState?: string }
    navigator?: { sendBeacon?: unknown }
  }
  if (preset.beaconFlush && typeof root.addEventListener === 'function') {
    const onExit = (): void => {
      void flushBuffer()
    }
    root.addEventListener('pagehide', onExit)
    root.addEventListener('visibilitychange', () => {
      if (root.document?.visibilityState === 'hidden') onExit()
    })
  }

  function makeLogger(boundContext: LogContext): Telemetry {
    function emit(level: LogLevel, message: string, context?: LogContext): void {
      if (LEVEL_ORDER[level] < LEVEL_ORDER[preset.minLevel]) return
      if (!shouldSample()) return
      const merged = redact({ ...boundContext, ...context }, redactKeys)
      const record: LogRecord = {
        level,
        message,
        timestamp: Date.now(),
        app: config.app,
        env: config.env,
        context: merged,
      }
      dispatch({ kind: 'log', record })
    }

    const logger: Telemetry = {
      debug(message, context?) {
        emit('debug', message, context)
      },
      info(message, context?) {
        emit('info', message, context)
      },
      warn(message, context?) {
        emit('warn', message, context)
      },
      error(message, context?) {
        emit('error', message, context)
      },
      fatal(message, context?) {
        emit('fatal', message, context)
      },

      child(context: LogContext): Telemetry {
        return makeLogger({ ...boundContext, ...context })
      },

      startSpan(name: string, attributes?: LogContext): Span {
        const startTime = Date.now()
        let ended = false
        return {
          end(opts?: { error?: unknown; attributes?: LogContext }): void {
            if (ended) return
            ended = true
            const endTime = Date.now()
            const merged = redact(
              { ...boundContext, ...attributes, ...opts?.attributes },
              redactKeys,
            )
            const err = opts?.error
            const record: SpanRecord = {
              name,
              startTime,
              endTime,
              durationMs: endTime - startTime,
              app: config.app,
              env: config.env,
              context: merged,
              status: err ? 'error' : 'ok',
              ...(err
                ? {
                    error: {
                      name: err instanceof Error ? err.name : 'Error',
                      message: err instanceof Error ? err.message : String(err),
                    },
                  }
                : {}),
            }
            dispatch({ kind: 'span', record })
          },
        }
      },

      flush(): Promise<void> {
        return flushBuffer()
      },

      get sinks(): string[] {
        return [...sinkOrder]
      },

      addSink(sink: TelemetrySink): void {
        addSinkInternal(sink)
      },

      removeSink(name: string): void {
        if (sinks.has(name)) {
          sinks.delete(name)
          const idx = sinkOrder.indexOf(name)
          if (idx !== -1) sinkOrder.splice(idx, 1)
        }
      },
    }

    return logger
  }

  return makeLogger({})
}

export type { TelemetryPreset }
