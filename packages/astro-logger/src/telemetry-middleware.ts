import {
  createTelemetry,
  type Telemetry,
  type TelemetryConfig,
} from '@refraction-ui/logger'

/**
 * Subset of Astro's middleware context we depend on. Kept structural so the
 * adapter never needs Astro's types at build time (Astro is a peer dep and
 * its middleware types vary across versions).
 */
export interface TelemetryMiddlewareContext {
  request: Request
  locals: Record<string, unknown>
}

/** A `MiddlewareNext`-compatible continuation. */
export type TelemetryMiddlewareNext = () => Promise<Response> | Response

/** Options for {@link createTelemetryMiddleware}. */
export interface TelemetryMiddlewareOptions extends TelemetryConfig {
  /**
   * Key under `context.locals` where the per-request logger is exposed.
   * Defaults to `telemetry`.
   */
  localsKey?: string
  /**
   * Pre-built telemetry instance to reuse instead of constructing one from
   * the config. Useful for sharing a single manager across requests.
   */
  telemetry?: Telemetry
}

/**
 * createTelemetryMiddleware — the Astro-idiomatic server-side telemetry hook.
 *
 * Returns a `defineMiddleware`-compatible `onRequest` handler that:
 *   - builds (or reuses) a `@refraction-ui/logger` telemetry manager,
 *   - exposes a per-request child logger on `context.locals[localsKey]`
 *     (bound with method + path), so SSR pages/endpoints can log,
 *   - wraps the downstream chain in a span recording duration + status,
 *   - flushes buffered records once the response is produced.
 *
 * ```ts
 * // src/middleware.ts
 * import { defineMiddleware } from 'astro:middleware'
 * import { createTelemetryMiddleware } from '@refraction-ui/astro-logger'
 *
 * export const onRequest = defineMiddleware(
 *   createTelemetryMiddleware({ app: 'web', env: 'production', endpoint: '/collect' }),
 * )
 * ```
 */
export function createTelemetryMiddleware(
  options: TelemetryMiddlewareOptions,
): (
  context: TelemetryMiddlewareContext,
  next: TelemetryMiddlewareNext,
) => Promise<Response> {
  const { localsKey = 'telemetry', telemetry, ...config } = options
  const root: Telemetry = telemetry ?? createTelemetry(config)

  return async function onRequest(
    context: TelemetryMiddlewareContext,
    next: TelemetryMiddlewareNext,
  ): Promise<Response> {
    const url = new URL(context.request.url)
    const method = context.request.method
    const path = url.pathname

    const requestLogger = root.child({ method, path })
    context.locals[localsKey] = requestLogger

    const span = requestLogger.startSpan('astro.request', { method, path })
    try {
      const response = await next()
      span.end({ attributes: { status: response.status } })
      return response
    } catch (error) {
      span.end({ error })
      requestLogger.error('astro.request.error', {
        method,
        path,
        message: error instanceof Error ? error.message : String(error),
      })
      throw error
    } finally {
      // Best-effort delivery of any buffered records for this request.
      void root.flush()
    }
  }
}
