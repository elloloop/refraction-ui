import { Inject, Injectable, InjectionToken, type Provider } from '@angular/core'
import {
  createTelemetry,
  type LogContext,
  type Logger,
  type Span,
  type Telemetry,
  type TelemetryConfig,
} from '@refraction-ui/logger'

/**
 * DI token carrying the {@link TelemetryConfig} supplied to
 * {@link provideTelemetry}. Mirrors the `createAI` / `<AIProvider>` config
 * surface — the consumer's only wiring is this config object.
 */
export const TELEMETRY_CONFIG = new InjectionToken<TelemetryConfig>(
  '@refraction-ui/angular-logger:TELEMETRY_CONFIG',
)

/**
 * DI token resolving to the singleton {@link Telemetry} instance. Provided by
 * {@link provideTelemetry}; injected by {@link TelemetryService}. Exposed so
 * advanced consumers can inject the raw telemetry instance directly.
 */
export const TELEMETRY = new InjectionToken<Telemetry>(
  '@refraction-ui/angular-logger:TELEMETRY',
)

/**
 * TelemetryService — an injectable Angular wrapper around the
 * `@refraction-ui/logger` core. Manager/provider pattern, mirroring
 * `createAI` + `<AIProvider>` (`packages/react-ai`).
 *
 * The Faro engine and every vendor type stay fully hidden behind the core;
 * the only consumer wiring is the {@link TelemetryConfig} passed to
 * {@link provideTelemetry}.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideTelemetry({ app: 'interview', env: 'production', endpoint }),
 *   ],
 * })
 *
 * class InterviewComponent {
 *   private readonly log = inject(TelemetryService).scope({ interviewId })
 * }
 * ```
 */
@Injectable()
export class TelemetryService implements Logger {
  /** The underlying telemetry instance from the core. */
  readonly telemetry: Telemetry

  constructor(@Inject(TELEMETRY) telemetry: Telemetry) {
    this.telemetry = telemetry
  }

  debug(message: string, context?: LogContext): void {
    this.telemetry.debug(message, context)
  }

  info(message: string, context?: LogContext): void {
    this.telemetry.info(message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.telemetry.warn(message, context)
  }

  error(message: string, context?: LogContext): void {
    this.telemetry.error(message, context)
  }

  fatal(message: string, context?: LogContext): void {
    this.telemetry.fatal(message, context)
  }

  /**
   * Derive a child logger with additional bound context (e.g.
   * `{ sessionId, interviewId, turnId }`). Merges over the parent context.
   */
  child(context: LogContext): Logger {
    return this.telemetry.child(context)
  }

  /**
   * Alias for {@link child} — reads naturally in component code
   * (`telemetry.scope({ interviewId })`).
   */
  scope(context: LogContext): Logger {
    return this.telemetry.child(context)
  }

  /** Begin a span. Call {@link Span.end} to record its duration. */
  startSpan(name: string, attributes?: LogContext): Span {
    return this.telemetry.startSpan(name, attributes)
  }

  /** Force-deliver buffered records on every sink. */
  flush(): Promise<void> {
    return this.telemetry.flush()
  }

  /** Registered sink names, in insertion order. */
  get sinks(): string[] {
    return this.telemetry.sinks
  }
}

/**
 * provideTelemetry — registers the singleton {@link Telemetry} instance and
 * {@link TelemetryService} for an Angular application.
 *
 * Pass to `bootstrapApplication(..., { providers: [...] })` or an
 * `NgModule`'s `providers`. The telemetry instance is constructed once from
 * the supplied config; no `endpoint` ⇒ console-only, `enabled: false` ⇒ a
 * tree-shakeable noop — exactly as the core defines.
 */
export function provideTelemetry(config: TelemetryConfig): Provider[] {
  return [
    { provide: TELEMETRY_CONFIG, useValue: config },
    {
      provide: TELEMETRY,
      useFactory: (cfg: TelemetryConfig): Telemetry => createTelemetry(cfg),
      deps: [TELEMETRY_CONFIG],
    },
    TelemetryService,
  ]
}
