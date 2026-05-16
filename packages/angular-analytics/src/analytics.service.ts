import {
  Inject,
  Injectable,
  InjectionToken,
  Optional,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core'
import {
  createAnalytics,
  type Analytics,
  type AnalyticsConfig,
  type AnalyticsContext,
  type AnalyticsProperties,
  type CallOptions,
  type ConsentAPI,
  type SessionAPI,
} from '@refraction-ui/analytics'

/**
 * DI token carrying the canonical `Analytics` instance. Provided by
 * {@link provideAnalytics}. Inject this directly only for advanced use —
 * prefer {@link AnalyticsService}.
 */
export const ANALYTICS_INSTANCE = new InjectionToken<Analytics>(
  '@refraction-ui/angular-analytics:ANALYTICS_INSTANCE',
)

/**
 * `provideAnalytics` — registers an analytics instance for the application
 * injector. Mirrors React's `<AnalyticsProvider>`: instrument once, never
 * naming a vendor.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideAnalytics({ app: 'my-app', env: 'production' }),
 *   ],
 * })
 * ```
 *
 * Pass an existing `Analytics` instance to share one collector across
 * injectors, or an {@link AnalyticsConfig} to construct one lazily.
 */
export function provideAnalytics(
  configOrInstance: AnalyticsConfig | Analytics,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ANALYTICS_INSTANCE,
      useFactory: () =>
        isAnalyticsInstance(configOrInstance)
          ? configOrInstance
          : createAnalytics(configOrInstance),
    },
  ])
}

function isAnalyticsInstance(
  value: AnalyticsConfig | Analytics,
): value is Analytics {
  return typeof (value as Analytics).track === 'function'
}

/**
 * AnalyticsService — injectable wrapper over the `@refraction-ui/analytics`
 * core. Exposes the full Segment-spec surface plus session/identity/consent
 * helpers. The app instruments through this service and never references a
 * vendor sink.
 *
 * ```ts
 * export class CheckoutComponent {
 *   constructor(private analytics: AnalyticsService) {}
 *   pay() {
 *     this.analytics.track('Payment Submitted', { plan: 'pro' })
 *   }
 * }
 * ```
 */
@Injectable()
export class AnalyticsService {
  private readonly analytics: Analytics

  constructor(
    @Optional()
    @Inject(ANALYTICS_INSTANCE)
    instance: Analytics | null,
  ) {
    if (!instance) {
      throw new Error(
        'AnalyticsService requires provideAnalytics(...) in the application providers',
      )
    }
    this.analytics = instance
  }

  /** The underlying canonical `Analytics` instance. */
  get instance(): Analytics {
    return this.analytics
  }

  /** Whether this is a live collector (false for the noop). */
  get enabled(): boolean {
    return this.analytics.enabled
  }

  /** Registered sink names. */
  get sinks(): string[] {
    return this.analytics.sinks
  }

  // --- Segment-spec calls ------------------------------------------------

  track(
    event: string,
    properties?: AnalyticsProperties,
    opts?: CallOptions,
  ): void {
    this.analytics.track(event, properties, opts)
  }

  identify(
    userId: string,
    traits?: AnalyticsProperties,
    opts?: CallOptions,
  ): void {
    this.analytics.identify(userId, traits, opts)
  }

  page(
    name?: string,
    properties?: AnalyticsProperties,
    opts?: CallOptions,
  ): void {
    this.analytics.page(name, properties, opts)
  }

  screen(
    name?: string,
    properties?: AnalyticsProperties,
    opts?: CallOptions,
  ): void {
    this.analytics.screen(name, properties, opts)
  }

  group(
    groupId: string,
    traits?: AnalyticsProperties,
    opts?: CallOptions,
  ): void {
    this.analytics.group(groupId, traits, opts)
  }

  alias(userId: string, previousId?: string, opts?: CallOptions): void {
    this.analytics.alias(userId, previousId, opts)
  }

  // --- Session / identity / consent helpers ------------------------------

  /** Analytics-session API (NOT replay). */
  get session(): SessionAPI {
    return this.analytics.session
  }

  /** Consent gate API. */
  get consent(): ConsentAPI {
    return this.analytics.consent
  }

  /** Persistent, non-PII anonymous id. */
  anonymousId(): string {
    return this.analytics.anonymousId()
  }

  /** Current opaque user id (if identified). */
  userId(): string | undefined {
    return this.analytics.userId()
  }

  /** Derive a child collector that merges extra context into every event. */
  with(context: Partial<AnalyticsContext>): Analytics {
    return this.analytics.with(context)
  }

  // --- Lifecycle ---------------------------------------------------------

  /** Flush all sinks (and the internal batch). */
  flush(): Promise<void> {
    return this.analytics.flush()
  }

  /** Reset identity + session (privacy-safe logout). */
  reset(): void {
    this.analytics.reset()
  }
}
