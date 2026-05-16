# @refraction-ui/analytics-sink-ga4

A **GA4 sink** for [`@refraction-ui/analytics`](../analytics). In the epic's
model GA4 is **just a sink** — there is no privileged engine. The app
instruments **once** via the neutral router; this adapter maps the canonical
Segment envelope to GA4 in one of two interchangeable modes.

No hard vendor dependency: gtag.js is **dynamically loaded** only when the
`client-sdk` mode actually delivers, and the `http` mode never loads any
browser library at all.

---

## Modes

| Mode | Transport | Vendor lib |
|------|-----------|------------|
| `http` *(default)* | GA4 **Measurement Protocol** (`/mp/collect`) | none — server-relay friendly |
| `client-sdk` | gtag.js in the browser | lazily injected on first delivery only |

```ts
import { createAnalytics } from '@refraction-ui/analytics'
import { createGA4Sink } from '@refraction-ui/analytics-sink-ga4'

// http (Measurement Protocol) — no browser library, ad-blocker-proof
const analytics = createAnalytics({
  app: 'my-app',
  env: process.env.NODE_ENV,
  consent: { granted: ['analytics'] },
  sinks: [
    createGA4Sink({
      mode: 'http',
      measurementId: 'G-XXXXXXXXXX',
      apiSecret: process.env.GA4_API_SECRET!,
    }),
  ],
})

// client-sdk — lazy gtag.js + GA4 Consent Mode bridge
createGA4Sink({
  mode: 'client-sdk',
  measurementId: 'G-XXXXXXXXXX',
  consentMode: {
    default: { analytics_storage: 'denied' },
    map: { analytics: ['analytics_storage'] },
  },
})
```

## Canonical envelope → GA4 mapping

| Canonical | GA4 |
|-----------|-----|
| `anonymousId` | `client_id` |
| `userId` | `user_id` (GA4 User-ID) |
| `properties` | event params |
| `identify` / `group` traits | `user_properties` |
| `sessionId` | `session_id` param (GA4 sessionisation alignment) |
| `page` / `screen` | `page_view` / `screen_view` (Enhanced-Measurement parity) |
| event names | lower_snake_cased, reserved prefixes escaped |

`identify` carries no GA4 event — it only sets `user_id` / `user_properties`.

## Consent

The sink declares `consentCategories` (default `['analytics']`); the router
will not deliver until they are granted. In `client-sdk` mode an optional
**GA4 Consent Mode bridge** pushes `gtag('consent', 'default', …)` on init and
`gtag('consent', 'update', …)` once the router permits delivery.

## License

MIT
