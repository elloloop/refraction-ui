# Definition of Done (DoD) & Acceptance Checklists

Apply the relevant checklist to every PR. All boxes must be checked unless explicitly waived by a maintainer.

## 1. Components (React)

- [ ] API matches contract in `docs/contracts/component-api.md` (props, data attributes).
- [ ] No hard‑coded design values; all colors/spacing use CSS vars or tokens.
- [ ] Keyboard interaction follows WAI-ARIA Authoring Practices for the pattern.
- [ ] Axe-core tests: 0 violations in Storybook test-runner.
- [ ] Unit + interaction tests cover critical states (≥ 90% statements for the component).
- [ ] Storybook story with Controls and at least one accessibility example.
- [ ] MDX usage docs include props table, variants, and a11y notes.
- [ ] Bundle size check: component ≤ 6 KB gzipped (CI gate passes).
- [ ] Changeset added when public API or template changes.
- [ ] Template header comment includes correct version.

## 2. CLI Commands

- [ ] Spec aligns with `docs/contracts/cli-spec.md`.
- [ ] Works on fresh Next.js and Vite sample repos (integration test).
- [ ] Supports `--dry` and `--diff` flags.
- [ ] Writes only inside project root; respects config paths.
- [ ] Helpful error messages for common failures.
- [ ] Unit tests for logic; e2e tests for happy path and one failure path.
- [ ] Performance: common runs < 5 s cold on CI (measured once).
- [ ] Changeset added and docs updated.

## 3. Token Pipeline

- [ ] Input validated against JSON schema.
- [ ] `tokens build` outputs CSS vars and Tailwind fragment identical to spec.
- [ ] Theme + mode switch demo verified (runtime switch < 50 ms laptop).
- [ ] Tests for ref resolution (`{global.color.blue-500}` etc.).
- [ ] Schema changes reviewed as MAJOR unless purely additive.

## 4. MCP Tools

- [ ] Inputs/outputs validated by shared Zod/JSON schemas.
- [ ] Mirrors CLI behavior (no feature drift).
- [ ] File write operations sandboxed; dry-run supported.
- [ ] Tests simulate a tool call and assert resulting files/diffs.
- [ ] Docs updated with tool examples.

## 5. Docs & Site

- [ ] Guide pages build without errors.
- [ ] Copy-paste snippets compile as-is in a blank project.
- [ ] Props tables and example code are up to date.
- [ ] Accessibility notes present for every interactive component.
- [ ] Link checks pass.

## 6. General / Repo

- [ ] Lint, typecheck, tests, a11y checks all green on CI.
- [ ] Changesets version bump present where needed.
- [ ] ADR created if decision deviates from existing contracts.
