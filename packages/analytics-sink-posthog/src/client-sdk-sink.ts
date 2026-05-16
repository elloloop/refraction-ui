import type {
  AnalyticsEvent,
  AnalyticsSink,
  SinkInitContext,
} from '@refraction-ui/analytics'
import { distinctId } from './mapping.js'

/**
 * PostHog `client-sdk` sink — OPTIONAL, opt-in mode.
 *
 * For client-exclusive PostHog features (autocapture, feature flags,
 * surveys, web experiments) that the protocol API alone cannot drive.
 * `posthog-js` is loaded **lazily via dynamic `import()`** the first time the
 * sink delivers, so a consumer who only uses the default `http` sink never
 * pays the browser-library cost and `posthog-js` stays a fully optional peer.
 *
 * Session replay is deliberately NOT touched here — it lives in the separate
 * `@refraction-ui/analytics-sink-posthog/replay` module so it is never on the
 * event path and tree-shakes out unless explicitly enabled.
 */

/** Minimal structural type for the bits of `posthog-js` we use. */
interface PostHogJs {
  init(apiKey: string, options: Record<string, unknown>): void
  capture(event: string, properties?: Record<string, unknown>): void
  identify(distinctId: string, set?: Record<string, unknown>): void
  alias(alias: string, original?: string): void
  group(
    groupType: string,
    groupKey: string,
    properties?: Record<string, unknown>,
  ): void
  reset(): void
}

export interface PostHogClientSdkSinkOptions {
  /** PostHog project API key. */
  apiKey: string
  /** PostHog API host. Default `https://us.i.posthog.com`. */
  host?: string
  /** Sink name. Default `posthog`. */
  name?: string
  /** Consent categories this sink requires. Default `['analytics']`. */
  consentCategories?: string[]
  /**
   * Extra `posthog-js` init options. `autocapture`, `capture_pageview`, and
   * `session_recording` default to OFF — the canonical router owns the event
   * path; replay is opt-in via the separate module.
   */
  posthogOptions?: Record<string, unknown>
  /**
   * Injected loader (testing / custom bundling). Defaults to a lazy
   * `import('posthog-js')`.
   */
  loadPostHog?: () => Promise<{ default: PostHogJs } | PostHogJs>
}

async function defaultLoad(): Promise<PostHogJs> {
  // Dynamic import keeps `posthog-js` out of the graph until first delivery.
  const mod = (await import('posthog-js')) as unknown as
    | { default: PostHogJs }
    | PostHogJs
  return 'default' in mod ? mod.default : mod
}

/**
 * Create the OPTIONAL PostHog `client-sdk`-mode sink. `posthog-js` is
 * dynamically imported on first use, never at module load.
 */
export function createPostHogClientSdkSink(
  options: PostHogClientSdkSinkOptions,
): AnalyticsSink {
  const {
    apiKey,
    host = 'https://us.i.posthog.com',
    name = 'posthog',
    consentCategories = ['analytics'],
    posthogOptions = {},
  } = options

  let ph: PostHogJs | undefined
  let loading: Promise<PostHogJs> | undefined

  async function ensure(): Promise<PostHogJs> {
    if (ph) return ph
    if (!loading) {
      const load = options.loadPostHog
        ? async () => {
            const m = await options.loadPostHog!()
            return ('default' in m ? m.default : m) as PostHogJs
          }
        : defaultLoad
      loading = load().then((instance) => {
        instance.init(apiKey, {
          api_host: host,
          // The canonical router owns the event path — disable PostHog's
          // own auto-capture and pageview, and never start replay here.
          autocapture: false,
          capture_pageview: false,
          disable_session_recording: true,
          ...posthogOptions,
        })
        ph = instance
        return instance
      })
    }
    return loading
  }

  return {
    name,
    consentCategories,

    async init(_ctx: SinkInitContext): Promise<void> {
      // Eagerly warm the SDK so the first event is not delayed. Still lazy
      // relative to module load — only runs once the sink is registered.
      await ensure()
    },

    async deliver(batch: AnalyticsEvent[]): Promise<void> {
      if (batch.length === 0) return
      const client = await ensure()
      for (const ev of batch) {
        const did = distinctId(ev)
        switch (ev.type) {
          case 'identify':
            client.identify(did, { ...(ev.traits ?? {}) })
            break
          case 'alias':
            if (ev.previousId) client.alias(ev.previousId, did)
            break
          case 'group':
            client.group(
              (ev.properties?.groupType as string) ?? 'company',
              ev.groupId ?? '',
              { ...(ev.traits ?? {}) },
            )
            break
          case 'page':
            client.capture('$pageview', { ...(ev.properties ?? {}) })
            break
          case 'screen':
            client.capture('$screen', {
              $screen_name: ev.event,
              ...(ev.properties ?? {}),
            })
            break
          case 'track':
          default:
            client.capture(ev.event ?? 'track', { ...(ev.properties ?? {}) })
            break
        }
      }
    },

    shutdown(): void {
      ph?.reset()
    },
  }
}
