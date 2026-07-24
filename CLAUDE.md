# Refraction UI — Agent Instructions (AUTHORITATIVE)

This file is the single source of truth for AI agents. If any other doc
(`AGENTS.md`, `GEMINI.md`, older notes, a sub-package README) disagrees with
this file about packaging or releasing, **this file wins**. Read this before
creating packages or publishing.

## What this project is

Refraction UI is a **headless, token-driven UI component library shipped across
multiple frameworks** — React and Astro (on npm) and Flutter (on pub.dev) — so a
single design language travels with a product across every surface. Components
are built on a small set of semantic design tokens; logic lives in
framework-agnostic **headless cores**, and thin **framework adapters** wrap each
core for their framework. The same component (e.g. `Button`, `VideoTile`,
`RatingScale`) looks and behaves the same whether a team builds in React, Astro,
or Flutter.

Two architectural commitments drive almost every rule below:

1. **One published artifact _per framework_, not per component.** Consumers
   install a single meta package per framework (`@refraction-ui/react`,
   `@refraction-ui/astro`, `refraction_ui` on pub.dev) and get *every* component
   from it — not 80+ individual packages. Per-component packages exist in the
   monorepo for isolation/testing but are all `private: true` and ride the meta.
   This keeps install/versioning trivial for consumers and lets the whole
   library move in lockstep. Do not try to publish a component on its own.
2. **Every component is a _triple_ that must stay in sync** — see
   "The component triple" below.

## Packaging & Release Architecture — READ FIRST

### The ONLY packages published to npm
| npm name | dir | notes |
|---|---|---|
| `@refraction-ui/react` | `packages/react-meta` | per-framework meta |
| `@refraction-ui/astro` | `packages/astro-meta` | per-framework meta |
| `@refraction-ui/tailwind-config` | `packages/tailwind-config` | |

That is the complete list — exactly **three** npm packages. **Every other
package under `packages/*` is `private: true` and is NEVER published to npm.**
This includes `@refraction-ui/shared` (`packages/shared`, headless shared
utils — embedded into the metas, never published), all headless cores (`ai`,
`auth`, `http`, `i18n`, `media-engines`, `logger`, `analytics`,
`analytics-sink-*`, …) and all framework adapters (`react-*`, `astro-*`).
`publish-oidc.mjs` filters `!pkg.private`, so private packages are skipped by
design.

Angular support has been **removed entirely** — there is no
`@refraction-ui/angular`, no `packages/angular-*`. Do not re-add it.

Flutter is a **single Dart package** `packages/flutter` (`refraction_ui`),
published to **pub.dev** by the `flutter-publish` tag workflow — a separate
ecosystem. Not npm, not metas, no changeset.

### How consumers get a feature
Consumers install **only** the meta (`@refraction-ui/react` etc.) or
`@refraction-ui/shared`. A feature reaches them only if its framework adapter
is **wired into the meta**. Headless cores are pulled in transitively by the
adapters (e.g. `@refraction-ui/ai` is private; `react-ai` depends on it;
`react-meta` re-exports `react-ai`).

## Hard rules

- **MUST NOT** set a feature/core package to `private: false` or add
  `publishConfig` to force it onto npm. Individual feature packages are never
  standalone npm packages.
- **MUST NOT** run `npm version` / `npm publish` on individual feature
  packages, or publish from a local machine, or with a stored npm token.
  Publishing is **only** via CI GitHub-Actions **OIDC trusted publishing**
  (provenance). Local/token publishing is forbidden (supply-chain + loses
  provenance).
- **MUST NOT** expect an individual feature package (e.g.
  `@refraction-ui/react-logger`) to appear on npm. It never will.
- Releases are **Changesets-driven**. There ARE changesets and a Version PR.
  (Ignore any doc claiming "no changesets / manually bump every package".)

## Adding a new framework feature (the correct procedure)

1. Headless core (if any): `packages/<feature>` — `private: true`. Consumed
   transitively by adapters; never published.
2. Framework adapter(s): `packages/<fw>-<feature>` (`react-`/`astro-`) —
   `private: true`. Mirror an existing adapter (`react-ai`).
3. **Wire each adapter into its meta** (this is the step that was missed 20×):
   - add `"@refraction-ui/<fw>-<feature>": "workspace:*"` to
     `packages/<fw>-meta/package.json` **`devDependencies`**
   - add `export * from '@refraction-ui/<fw>-<feature>'` to
     `packages/<fw>-meta/src/index.ts`
   - (this is exactly what `update-meta-packages.cjs` automates)
4. Build the metas (`pnpm turbo run build --filter=@refraction-ui/react …`) to
   catch `export *` name collisions before landing.
5. **Ship the component triple** (below) — implementation, Storybook story, and
   docs-site page — in the same change. A component is not "done" until all
   three exist and agree.
6. **Add a changeset** bumping the affected metas and land it so the component
   actually reaches npm (see Releasing). An unpublished component helps no one.

## The component triple — keep these in sync

Every component is three artifacts that **must stay in sync and ship together**:

1. **Implementation** — headless core + the per-framework adapters
   (`packages/<feature>`, `packages/<fw>-<feature>`). The source of truth for
   behavior, props, and tokens.
2. **Storybook story** — `docs-site/src/app/components/<slug>/<Name>.stories.tsx`
   (plus the `examples.tsx` it renders). The interactive showcase. The story
   `title` must be `<Category>/<Name>` where Category is one of: **Inputs,
   Navigation, Data Display, Feedback, Overlays, Layout, Chat & AI, Calls &
   Media, Marketing, Editors & IDE, Utilities** (the sidebar taxonomy — flat
   `Components/<Name>` titles are not allowed).
3. **Docs-site page** — `docs-site/src/app/components/<slug>/page.tsx` with the
   live examples, a props table, and an install snippet.

Rules:

- **Never land one without the others.** If you add a prop, a variant, or a
  whole component, update the implementation **and** the story **and** the docs
  page in the same PR. A docs page that lists a prop the component doesn't have
  (or vice-versa) is a bug.
- **The story and docs page import the real published-shape component** (the
  `@refraction-ui/react-<feature>` adapter, re-exported by the meta) — not a
  local mock — so they exercise exactly what consumers get.
- **Add the new `@refraction-ui/react-<feature>` to `docs-site/package.json`
  `dependencies`** (`workspace:*`) or the docs build can't resolve it.
- **Publish regularly.** The triple is only useful to consumers once it's on
  npm. Don't let implementation, docs, and the published meta drift apart —
  land the changeset and merge the Version PR so the docs site and the npm
  package describe the same thing. Treat "implemented but unpublished" as
  unfinished work.

## Component build playbook (hard-won — follow exactly)

Mirror an existing, recently-shipped component as your template (e.g.
`packages/rating-scale` + `packages/react-rating-scale` + `packages/astro-rating-scale`
+ `docs-site/src/app/components/rating-scale/*`). The conventions below are not
style preferences — each one is a build error or a shipped bug we have already
hit. Authoring many components in parallel (one subagent per component) works
well **only if every agent follows these**; the integrator then wires metas,
builds, and fixes centrally.

**Headless core (`packages/<feature>`):**
- JSX-free: pure logic/state helpers + `cva` style variants only. `private: true`.
- **`cva` variant values are STRINGS.** A boolean-ish variant uses keys
  `true:`/`false:`, and **`defaultVariants` must use the string `'false'`/`'true'`**
  (not a boolean) — `defaultVariants: { featured: 'false' }`. At call sites pass
  `cond ? 'true' : 'false'`, never a raw boolean. (Raw booleans fail the dts build.)
- ARIA props that include `role`/`aria-*` (esp. `aria-live`, `aria-valuenow`):
  type the returned object as **`Record<string, string | number | boolean>`**,
  not `Partial<AccessibilityProps>` (that type is narrow and rejects most aria-*).
- **No `Math.random()` / `Date.now()` / argless `new Date()`** in cores — keep
  them deterministic; accept ids/timestamps as inputs.

**React adapter (`packages/react-<feature>`):**
- Thin wrapper over the core; `private: true`; `forwardRef` + `className`.
- **`Omit` every prop name that collides with `React.HTMLAttributes<…>`.** Hit so
  far: `onSelect`, `results`, `color`, `content`, `title`, `defaultValue`,
  `onChange`. If your component declares any of these with a non-DOM type, add it
  to the `Omit` or the interface "incorrectly extends" and the build fails.
- Spread the core's ARIA object **directly** (`{...api.ariaProps}`). Do **not**
  cast it `as React.AriaAttributes & { role: string }` — that assertion fails to
  compile; the direct spread works.
- **SSR text rule:** adjacent `{a} {b}` expressions get comment markers between
  them under `renderToString`, so a composed string renders non-contiguously and
  breaks `toContain('a b')`. Render composed strings as a **single template
  literal**: `{`${a} ${b}`}`.
- Generic components: make the component generic (`<T,>`); a generic +
  `forwardRef` is awkward, so a plain generic function component is acceptable.

**Astro adapter (`packages/astro-<feature>`):** `private: true`; `src/index.ts`
is `export {}`; the real component is `src/<Name>.astro` (SSR; content via
`<slot/>`). `astro-meta`'s `build.mjs` auto-copies the `.astro` files for any
`astro-*` package listed in `astro-meta`'s deps — so wiring = the devDependency
+ `export *` only.

**Tests (what we write, and what they do _not_ cover):**
- Core: unit tests of the pure logic (Vitest, node env).
- React adapter: **SSR `renderToString`** tests (node env — no jsdom/Testing
  Library) asserting rendered structure + ARIA. These do **not** exercise click/
  drag/keyboard interaction or visual output. When a component's value is in
  interaction (drag-reorder, slot selection) or pixels, say so — the SSR tests
  prove it renders the right shape, not that the interaction works. Add
  interaction/visual coverage (jsdom + Testing Library, or Playwright) when that
  behavior is load-bearing; don't imply coverage you didn't write.

**Build/verify locally (in this order — turbo respects the dep graph):**
- `pnpm turbo run build --filter=@refraction-ui/react` — builds the whole graph
  and the React meta; catches `export *` collisions and dts errors. (Building a
  single package directly often fails to resolve `@refraction-ui/shared` types —
  use turbo.)
- `pnpm turbo run build --filter=@refraction-ui/astro` — runs `build.mjs`.
- `pnpm turbo run test --filter=…` for the new packages.
- Docs build in a fresh checkout needs its deps built first:
  `pnpm turbo run build --filter='refraction-ui-docs^...'` then
  `pnpm --filter refraction-ui-docs run build`. **Add the new
  `@refraction-ui/react-<feature>` to `docs-site/package.json` deps** or the docs
  build can't resolve the import.
- `pnpm turbo run lint typecheck --filter='[HEAD~1]'` after committing — must be
  **0 errors** (pre-existing warnings in other packages are fine).

## Releasing

1. Add a `.changeset/*.md` bumping the affected **public** packages only — the
   metas (`@refraction-ui/react|astro`) and/or `@refraction-ui/tailwind-config`.
   Never list private feature packages (incl. now-private
   `@refraction-ui/shared`) as the release driver (they may be version-bumped
   by changesets but are not published).
2. Land it. The Changesets Action opens/updates a **`chore: release packages`
   Version PR** (it consumes changesets, bumps versions, writes CHANGELOGs).
3. Merge that Version PR. The next `Release` run sees no changesets → runs
   `scripts/publish-oidc.mjs` → publishes the **non-private** packages to npm
   `@latest` via OIDC with provenance.
4. Verify: `npm view @refraction-ui/react dist-tags --json`.

Existing public packages already have npm OIDC trusted publishers configured
(that's why they publish). Brand-new public package names would NOT — another
reason new feature packages must stay private and ride the metas.

### CI gating facts (so you don't get stuck or merge-past-red blindly)

- **Only `commit-lint` is a required status check.** Everything else is
  informational at the branch-protection level.
- The **`dependencies` / `validation` "Audit dependencies"** step fails on a
  **pre-existing transitive esbuild advisory** that is present on `main` and
  unrelated to component work. It does **not** gate the release pipeline. Do not
  treat it as your failure — but **do** confirm the `validation` job's **"Run CI"
  step** (the full `make ci`: lint + typecheck + test + build) **succeeded**;
  that is the real green signal. Verify by step conclusion, never assume.
- The **`Release` workflow is `workflow_run` on _"Test Matrix"_ success** (not on
  the "CI" workflow). So the publish pipeline is gated by **Test Matrix passing
  on `main`**, regardless of the audit red. Sequence after merging a feature PR:
  Test Matrix (main) → Release opens the **`chore: release packages` Version PR**
  → merge it → Test Matrix again → Release sees no changesets → `publish-oidc`
  publishes via OIDC. Each Test Matrix run is ~25–35 min; poll, don't assume.
- Admin-merging past the audit red is acceptable **only after** the validation
  "Run CI" step is confirmed green and `commit-lint` passes. Surface that you did
  so and why.
- The recurring esbuild audit failure is tracked separately; if asked to fix CI
  reds, that audit advisory — not your component — is usually the culprit.

### Flutter releases (separate ecosystem)

`refraction_ui` publishes to **pub.dev** via the **`flutter-publish` tag
workflow** (tag `refraction_ui-vX.Y.Z` matching `packages/flutter/pubspec.yaml`).
The publish gate runs `flutter test --exclude-tags golden` — **golden
(visual-baseline) tests are excluded** because their macOS-generated PNGs cannot
render pixel-identical on the Linux CI runner (this silently blocked every
release 0.10→0.42 until fixed). Don't ship checked-in test artifacts
(`test/failures/**`, stray `*_results.*`) in the package, and declare any
test-only imports in `dev_dependencies` or `dart pub publish` fails.

## Pre-push

Run `make ci` before pushing to `main`; never push failing code. Use `stax`
for git/dev workflow, not raw `git`/`gh` (issue/PR skills excepted).

---

## How I expect you to write code

**No shortcuts. "Simple" never means "sloppy."** A small diff that hardcodes,
duplicates, or skips a test isn't simpler — it's deferred cost.

1. **Fix causes, not symptoms.** Find the root cause before fixing. If you're
   applying a workaround, say so explicitly and explain why. Never swallow an
   exception or silence an error to make a problem disappear.

2. **Think about consequences.** Before changing shared or widely-used code,
   trace its callers and the invariants they rely on. A fix that's locally
   correct but breaks something elsewhere — now or later — is not a fix.

3. **SOLID, sensibly.** One responsibility per class/widget/function. Separate
   pure logic from I/O so it can be tested. Inject dependencies that cross a
   boundary so they're mockable. Don't add abstractions for things that don't
   cross a boundary.

4. **DRY about knowledge, not appearance.** Don't duplicate a rule or decision.
   Code that merely looks similar but changes for different reasons stays
   separate. When unsure, prefer duplication over a premature/wrong abstraction.

5. **No hardcoded values.** No magic numbers or strings inline — give them
   names. Environment/tenant/feature-specific values go in typed config in
   application code, never scattered literals, never the database.

6. **Readable & maintainable.** Clear names, short flat functions, early
   returns over deep nesting. Comments explain *why*, not *what*. Match the
   existing style of the file you're editing.

7. **Testable, and prove it.** Ship a test for behavior you add or change. If
   something is hard to test, that's a design smell — restructure until it
   isn't. "Works but can't be tested" means it isn't done.

A change is done only when: the cause (not a symptom) is fixed, no new hardcoded
values, a test covers it, and the analyzer/formatter are clean.

## Project facts

> Keep these current as the repo evolves; only write what you've confirmed.

- **Setup command:** `make install` (`pnpm install --frozen-lockfile`; pnpm@10.13.1, Node 20)
- **Analyze/lint command:** `make lint` (`pnpm turbo run lint` → `eslint src --ext .ts,.tsx`); also `make typecheck` (`tsc --noEmit`)
- **Test command (all):** `make test` (`pnpm turbo run test` → `vitest run --passWithNoTests` per package)
- **Test command (single file/test):** `pnpm --filter <pkg> exec vitest run <file>` or scope by name with `vitest run -t "<name>"`
- **Format command:** No Prettier; formatting is `.editorconfig` (2-space, LF, final newline) enforced via ESLint — run `make lint`
- **Run an app:** `pnpm storybook` (React, port 6006) / `pnpm storybook:astro` (Astro, port 6008); docs in `docs-site`; Flutter package has its own `packages/flutter/Makefile`
- **Repo layout:** pnpm + Turborepo monorepo. `packages/*` (~298 dirs: headless cores, `react-*`/`astro-*`/`angular-*` adapters, `*-meta` aggregators, `tailwind-config`, Dart `flutter`); `docs-site` (docs); `e2e` + `playwright.config.ts` (Playwright); `.storybook`/`.storybook-astro`; `scripts/` (codegen/publish helpers)
- **State management / data layer conventions:** Headless cores (`private: true`) hold logic; framework adapters (`react-*`/`astro-*`, also `private: true`) wrap them; only the per-framework `*-meta` packages plus `tailwind-config` are published, re-exporting adapters via `export *`. Consumers install only a meta or `@refraction-ui/shared`
- **Generated files NOT to hand-edit:** Built `dist/**` and `coverage/**` (Turbo outputs); meta `package.json` deps / `src/index.ts` exports are managed by `update-meta-packages.cjs`; packages and stories scaffolded by `scripts/generate-package.mjs`, `scripts/generate-astro-packages.mjs`, `scripts/generate-stories.mjs`, `scripts/generate-astro-stories.mjs`, `scripts/generate-docs-stories.mjs`; docs by `update-docs.cjs`; `pnpm-lock.yaml`
- **Other gotchas:** Only 3 npm packages publish (`@refraction-ui/react`, `@refraction-ui/astro`, `@refraction-ui/tailwind-config`) — everything else is `private: true` (see "Hard rules"); Flutter publishes to pub.dev via the `flutter-publish` tag workflow, not npm; releases are Changesets + OIDC trusted publishing only (never local/token publish); run `make ci` before push and use `stax` over raw `git`/`gh`
