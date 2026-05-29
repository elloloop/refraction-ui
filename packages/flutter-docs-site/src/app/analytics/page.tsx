import { CodeBlock } from '@/components/code-block'

export const metadata = {
  title: 'Analytics — Refraction UI',
  description:
    'Headless Segment-spec analytics router: consumer API, sessions/identity/consent, GA4 collection-parity, the backend wire contract, and the recommended server-relay topology.',
}

const consumerApi = `import { createAnalytics } from '@refraction-ui/analytics'

const analytics = createAnalytics({
  app: 'my-app',
  env: process.env.NODE_ENV,           // drives dev/prod presets
  endpoint: 'https://collect.example.com', // optional: auto-adds the http sink
  writeKey: 'WRITE_KEY',
  enabled: true,                       // false → tree-shakeable noop
  sampleRate: 1,                       // 0..1, applied per call
  redactKeys: ['internalScore'],       // extra PII keys to strip
  consent: { granted: ['analytics'] },
})

// Segment Spec — the entire instrumentation surface (never name a vendor)
analytics.track('Signup Clicked', { plan: 'pro' })
analytics.identify('user_42', { plan: 'pro' })
analytics.page('Pricing', { path: '/pricing' })
analytics.screen('Dashboard')
analytics.group('org_7', { name: 'Acme' })
analytics.alias('user_42', 'anon-or-prev-id')

// Analytics session (NOT replay) · consent gate · child context
analytics.session.id()
analytics.consent.grant('marketing')
const checkout = analytics.with({ feature: 'checkout' })

await analytics.flush()                // drain batch + flush all sinks
analytics.reset()                      // privacy-safe logout`

const reactApi = `import { AnalyticsProvider, useAnalytics, useTrackEvent } from '@refraction-ui/react-analytics'

function App() {
  return (
    <AnalyticsProvider config={{ app: 'my-app', env: 'production', endpoint, writeKey }}>
      <Pricing />
    </AnalyticsProvider>
  )
}

function Pricing() {
  const analytics = useAnalytics()
  const track = useTrackEvent()            // stable, memoised
  return <button onClick={() => track('Plan Selected', { plan: 'pro' })}>Pro</button>
}`

const devProd = `// dev  (env !== 'production'): synchronous, unbatched + a console sink
//                              so engineers see exactly what would ship.
// prod (env === 'production'): batching + sampling + a sendBeacon flush
//                              bound to pagehide / visibilitychange.
// enabled: false             : returns a noop — the live collector and all
//                              sink code tree-shake out of the bundle.

createAnalytics({ app: 'my-app', env: 'production' })   // → prod preset
createAnalytics({ app: 'my-app', env: 'development' })  // → dev preset
createAnalytics({ app: 'my-app', env, enabled: false }) // → noop`

const wireRequest = `POST {endpoint}/v{schemaVersion}/batch        (schemaVersion = 1 → /v1/batch)
Content-Type: application/json                 (gzip optional)
Authorization: Basic base64("{writeKey}:")     ← note the trailing colon

{
  "batch":   [ /* AnalyticsEvent[] — canonical envelope */ ],
  "sentAt":  "2026-05-16T12:00:00.000Z",        // honest client send time
  "batchId": "<uuid v4>"
}`

const wireEvent = `{
  "type": "track",                  // track|identify|page|screen|group|alias
  "event": "Signup Clicked",        // track/page/screen name (optional)
  "messageId": "<uuid v4>",         // idempotency key — backends MUST dedupe
  "anonymousId": "<uuid v4>",       // persistent, non-PII
  "userId": "user_42",              // opaque, optional
  "sessionId": "<uuid v4>",         // analytics session
  "properties": { },                // track/page/screen/group payload
  "traits": { },                    // identify/group traits
  "context": { "app": "my-app", "env": "production",
               "library": { "name": "@refraction-ui/analytics", "version": "0.1.0" } },
  "timestamp": "2026-05-16T12:00:00.000Z",      // ISO-8601 client time
  "schemaVersion": 1
}`

const beacon = `// Unload path: navigator.sendBeacon cannot set an Authorization header.
// A conforming backend MUST also accept the write key via query + text/plain:
POST {endpoint}/v1/batch?writeKey={writeKey}
Content-Type: text/plain`

const relayTopology = `Browser                         Your backend (the relay)        Vendors
────────                         ─────────────────────────       ───────
analytics.track(...)             POST /v1/batch                   GA4  (Measurement Protocol)
   │  neutral router only   ───▶   ├─ auth (Basic | ?writeKey=)     ▲
   │  (no vendor SDK)              ├─ dedupe messageId              │ server-side
   ▼                              ├─ clock-skew correct            │ fan-out
sendBeacon on unload  ─────────▶  ├─ size caps / schemaVersion ────┤ (ad-blocker-proof)
                                  └─ 200 accept-and-queue          ▼
                                                                  Azure App Insights`

const referenceServer = `import {
  createNodeRelayServer,
  createGA4Forwarder,
  createAzureForwarder,
} from '@refraction-ui/analytics-relay-reference'

const srv = createNodeRelayServer({
  writeKeys: ['WRITE_KEY'],
  forwarders: [
    createGA4Forwarder({ measurementId: 'G-XXXX', apiSecret, fetchImpl }),
    createAzureForwarder({ instrumentationKey, fetchImpl }),
  ],
})
const base = await srv.listen(8080) // POST {base}/v1/batch`

function Code({ code, language = 'tsx' }: { code: string; language?: string }) {
  return <CodeBlock code={code} language={language} />
}

function StatusRow({
  code,
  meaning,
  behaviour,
}: {
  code: string
  meaning: string
  behaviour: string
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2 pr-4 font-mono text-sm text-foreground whitespace-nowrap">
        {code}
      </td>
      <td className="py-2 pr-4 text-sm text-muted-foreground">{meaning}</td>
      <td className="py-2 text-sm text-muted-foreground">{behaviour}</td>
    </tr>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="max-w-3xl space-y-12 pb-16">
      <header className="space-y-3">
        <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
          Headless library
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          <code className="text-foreground">@refraction-ui/analytics</code> is a
          neutral <strong>Segment-spec collector/router</strong>. The app
          instruments <strong>once</strong> and never names a vendor; the
          library fans the canonical event envelope out to N pluggable sinks
          (GA4, Azure App Insights, PostHog, your own backend). There is{' '}
          <strong>no privileged engine</strong> — every vendor is just a sink.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Consumer API
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The entire public surface is the Segment Spec. Instrument once; the
          router handles batching, sessions, identity, consent and fan-out.
        </p>
        <Code code={consumerApi} />
        <h3 className="text-lg font-semibold text-foreground pt-2">React</h3>
        <p className="text-muted-foreground leading-relaxed">
          <code className="text-foreground">
            @refraction-ui/react-analytics
          </code>{' '}
          mirrors <code className="text-foreground">react-ai</code>: a provider
          plus hooks. No vendor SDK is loaded in the browser.
        </p>
        <Code code={reactApi} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Dev vs. prod
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The <code className="text-foreground">env</code> drives a preset.
          Development is synchronous with a console sink so engineers see
          exactly what would ship; production batches, samples and flushes via{' '}
          <code className="text-foreground">sendBeacon</code> on unload.
        </p>
        <Code code={devProd} language="ts" />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Sessions, identity &amp; consent
        </h2>
        <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc pl-5">
          <li>
            <strong className="text-foreground">sessionId</strong> — client
            UUIDv4 minted at session start. A session ends after 30&nbsp;min of
            inactivity (GA4 parity, configurable) or when a new campaign
            (UTM&nbsp;/ <code>gclid</code>&nbsp;/ <code>fbclid</code>&nbsp;/{' '}
            <code>msclkid</code>) is detected. Persisted cross-tab via
            localStorage&nbsp;→&nbsp;cookie&nbsp;→&nbsp;memory.
          </li>
          <li>
            <strong className="text-foreground">anonymousId</strong> —
            persistent, non-PII, resettable UUIDv4.{' '}
            <code>reset()</code> mints a fresh one so a new visitor is never
            stitched to the old one.
          </li>
          <li>
            <strong className="text-foreground">userId</strong> — opaque,
            app-supplied; never persisted by the library.{' '}
            <code>alias</code> emits a <code>previousId&nbsp;→&nbsp;userId</code>{' '}
            stitch event.
          </li>
          <li>
            <strong className="text-foreground">PII</strong> — a built-in
            deny-list (email&nbsp;/ phone&nbsp;/ name&nbsp;/ password&nbsp;/
            card&nbsp;/ …) plus <code>redactKeys</code>; case- and
            separator-insensitive, recursing into nested objects/arrays. Values
            become <code>&quot;[REDACTED]&quot;</code>.
          </li>
          <li>
            <strong className="text-foreground">Consent</strong> — each sink
            declares the categories it requires; the router will not deliver to
            a sink unless <strong>all</strong> its categories are granted
            (per-sink consent).
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          GA4 collection-parity
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          GA4 is <strong>one sink</strong>. Collection reaches parity (and
          beyond) via optional auto-capture plugins; identity and parameters map
          directly — <code>anonymousId&nbsp;→&nbsp;client_id</code>,{' '}
          <code>userId&nbsp;→&nbsp;user_id</code>,{' '}
          <code>sessionId&nbsp;→&nbsp;session_id</code>,{' '}
          <code>track&nbsp;→</code> a snake_cased GA4 event,{' '}
          <code>page&nbsp;→&nbsp;page_view</code>,{' '}
          <code>screen&nbsp;→&nbsp;screen_view</code>. Reporting is{' '}
          <em>delegated</em>: route the GA4 sink and you get GA&rsquo;s exact
          reports unchanged.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Backend wire contract
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The built-in <code className="text-foreground">http</code> sink
          implements the <strong>Segment HTTP Tracking API</strong> batch format
          — <em>adopt, do not invent</em> — so RudderStack&nbsp;/ Jitsu&nbsp;/
          Segment are drop-in conforming backends.
        </p>

        <h3 className="text-lg font-semibold text-foreground pt-2">Request</h3>
        <Code code={wireRequest} language="bash" />

        <h3 className="text-lg font-semibold text-foreground pt-2">
          Canonical event envelope
        </h3>
        <Code code={wireEvent} language="json" />

        <h3 className="text-lg font-semibold text-foreground pt-2">
          Response semantics (accept-and-queue)
        </h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="py-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="py-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Meaning
                </th>
                <th className="py-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Client behaviour
                </th>
              </tr>
            </thead>
            <tbody className="px-4">
              <tr>
                <td colSpan={3} className="px-4">
                  <table className="w-full">
                    <tbody>
                      <StatusRow
                        code="2xx"
                        meaning="Accepted and queued (not yet processed)"
                        behaviour="done"
                      />
                      <StatusRow
                        code="400"
                        meaning="Malformed"
                        behaviour="drop, never retry"
                      />
                      <StatusRow
                        code="401"
                        meaning="Bad write key"
                        behaviour="drop, never retry"
                      />
                      <StatusRow
                        code="413"
                        meaning="Payload too large"
                        behaviour="drop (client also pre-splits)"
                      />
                      <StatusRow
                        code="429 / 5xx"
                        meaning="Transient / overload"
                        behaviour="exponential backoff retry"
                      />
                      <StatusRow
                        code="network err"
                        meaning="—"
                        behaviour="treated as transient → retry"
                      />
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc pl-5 pt-2">
          <li>
            <strong className="text-foreground">Idempotency</strong> — backends{' '}
            <strong>MUST</strong> dedupe on <code>messageId</code>.
          </li>
          <li>
            <strong className="text-foreground">Clock skew</strong> — the
            backend corrects time as{' '}
            <code>corrected = timestamp + (receivedAt − sentAt)</code>; the
            client always stamps an honest <code>sentAt</code>.
          </li>
          <li>
            <strong className="text-foreground">Size limits</strong> — soft caps
            of ≈&nbsp;500&nbsp;KB&nbsp;/&nbsp;batch and
            ≈&nbsp;32&nbsp;KB&nbsp;/&nbsp;event (Segment parity). The client
            pre-splits oversized batches and drops over-cap events.
          </li>
          <li>
            <strong className="text-foreground">Versioning</strong> — the path
            carries <code>/v&#123;schemaVersion&#125;/</code>; every event also
            carries <code>schemaVersion</code>.
          </li>
        </ul>

        <h3 className="text-lg font-semibold text-foreground pt-2">
          sendBeacon caveat (unload path)
        </h3>
        <Code code={beacon} language="bash" />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Recommended topology: server relay
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The recommended production topology is a <strong>server relay</strong>
          : the browser ships only our neutral router to <em>your</em>{' '}
          <code>endpoint</code>; your backend fans out to vendors server-side.
          This is ad-blocker-proof and keeps vendor SDKs out of the bundle.
        </p>
        <Code code={relayTopology} language="text" />
        <p className="text-muted-foreground leading-relaxed">
          The repo ships an executable, dependency-free reference relay,{' '}
          <code className="text-foreground">
            @refraction-ui/analytics-relay-reference
          </code>{' '}
          (internal — never published). It implements the wire contract above
          and fans out to GA4 (Measurement Protocol) and Azure App Insights. The
          core <code>http</code> sink is conformance-tested against it
          end-to-end over a real socket (batch, beacon path, retry codes,
          dedupe, clock-skew, fan-out).
        </p>
        <Code code={referenceServer} language="ts" />
      </section>
    </div>
  )
}
