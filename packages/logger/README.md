# @refraction-ui/logger

Headless, vendor-neutral telemetry/logging core. Manager + provider (sink)
pattern, mirroring [`@refraction-ui/ai`](../ai). No framework, no UI, no
required network dependency.

- **Vendor-neutral** — engines implement a `TelemetrySink` interface. The
  default engine is Grafana Faro, attached via **optional peerDependencies**.
  No Faro/Grafana type ever appears in the public API.
- **Console by default** — with no `endpoint`, telemetry is console-only.
- **Kill switch** — `enabled: false` returns a tree-shakeable noop logger
  that produces zero emissions and never imports an engine.
- **Env presets** — `development` (sync, pretty, `debug`, no batching) vs
  `production` (batched, sampled, `>= warn`, beacon flush on page exit).
- **Child loggers** with bound context, async **spans**, **redaction**.

## Install

```sh
pnpm add @refraction-ui/logger
```

To use the Faro engine (optional — only when you set an `endpoint`):

```sh
pnpm add @grafana/faro-web-sdk @grafana/faro-web-tracing
```

If these peers are not installed, the logger silently stays console-only.

## Quick start

```ts
import { createTelemetry } from '@refraction-ui/logger'

const telemetry = createTelemetry({
  app: 'interview-service',
  env: 'production',
  endpoint: 'https://collector.example/ingest', // optional
  sampleRate: 0.25,                              // optional
  redactKeys: ['password', 'token'],             // optional
  enabled: true,                                 // optional (default true)
})

telemetry.warn('rate limited', { route: '/v1/answer' })

const session = telemetry.child({ sessionId: 's-123' })
const turn = session.child({ turnId: 't-7' })

const span = turn.startSpan('llm-call', { model: 'gpt' })
try {
  // ... async work ...
  span.end()
} catch (err) {
  span.end({ error: err })
}

await telemetry.flush()
```

## API

### `createTelemetry(config): Telemetry`

| Config field | Type | Notes |
| --- | --- | --- |
| `app` | `string` | Logical app/service name on every record. **Required.** |
| `env` | `'development' \| 'production'` | Selects a behavior preset. **Required.** |
| `endpoint` | `string?` | Remote collector URL. Omit → console only (no engine constructed). |
| `enabled` | `boolean?` | `false` → tree-shakeable noop, zero emissions. Default `true`. |
| `sampleRate` | `number?` | `0..1` kept fraction. Defaults to the preset (`1` dev / `0.25` prod). |
| `redactKeys` | `string[]?` | Context keys (deep, case-insensitive) replaced with `[REDACTED]`. |

Returns a `Telemetry` — which **is** a `Logger` bound to an empty root
context, plus sink management.

### `Logger`

| Member | Description |
| --- | --- |
| `debug/info/warn/error/fatal(message, context?)` | Emit a record at that level. |
| `child(context)` | Derive a logger with merged bound context (e.g. `sessionId`, `interviewId`, `turnId`). Parent is unaffected. |
| `startSpan(name, attributes?) → Span` | Begin a timed span. |
| `flush()` | Deliver buffered records (batched presets) and flush every sink. |

### `Span`

| Member | Description |
| --- | --- |
| `end(opts?)` | End and emit a `SpanRecord`. `opts.error` → `status: 'error'`; `opts.attributes` merges in. Idempotent. |

### `Telemetry` (extends `Logger`)

| Member | Description |
| --- | --- |
| `sinks` | Registered sink names, insertion order. |
| `addSink(sink)` | Register an additional `TelemetrySink`. |
| `removeSink(name)` | Remove a sink by name. |

### Presets

| | development | production |
| --- | --- | --- |
| min level | `debug` | `warn` |
| delivery | sync | batched (size 20) |
| sample rate | `1` | `0.25` |
| console output | pretty | structured JSON |
| beacon flush on `pagehide`/`visibilitychange` | no | yes |

Exposed as `PRESETS` and `resolvePreset(env)`.

### Sinks (transports)

`TelemetrySink` is the vendor-neutral engine contract:

```ts
interface TelemetrySink {
  name: string
  log(record: LogRecord): void
  span(record: SpanRecord): void
  flush(): Promise<void>
}
```

Built-ins:

- `createConsoleSink(options?)` — default zero-dependency transport.
- `createFaroSink(options)` — async Grafana Faro engine. Loads the optional
  peers dynamically; resolves to `null` when they are absent (caller falls
  back to console). Accepts an injectable `transport` for tests (no network).
- `createNoopTelemetry()` — the kill-switch logger (used internally when
  `enabled: false`).

### Utilities

- `redact(context, keys)` — deep, case-insensitive, cycle-safe redaction.
- `createMockSink(name?)` — recording sink for tests (`logs`, `spans`,
  `flushCalls`). Mirrors `createMockAIProvider`.
- `LEVEL_ORDER` — numeric level ordering for threshold comparisons.

## License

MIT
