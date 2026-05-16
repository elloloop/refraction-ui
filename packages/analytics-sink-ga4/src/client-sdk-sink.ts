/**
 * GA4 `client-sdk` adapter — lazy gtag.js.
 *
 * The vendor library is NEVER a hard dependency and is NEVER bundled. On the
 * first delivery the adapter:
 *   1. installs the gtag stub + dataLayer,
 *   2. pushes the Consent Mode default (if a bridge is configured),
 *   3. lazily injects `https://www.googletagmanager.com/gtag/js?id=<id>`
 *      via a `<script>` tag (or an injected loader for tests/SSR),
 *   4. runs `gtag('js', Date)` + `gtag('config', <id>, { send_page_view:false })`.
 *
 * Subsequent deliveries map each canonical envelope through the shared mapper
 * and call `gtag('set', 'user_properties', …)` / `gtag('set', { user_id })` /
 * `gtag('event', name, params)`.
 *
 * Consent Mode bridge: `init` pushes `consent: default`; `deliver` is only
 * reached when the router's consent gate already allows this sink, at which
 * point `consent: update` is pushed for the mapped GA4 consent types.
 */

import type {
  AnalyticsEvent,
  AnalyticsSink,
  SinkInitContext,
} from '@refraction-ui/analytics'
import type { GA4ClientSdkOptions, GtagFn } from './types.js'
import { mapEvent } from './mapping.js'

const DEFAULT_SRC_BASE = 'https://www.googletagmanager.com/gtag/js'

interface GtagGlobal {
  dataLayer?: unknown[]
  gtag?: GtagFn
  document?: {
    createElement(tag: string): {
      async: boolean
      src: string
      onload: (() => void) | null
      onerror: (() => void) | null
    }
    head?: { appendChild(node: unknown): void }
    getElementsByTagName(tag: string): ArrayLike<{
      parentNode?: { insertBefore(a: unknown, b: unknown): void }
    }>
  }
}

/** DOM `<script>` injector (browser only). */
function defaultScriptLoader(src: string): Promise<void> {
  const g = globalThis as unknown as GtagGlobal
  const doc = g.document
  if (!doc || typeof doc.createElement !== 'function') {
    return Promise.reject(
      new Error('GA4 client-sdk sink: no DOM to inject gtag.js'),
    )
  }
  return new Promise<void>((resolve, reject) => {
    const el = doc.createElement('script')
    el.async = true
    el.src = src
    el.onload = () => resolve()
    el.onerror = () => reject(new Error('GA4 client-sdk: gtag.js failed'))
    if (doc.head?.appendChild) {
      doc.head.appendChild(el)
    } else {
      const first = doc.getElementsByTagName('script')[0]
      first?.parentNode?.insertBefore(el, first)
    }
  })
}

/**
 * Create the GA4 gtag.js (`client-sdk`) sink. The vendor script is dynamically
 * loaded on first delivery only — there is no static import of any GA4/gtag
 * library, so `http`-mode consumers never pull this code path.
 */
export function createGA4ClientSdkSink(
  options: GA4ClientSdkOptions,
): AnalyticsSink {
  const {
    measurementId,
    consentCategories = ['analytics'],
    name = 'ga4',
    consentMode,
  } = options

  const g = globalThis as unknown as GtagGlobal

  let gtag: GtagFn | undefined = options.gtag
  let loaded = false
  let loadPromise: Promise<void> | undefined

  function ensureGtagStub(): GtagFn {
    if (gtag) return gtag
    // Standard gtag bootstrap: dataLayer-backed shim available synchronously.
    g.dataLayer = g.dataLayer ?? []
    const dl = g.dataLayer
    const fn: GtagFn = (...args: unknown[]) => {
      dl.push(args)
    }
    g.gtag = g.gtag ?? fn
    gtag = g.gtag
    return gtag
  }

  function pushConsentDefault(): void {
    if (!consentMode?.default || !gtag) return
    gtag('consent', 'default', { ...consentMode.default })
  }

  function pushConsentUpdate(): void {
    if (!consentMode?.map || !gtag) return
    const update: Record<string, 'granted'> = {}
    // deliver() only runs when the router's consent gate already permits this
    // sink (all consentCategories granted) → reflect that to GA4.
    for (const cat of consentCategories) {
      for (const ga4Type of consentMode.map[cat] ?? []) {
        update[ga4Type] = 'granted'
      }
    }
    if (Object.keys(update).length > 0) {
      gtag('consent', 'update', update)
    }
  }

  function ensureLoaded(): Promise<void> {
    if (loaded) return Promise.resolve()
    if (loadPromise) return loadPromise

    ensureGtagStub()
    pushConsentDefault()

    // App/test supplied its own gtag → never inject a vendor script.
    if (options.gtag) {
      gtag!('js', new Date())
      gtag!('config', measurementId, { send_page_view: false })
      loaded = true
      return Promise.resolve()
    }

    const base = options.gtagSrcBase ?? DEFAULT_SRC_BASE
    const src = `${base}?id=${encodeURIComponent(measurementId)}`
    const load = options.scriptLoader ?? defaultScriptLoader

    loadPromise = load(src).then(() => {
      gtag!('js', new Date())
      gtag!('config', measurementId, { send_page_view: false })
      loaded = true
    })
    return loadPromise
  }

  return {
    name,
    consentCategories,

    init(_ctx: SinkInitContext): void {
      // Install the stub + Consent Mode default eagerly so a `consent:
      // default` is in dataLayer before the tag loads. The vendor script
      // itself is still deferred to the first delivery.
      ensureGtagStub()
      pushConsentDefault()
      void _ctx
    },

    async deliver(batch: AnalyticsEvent[]): Promise<void> {
      if (batch.length === 0) return
      await ensureLoaded()
      const send = gtag!
      pushConsentUpdate()

      for (const ev of batch) {
        const m = mapEvent(ev)

        if (m.userId) {
          send('set', { user_id: m.userId })
        }
        if (m.userProperties) {
          const flat: Record<string, unknown> = {}
          for (const [k, v] of Object.entries(m.userProperties)) {
            flat[k] = v.value
          }
          send('set', 'user_properties', flat)
        }
        if (m.event) {
          send('event', m.event.name, m.event.params)
        }
      }
    },
  }
}
