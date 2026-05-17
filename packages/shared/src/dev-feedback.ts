/**
 * dev-feedback — zero-dependency `devWarn` / `devError` primitives.
 *
 * Design constraints (epic #247, issue #248):
 * - Guarded by `process.env.NODE_ENV !== 'production'` so production bundlers
 *   dead-code-strip every call (the guard is a static string compare that
 *   minifiers fold to `false` in prod builds).
 * - Warn-once dedupe per `code` — a footgun is reported once, not on every
 *   render.
 * - NO import of `@refraction-ui/logger` (no hard dependency on the telemetry
 *   lib). Forwarding to a telemetry sink happens ONLY if the consumer
 *   explicitly injects one (dependency inversion, never an import).
 */

/**
 * Minimal structural shape of the record a telemetry sink consumes. This is a
 * deliberate structural mirror of `@refraction-ui/logger`'s `LogRecord` — it is
 * NOT imported, so `@refraction-ui/shared` keeps zero dependency on the
 * telemetry lib. A consumer that wires the real logger sink satisfies this
 * shape structurally.
 */
export interface DevFeedbackRecord {
  level: 'warn' | 'error'
  message: string
  timestamp: number
  /** Structured detail — the library-origin envelope lives here. */
  context: Record<string, unknown>
}

/**
 * The narrow contract a consumer-injected telemetry sink must satisfy. Kept
 * intentionally minimal and structural so the real `TelemetrySink` from
 * `@refraction-ui/logger` is assignable WITHOUT shared importing the logger.
 */
export interface DevFeedbackSink {
  /** Receive a single dev-feedback record. Must never throw to the caller. */
  log(record: DevFeedbackRecord): void
}

/**
 * Minimal ambient view of `process.env` so we can read `NODE_ENV` WITHOUT
 * pulling `@types/node` into this zero-dependency package. Accessed defensively
 * (the `typeof process === 'undefined'` guard) so this is safe in browsers too.
 */
declare const process:
  | { env?: { NODE_ENV?: string } }
  | undefined

/** Per-code dedupe set — module-scoped so it survives across calls. */
const seen = new Set<string>()

/**
 * Optional, consumer-injected sink. `null` until a consumer explicitly wires
 * one via {@link setDevFeedbackSink}. Nothing phones home implicitly.
 */
let injectedSink: DevFeedbackSink | null = null

/**
 * Wire an optional telemetry sink that {@link devWarn} / {@link devError}
 * forward to (in addition to the console). Inversion of control: the consumer
 * owns the sink; this package never imports it. Pass `null` to unwire.
 *
 * Forwarding still only happens in non-production (the calls themselves are
 * stripped in prod), and still respects warn-once dedupe.
 */
export function setDevFeedbackSink(sink: DevFeedbackSink | null): void {
  injectedSink = sink
}

/** Test-only / consumer-only escape hatch to reset warn-once dedupe state. */
export function resetDevFeedback(): void {
  seen.clear()
}

function isDev(): boolean {
  // String compare (not a negated truthiness) so bundlers can statically fold
  // `process.env.NODE_ENV` and strip the whole branch in production builds.
  return (
    typeof process === 'undefined' ||
    process.env?.NODE_ENV !== 'production'
  )
}

function emit(
  level: 'warn' | 'error',
  code: string,
  message: string,
  detail?: Record<string, unknown>,
): void {
  if (!isDev()) return

  // Warn-once dedupe, keyed by (level, code) so an error and a warning sharing
  // a code are not collapsed into one.
  const key = `${level}:${code}`
  if (seen.has(key)) return
  seen.add(key)

  const text = `[refraction-ui] ${code}: ${message}`

  if (level === 'error') {
    console.error(text, detail ?? '')
  } else {
    console.warn(text, detail ?? '')
  }

  // Forward to the consumer-injected sink ONLY if one was explicitly wired.
  if (injectedSink) {
    const record: DevFeedbackRecord = {
      level,
      message: `${code}: ${message}`,
      timestamp: Date.now(),
      context: { code, ...(detail ?? {}) },
    }
    try {
      injectedSink.log(record)
    } catch {
      // A broken sink must never break the consumer app.
    }
  }
}

/**
 * Emit a development-only warning for a refraction-ui footgun.
 *
 * @param code    Stable, greppable identifier (e.g. `'react/no-controlled-prop'`).
 * @param message Human-readable explanation.
 * @param detail  Optional structured detail (forwarded to an injected sink).
 *
 * Stripped entirely in production. Warned at most once per `code`.
 */
export function devWarn(
  code: string,
  message: string,
  detail?: Record<string, unknown>,
): void {
  emit('warn', code, message, detail)
}

/**
 * Emit a development-only error for a refraction-ui misuse / invariant break.
 *
 * @param code    Stable, greppable identifier.
 * @param message Human-readable explanation.
 * @param detail  Optional structured detail (forwarded to an injected sink).
 *
 * Stripped entirely in production. Reported at most once per `code`.
 */
export function devError(
  code: string,
  message: string,
  detail?: Record<string, unknown>,
): void {
  emit('error', code, message, detail)
}
