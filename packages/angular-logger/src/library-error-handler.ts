import {
  ErrorHandler,
  Injectable,
  InjectionToken,
  type Provider,
} from '@angular/core'
import {
  captureLibraryOriginError,
  type DevFeedbackRecord,
  type DevFeedbackSink,
  type LibraryOriginIdentity,
} from '@refraction-ui/shared'

/**
 * library-error-handler — the Angular capture seam for epic #247 / issue #249.
 *
 * An `ErrorHandler` that tags ONLY errors whose stack originates in a
 * `@refraction-ui/*` package and routes them to an optional, consumer-wired
 * telemetry sink. The filter → tag → route flow lives entirely in
 * `@refraction-ui/shared`'s `captureLibraryOriginError`; this class is the
 * thin Angular DI wrapper around it.
 *
 * The consumer's normal error behavior is preserved: EVERY error is still
 * delegated to Angular's default `ErrorHandler` (console + rethrow semantics).
 * App-origin errors are never tagged or forwarded to the diagnostics sink.
 *
 * Zero hard dependency on the telemetry lib — the sink is the structural
 * `DevFeedbackSink` from shared (the real `@refraction-ui/logger`
 * `TelemetrySink` satisfies it). Nothing phones home unless a sink is wired.
 */

/**
 * DI token for the fixed package/component identity tagged onto a captured
 * library-origin error. Carries NO app data (the fingerprint is derived from
 * the stack). Required by {@link provideLibraryErrorCapture}.
 */
export const LIBRARY_ORIGIN_IDENTITY = new InjectionToken<LibraryOriginIdentity>(
  '@refraction-ui/angular-logger:LIBRARY_ORIGIN_IDENTITY',
)

/**
 * DI token for the optional, consumer-wired telemetry sink. Unprovided /
 * `null` ⇒ no-op (nothing phones home). The real `@refraction-ui/logger`
 * `TelemetrySink` satisfies this structurally.
 */
export const LIBRARY_ERROR_SINK = new InjectionToken<DevFeedbackSink | null>(
  '@refraction-ui/angular-logger:LIBRARY_ERROR_SINK',
)

/**
 * RefractionErrorHandler — see module doc. Delegates all errors to a base
 * `ErrorHandler` (default Angular behavior preserved) and additionally
 * captures only refraction-ui-origin ones.
 */
@Injectable()
export class RefractionErrorHandler implements ErrorHandler {
  private readonly identity: LibraryOriginIdentity
  private readonly sink: DevFeedbackSink | null
  private readonly delegate: ErrorHandler

  constructor(
    identity: LibraryOriginIdentity,
    sink: DevFeedbackSink | null,
    /** Base handler to preserve default behavior. Defaults to Angular's. */
    delegate: ErrorHandler = new ErrorHandler(),
  ) {
    this.identity = identity
    this.sink = sink
    this.delegate = delegate
  }

  /**
   * Capture refraction-origin errors (filter + tag + optional forward), then
   * ALWAYS delegate to the base handler so the app's normal error behavior is
   * untouched. Returns nothing (Angular's `ErrorHandler` contract).
   *
   * Exposed return is `void`; the captured record (or `null` for app-origin)
   * is available via {@link tryCapture} for tests / advanced consumers.
   */
  handleError(error: unknown): void {
    this.tryCapture(error)
    this.delegate.handleError(error)
  }

  /**
   * The pure capture step (no delegation). Returns the tagged diagnostics
   * record for a library-origin error, or `null` when the error is app-origin
   * (untouched — never forwarded). Never throws.
   */
  tryCapture(error: unknown): DevFeedbackRecord | null {
    return captureLibraryOriginError(error, this.identity, this.sink)
  }
}

/**
 * provideLibraryErrorCapture — registers {@link RefractionErrorHandler} as the
 * app's `ErrorHandler`, wiring the supplied identity and an optional sink.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideLibraryErrorCapture(
 *       { package: '@refraction-ui/angular', componentName: 'app',
 *         version: '0.1.0', framework: 'angular' },
 *       mySink, // omit / null ⇒ nothing phones home
 *     ),
 *   ],
 * })
 * ```
 */
export function provideLibraryErrorCapture(
  identity: LibraryOriginIdentity,
  sink: DevFeedbackSink | null = null,
): Provider[] {
  return [
    { provide: LIBRARY_ORIGIN_IDENTITY, useValue: identity },
    { provide: LIBRARY_ERROR_SINK, useValue: sink },
    {
      provide: ErrorHandler,
      useFactory: (
        id: LibraryOriginIdentity,
        s: DevFeedbackSink | null,
      ): ErrorHandler => new RefractionErrorHandler(id, s),
      deps: [LIBRARY_ORIGIN_IDENTITY, LIBRARY_ERROR_SINK],
    },
  ]
}
