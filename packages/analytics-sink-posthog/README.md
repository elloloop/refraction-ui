# @refraction-ui/analytics-sink-posthog

A **PostHog `AnalyticsSink`** for [`@refraction-ui/analytics`](../analytics).
PostHog is **just a sink** — there is no privileged engine. Register it via
`config.sinks` or `analytics.addSink(...)`; the app still instruments once and
never names a vendor.

Runtime deps: `@refraction-ui/analytics`, `@refraction-ui/shared`. `posthog-js`
is an **optional peer** — only ever reached through a dynamic `import()`.

---

## Two modes (per the epic's fan-out model)

| Mode         | Default | What it does | `posthog-js`? |
|--------------|:-------:|--------------|:-------------:|
| `http`       | ✅ yes  | Pure protocol adapter against PostHog's `/capture` + `/batch` API. Server-relay friendly, ad-blocker-proof behind your own endpoint. | never |
| `client-sdk` | opt-in  | Lazily dynamic-imports `posthog-js` for client-exclusive features (feature flags, surveys, web experiments). | lazy `import()` |

```ts
import { createAnalytics } from '@refraction-ui/analytics'
import { createPostHogSink } from '@refraction-ui/analytics-sink-posthog'

const analytics = createAnalytics({
  app: 'my-app',
  env: process.env.NODE_ENV,
  sinks: [
    // Default http mode — no browser library:
    createPostHogSink({ apiKey: 'phc_PROJECT_KEY' }),
    // …or opt into the client SDK:
    // createPostHogSink({ mode: 'client-sdk', apiKey: 'phc_PROJECT_KEY' }),
  ],
})
```

`host` defaults to `https://us.i.posthog.com` (use `https://eu.i.posthog.com`,
a self-hosted host, or — recommended in prod — your own reverse-proxy path).

### Envelope → PostHog mapping

| Canonical (`AnalyticsEvent`)        | PostHog                                            |
|-------------------------------------|----------------------------------------------------|
| `anonymousId` / `userId`            | `distinct_id` (`userId` once identified, else `anonymousId`) |
| `messageId`                         | `uuid` (idempotency — PostHog dedupes)             |
| `track`                             | event name verbatim + `properties`                 |
| `identify`                          | `$identify` + `$set` traits + `$anon_distinct_id` stitch |
| `page`                              | `$pageview`                                        |
| `screen`                            | `$screen` (`$screen_name`)                         |
| `group`                             | `$groupidentify` (`$group_type`/`$group_key`/`$group_set`) |
| `alias`                             | `$create_alias` (`alias` = `previousId`)           |
| `context` (app/env/lib/page/session)| flattened to `$lib`/`app`/`env`/`$current_url`/`$session_id`/… |

PostHog authenticates with the public project key in the JSON body — no
`Authorization` header — so the `sendBeacon` unload path works without header
juggling. Accept-and-queue response semantics mirror the wire contract:
`2xx` done, `400`/`401`/`403`/`413` drop, `429`/`5xx`/network → backoff retry.

---

## Optional session replay (rrweb) — OFF by default

Session replay lives in a **separate entry point** and is **never on the event
path**. It is a thin controller around `posthog-js`'s built-in rrweb recorder
(we do not bundle rrweb ourselves).

```ts
// Imported from its OWN entry — nothing in the main entry references it.
import { startSessionReplay } from '@refraction-ui/analytics-sink-posthog/replay'

const replay = await startSessionReplay({
  apiKey: 'phc_PROJECT_KEY',
  hasConsent: () => consentStore.isGranted('session_replay'),
})

// On a consent change:
replay.enforceConsent()   // stops recording if consent was revoked
replay.stop()             // tear the recorder down
```

Guarantees:

- **Off by default.** The main entry never imports `replay.ts`, so it,
  `posthog-js`, and rrweb **tree-shake out entirely** for consumers who do not
  opt in (asserted in `__tests__/tree-shaking.test.ts`).
- **Never on the event path.** Replay is not an `AnalyticsSink`; it cannot see,
  transform, delay, or block `track`/`identify`/… envelopes. Events keep
  flowing even if replay never starts or fails to load.
- **Privacy/consent gated.** `startSessionReplay` will not load `posthog-js`
  or start recording unless `hasConsent()` returns `true`, re-checks consent
  after the async load, and `enforceConsent()` stops on revocation. Masking
  defaults are maximally private (all text + all inputs masked).
- **Lazy.** `posthog-js` is `import()`-ed only when replay actually starts.

---

## API

- `createPostHogSink(options)` — mode-dispatching factory (`http` default).
- `createPostHogHttpSink(options)` — the default protocol sink directly.
- `createPostHogClientSdkSink(options)` — the optional lazy-SDK sink directly.
- `toPostHogEvent` / `toPostHogBatch` / `distinctId` — the pure mapping.
- `@refraction-ui/analytics-sink-posthog/replay` → `startSessionReplay`.

## License

MIT
