# @refraction-ui/analytics

A headless, neutral **Segment-spec collector/router** for product analytics.
The app instruments **once** — it never names a vendor. The library collects
the canonical event envelope and **fans it out** to N pluggable sinks
(GA4, Azure App Insights, PostHog, your own backend, …). **There is no
privileged engine** — every vendor is just a sink.

Sibling of `@refraction-ui/ai`: same factory/manager pattern (`createAnalytics`
mirrors `createAI`). No runtime dependencies beyond `@refraction-ui/shared`.

---

## Consumer API

```ts
import { createAnalytics } from '@refraction-ui/analytics'

const analytics = createAnalytics({
  app: 'my-app',
  env: process.env.NODE_ENV,          // drives dev/prod presets
  endpoint: 'https://collect.example.com', // optional: auto-adds the http sink
  writeKey: 'WRITE_KEY',
  enabled: true,                      // false → tree-shakeable noop
  sampleRate: 1,                      // 0..1, applied per call
  redactKeys: ['internalScore'],      // extra PII keys to strip
  consent: { granted: ['analytics'] },
})

// Segment Spec — the entire instrumentation surface
analytics.track('Signup Clicked', { plan: 'pro' })
analytics.identify('user_42', { plan: 'pro' })   // userId is opaque to the lib
analytics.page('Pricing', { path: '/pricing' })
analytics.screen('Dashboard')
analytics.group('org_7', { name: 'Acme' })
analytics.alias('user_42', 'anon-or-prev-id')

// Sessions (analytics session — NOT replay)
analytics.session.id()        // current UUIDv4 session id
analytics.session.start()     // force a new session
analytics.session.end()
analytics.session.set({ plan: 'pro' })

// Consent gate (per-sink categories)
analytics.consent.grant('marketing')
analytics.consent.revoke('marketing')
analytics.consent.isGranted('analytics')

// Child context — merged into every event, parent untouched
const checkout = analytics.with({ feature: 'checkout' })
checkout.track('Card Added')

// Lifecycle
await analytics.flush()       // drain the batch + flush all sinks
analytics.reset()             // privacy-safe logout: new anonymousId + end session
```

### Config

| Key               | Default                         | Purpose |
|-------------------|---------------------------------|---------|
| `app`             | —                               | Stamped into `context.app` |
| `env`             | —                               | `production` → prod preset, else dev |
| `endpoint`        | —                               | When set, auto-registers the built-in `http` sink |
| `writeKey`        | `''`                            | Auth for the auto `http` sink |
| `enabled`         | `true`                          | `false` → tree-shakeable noop |
| `sampleRate`      | `1`                             | Per-call sampling (0..1) |
| `redactKeys`      | `[]`                            | Extra keys to redact (on top of the PII deny-list) |
| `sinks`           | `[]`                            | Explicit sinks (override same-named built-ins) |
| `session`         | 30-min timeout, localStorage    | `{ timeoutMs, resetOnCampaign, storage, storageKey }` |
| `identity`        | localStorage                    | `{ storage, storageKey }` |
| `consent`         | nothing granted                 | `{ granted, strict }` |
| `preset`          | from `env`                      | `'dev'` \| `'prod'` |
| `batchSize`       | `20`                            | Auto-flush threshold (prod) |
| `flushIntervalMs` | `10000`                         | Auto-flush interval (prod) |

### Presets

- **dev** (`env !== 'production'`): synchronous, unbatched delivery + a
  built-in `console` sink so engineers see exactly what would ship.
- **prod**: batching + sampling, plus a `sendBeacon` flush bound to
  `pagehide` / `visibilitychange` so in-flight events are not lost on unload.
- **`enabled: false`**: returns a noop whose every method is empty — the live
  collector and all sink code tree-shake out of the bundle.

### Sessions / Identity / Consent

- **`sessionId`** — client UUIDv4, minted at session start. A session ends
  after **30 min of inactivity** (GA4 parity, configurable) **or** when a new
  campaign (UTM / `gclid` / `fbclid` / `msclkid`) is detected. Persisted
  cross-tab via localStorage → cookie → memory.
- **`anonymousId`** — persistent, non-PII, **resettable** UUIDv4. `reset()`
  mints a fresh one so a new visitor is never stitched to the old one.
- **`userId`** — opaque, app-supplied; never persisted by the library (the app
  owns the user record).
- **`alias`** — emits a `previousId → userId` stitch event.
- **PII** — a built-in deny-list (email / phone / name / password / card / …)
  plus `redactKeys`. Matching is case- and separator-insensitive and recurses
  into nested objects/arrays. Values become `"[REDACTED]"`.
- **Consent** — each sink declares the categories it requires; the router will
  not deliver to a sink unless **all** its categories are granted.

---

## Backend wire contract (the `http` sink)

The built-in `http` sink implements the **Segment HTTP Tracking API** batch
format — *adopt, do not invent* — so **RudderStack / Jitsu / Segment** are
drop-in conforming backends, and any custom backend can be built to conform.

### Request

```
POST {endpoint}/v{schemaVersion}/batch          (schemaVersion = 1 → /v1/batch)
Content-Type: application/json                   (gzip optional)
Authorization: Basic base64("{writeKey}:")       ← note the trailing colon
```

```jsonc
{
  "batch": [ /* AnalyticsEvent[] — canonical envelope (below) */ ],
  "sentAt": "2026-05-16T12:00:00.000Z",          // honest client send time
  "batchId": "<uuid v4>"
}
```

### Canonical event envelope (`AnalyticsEvent`)

```jsonc
{
  "type": "track",                  // track|identify|page|screen|group|alias
  "event": "Signup Clicked",        // track/page/screen name (optional)
  "messageId": "<uuid v4>",         // idempotency key — backends MUST dedupe
  "anonymousId": "<uuid v4>",       // persistent, non-PII
  "userId": "user_42",              // opaque, optional
  "groupId": "org_7",               // group calls
  "previousId": "anon-id",          // alias calls
  "sessionId": "<uuid v4>",         // analytics session
  "properties": { },                // track/page/screen/group payload
  "traits": { },                    // identify/group traits
  "context": {
    "app": "my-app",
    "env": "production",
    "page": { "path": "/", "url": "...", "referrer": "...", "title": "..." },
    "library": { "name": "@refraction-ui/analytics", "version": "0.1.0" }
  },
  "timestamp": "2026-05-16T12:00:00.000Z",  // ISO-8601 client time
  "schemaVersion": 1
}
```

### Response semantics (accept-and-queue)

| Status      | Meaning              | Client behaviour |
|-------------|----------------------|------------------|
| `2xx`       | Accepted **and queued** (not yet processed) | done |
| `400`       | Malformed            | **drop, never retry** |
| `401`       | Bad write key        | **drop, never retry** |
| `413`       | Payload too large    | **drop** (client also pre-splits) |
| `429`/`5xx` | Transient / overload | **exponential backoff retry** |
| network err | —                    | treated as transient → retry |

- **Idempotency** — backends **MUST** dedupe on `messageId`.
- **Clock skew** — the backend corrects time as
  `corrected = timestamp + (receivedAt − sentAt)`; the client always stamps an
  honest `sentAt`.
- **Size limits** — soft caps of **≈ 500 KB / batch** and **≈ 32 KB / event**
  (Segment parity). The client pre-splits oversized batches and drops events
  that exceed the per-event cap (they can never be delivered).
- **Versioning** — the path carries `/v{schemaVersion}/`; every event also
  carries `schemaVersion`.

### sendBeacon caveat (unload path)

On `pagehide` / `visibilitychange` the client uses `navigator.sendBeacon`,
which **cannot set an `Authorization` header**. On that path the sink falls
back to:

```
POST {endpoint}/v1/batch?writeKey={writeKey}
Content-Type: text/plain
```

A conforming backend **MUST** also accept the write key via the `writeKey`
query parameter with a `text/plain` body.

---

## Sinks

A sink implements the `AnalyticsSink` SPI:

```ts
interface AnalyticsSink {
  name: string
  consentCategories?: string[]                 // required categories
  init?(ctx): void | Promise<void>
  deliver(batch, ctx): void | Promise<void>    // canonical envelopes
  flush?(): void | Promise<void>
  shutdown?(): void | Promise<void>
}
```

Built-ins: `createHttpSink` (wire contract above), `createConsoleSink` (dev),
`createMockSink` (testing). Vendor adapters (GA4, Azure, PostHog) ship as
separate packages and are *just sinks* — register them via `config.sinks` or
`analytics.addSink(...)`.

## License

MIT
