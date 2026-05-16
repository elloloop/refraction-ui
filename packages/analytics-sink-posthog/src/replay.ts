/**
 * @refraction-ui/analytics-sink-posthog/replay
 *
 * OPTIONAL, lazy session-replay (rrweb, via `posthog-js`).
 *
 * Hard guarantees this module exists to enforce:
 *
 *  1. **Off by default.** Nothing in the main `@refraction-ui/analytics-sink-posthog`
 *     entry imports this file, so it (and `posthog-js`, and rrweb) are fully
 *     tree-shaken out of any bundle that does not explicitly import it.
 *  2. **Never on the event path.** Replay is not an `AnalyticsSink`. It does
 *     not see, transform, or block canonical envelopes. `track`/`identify`/…
 *     keep flowing through the sink even if replay never starts or fails.
 *  3. **Privacy/consent gated.** `startSessionReplay` refuses to start unless
 *     a consent predicate returns true, and re-checks it; `stop()` tears the
 *     recorder down. Masking defaults are maximally private.
 *  4. **Lazy.** `posthog-js` is `import()`-ed only when `startSessionReplay`
 *     is actually called.
 *
 * This is a thin controller around `posthog-js`'s built-in rrweb session
 * recording — we do not bundle rrweb ourselves.
 */

/** Minimal structural view of the `posthog-js` replay surface. */
interface PostHogReplay {
  init(apiKey: string, options: Record<string, unknown>): void
  startSessionRecording(): void
  stopSessionRecording(): void
  sessionRecordingStarted?(): boolean
}

export interface SessionReplayOptions {
  /** PostHog project API key. */
  apiKey: string
  /** PostHog API host. Default `https://us.i.posthog.com`. */
  host?: string
  /**
   * Consent predicate. Replay starts ONLY when this returns `true`, and is
   * re-checked by `enforceConsent()`. There is no default-allow: if omitted,
   * replay is treated as NOT consented and will not start.
   */
  hasConsent?: () => boolean
  /**
   * rrweb masking. Defaults are maximally private: all text + all inputs
   * masked. Override deliberately and document the privacy review.
   */
  maskAllText?: boolean
  maskAllInputs?: boolean
  /** Extra `posthog-js` session_recording options (advanced). */
  recordingOptions?: Record<string, unknown>
  /**
   * Injected loader (testing / custom bundling). Defaults to a lazy
   * `import('posthog-js')`.
   */
  loadPostHog?: () => Promise<{ default: PostHogReplay } | PostHogReplay>
}

/** Handle returned by {@link startSessionReplay}. */
export interface SessionReplayHandle {
  /** True if the rrweb recorder is currently running. */
  readonly recording: boolean
  /**
   * Re-evaluate the consent predicate. If consent was revoked, recording is
   * stopped. Call this from your consent-change handler.
   */
  enforceConsent(): void
  /** Stop recording and release the recorder. Idempotent. */
  stop(): void
}

async function defaultLoad(): Promise<PostHogReplay> {
  const mod = (await import('posthog-js')) as unknown as
    | { default: PostHogReplay }
    | PostHogReplay
  return 'default' in mod ? mod.default : mod
}

/**
 * Start PostHog/rrweb session replay. Resolves to a handle, or to a
 * non-recording handle if consent is not granted (it never throws on the
 * consent path — replay simply does not start).
 *
 * `posthog-js` is dynamically imported here and nowhere else.
 */
export async function startSessionReplay(
  options: SessionReplayOptions,
): Promise<SessionReplayHandle> {
  const {
    apiKey,
    host = 'https://us.i.posthog.com',
    hasConsent,
    maskAllText = true,
    maskAllInputs = true,
    recordingOptions = {},
  } = options

  const consented = (): boolean =>
    typeof hasConsent === 'function' ? hasConsent() === true : false

  // Single-slot holder so the closure can observe the lazily-loaded
  // instance without an outer `let` rebind.
  const slot: { ph?: PostHogReplay } = {}
  let recording = false

  const stop = (): void => {
    if (slot.ph && recording) {
      slot.ph.stopSessionRecording()
    }
    recording = false
  }

  const handle: SessionReplayHandle = {
    get recording() {
      return recording
    },
    enforceConsent(): void {
      if (!consented()) stop()
    },
    stop,
  }

  // Privacy gate: do not even load posthog-js if consent is absent.
  if (!consented()) return handle

  const load = options.loadPostHog
    ? async () => {
        const m = await options.loadPostHog!()
        return ('default' in m ? m.default : m) as PostHogReplay
      }
    : defaultLoad

  slot.ph = await load()
  slot.ph.init(apiKey, {
    api_host: host,
    autocapture: false,
    capture_pageview: false,
    // Start with replay disabled, then opt in explicitly below.
    disable_session_recording: true,
    session_recording: {
      maskAllInputs,
      maskTextSelector: maskAllText ? '*' : undefined,
      ...recordingOptions,
    },
  })

  // Re-check consent after the (async) load in case it was revoked meanwhile.
  if (!consented()) return handle

  slot.ph.startSessionRecording()
  recording = slot.ph.sessionRecordingStarted?.() ?? true
  return handle
}
