# @refraction-ui/analytics-sink-app-insights

Azure **Application Insights** sink for
[`@refraction-ui/analytics`](../analytics). A sink is *just a sink* — the app
instruments once via the neutral router and this adapter fans the canonical
envelope out to Application Insights. **No privileged engine.**

Dual-mode, mirroring the analytics core's `client-sdk` / `http` split:

- **`client-sdk`** — runs in the browser via
  `@microsoft/applicationinsights-web` (`trackEvent` / `trackPageView`). The
  vendor SDK is an **optional peer dependency** loaded **lazily via dynamic
  import** the first time a batch is delivered — it never enters the bundle
  unless this sink is actually used. There is **no hard/static dependency** on
  the vendor library.
- **`http`** — POSTs Breeze ingestion envelopes to the App Insights
  `/v2/track` endpoint. **No browser library** is loaded; server-relay
  friendly (ad-blocker-proof when paired with a server relay).

## Usage

```ts
import { createAnalytics } from '@refraction-ui/analytics'
import { createAppInsightsSink } from '@refraction-ui/analytics-sink-app-insights'

// Browser, vendor SDK (lazy-loaded):
const clientSink = createAppInsightsSink({
  mode: 'client-sdk',
  connectionString: 'InstrumentationKey=...;IngestionEndpoint=...',
})

// Server relay / no browser lib:
const httpSink = createAppInsightsSink({
  mode: 'http',
  instrumentationKey: '00000000-0000-0000-0000-000000000000',
  // endpoint defaults to https://dc.services.visualstudio.com
})

const analytics = createAnalytics({
  app: 'my-app',
  env: process.env.NODE_ENV,
  sinks: [httpSink],
})
```

## Envelope → Application Insights mapping

The canonical `AnalyticsEvent` maps to an App Insights **custom event** with a
**properties / measurements split**:

- **`measurements`** — every finite `number` (queryable/aggregatable in KQL).
- **`properties`** — everything else, stringified; nested objects are
  dot-flattened (App Insights does not index nested JSON dimensions).
- **Identity** — `userId` → `authenticatedUserId` (+ `anonymous: "false"`);
  no `userId` → `anonymous: "true"`. In `client-sdk` mode this also calls
  `setAuthenticatedUserContext` / `clearAuthenticatedUserContext`; in `http`
  mode it sets the `ai.user.authUserId` tag.
- **Routing/correlation** — `sessionId` → `ai.session.id`, `anonymousId` →
  `ai.user.id`, `messageId` → `ai.operation.id`.
- **`page`** events route to `trackPageView` (client-sdk) / `PageViewData`
  (http); all other types are custom `EventData`.

## Consent

Requires the `analytics` consent category by default (override via
`consentCategories`). The router will not deliver until it is granted.

## License

MIT
