# Refraction UI — Agent Instructions (AUTHORITATIVE)

This file is the single source of truth for AI agents. If any other doc
(GEMINI.md, older notes, a sub-package README) disagrees with this file about
packaging or releasing, **this file wins**. Read this before creating packages
or publishing.

## Packaging & Release Architecture — READ FIRST

### The ONLY packages published to npm
| npm name | dir | notes |
|---|---|---|
| `@refraction-ui/react` | `packages/react-meta` | per-framework meta |
| `@refraction-ui/astro` | `packages/astro-meta` | per-framework meta |
| `@refraction-ui/angular` | `packages/angular-meta` | per-framework meta |
| `@refraction-ui/shared` | `packages/shared` | headless shared utils |
| `@refraction-ui/tailwind-config` | `packages/tailwind-config` | |

**Every other package under `packages/*` is `private: true` and is NEVER
published to npm.** This includes all headless cores (`ai`, `auth`, `http`,
`i18n`, `media-engines`, `logger`, `analytics`, `analytics-sink-*`, …) and all
framework adapters (`react-*`, `astro-*`, `angular-*`). `publish-oidc.mjs`
filters `!pkg.private`, so private packages are skipped by design.

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
2. Framework adapter(s): `packages/<fw>-<feature>` (`react-`/`astro-`/
   `angular-`) — `private: true`. Mirror an existing adapter (`react-ai`).
3. **Wire each adapter into its meta** (this is the step that was missed 20×):
   - add `"@refraction-ui/<fw>-<feature>": "workspace:*"` to
     `packages/<fw>-meta/package.json` **`devDependencies`**
   - add `export * from '@refraction-ui/<fw>-<feature>'` to
     `packages/<fw>-meta/src/index.ts`
   - (this is exactly what `update-meta-packages.cjs` automates)
4. Build the metas (`pnpm turbo run build --filter=@refraction-ui/react …`) to
   catch `export *` name collisions before landing.

## Releasing

1. Add a `.changeset/*.md` bumping the affected **public** packages only — the
   metas (`@refraction-ui/react|astro|angular`) and/or `@refraction-ui/shared`.
   Never list private feature packages as the release driver (they may be
   version-bumped by changesets but are not published).
2. Land it. The Changesets Action opens/updates a **`chore: release packages`
   Version PR** (it consumes changesets, bumps versions, writes CHANGELOGs).
3. Merge that Version PR. The next `Release` run sees no changesets → runs
   `scripts/publish-oidc.mjs` → publishes the **non-private** packages to npm
   `@latest` via OIDC with provenance.
4. Verify: `npm view @refraction-ui/react dist-tags --json`.

Existing public packages already have npm OIDC trusted publishers configured
(that's why they publish). Brand-new public package names would NOT — another
reason new feature packages must stay private and ride the metas.

## Pre-push

Run `make ci` before pushing to `main`; never push failing code. Use `stax`
for git/dev workflow, not raw `git`/`gh` (issue/PR skills excepted).
