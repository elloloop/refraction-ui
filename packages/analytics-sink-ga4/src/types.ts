/**
 * @refraction-ui/analytics-sink-ga4 — option contracts.
 *
 * GA4 is "just a sink" in the epic's model (no privileged engine). This
 * adapter implements the `AnalyticsSink` SPI from `@refraction-ui/analytics`
 * in two interchangeable modes:
 *
 *   - `client-sdk` — lazy-loads gtag.js in the browser (no hard vendor dep;
 *     the script is injected on first delivery only). Bridges Consent Mode.
 *   - `http`       — GA4 Measurement Protocol (`/mp/collect`). No browser
 *     library is ever loaded — server-relay friendly.
 *
 * Default = `http` (protocol adapter, no vendor lib in the browser), matching
 * the epic's "default = protocol adapters" stance.
 */

/** Minimal gtag.js function signature (we never import the real types). */
export type GtagFn = (...args: unknown[]) => void

/** GA4 Consent Mode signal values. */
export type ConsentState = 'granted' | 'denied'

/**
 * GA4 Consent Mode bridge — maps our consent categories to the gtag
 * `consent` command. Only used in `client-sdk` mode.
 */
export interface GA4ConsentBridge {
  /**
   * Default consent state pushed via `gtag('consent', 'default', …)` before
   * the GA4 tag loads. Keys are GA4 consent types
   * (`analytics_storage`, `ad_storage`, `ad_user_data`,
   * `ad_personalization`, `functionality_storage`, …).
   */
  default?: Record<string, ConsentState>
  /**
   * Maps a refraction consent category → the GA4 consent types it controls.
   * When the router reports the sink may deliver (category granted) the
   * adapter pushes `gtag('consent', 'update', { <types>: 'granted' })`.
   * Example: `{ analytics: ['analytics_storage'] }`.
   */
  map?: Record<string, string[]>
}

interface GA4CommonOptions {
  /** GA4 Measurement ID, e.g. `G-XXXXXXXXXX`. */
  measurementId: string
  /**
   * Consent categories this sink requires. The router will not deliver until
   * all are granted. Default: `['analytics']`.
   */
  consentCategories?: string[]
  /** Stable sink name. Default `'ga4'`. */
  name?: string
}

/** `client-sdk` mode — runs gtag.js in the browser. */
export interface GA4ClientSdkOptions extends GA4CommonOptions {
  mode: 'client-sdk'
  /**
   * Inject the GA4 Consent Mode bridge. The default state (if any) is pushed
   * before the tag loads; category grants drive `consent: update`.
   */
  consentMode?: GA4ConsentBridge
  /**
   * Inject an existing gtag function (tests / apps that manage the tag
   * themselves). When provided, the script loader is NOT used and **no**
   * vendor script is injected.
   */
  gtag?: GtagFn
  /**
   * Inject the script loader (tests / SSR-safe apps). Receives the gtag.js
   * src URL; must resolve once the script has executed. Defaults to a DOM
   * `<script>` injector (browser only).
   */
  scriptLoader?: (src: string) => Promise<void>
  /** Override the gtag.js base URL (testing). */
  gtagSrcBase?: string
}

/** `http` mode — GA4 Measurement Protocol. No browser library. */
export interface GA4HttpOptions extends GA4CommonOptions {
  mode?: 'http'
  /** GA4 Measurement Protocol API secret (server-side credential). */
  apiSecret: string
  /** Override the `/mp/collect` base URL (testing / EU endpoint). */
  endpoint?: string
  /** Use the Measurement Protocol `/debug/mp/collect` validation endpoint. */
  debug?: boolean
  /** Injected fetch (defaults to global fetch). Never loads a vendor lib. */
  fetchImpl?: typeof fetch
}

/** Discriminated union of the two modes. */
export type GA4SinkOptions = GA4ClientSdkOptions | GA4HttpOptions
