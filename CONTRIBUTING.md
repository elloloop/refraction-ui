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
- ESLint + Prettier must pass.

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

- Versions are determined **automatically** from conventional commits via [semantic-release](https://semantic-release.gitbook.io/).
- `fix:` commits trigger a **patch** bump (0.1.0 -> 0.1.1).
- `feat:` commits trigger a **minor** bump (0.1.0 -> 0.2.0).
- `feat!:` or `BREAKING CHANGE:` in the footer triggers a **major** bump (0.1.0 -> 1.0.0).
- No manual version bumps or changelogs needed — it's all automated.

### Release channels

- **`main` branch** publishes canary prereleases (`x.x.x-canary.N`) to npm `@canary` dist-tag.
- **`stable` branch** publishes stable releases to npm `@latest` dist-tag.

## Pull requests

- PR titles must follow conventional commit format (enforced by CI).
- PR descriptions must be at least 20 characters.
- Fill out the PR template completely.
- All CI checks (lint, test, build, security audit) must pass.

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
- Report vulnerabilities privately via [GitHub Security Advisories](https://github.com/elloloop/refraction-ui/security/advisories/new).
- Do **not** open public issues for security vulnerabilities.
