# Refraction UI — Agent Guide

> **`CLAUDE.md` is the authoritative source.** This file is the cross-tool
> entry point (AGENTS.md is the emerging convention many coding agents read
> first); it summarizes the essentials and points to `CLAUDE.md` for the full,
> binding rules. If anything here disagrees with `CLAUDE.md`, **`CLAUDE.md`
> wins**. Read it before creating packages or publishing.

## What this project is

Refraction UI is a **headless, token-driven UI component library shipped across
multiple frameworks** — React and Astro (npm) and Flutter (pub.dev) — so one
design language travels with a product across every surface. Logic lives in
framework-agnostic **headless cores**; thin **framework adapters** wrap each
core. The same component behaves the same in React, Astro, or Flutter.

## Two commitments that drive the rules

1. **One published artifact _per framework_, not per component.** Consumers
   install a single meta per framework and get every component from it:
   - `@refraction-ui/react`  → `packages/react-meta`
   - `@refraction-ui/astro`  → `packages/astro-meta`
   - `@refraction-ui/tailwind-config`
   - `refraction_ui` (Flutter, pub.dev) → `packages/flutter`

   Every other `packages/*` (headless cores, `react-*`/`astro-*` adapters,
   `@refraction-ui/shared`) is **`private: true`** and never published on its
   own — it rides the meta. Do **not** publish a component standalone, and do
   **not** publish locally: npm publishing is **CI-only** via Changesets → a
   "release packages" Version PR → OIDC trusted publishing. Flutter publishes
   via the `flutter-publish` tag workflow.

2. **Every component is a _triple_ that must stay in sync and ship together:**
   - **Implementation** — headless core + per-framework adapters.
   - **Storybook story** — `docs-site/src/app/components/<slug>/<Name>.stories.tsx`.
   - **Docs-site page** — `docs-site/src/app/components/<slug>/page.tsx` (live
     examples + props table + install snippet).

   Never land one without the others; if you change a prop/variant, update all
   three in the same PR. The story/docs import the real adapter (re-exported by
   the meta), not a mock. **Then publish** — a component is unfinished until the
   changeset is landed and the meta is on npm, so the docs site and the npm
   package describe the same thing.

## Adding a component (short version)

1. Headless core `packages/<feature>` (`private: true`).
2. Adapters `packages/react-<feature>` / `packages/astro-<feature>`
   (`private: true`), mirroring an existing one.
3. Wire each adapter into its meta: add the `workspace:*` devDependency to
   `packages/<fw>-meta/package.json` **and** `export * from …` in
   `packages/<fw>-meta/src/index.ts`.
4. Build the metas to catch `export *` collisions.
5. Add the docs-site page + Storybook story (the triple) and the
   `react-<feature>` dep to `docs-site/package.json`.
6. Add a changeset bumping the affected metas; land it and merge the Version PR
   to publish.

## Build conventions (read before authoring a component)

`CLAUDE.md` → **"Component build playbook"** has the exact, hard-won rules. The
ones that bite every time:

- Headless core is JSX-free (logic + `cva` styles). `cva` variant values are
  **strings**; `defaultVariants` use `'false'`/`'true'`, never booleans.
- React props extending `HTMLAttributes` must **`Omit`** colliding DOM names
  (`onSelect`, `results`, `color`, `content`, `title`, `defaultValue`,
  `onChange`).
- Spread the core's ARIA object directly (`{...api.ariaProps}`), typed
  `Record<string, string | number | boolean>` — no `as AriaAttributes` cast.
- In SSR, render composed strings as a single template literal (`{`${a} ${b}`}`),
  not adjacent `{a} {b}`.
- No `Math.random()`/`Date.now()` in cores.
- React adapter tests are SSR `renderToString` (no jsdom) — they assert
  structure/ARIA, **not** interaction or visuals. Don't claim coverage you didn't
  write; add jsdom/Playwright when interaction is the point.
- Build via `turbo` (respects the dep graph); add the new
  `@refraction-ui/react-<feature>` to `docs-site/package.json` deps.

## Releasing & CI (read before merging)

Publishing is CI-only (Changesets → Version PR → OIDC). Key gating facts in
`CLAUDE.md` → "CI gating facts": only `commit-lint` is required; the
`validation`/`dependencies` **audit** step fails on a pre-existing esbuild
advisory and does **not** gate publishing (but confirm the validation **"Run CI"**
step is green); the `Release` workflow fires on **Test Matrix** success on `main`,
then a `chore: release packages` Version PR must be merged to publish. Flutter
publishes to pub.dev via the `flutter-publish` tag (golden tests excluded from
the gate).

## Before pushing

Run `make ci` (lint + typecheck + test + build). Use `stax` for git/dev
workflow, not raw `git`/`gh` (issue/PR skills excepted). See `CLAUDE.md` for the
full hard rules, the build playbook, the exact publishing flow, and
code-quality expectations.
