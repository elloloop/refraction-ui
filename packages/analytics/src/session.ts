import type {
  AnalyticsProperties,
  AnalyticsStorage,
  SessionConfig,
} from './types.js'
import { resolveStorage } from './storage.js'
import { uuidv4 } from './uuid.js'

/** GA4 parity: 30 minutes of inactivity ends a session. */
export const DEFAULT_SESSION_TIMEOUT_MS = 30 * 60 * 1000

const DEFAULT_KEY = 'rfx:analytics:session'

interface PersistedSession {
  id: string
  /** Last activity epoch ms. */
  lastActivity: number
  /** Campaign fingerprint at session start (for campaign-reset). */
  campaign?: string
  /** Session-scoped properties (set via session.set). */
  props?: AnalyticsProperties
}

/** Recognised campaign params (UTM + common click ids). GA4 parity. */
const CAMPAIGN_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
]

/**
 * Derive a stable campaign fingerprint from a URL's query string. A change in
 * this fingerprint (a *new* campaign, not its absence) forces a new session,
 * matching GA4's "campaign change resets the session" behaviour.
 */
export function campaignFingerprint(search?: string): string | undefined {
  if (!search) return undefined
  let qs = search
  const q = qs.indexOf('?')
  if (q !== -1) qs = qs.slice(q + 1)
  let params: URLSearchParams
  try {
    params = new URLSearchParams(qs)
  } catch {
    return undefined
  }
  const pairs: string[] = []
  for (const p of CAMPAIGN_PARAMS) {
    const v = params.get(p)
    if (v) pairs.push(`${p}=${v}`)
  }
  return pairs.length ? pairs.join('&') : undefined
}

/**
 * Session engine.
 *
 * A session is a span of continuous activity. It ends after `timeoutMs` of
 * inactivity (GA4 parity, default 30 min) or when a *new* campaign is
 * detected. State is persisted cross-tab so multiple tabs share one session.
 */
export function createSession(
  config?: SessionConfig,
  now: () => number = () => Date.now(),
) {
  const storage: AnalyticsStorage = resolveStorage(config?.storage)
  const key = config?.storageKey ?? DEFAULT_KEY
  const timeoutMs = config?.timeoutMs ?? DEFAULT_SESSION_TIMEOUT_MS
  const resetOnCampaign = config?.resetOnCampaign ?? true

  function read(): PersistedSession | null {
    const raw = storage.get(key)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as PersistedSession
      if (parsed && typeof parsed.id === 'string') return parsed
    } catch {
      /* corrupt — treat as none */
    }
    return null
  }

  function write(s: PersistedSession): void {
    storage.set(key, JSON.stringify(s))
  }

  function mint(campaign?: string): PersistedSession {
    const s: PersistedSession = {
      id: uuidv4(),
      lastActivity: now(),
      campaign,
    }
    write(s)
    return s
  }

  /**
   * Return the live session, creating/rotating it as required by the
   * inactivity timeout and (optionally) a campaign change.
   */
  function ensure(campaign?: string): PersistedSession {
    const existing = read()
    const t = now()

    if (!existing) return mint(campaign)

    // Inactivity timeout.
    if (t - existing.lastActivity > timeoutMs) {
      return mint(campaign)
    }

    // Campaign reset — only when a *new* campaign appears.
    if (
      resetOnCampaign &&
      campaign !== undefined &&
      existing.campaign !== campaign
    ) {
      return mint(campaign)
    }

    return existing
  }

  return {
    /** Get the current session id, rotating if expired. */
    id(campaign?: string): string {
      return ensure(campaign).id
    },
    /** Force a brand-new session. */
    start(campaign?: string): string {
      return mint(campaign).id
    },
    /** End the current session (next id() mints a fresh one). */
    end(): void {
      storage.remove(key)
    },
    /** Touch activity so the inactivity window slides forward. */
    touch(campaign?: string): string {
      const s = ensure(campaign)
      s.lastActivity = now()
      write(s)
      return s.id
    },
    /** Attach/merge session-scoped properties. */
    set(props: AnalyticsProperties): void {
      const s = ensure()
      s.props = { ...(s.props ?? {}), ...props }
      write(s)
    },
    /** Read session-scoped properties (undefined when none). */
    props(): AnalyticsProperties | undefined {
      return read()?.props
    },
  }
}

export type Session = ReturnType<typeof createSession>
