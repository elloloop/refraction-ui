import type {
  AnalyticsEvent,
  AnalyticsSink,
  SinkDeliverContext,
} from '@refraction-ui/analytics'
import { mapEvent, eventName } from './mapping.js'

/**
 * Minimal structural shape of the bits of `@microsoft/applicationinsights-web`
 * we use. Declared locally so the vendor lib stays an OPTIONAL peer with NO
 * type-level hard dependency — it is only ever reached via dynamic import.
 */
export interface AppInsightsLike {
  loadAppInsights?: () => unknown
  trackEvent: (
    event: { name: string },
    customProperties?: Record<string, unknown>,
  ) => void
  trackPageView: (pageView?: {
    name?: string
    uri?: string
    properties?: Record<string, unknown>
    measurements?: Record<string, number>
  }) => void
  setAuthenticatedUserContext?: (
    authenticatedUserId: string,
    accountId?: string,
    storeInCookie?: boolean,
  ) => void
  clearAuthenticatedUserContext?: () => void
  flush?: (async?: boolean) => void
}

/** Fan-out mode for the App Insights sink. */
export type AppInsightsSinkMode = 'client-sdk' | 'http'

interface BaseOptions {
  /** Consent categories this sink requires. Default `['analytics']`. */
  consentCategories?: string[]
  /** Stable sink name. Default `'app-insights'`. */
  name?: string
}

/**
 * `client-sdk` mode — runs in the browser via `@microsoft/applicationinsights-web`.
 *
 * The vendor SDK is loaded **lazily via dynamic import** the first time a
 * batch is delivered, so it never enters the bundle unless this sink is used.
 * Callers may instead inject a ready instance (`appInsights`) or a custom
 * `loadSdk` factory (used by tests with a mock transport — no network).
 */
export interface ClientSdkOptions extends BaseOptions {
  mode: 'client-sdk'
  /** App Insights connection string (preferred) or instrumentation key. */
  connectionString?: string
  /** Legacy instrumentation key (used when `connectionString` is absent). */
  instrumentationKey?: string
  /**
   * Pre-constructed App Insights instance. When provided, no dynamic import
   * or `loadAppInsights()` happens — used for DI/testing.
   */
  appInsights?: AppInsightsLike
  /**
   * Custom async SDK factory. Overrides the built-in dynamic import of
   * `@microsoft/applicationinsights-web`. Receives the resolved config.
   */
  loadSdk?: (config: {
    connectionString?: string
    instrumentationKey?: string
  }) => Promise<AppInsightsLike>
}

/**
 * `http` mode — POSTs to the App Insights `/v2/track` ingestion endpoint.
 * No browser library is loaded; server-relay friendly.
 */
export interface HttpOptions extends BaseOptions {
  mode: 'http'
  /** Instrumentation key (iKey) for the ingestion envelope. Required. */
  instrumentationKey: string
  /**
   * Ingestion endpoint base. Default the public global endpoint
   * `https://dc.services.visualstudio.com`. Region endpoints are accepted.
   * Events POST to `{endpoint}/v2/track`.
   */
  endpoint?: string
  /** Injected fetch (defaults to global fetch). */
  fetchImpl?: typeof fetch
  /** Max retries for 429/5xx (exponential backoff). Default 3. */
  maxRetries?: number
  /** Base backoff delay in ms. Default 500. */
  backoffBaseMs?: number
}

export type AppInsightsSinkOptions = ClientSdkOptions | HttpOptions

const DEFAULT_INGEST_ENDPOINT = 'https://dc.services.visualstudio.com'
const NO_RETRY = new Set([400, 401, 403, 413])
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/* ------------------------------------------------------------------ */
/*  client-sdk mode                                                    */
/* ------------------------------------------------------------------ */

function createClientSdkSink(opts: ClientSdkOptions): AnalyticsSink {
  const name = opts.name ?? 'app-insights'
  let instance: AppInsightsLike | undefined = opts.appInsights
  let loading: Promise<AppInsightsLike> | undefined

  async function resolveSdk(): Promise<AppInsightsLike> {
    if (instance) return instance
    if (loading) return loading
    loading = (async () => {
      if (opts.loadSdk) {
        instance = await opts.loadSdk({
          connectionString: opts.connectionString,
          instrumentationKey: opts.instrumentationKey,
        })
        return instance
      }
      // Lazy, dynamic, optional — never a static/hard dependency.
      const mod = (await import(
        /* @vite-ignore */ '@microsoft/applicationinsights-web'
      )) as {
        ApplicationInsights: new (cfg: {
          config: {
            connectionString?: string
            instrumentationKey?: string
          }
        }) => AppInsightsLike
      }
      const ai = new mod.ApplicationInsights({
        config: {
          connectionString: opts.connectionString,
          instrumentationKey: opts.instrumentationKey,
        },
      })
      ai.loadAppInsights?.()
      instance = ai
      return ai
    })()
    return loading
  }

  let lastAuthUserId: string | undefined

  return {
    name,
    consentCategories: opts.consentCategories ?? ['analytics'],

    async deliver(batch: AnalyticsEvent[]): Promise<void> {
      if (batch.length === 0) return
      const ai = await resolveSdk()

      for (const ev of batch) {
        // Identity → App Insights authenticated-user context.
        if (ev.userId !== undefined && ev.userId !== lastAuthUserId) {
          ai.setAuthenticatedUserContext?.(ev.userId)
          lastAuthUserId = ev.userId
        }
        if (
          ev.type === 'identify' &&
          ev.userId === undefined &&
          lastAuthUserId !== undefined
        ) {
          ai.clearAuthenticatedUserContext?.()
          lastAuthUserId = undefined
        }

        const mapped = mapEvent(ev)
        const merged: Record<string, unknown> = {
          ...mapped.properties,
          ...mapped.measurements,
        }

        if (ev.type === 'page') {
          ai.trackPageView({
            name: ev.event ?? ev.context.page?.path,
            uri: ev.context.page?.url,
            properties: mapped.properties,
            measurements: mapped.measurements,
          })
        } else {
          ai.trackEvent({ name: mapped.name }, merged)
        }
      }
    },

    async flush(): Promise<void> {
      if (instance?.flush) instance.flush(false)
    },

    shutdown(): void {
      instance = undefined
      loading = undefined
      lastAuthUserId = undefined
    },
  }
}

/* ------------------------------------------------------------------ */
/*  http mode — App Insights /v2/track ingestion                       */
/* ------------------------------------------------------------------ */

interface IngestEnvelope {
  name: string
  time: string
  iKey: string
  tags: Record<string, string>
  data: {
    baseType: 'EventData' | 'PageViewData'
    baseData: {
      ver: 2
      name: string
      properties: Record<string, string>
      measurements: Record<string, number>
    }
  }
}

/**
 * Build an App Insights ingestion envelope (Breeze schema) for one canonical
 * event. `tags` carry session/user/operation correlation; `baseData` carries
 * the custom event with the properties/measurements split.
 */
export function buildIngestEnvelope(
  ev: AnalyticsEvent,
  iKey: string,
): IngestEnvelope {
  const mapped = mapEvent(ev)
  const isPage = ev.type === 'page'
  const tags: Record<string, string> = {
    'ai.session.id': ev.sessionId,
    'ai.user.id': ev.anonymousId,
    'ai.operation.id': ev.messageId,
    'ai.internal.sdkVersion': `refraction-ui-analytics-app-insights:0.1.0`,
    'ai.application.ver': ev.context.library.version,
    'ai.cloud.role': ev.context.app,
    'ai.cloud.roleInstance': ev.context.env,
  }
  if (ev.userId !== undefined) tags['ai.user.authUserId'] = ev.userId

  return {
    name: isPage
      ? 'Microsoft.ApplicationInsights.PageView'
      : 'Microsoft.ApplicationInsights.Event',
    time: ev.timestamp,
    iKey,
    tags,
    data: {
      baseType: isPage ? 'PageViewData' : 'EventData',
      baseData: {
        ver: 2,
        name: isPage ? eventName(ev) : mapped.name,
        properties: mapped.properties,
        measurements: mapped.measurements,
      },
    },
  }
}

function createHttpSink(opts: HttpOptions): AnalyticsSink {
  const name = opts.name ?? 'app-insights'
  const {
    instrumentationKey,
    maxRetries = 3,
    backoffBaseMs = 500,
  } = opts
  const base = (opts.endpoint ?? DEFAULT_INGEST_ENDPOINT).replace(/\/+$/, '')
  const url = `${base}/v2/track`

  const resolveFetch = (): typeof fetch => {
    if (opts.fetchImpl) return opts.fetchImpl
    const f = (globalThis as unknown as { fetch?: typeof fetch }).fetch
    if (!f) throw new Error('No fetch implementation available')
    return f
  }

  async function send(body: string): Promise<void> {
    const doFetch = resolveFetch()
    for (let attempt = 0; ; attempt++) {
      let status: number
      try {
        const res = await doFetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        })
        status = res.status
      } catch {
        status = 0 // network error → transient
      }
      if (status >= 200 && status < 300) return
      if (NO_RETRY.has(status)) return
      if (attempt >= maxRetries) return
      await sleep(backoffBaseMs * 2 ** attempt)
    }
  }

  return {
    name,
    consentCategories: opts.consentCategories ?? ['analytics'],

    async deliver(
      batch: AnalyticsEvent[],
      _ctx: SinkDeliverContext,
    ): Promise<void> {
      if (batch.length === 0) return
      const envelopes = batch.map((ev) =>
        buildIngestEnvelope(ev, instrumentationKey),
      )
      // App Insights ingestion accepts a JSON array of envelopes (it also
      // accepts newline-delimited; the array form is the documented batch).
      await send(JSON.stringify(envelopes))
    },
  }
}

/* ------------------------------------------------------------------ */
/*  factory                                                            */
/* ------------------------------------------------------------------ */

/**
 * Create an Azure Application Insights {@link AnalyticsSink}.
 *
 * Dual-mode:
 *  - `client-sdk` — browser, lazy `@microsoft/applicationinsights-web`
 *    (`trackEvent` / `trackPageView`); the vendor lib is an OPTIONAL peer
 *    loaded only via dynamic import, never a hard/static dependency.
 *  - `http` — App Insights `/v2/track` ingestion endpoint; no browser lib,
 *    server-relay friendly.
 *
 * Both modes map the canonical envelope to App Insights custom events with a
 * properties/measurements split and surface identity as
 * `authenticatedUserId` / `anonymous`.
 */
export function createAppInsightsSink(
  options: AppInsightsSinkOptions,
): AnalyticsSink {
  return options.mode === 'http'
    ? createHttpSink(options)
    : createClientSdkSink(options)
}
