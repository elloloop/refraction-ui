# AI Agent Instructions

> **Authoritative source: [`CLAUDE.md`](./CLAUDE.md).** Read it before creating
> packages or releasing. This file only covers the pre-push workflow; the
> packaging/release rules below defer entirely to `CLAUDE.md`.

## Mandatory Pre-Push Workflow
Before pushing any commits to the remote repository, you **MUST** run the local CI pipeline:

1. Run `make ci` in the root directory.
2. If `make ci` fails, fix the errors, commit, and re-run until it passes.
3. **NEVER** push failing code to the remote repository.

## Packaging & Release — see CLAUDE.md

Earlier revisions of this file were **wrong** and caused repeated mistakes.
They are corrected and the rules now live in `CLAUDE.md`. In short:

- The **only** npm-published packages are the per-framework metas
  (`@refraction-ui/react|astro` from `packages/*-meta`) and
  `@refraction-ui/tailwind-config` — exactly three.
- **Every other `packages/*` is `private: true` and never published** —
  `@refraction-ui/shared` (embedded into the metas), all headless cores and
  all `react-*`/`astro-*` adapters. Angular support has been removed entirely.
- A new feature reaches consumers by wiring its adapter into the meta
  (`devDependencies` `workspace:*` + `export * from` in `*-meta/src/index.ts`),
  **not** by publishing the package itself.
- **Do NOT** `npm version`/`npm publish` individual packages, set feature
  packages public, or publish locally/with a token.
- Releases are **Changesets-driven**: changeset bumping the public meta
  packages → `chore: release packages` Version PR → merge → CI
  `publish-oidc.mjs` publishes via GitHub OIDC (provenance).
- Flutter (`packages/flutter`) publishes to **pub.dev** separately.

Full procedure and rationale: **[`CLAUDE.md`](./CLAUDE.md)**.
