# Contributing to Refraction UI

Thanks for helping. Please read this before you start.

## Quick start
1. Fork and clone.
2. `pnpm install`.
3. `pnpm build && pnpm test`.
4. Create a branch: `feat/dialog-aria-fix`.
5. Add a Changeset if you change a package: `pnpm changeset`.
6. Open a PR.

## Development
- Use pnpm workspaces and Turbo tasks.
- Run `pnpm dev` in packages you touch if available.
- Add tests for any fix or feature.

## Style rules
- TypeScript strict mode.
- Named exports only.
- ESLint + Prettier must pass.

## Commit messages
- Conventional Commits (`feat:`, `fix:`, `docs:` ...) recommended.
- Changesets control package version bumps.

## Tests
- Unit: Vitest + @testing-library.
- Accessibility: jest-axe or axe-playwright.
- Visual: Playwright or Chromatic snapshots.

## Docs
- Update MDX in `docs/` or component stories.
- If you add a new concept, consider an ADR.

## Opening issues
- Provide reproduction steps and versions.
- Mark if bug is accessibility or security related.

## Security
- Report vulnerabilities privately (email in README). Do not open public issues.

