import type { AnalyticsEvent } from '@refraction-ui/analytics'

/**
 * Canonical envelope → PostHog event mapping.
 *
 * This module is pure (no I/O, no transport) so the http sink and the
 * client-sdk sink share exactly one mapping definition and it can be unit
 * tested in isolation against a mock transport.
 *
 * PostHog identity model:
 *   - `distinct_id` is the single id PostHog buckets a person under.
 *   - Before `identify`, the anonymous visitor is keyed by `anonymousId`.
 *   - `identify` upgrades the person to the opaque app `userId`, sending
 *     `$set` traits and an `$anon_distinct_id` so PostHog stitches the
 *     pre-identify anonymous history onto the identified person.
 *   - `alias` emits PostHog's `$create_alias` linking `previousId` (alias)
 *     to the canonical `userId`/`anonymousId` (distinct_id).
 *   - `group` emits a `$groupidentify` event with `$group_set` traits.
 *
 * See https://posthog.com/docs/api/capture for the event shape.
 */

/** A single PostHog capture event (the `/capture` and `/batch` item shape). */
export interface PostHogEvent {
  /** PostHog event name (Segment names map to `$pageview`/`$screen`/etc.). */
  event: string
  /** The person bucket id. */
  distinct_id: string
  /** Event + person/group properties. */
  properties: Record<string, unknown>
  /** ISO-8601 client timestamp (PostHog corrects for skew server-side). */
  timestamp: string
  /** Idempotency key — PostHog dedupes on this. Mirrors `messageId`. */
  uuid: string
}

/** Resolve the PostHog `distinct_id` for an envelope. */
export function distinctId(ev: AnalyticsEvent): string {
  return ev.userId ?? ev.anonymousId
}

/**
 * Properties that PostHog reads off `context` for every event so its UI
 * shows app/library/page/session metadata without the consumer wiring it.
 */
function contextProperties(ev: AnalyticsEvent): Record<string, unknown> {
  const ctx = ev.context
  const props: Record<string, unknown> = {
    $lib: ctx.library?.name,
    $lib_version: ctx.library?.version,
    app: ctx.app,
    env: ctx.env,
    $session_id: ev.sessionId,
    // Keep the canonical anonymous id addressable in PostHog too.
    anonymousId: ev.anonymousId,
  }
  const page = ctx.page
  if (page) {
    if (page.url !== undefined) props.$current_url = page.url
    if (page.path !== undefined) props.$pathname = page.path
    if (page.referrer !== undefined) props.$referrer = page.referrer
    if (page.title !== undefined) props.title = page.title
    if (page.search !== undefined) props.$search = page.search
  }
  return props
}

/**
 * Map one canonical envelope to one PostHog event.
 *
 * `track`    → the event name verbatim, `properties` passed through.
 * `page`     → `$pageview` (PostHog's built-in pageview).
 * `screen`   → `$screen` with `$screen_name`.
 * `identify` → `$identify` with `$set` traits + `$anon_distinct_id` stitch.
 * `group`    → `$groupidentify` with `$group_set` traits.
 * `alias`    → `$create_alias` linking `previousId` → distinct id.
 */
export function toPostHogEvent(ev: AnalyticsEvent): PostHogEvent {
  const base = {
    distinct_id: distinctId(ev),
    timestamp: ev.timestamp,
    uuid: ev.messageId,
  }
  const props = contextProperties(ev)

  switch (ev.type) {
    case 'identify': {
      return {
        ...base,
        event: '$identify',
        properties: {
          ...props,
          $set: { ...(ev.traits ?? {}) },
          // Stitch the pre-identify anonymous history onto this person.
          $anon_distinct_id: ev.anonymousId,
        },
      }
    }
    case 'group': {
      const groupType = (ev.properties?.groupType as string) ?? 'company'
      return {
        ...base,
        event: '$groupidentify',
        properties: {
          ...props,
          $group_type: groupType,
          $group_key: ev.groupId,
          $group_set: { ...(ev.traits ?? {}) },
        },
      }
    }
    case 'alias': {
      return {
        ...base,
        event: '$create_alias',
        properties: {
          ...props,
          // PostHog links `alias` to the current `distinct_id`.
          alias: ev.previousId,
        },
      }
    }
    case 'page': {
      return {
        ...base,
        event: '$pageview',
        properties: { ...props, ...(ev.properties ?? {}) },
      }
    }
    case 'screen': {
      return {
        ...base,
        event: '$screen',
        properties: {
          ...props,
          $screen_name: ev.event,
          ...(ev.properties ?? {}),
        },
      }
    }
    case 'track':
    default: {
      return {
        ...base,
        event: ev.event ?? 'track',
        properties: { ...props, ...(ev.properties ?? {}) },
      }
    }
  }
}

/** Map a batch of canonical envelopes to PostHog events. */
export function toPostHogBatch(batch: AnalyticsEvent[]): PostHogEvent[] {
  return batch.map(toPostHogEvent)
}
