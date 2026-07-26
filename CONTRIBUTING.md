# Contributing to Refraction UI

Thanks for helping. Please read this before you start.

## Quick start
1. Fork and clone.
2. `pnpm install`.
3. `pnpm build && pnpm test`.
4. Create a branch: `feat/dialog-aria-fix`.
5. Open a PR.

## Development
- Use pnpm workspaces and Turbo tasks.
- Run `pnpm dev` in packages you touch if available.
- Add tests for any fix or feature.

## Style rules
- TypeScript strict mode.
- Named exports only.
- ESLint must pass (formatting is `.editorconfig` enforced via ESLint; no Prettier).

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/). This is **required** — commit linting is enforced in CI.

```
feat(button): add loading state
fix(dialog): resolve focus trap on close
docs: update component creation guide
chore: update dependencies
refactor(theme): simplify token resolution
test(input): add aria label coverage
perf(sidebar): reduce re-renders
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`.

### How versioning works

Releases use [Changesets](https://github.com/changesets/changesets):

1. Include a changeset file (`.changeset/*.md`, via `pnpm changeset`) in your PR when you change a published package — the metas (`@refraction-ui/react`, `@refraction-ui/astro`) or `@refraction-ui/tailwind-config`. Choose the bump (`patch`/`minor`/`major`) that matches the change.
2. On merge, the Changesets Action opens/updates a **`chore: release packages` Version PR** that consumes the changesets, bumps versions, and writes CHANGELOGs.
3. Merging the Version PR publishes the non-private packages to npm `@latest` via GitHub-Actions **OIDC trusted publishing** (with provenance). Publishing is CI-only — never publish from a local machine.

The conventional-commit rules above are still required (commit-lint is enforced), but versions come from changeset files, not from commit messages.

### Releasing the Flutter package (`refraction_ui`)

The Flutter package is published to **pub.dev**, separately from the npm packages, via a tag-driven workflow. See [`packages/flutter/RELEASING.md`](packages/flutter/RELEASING.md) for the full procedure. TL;DR:

```sh
# bump packages/flutter/pubspec.yaml + CHANGELOG.md, merge to main, then:
git tag refraction_ui-v0.1.1
git push origin refraction_ui-v0.1.1
```

The `flutter-publish` workflow runs analyzer + tests + dry-run before doing the actual `dart pub publish`, gated by GitHub-OIDC trust on pub.dev.

## Pull requests

- PR titles must follow conventional commit format (enforced by CI).
- PR descriptions must be at least 20 characters.
- Fill out the PR template completely.
- Only `commit-lint` is a required CI check. The dependency-audit step is known-red on a pre-existing advisory and does not gate merging — but the validation **"Run CI"** step (lint + typecheck + test + build) should be green. See `CLAUDE.md` → "CI gating facts".

## Tests
- Unit: Vitest (headless cores, node env).
- React adapters: SSR `renderToString` tests asserting rendered structure + ARIA (no Testing Library).
- Accessibility: ARIA assertions in the adapter SSR tests.
- Visual: Playwright screenshot diffs + Lost Pixel (`lostpixel.config.ts`).

## Docs
- Update the docs-site page and story under `docs-site/src/app/components/<slug>/` (page + story + live examples) — keep the component triple in sync (see `CLAUDE.md`).
- If you add a new concept, consider an ADR.

## Opening issues
- Provide reproduction steps and versions.
- Mark if bug is accessibility or security related.

## Security
- Report vulnerabilities privately via [GitHub Security Advisories](https://github.com/elloloop/refraction-ui/security/advisories/new).
- Do **not** open public issues for security vulnerabilities.
