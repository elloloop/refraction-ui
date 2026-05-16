import type { AnalyticsEvent } from '@refraction-ui/analytics'

/**
 * App Insights custom-event payload after mapping the canonical envelope.
 *
 * App Insights splits a custom event's bag into two dictionaries:
 *  - `properties`  — string-valued dimensions (everything non-numeric)
 *  - `measurements`— numeric metrics (queryable/aggregatable in KQL)
 *
 * We additionally surface identity:
 *  - `authenticatedUserId` — present iff the envelope has `userId`
 *  - `anonymous` — `'true'` when no `userId`, else `'false'` (string for the
 *     properties bag; App Insights properties are always strings)
 */
export interface AppInsightsEvent {
  /** App Insights custom-event name. */
  name: string
  /** String-valued custom dimensions. */
  properties: Record<string, string>
  /** Numeric custom metrics. */
  measurements: Record<string, number>
}

/** Track-call name fallback when the envelope omits `event`. */
const FALLBACK_TRACK_NAME = 'track'

/**
 * Derive the App Insights custom-event name for a canonical event.
 *
 * - `page`  → `Page View: <name|path>` (also routed to `trackPageView` in the
 *   client-sdk mode; the name here is the http-mode/event fallback)
 * - `screen`→ `Screen: <name>`
 * - `identify` → `Identify`
 * - `group` → `Group`
 * - `alias` → `Alias`
 * - `track` → the event name (or `track` when absent)
 */
export function eventName(ev: AnalyticsEvent): string {
  switch (ev.type) {
    case 'page':
      return `Page View: ${ev.event ?? ev.context.page?.path ?? '(unknown)'}`
    case 'screen':
      return `Screen: ${ev.event ?? '(unknown)'}`
    case 'identify':
      return 'Identify'
    case 'group':
      return 'Group'
    case 'alias':
      return 'Alias'
    case 'track':
    default:
      return ev.event ?? FALLBACK_TRACK_NAME
  }
}

/** True for finite numbers (App Insights measurements must be finite). */
function isMeasurement(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Stringify a non-numeric value for the App Insights `properties` bag, which
 * is string-only. Objects/arrays are JSON-encoded; everything else uses
 * `String()`. `undefined`/`null` keys are skipped by the caller.
 */
function stringify(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }
  if (typeof value === 'number') return String(value)
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

/**
 * Split an arbitrary bag into App Insights `properties` (strings) and
 * `measurements` (finite numbers), recursively flattening nested objects with
 * dotted keys so KQL queries stay flat (App Insights does not index nested
 * JSON in custom dimensions).
 */
function splitBag(
  bag: Record<string, unknown> | undefined,
  prefix: string,
  properties: Record<string, string>,
  measurements: Record<string, number>,
): void {
  if (!bag) return
  for (const [key, value] of Object.entries(bag)) {
    if (value === undefined || value === null) continue
    const flatKey = prefix ? `${prefix}.${key}` : key
    if (isMeasurement(value)) {
      measurements[flatKey] = value
      continue
    }
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      value.constructor === Object
    ) {
      splitBag(
        value as Record<string, unknown>,
        flatKey,
        properties,
        measurements,
      )
      continue
    }
    properties[flatKey] = stringify(value)
  }
}

/**
 * Map a canonical {@link AnalyticsEvent} to an {@link AppInsightsEvent}.
 *
 * Properties bag composition:
 *  - canonical context: `app`, `env`, library name/version, page fields
 *  - envelope identity/routing: `messageId`, `anonymousId`, `sessionId`,
 *    `type`, `groupId?`, `previousId?`, `timestamp`, `schemaVersion`
 *  - identity surface: `authenticatedUserId` (iff `userId`), `anonymous`
 *  - the event's `properties` and `traits`, numbers → `measurements`
 *
 * The split is stable and lossless: every scalar lands in exactly one of the
 * two dictionaries; nested objects are dot-flattened.
 */
export function mapEvent(ev: AnalyticsEvent): AppInsightsEvent {
  const properties: Record<string, string> = {}
  const measurements: Record<string, number> = {}

  // Identity → App Insights authenticated/anonymous surface.
  if (ev.userId !== undefined) {
    properties.authenticatedUserId = ev.userId
    properties.anonymous = 'false'
  } else {
    properties.anonymous = 'true'
  }

  // Routing / envelope metadata (kept as queryable dimensions).
  properties.messageId = ev.messageId
  properties.anonymousId = ev.anonymousId
  properties.sessionId = ev.sessionId
  properties.eventType = ev.type
  properties.timestamp = ev.timestamp
  measurements.schemaVersion = ev.schemaVersion
  if (ev.groupId !== undefined) properties.groupId = ev.groupId
  if (ev.previousId !== undefined) properties.previousId = ev.previousId
  if (ev.event !== undefined) properties.eventName = ev.event

  // Canonical context.
  properties.app = ev.context.app
  properties.env = ev.context.env
  properties.libraryName = ev.context.library.name
  properties.libraryVersion = ev.context.library.version
  if (ev.context.page) {
    splitBag(
      ev.context.page as Record<string, unknown>,
      'page',
      properties,
      measurements,
    )
  }

  // Event payload + identify/group traits.
  splitBag(ev.properties, '', properties, measurements)
  splitBag(ev.traits, '', properties, measurements)

  return { name: eventName(ev), properties, measurements }
}
