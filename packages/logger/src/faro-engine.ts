import type { LogLevel, LogRecord, SpanRecord, TelemetrySink } from './types.js'

/**
 * Faro-backed engine. `@grafana/faro-web-sdk` + `@grafana/faro-web-tracing`
 * are **optional peerDependencies** — they are loaded dynamically and never
 * referenced in this module's public types. If the peers are absent the
 * factory resolves to `null` so the caller can fall back to console.
 *
 * For tests, a `transport` may be injected: an object with a `push(payload)`
 * method. This bypasses Faro entirely (no network, no peer required).
 */

/** Minimal structural shape of a Faro-ish transport. Not exported. */
interface FaroTransport {
  push(payload: { kind: 'log' | 'span'; record: LogRecord | SpanRecord }): void
}

export interface FaroEngineOptions {
  app: string
  endpoint: string
  /**
   * Test/override transport. When provided, the Faro peers are NOT loaded
   * and records are forwarded straight to `transport.push`.
   */
  transport?: FaroTransport
}

/** Map our levels onto Faro's log-level strings. */
const FARO_LEVEL: Record<LogLevel, string> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'error',
}

/**
 * Construct the Faro engine. Returns `null` when the optional peers are not
 * installed and no override transport was supplied — callers treat `null` as
 * "fall back to console".
 */
export async function createFaroSink(
  opts: FaroEngineOptions,
): Promise<TelemetrySink | null> {
  const transport = opts.transport ?? (await loadFaroTransport(opts))
  if (!transport) return null

  return {
    name: 'faro',

    log(record: LogRecord): void {
      transport.push({ kind: 'log', record })
    },

    span(record: SpanRecord): void {
      transport.push({ kind: 'span', record })
    },

    async flush(): Promise<void> {
      // Faro's own transports flush on their schedule / on beacon; the
      // manager drives page-exit beacon flushing. Nothing buffered here.
    },
  }
}

/**
 * Dynamically import the Faro peers and adapt them to {@link FaroTransport}.
 * Returns `null` if either peer is missing (optional peerDependency absent).
 */
async function loadFaroTransport(
  opts: FaroEngineOptions,
): Promise<FaroTransport | null> {
  try {
    // Indirected so bundlers keep these as runtime-optional dynamic imports.
    const sdkName = '@grafana/faro-web-sdk'
    const tracingName = '@grafana/faro-web-tracing'
    const sdk = (await import(/* @vite-ignore */ sdkName)) as {
      initializeFaro: (cfg: unknown) => unknown
      getWebInstrumentations: () => unknown[]
    }
    const tracing = (await import(/* @vite-ignore */ tracingName)) as {
      TracingInstrumentation: new () => unknown
    }

    const faro = sdk.initializeFaro({
      url: opts.endpoint,
      app: { name: opts.app },
      instrumentations: [
        ...sdk.getWebInstrumentations(),
        new tracing.TracingInstrumentation(),
      ],
    }) as {
      api: {
        pushLog: (msgs: unknown[], opts?: unknown) => void
        pushEvent: (name: string, attrs?: Record<string, unknown>) => void
      }
    }

    return {
      push({ kind, record }): void {
        if (kind === 'log') {
          const r = record as LogRecord
          faro.api.pushLog([r.message], {
            level: FARO_LEVEL[r.level],
            context: flatten(r.context),
          })
        } else {
          const r = record as SpanRecord
          faro.api.pushEvent(`span:${r.name}`, {
            durationMs: String(r.durationMs),
            status: r.status,
            ...flatten(r.context),
          })
        }
      },
    }
  } catch {
    // Peer not installed (optional) or init failed — caller falls back.
    return null
  }
}

/** Faro context attributes are flat string maps; coerce ours to match. */
function flatten(ctx: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(ctx)) {
    out[k] = typeof v === 'string' ? v : JSON.stringify(v)
  }
  return out
}
