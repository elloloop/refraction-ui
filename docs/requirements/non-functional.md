# Non functional requirements (NFRs)

## Performance
- Bundle size: each React component bundle (JS + CSS) ≤ 6 KB gzipped; core runtime (react package without templates) ≤ 45 KB gzipped.
- Tree shaking: all packages are ESM, side‑effect free where possible.
- Runtime theme or mode switch must apply in <50 ms on a mid‑range laptop and <100 ms on mobile.
- CLI common tasks (`init`, `add`) finish in <5 s on a cold run (no network cache).
- Token build (`tokens build`) completes in <2 s for 5k tokens.

## Theming
- Support ≥ 2 first‑party themes out of the box.
- **Every theme must include at least `light` and `dark` modes.**
- Adding/switching theme or mode requires no rebuild; only CSS var swap.
- Theme packs can be loaded at runtime (lazy chunk) and registered without restart.

## Accessibility
- Target WCAG 2.1 AA for all interactive components.
- axe-core CI checks: zero violations allowed in strict mode.
- Full keyboard support (tab/shift-tab, escape, arrows) across components.
- Screen reader roles, labels and aria-* attributes validated with Testing Library queries.

## Reliability & Quality
- Test coverage: 80% lines overall, 100% on critical paths (token pipeline, CLI file writes, engine adapters).
- Visual regression tests on core components via Playwright/Chromatic.
- CI runs: lint, typecheck, unit, a11y and visual tests on every PR; must be green to merge.

## Security
- CLI write operations constrained to project root. Always offer `--dry` for destructive ops.
- No uncontrolled shell execution inside generators/MCP tools.
- MCP server sandbox: allowlist of file paths and commands; no network by default.

## Compatibility
- React 18+, Node 18+.
- Tailwind 3.4+ by default (plugin optional).
- Type definitions for TS 5+.
- Future renderer targets: Svelte 4+, Vue 3+, Angular 17+ (not required for v0.1).

## Maintainability
- Strict TypeScript config (`noImplicitAny`, `strictNullChecks`, etc.).
- Changesets for package versioning; every API change must include a changeset.
- ADR required for breaking changes or new core concepts.

## Developer Experience
- All CLI commands support `--dry`, `--diff`, and `--verbose`.
- Error messages are human-readable and suggest fixes.
- Docs examples are runnable and included in CI to prevent rot.

## Observability
- Optional debug logs enabled with `DEBUG=refraction:*`.
- CLI telemetry is opt-in and anonymous; clearly documented and can be disabled.
