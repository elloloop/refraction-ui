/**
 * @refraction-ui/analytics — type contracts.
 *
 * The library is a neutral Segment-spec collector/router. The app instruments
 * once via the canonical API; the router fans the canonical envelope out to
 * N pluggable sinks. There is NO privileged engine — every vendor is a sink.
 */

/** Canonical Segment event types. */
export type AnalyticsEventType =
  | 'track'
  | 'identify'
  | 'page'
  | 'screen'
  | 'group'
  | 'alias'

/** Schema version stamped onto every envelope and the wire contract path. */
export const SCHEMA_VERSION = 1

/** Arbitrary, JSON-serialisable bag of values. */
export type AnalyticsProperties = Record<string, unknown>

/**
 * The context block attached to every event. `library` identifies the
 * collector; `app`/`env` identify the product instance.
 */
export interface AnalyticsContext {
  app: string
  env: string
  page?: {
    path?: string
    url?: string
    referrer?: string
    title?: string
    search?: string
  }
  library: {
    name: string
    version: string
  }
  /** Free-form additions contributed by `with(context)` children. */
  [key: string]: unknown
}

/**
 * The canonical Segment envelope. Every sink receives events in exactly this
 * shape; the built-in HTTP sink ships it verbatim over the wire contract.
 */
export interface AnalyticsEvent {
  /** Segment call type. */
  type: AnalyticsEventType
  /** Event name (track/screen) or page name (page). */
  event?: string
  /** Idempotency key — backends MUST dedupe on this. */
  messageId: string
  /** Persistent, non-PII, resettable client id. */
  anonymousId: string
  /** Opaque app-supplied id (set after identify). */
  userId?: string
  /** Group id (group calls). */
  groupId?: string
  /** Previous id (alias calls). */
  previousId?: string
  /** Analytics session id (UUIDv4, minted at session start). */
  sessionId: string
  /** track/page/screen/group payload. */
  properties?: AnalyticsProperties
  /** identify/group trait payload. */
  traits?: AnalyticsProperties
  /** Collector + product context. */
  context: AnalyticsContext
  /** ISO-8601 client timestamp. */
  timestamp: string
  /** Envelope schema version. */
  schemaVersion: number
}

/**
 * Sink SPI — implemented by adapter packages (GA4, Azure, PostHog) and by the
 * built-in HTTP sink. A sink declares the consent categories it requires; the
 * router will not deliver to a sink whose categories are not all granted.
 */
export interface AnalyticsSink {
  /** Stable sink identifier. */
  name: string
  /** Consent categories this sink requires (e.g. ['analytics']). */
  consentCategories?: string[]
  /** Called once before the first delivery. */
  init?(ctx: SinkInitContext): void | Promise<void>
  /** Deliver a batch of canonical events. */
  deliver(batch: AnalyticsEvent[], ctx: SinkDeliverContext): void | Promise<void>
  /** Flush any buffered state (best-effort). */
  flush?(): void | Promise<void>
  /** Release resources on reset()/shutdown. */
  shutdown?(): void | Promise<void>
}

/** Context handed to `sink.init`. */
export interface SinkInitContext {
  app: string
  env: string
  endpoint?: string
}

/** Context handed to every `sink.deliver`. */
export interface SinkDeliverContext {
  /** True on the unload path — sinks should prefer sendBeacon. */
  unload: boolean
}

/** Cross-tab persistence SPI. Defaults pick localStorage/cookie/memory. */
export interface AnalyticsStorage {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
}

/** Session engine configuration. */
export interface SessionConfig {
  /** Inactivity timeout in ms before a new session is minted. GA4 = 30min. */
  timeoutMs?: number
  /** Reset the session when a campaign/utm change is detected. */
  resetOnCampaign?: boolean
  /** Persistence backend; defaults to localStorage→cookie→memory. */
  storage?: AnalyticsStorage
  /** Storage key namespace. */
  storageKey?: string
}

/** Identity engine configuration. */
export interface IdentityConfig {
  /** Persistence backend; defaults to localStorage→cookie→memory. */
  storage?: AnalyticsStorage
  /** Storage key namespace. */
  storageKey?: string
}

/** Consent gate configuration. */
export interface ConsentConfig {
  /** Categories granted at boot. */
  granted?: string[]
  /**
   * If true, an event is dropped entirely when NO sink can receive it.
   * If false (default), events are still buffered until consent is granted.
   */
  strict?: boolean
}

/** Consent gate runtime API. */
export interface ConsentAPI {
  grant(...categories: string[]): void
  revoke(...categories: string[]): void
  granted(): string[]
  isGranted(category: string): boolean
}

/** Session runtime API. */
export interface SessionAPI {
  /** Current session id (mints one lazily if none active). */
  id(): string
  /** Force-start a new session, returning the new id. */
  start(): string
  /** End the current session. */
  end(): void
  /** Attach arbitrary session-scoped properties. */
  set(props: AnalyticsProperties): void
}

/** Built-in HTTP sink options (Segment HTTP Tracking API wire contract). */
export interface HttpSinkOptions {
  /** Base endpoint; events POST to `{endpoint}/v{schemaVersion}/batch`. */
  endpoint: string
  /** Write key — sent as `Authorization: Basic base64(writeKey:)`. */
  writeKey: string
  /** Max retries for 429/5xx (exponential backoff). Default 3. */
  maxRetries?: number
  /** Base backoff delay in ms. Default 500. */
  backoffBaseMs?: number
  /** Injected fetch (defaults to global fetch). */
  fetchImpl?: typeof fetch
  /** Injected sendBeacon (defaults to navigator.sendBeacon). */
  beaconImpl?: (url: string, body: string) => boolean
  /** Consent categories this sink requires. Default ['analytics']. */
  consentCategories?: string[]
  /** Soft per-batch byte cap (Segment ≈ 500KB). Default 500_000. */
  maxBatchBytes?: number
  /** Soft per-event byte cap (Segment ≈ 32KB). Default 32_000. */
  maxEventBytes?: number
}

/** `createAnalytics` configuration. */
export interface AnalyticsConfig {
  /** Product/app identifier (stamped into context.app). */
  app: string
  /** Environment, e.g. 'development' | 'production'. Drives presets. */
  env: string
  /** When set, a built-in HTTP sink is auto-registered to this endpoint. */
  endpoint?: string
  /** Write key for the auto-registered HTTP sink. */
  writeKey?: string
  /** Kill switch — when false, a tree-shakeable noop is returned. Default true. */
  enabled?: boolean
  /** 0..1 sampling rate applied per top-level call. Default 1. */
  sampleRate?: number
  /** Extra property/trait keys to redact (in addition to the PII deny-list). */
  redactKeys?: string[]
  /** Explicit sinks (in addition to / instead of the auto HTTP sink). */
  sinks?: AnalyticsSink[]
  /** Session engine config. */
  session?: SessionConfig
  /** Identity engine config. */
  identity?: IdentityConfig
  /** Consent gate config. */
  consent?: ConsentConfig
  /**
   * Force a preset. Defaults: env==='production' → 'prod', else 'dev'.
   * dev = sync + console; prod = batch + sample + beacon flush on unload.
   */
  preset?: 'dev' | 'prod'
  /** Batch size before an automatic flush (prod). Default 20. */
  batchSize?: number
  /** Auto-flush interval in ms (prod). Default 10_000. */
  flushIntervalMs?: number
}

/** Options accepted by every top-level call. */
export interface CallOptions {
  /** Per-call timestamp override (ISO-8601). */
  timestamp?: string
  /** Per-call context overrides (shallow-merged). */
  context?: Partial<AnalyticsContext>
}

/** The public analytics surface returned by `createAnalytics`. */
export interface Analytics {
  track(event: string, properties?: AnalyticsProperties, opts?: CallOptions): void
  identify(userId: string, traits?: AnalyticsProperties, opts?: CallOptions): void
  page(name?: string, properties?: AnalyticsProperties, opts?: CallOptions): void
  screen(name?: string, properties?: AnalyticsProperties, opts?: CallOptions): void
  group(groupId: string, traits?: AnalyticsProperties, opts?: CallOptions): void
  alias(userId: string, previousId?: string, opts?: CallOptions): void

  /** Analytics-session API (NOT replay). */
  session: SessionAPI
  /** Consent gate API. */
  consent: ConsentAPI

  /** Persistent, non-PII anonymous id. */
  anonymousId(): string
  /** Current opaque user id (if identified). */
  userId(): string | undefined

  /** Derive a child that merges extra context into every event. */
  with(context: Partial<AnalyticsContext>): Analytics

  /** Register an additional sink at runtime. */
  addSink(sink: AnalyticsSink): void
  /** Remove a sink by name. */
  removeSink(name: string): void
  /** Registered sink names. */
  readonly sinks: string[]

  /** Flush all sinks (and the internal batch). */
  flush(): Promise<void>
  /**
   * Reset identity + session (privacy-safe logout). Mints a fresh
   * anonymousId and ends the session.
   */
  reset(): void
  /** Whether this is a live collector (false for the noop). */
  readonly enabled: boolean
}
