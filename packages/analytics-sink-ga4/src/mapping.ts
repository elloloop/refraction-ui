/**
 * Canonical envelope → GA4 mapping.
 *
 * One mapper, two consumers: the `client-sdk` adapter feeds the result into
 * `gtag('event', name, params)` / `gtag('set', ...)`, and the `http` adapter
 * serialises it into a Measurement Protocol `/mp/collect` payload. Keeping the
 * mapping in one place guarantees the two modes stay behaviourally identical.
 *
 * Identity / param mapping (issue #216, epic #213):
 *   anonymousId  → client_id           (GA4 device/browser id)
 *   userId       → user_id             (GA4 User-ID, cross-device)
 *   properties   → event params        (track/page/screen/group payload)
 *   identify     → user_properties     (traits become GA4 user properties)
 *   sessionId    → session_id param    (so GA4 sessionisation can align)
 *
 * GA4 event-name normalisation: GA4 recommends snake_case event names and
 * forbids spaces. `page` → `page_view`, `screen` → `screen_view` (GA4
 * Enhanced-Measurement parity); everything else is lower_snake_cased.
 */

import type { AnalyticsEvent, AnalyticsProperties } from '@refraction-ui/analytics'

/** A GA4 event ready for gtag.js or the Measurement Protocol. */
export interface GA4Event {
  /** GA4 event name (snake_case, no spaces). */
  name: string
  /** Event params (GA4 caps these; we pass them through verbatim). */
  params: Record<string, unknown>
}

/** The fully-mapped result for a single canonical envelope. */
export interface GA4Mapped {
  /** GA4 client_id (from anonymousId). Always present. */
  clientId: string
  /** GA4 user_id (from userId). Present only after identify. */
  userId?: string
  /**
   * GA4 user_properties (from identify/group traits). Each value is wrapped
   * in `{ value }` as the Measurement Protocol requires; the gtag adapter
   * unwraps when it calls `gtag('set', 'user_properties', ...)`.
   */
  userProperties?: Record<string, { value: unknown }>
  /**
   * The GA4 event to send. `identify` calls carry no event (they only set
   * user_id / user_properties), so this is optional.
   */
  event?: GA4Event
}

const GA4_RESERVED_PREFIXES = ['google_', 'ga_', 'firebase_']

/** Lower_snake_case an arbitrary event/trait name for GA4. */
export function toGa4Name(name: string): string {
  const snake = name
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
  // GA4 names must start with a letter and avoid reserved prefixes.
  const safe = /^[a-z]/.test(snake) ? snake : `e_${snake}`
  return GA4_RESERVED_PREFIXES.some((p) => safe.startsWith(p))
    ? `x_${safe}`
    : safe
}

/** Map a Segment call type + name to its GA4 event name. */
export function ga4EventName(ev: AnalyticsEvent): string | undefined {
  switch (ev.type) {
    case 'identify':
      // identify only sets identity/user_properties — no event is emitted.
      return undefined
    case 'page':
      return 'page_view'
    case 'screen':
      return 'screen_view'
    case 'group':
      return 'group'
    case 'alias':
      return 'alias'
    case 'track':
      return ev.event ? toGa4Name(ev.event) : 'track'
    default:
      return undefined
  }
}

/** Wrap traits as GA4 user_properties (`{ name: { value } }`). */
function toUserProperties(
  traits: AnalyticsProperties | undefined,
): Record<string, { value: unknown }> | undefined {
  if (!traits) return undefined
  const out: Record<string, { value: unknown }> = {}
  let any = false
  for (const [k, v] of Object.entries(traits)) {
    if (v === undefined) continue
    out[toGa4Name(k)] = { value: v }
    any = true
  }
  return any ? out : undefined
}

/** Build the GA4 event params from a canonical envelope. */
function toParams(ev: AnalyticsEvent): Record<string, unknown> {
  const params: Record<string, unknown> = {}

  // Pass through the canonical payload as GA4 params.
  for (const [k, v] of Object.entries(ev.properties ?? {})) {
    if (v === undefined) continue
    params[toGa4Name(k)] = v
  }

  // Align GA4 sessionisation with our analytics session.
  params.session_id = ev.sessionId
  // Stable client-supplied de-dupe / debugging aid.
  params.engagement_time_msec = params.engagement_time_msec ?? 1

  // page/screen context → GA4 page_* params (Enhanced-Measurement parity).
  const page = ev.context.page
  if (ev.type === 'page' || ev.type === 'screen') {
    if (ev.event) {
      if (ev.type === 'screen') params.screen_name = ev.event
      else params.page_title = params.page_title ?? ev.event
    }
    if (page?.url && params.page_location === undefined) {
      params.page_location = page.url
    }
    if (page?.path && params.page_path === undefined) {
      params.page_path = page.path
    }
    if (page?.referrer && params.page_referrer === undefined) {
      params.page_referrer = page.referrer
    }
    if (page?.title && params.page_title === undefined) {
      params.page_title = page.title
    }
  }

  if (ev.type === 'group' && ev.groupId) {
    params.group_id = ev.groupId
  }
  if (ev.type === 'alias') {
    if (ev.userId) params.user_id = ev.userId
    if (ev.previousId) params.previous_id = ev.previousId
  }

  return params
}

/**
 * Map one canonical envelope to its GA4 representation. Pure — no transport,
 * no vendor lib; both the gtag and Measurement-Protocol adapters consume this.
 */
export function mapEvent(ev: AnalyticsEvent): GA4Mapped {
  const name = ga4EventName(ev)
  const mapped: GA4Mapped = {
    clientId: ev.anonymousId,
  }
  if (ev.userId) mapped.userId = ev.userId

  if (ev.type === 'identify' || ev.type === 'group') {
    const up = toUserProperties(ev.traits)
    if (up) mapped.userProperties = up
  }

  if (name) {
    mapped.event = { name, params: toParams(ev) }
  }
  return mapped
}
