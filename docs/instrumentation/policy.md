# Instrumentation Policy — refraction-ui components

> Wave 0 foundation artifact for epic **#254** (Instrument all existing
> refraction-ui components with the logger), Wave 0 issue **#255**, building on
> the error-feedback primitive epic **#247**.
>
> Status: **policy + tier map**. No code changes to any package. No changeset.

## 1. The stance (non-negotiable)

This is the agreed React/MUI stance. It is **NOT** blanket `logger.info()`
across the ~281 packages in this monorepo. Three, and only three, things ship:

1. **`devWarn` in the footgun minority.** Dev-only, env-guarded, warn-once.
   Emits on the *misuse seam* (wrong provider, missing context, conflicting
   props, deprecated API). Compiles out / is silent in production. Zero
   runtime dependency on the telemetry library.
2. **Error seams at refraction-origin errors.** A per-framework boundary
   (`TelemetryErrorBoundary` for React, already in `@refraction-ui/react-logger`)
   that routes errors **originating inside a `@refraction-ui/*` package** to
   the optional sink — *only if the consumer wired one*. Off by default.
3. **Telemetry only at async-heavy components.** Spans/timings on AI, media,
   voice, video, realtime lifecycles — emitted **only** when a consumer
   provides a sink via `<TelemetryProvider>`. No-op otherwise.

Everything else (pure presentational components) gets **nothing**.

### Explicitly forbidden

- ❌ Blanket `logger.info()` / `console.*` across packages.
- ❌ Any unconditional log on render, mount, prop change, or event in a
  presentational component.
- ❌ Telemetry that runs without a consumer-provided sink (no implicit
  phone-home — consistent with #247 OSS guardrails).
- ❌ Logging prop *values*, app state, user data, or PII. Error seams ship
  redacted fingerprints only (package / componentName / version / normalized
  stack hash / framework / count), per #247.
- ❌ New telemetry contracts. The existing logger sink + wire contract
  (`@refraction-ui/logger`, #214/#221) is reused, never redefined.

## 2. Tiers

The machine-readable map lives in
[`component-tiers.json`](./component-tiers.json). Every React component package
is classified into exactly one **primary** tier; `react-ai` additionally
carries a **secondary** tier (see §2.4).

### 2.1 `footgun` → `devWarn`

A component is a footgun if **any** of:

- It requires a provider/context and **throws** when used outside it
  (`useX must be used within <XProvider>`, compound-part guards).
- It has a **silent-default context** — sub-parts read a context default and
  render visibly wrong (e.g. zero dimensions) instead of throwing. This is the
  *worst* footgun: no error, no signal. `react-charts`, `react-select`.
- It has a **required prop** whose absence throws (`AuthProvider` without
  `adapter`).
- It has **mutually-exclusive props** or a **deprecated** prop/API path.

Treatment:

- Add a `devWarn(...)` (from `@refraction-ui/shared`, primitive landed via
  #248) **at the misuse seam**, *before* the existing throw or alongside the
  silent fallback.
- **Keep the existing `throw`.** `devWarn` augments, never replaces, the
  thrown error. For silent-default contexts, `devWarn` is the *only* signal —
  do not introduce a throw (would be a breaking change).
- **Exception — `@refraction-ui/react-logger` (telemetry instrumentation
  itself):** its hooks (`useTelemetry`/`useLogger`/`useSpan`) **must NOT
  throw** outside `<TelemetryProvider>` — they return a shared
  `createNoopTelemetry()` and emit only the `devWarn`. Rationale: adding
  logging to a component must never crash the host (incl. in tests) — that
  would defeat the purpose of instrumentation. Do not re-introduce the throw.
- `devWarn` is warn-once per message, env-guarded (`process.env.NODE_ENV !==
  'production'` / `import.meta.env.DEV`), and **must not import the telemetry
  library**. If a consumer wired the diagnostics sink (#247 W1), the error
  seam — not `devWarn` — forwards a redacted fingerprint.

### 2.2 `async-heavy` → optional telemetry + error seam

AI / meeting / media / voice / video / realtime components. Treatment:

- Wrap the async lifecycle (LLM call, playback start→ready, recording
  session, audio-analysis loop) in a span via `useSpan()` from
  `@refraction-ui/react-logger`.
- Failures route through the error seam (`TelemetryErrorBoundary` /
  explicit `telemetry.error(...)` on the catch path).
- **All of this is a no-op unless the consumer mounted `<TelemetryProvider>`
  with a sink.** No provider → zero records, zero overhead.
- Span attributes are operational only (model name, duration, status) —
  **never** prompt content, audio bytes, user input.

### 2.3 `skip` → nothing

Pure presentational thin wrappers over a headless core (Badge, Card,
Skeleton, …) and stub/re-export-only packages. **No instrumentation.** Adding
`devWarn`/logging here is the exact anti-pattern this policy forbids.

### 2.4 Dual-tier (`react-ai`)

`react-ai` is **both** a footgun (`useAI`/`useTTS` throw outside their
provider) **and** async-heavy (`generateText`/`generateJSON`/TTS are async
network calls). Both treatments apply: `devWarn` on the provider-misuse seam
**and** telemetry spans on the async generate/stream paths. Primary tier in
the map is `footgun`; `secondaryTier: "async-heavy"` records the telemetry
obligation.

## 3. React-first prioritization

Rollout is **React-first**: the `react-*` packages are instrumented in
Waves 1–3 before any Astro / Flutter mirror. Rationale:

- React is the reference framework (most consumers, the primitive landed in
  `@refraction-ui/react-logger` first).
- Astro/Flutter wrappers re-expose the same headless cores; once the
  React policy is proven, the mirror is mechanical and lower-risk.
- Per project guidance: headless core + React first; other frameworks when
  idle.

The non-React framework packages (`astro-*`, Flutter) are **out
of scope for the prioritized rollout** but inherit this identical policy and
tier mapping by component name when their wave is scheduled.

## 4. Mapping to epic waves

| Wave | Scope | Tier | Dep |
|------|-------|------|-----|
| 0 | This doc + tier map + lint spec | — | logger core, #248, #255 |
| 1 | Footgun `devWarn` rollout (React, batched) | `footgun` | W0 + #248 |
| 2 | Error-seam wiring across React adapters | all w/ refraction-origin errors | W0 + #249 |
| 3 | Async-heavy telemetry instrumentation (React) | `async-heavy` | W0 |
| 4 | Enforcement lint rule + docs | — | W1, see [`eslint-rule-spec.md`](./eslint-rule-spec.md) |

## 5. Acceptance per component (Waves 1–3)

A component is "done" for its tier when:

- **footgun**: `devWarn` at every misuse seam; existing throw retained; a
  test asserts the warn fires once in dev and is silent in prod; no
  `console.*`/`logger.info` added.
- **async-heavy**: span emitted on the async lifecycle; verified no-op
  without a provider; failure path routes to the seam; no payload leakage.
- **skip**: explicitly left untouched; lint rule (Wave 4) flags any
  `devWarn`/logger import added to a `skip` package as an error.

## 6. Verification of this artifact

- `component-tiers.json` parses as valid JSON (verified).
- Markdown is **pure docs**: the `docs-site` app is a Next.js app with
  hardcoded routes and does **not** ingest `docs/**`. No markdown build step
  picks this up; nothing to "build".
- **No changeset**: zero code changes to any `packages/*` — analysis +
  committed docs/JSON only.
