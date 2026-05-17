import {
  captureLibraryOriginError,
  type DevFeedbackRecord,
  type DevFeedbackSink,
  type LibraryOriginIdentity,
} from '@refraction-ui/shared'

/**
 * library-error-capture — the Astro capture seam for epic #247 / issue #249.
 *
 * A `defineMiddleware`-compatible runtime hook that tags ONLY errors whose
 * stack originates in a `@refraction-ui/*` package and routes them to an
 * optional, consumer-wired telemetry sink. The filter → tag → route flow
 * lives entirely in `@refraction-ui/shared`'s `captureLibraryOriginError`;
 * this is the thin Astro middleware around it.
 *
 * The error is ALWAYS rethrown so Astro's normal error handling (and the
 * app's own error pages) are untouched. App-origin errors are never tagged
 * or forwarded to the diagnostics sink — they pass straight through.
 *
 * Zero hard dependency on the telemetry lib — the sink is the structural
 * `DevFeedbackSink` from shared (the real `@refraction-ui/logger`
 * `TelemetrySink` satisfies it). Nothing phones home unless a sink is wired.
 */

/**
 * Subset of Astro's middleware context we depend on. Kept structural so the
 * adapter never needs Astro's types at build time (Astro is a peer dep and
 * its middleware types vary across versions).
 */
export interface LibraryErrorCaptureContext {
  request: Request
  locals: Record<string, unknown>
}

/** A `MiddlewareNext`-compatible continuation. */
export type LibraryErrorCaptureNext = () => Promise<Response> | Response

/** Options for {@link createLibraryErrorCapture}. */
export interface LibraryErrorCaptureOptions {
  /**
   * Fixed package/component identity tagged onto a captured library-origin
   * error. Carries NO app data — the fingerprint is derived from the stack.
   */
  identity: LibraryOriginIdentity
  /**
   * Optional, consumer-wired telemetry sink. Library-origin errors are
   * forwarded here when present; absent / `null` ⇒ no-op (nothing phones
   * home). The real `@refraction-ui/logger` `TelemetrySink` satisfies this.
   */
  sink?: DevFeedbackSink | null
  /**
   * Invoked when a library-origin error is captured, with the tagged
   * diagnostics record (after it has been forwarded to the sink). Optional;
   * never called for app-origin errors.
   */
  onCapture?: (record: DevFeedbackRecord) => void
}

/**
 * createLibraryErrorCapture — the Astro-idiomatic server-side capture hook.
 *
 * Returns a `defineMiddleware`-compatible `onRequest` handler that runs the
 * downstream chain and, if it throws, captures the error iff it is
 * `@refraction-ui/*`-origin (filter + tag + optional forward) and then
 * ALWAYS rethrows so Astro's error handling is unchanged.
 *
 * ```ts
 * // src/middleware.ts
 * import { defineMiddleware } from 'astro:middleware'
 * import { createLibraryErrorCapture } from '@refraction-ui/astro-logger'
 *
 * export const onRequest = defineMiddleware(
 *   createLibraryErrorCapture({
 *     identity: { package: '@refraction-ui/astro', componentName: 'app',
 *                 version: '0.1.0', framework: 'astro' },
 *     sink: mySink, // omit ⇒ nothing phones home
 *   }),
 * )
 * ```
 */
export function createLibraryErrorCapture(
  options: LibraryErrorCaptureOptions,
): (
  context: LibraryErrorCaptureContext,
  next: LibraryErrorCaptureNext,
) => Promise<Response> {
  const { identity, sink = null, onCapture } = options

  return async function onRequest(
    _context: LibraryErrorCaptureContext,
    next: LibraryErrorCaptureNext,
  ): Promise<Response> {
    try {
      return await next()
    } catch (error) {
      // Filter + tag + route happens entirely in shared. Returns the tagged
      // record for a library-origin error, or null for an app-origin error
      // (left completely untouched — not forwarded anywhere).
      const record = captureLibraryOriginError(error, identity, sink)
      if (record) onCapture?.(record)
      // Always rethrow: Astro's normal error handling / error page is
      // unchanged for both library- and app-origin errors.
      throw error
    }
  }
}

/**
 * captureAstroLibraryError — the non-middleware Astro seam. Use from an
 * endpoint / server island `try/catch` where the middleware cannot reach.
 * Same contract: library-origin only, optional sink, app-origin returns
 * `null` untouched. Never throws.
 */
export function captureAstroLibraryError(
  error: unknown,
  identity: LibraryOriginIdentity,
  sink?: DevFeedbackSink | null,
): DevFeedbackRecord | null {
  return captureLibraryOriginError(error, identity, sink)
}
