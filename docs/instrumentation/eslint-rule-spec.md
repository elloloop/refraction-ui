# ESLint Rule Spec — `no-blanket-logging` / `devwarn-policy`

> Wave 0 deliverable for #255 (enforces the policy in
> [`policy.md`](./policy.md)). **Spec only** — no rule code is shipped in
> Wave 0. Implementation lands in **Wave 4** (epic #254) once the Wave 1
> `devWarn` rollout has established the patterns.

## 1. Goal

Mechanically enforce the agreed stance so the codebase cannot drift back into
blanket logging:

1. Forbid `console.*` and any `logger.info/debug/warn/error` / telemetry
   import inside **`skip`-tier** component packages.
2. Forbid **unconditional** logging anywhere (must be `devWarn` /
   env-guarded / behind a provided sink).
3. Require footgun misuse seams to use `devWarn` from
   `@refraction-ui/shared` — not `console.warn`, not `logger.warn`.
4. Keep telemetry in `async-heavy` packages strictly provider-gated.

## 2. Package / plugin shape

- New workspace package: `packages/eslint-plugin-refraction-ui`
  (dev-only, **not** published as a runtime dep — consistent with the
  "minimize deps / no implicit phone-home" guardrails).
- Exposes a flat-config + legacy-config preset:
  `plugin:@refraction-ui/instrumentation/recommended`.
- The plugin **reads `docs/instrumentation/component-tiers.json`** at lint
  time (resolved relative to repo root) to know each package's tier. The
  JSON is the single source of truth; the rule has no hardcoded list.

## 3. Rules

### 3.1 `@refraction-ui/instrumentation/no-blanket-logging`

- **Type**: problem. **Default**: `error`.
- **Applies to**: every file under `packages/*/src/**`.
- **Reports** when:
  - A `CallExpression` callee matches `console.(log|info|debug|warn|error|trace)`.
  - A call to `.info(` / `.debug(` whose receiver is a logger/telemetry
    identifier (heuristic: imported from `@refraction-ui/logger`,
    `@refraction-ui/react-logger`, or a var named `/logger|telemetry/i`).
  - **And** the call is not inside an env guard (see §4).
- **Severity escalation**: if the enclosing package's tier in the tier map is
  `skip`, *any* logging/telemetry import or call is reported (even guarded) —
  `skip` means **zero** instrumentation.
- **Autofix**: none (intentional — forces a human tier decision).
- **Message**: `Blanket logging is forbidden by docs/instrumentation/policy.md. Use devWarn (footgun) or provider-gated telemetry (async-heavy); skip-tier packages get nothing.`

### 3.2 `@refraction-ui/instrumentation/devwarn-at-seam`

- **Type**: suggestion. **Default**: `warn` (→ `error` after Wave 1).
- **Applies to**: packages whose tier is `footgun`.
- **Reports** when a known misuse seam exists without an adjacent `devWarn`:
  - A `throw new Error(/must be used within|requires|is required/)` inside a
    context-guard function with **no** `devWarn(...)` call in the same block.
  - A silent-default context read (`useContext(X)` where `X` was created
    with a non-null default) in a `silent-default-context` package, with no
    `devWarn` on the misuse branch.
- **Autofix**: none (the warning message must be authored).
- **Message**: `Footgun misuse seam should emit devWarn before the throw / silent fallback (see component-tiers.json footgunKind).`

### 3.3 `@refraction-ui/instrumentation/devwarn-import-source`

- **Type**: problem. **Default**: `error`.
- `devWarn` / `devError` **must** be imported from `@refraction-ui/shared`.
  Flags `console.warn` used where the tier map says `devWarn` is required,
  and flags `devWarn` imported from anywhere else.
- Ensures the capture primitive stays the zero-dep `@refraction-ui/shared`
  one (#247 / #248 guardrail), never the telemetry lib.

### 3.4 `@refraction-ui/instrumentation/telemetry-must-be-provider-gated`

- **Type**: problem. **Default**: `error`.
- **Applies to**: `async-heavy` packages.
- Flags `useSpan()` / `telemetry.*` usage that is **not** reached through
  the `<TelemetryProvider>` context (heuristic: direct `createTelemetry(...)`
  construction inside a component package, or a span started at module scope).
- Guarantees the "no-op without a consumer sink" invariant.

## 4. "Env guard" definition (shared helper)

A logging call is *guarded* if it is statically inside one of:

- `if (process.env.NODE_ENV !== 'production') { … }`
- `if (import.meta.env.DEV) { … }` / `if (__DEV__) { … }`
- the body of `devWarn`/`devError` from `@refraction-ui/shared` (these are
  guarded by construction — calling them is always allowed in footgun pkgs).

## 5. Config wiring (Wave 4)

Add to root `.eslintrc.cjs` `overrides`:

```js
{
  files: ['packages/*/src/**/*.{ts,tsx}'],
  plugins: ['@refraction-ui/instrumentation'],
  extends: ['plugin:@refraction-ui/instrumentation/recommended'],
}
```

`recommended` = `no-blanket-logging: error`,
`devwarn-import-source: error`,
`telemetry-must-be-provider-gated: error`,
`devwarn-at-seam: warn` (promote to `error` after the Wave 1 footgun rollout
is complete and green).

## 6. Test fixtures (authored with the rule in Wave 4)

- ✅ `devWarn` from `@refraction-ui/shared` in a footgun package → no report.
- ❌ `console.warn` in a footgun package → `devwarn-import-source`.
- ❌ any `logger.info` in a `skip` package → `no-blanket-logging` (escalated).
- ❌ unguarded `console.log` anywhere → `no-blanket-logging`.
- ❌ `createTelemetry()` constructed inside `react-waveform` → `telemetry-must-be-provider-gated`.
- ❌ footgun context-guard throw with no adjacent `devWarn` → `devwarn-at-seam`.

## 7. Non-goals

- Not a type checker; tier source of truth is `component-tiers.json`, not
  inference.
- Does not rewrite code (no autofix) — every instrumentation decision is a
  reviewed human choice per the policy.
- Does not run in consumer apps — dev-only, this repo's lint pipeline.
