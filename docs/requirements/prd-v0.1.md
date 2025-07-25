# Refraction UI – PRD v0.1

## 1. Vision
Refraction UI gives teams a shadcn-like, source-first UI kit that is theming-first and engine-swappable. Developers install or generate components, flows and tokens through a CLI or an MCP server. v0.1 delivers the smallest coherent slice.

## 2. Users and jobs
**Users**
- Frontend engineers already using shadcn or Radix.
- Design system engineers who need multiple brand themes.
- LLM/IDE power users who want generators via MCP.

**Jobs to be done**
1. Bootstrap a project with themed components fast.
2. Add or upgrade a component without losing local edits.
3. Import design tokens and switch themes (light/dark) at runtime.
4. Check accessibility quickly in dev and CI.

## 3. In scope (v0.1)

### 3.1 Theming and tokens
- Multiple named themes (at least `default` and `acme-demo`), each with light and dark modes.
- Token schema: global, semantic, component levels in `refraction-tokens.json`.
- Runtime switcher: `<ThemeProvider />`, `useTheme()`, persistence via localStorage, SSR safe default.
- Build step: CSS vars and Tailwind plugin fragment.

### 3.2 React components (headless + styled)
Minimum set (8):
1. Button
2. Input (text, password)
3. Dialog (modal)
4. Popover
5. Dropdown Menu
6. Tabs
7. Tooltip
8. Toast

Each ships with:
- Headless primitive API (Radix-like props, data-state attrs).
- Styled wrapper using tokens and class-variance-authority style variants.
- Tests (unit + interaction) and Storybook story.
- Axe pass.

### 3.3 CLI (`refraction-ui`)
Commands:
- `init`
- `add <component...>`
- `remove <component>`
- `upgrade <component|all>`
- `tokens import <file>`
- `tokens build`
- `a11y [pattern]`
- `doctor`

Flags: `--dry`, `--diff`, `--framework`, `--engine`, `--strict`.

Config: `.refractionrc.(json|ts)` (paths, default engine, tokens path).

### 3.4 MCP server
Tools:
- `generate_component`
- `scaffold_flow` (auth only)
- `convert_tokens`
- `a11y_check`
- `upgrade_component`
- `docs_lookup`

Transport: JSON-RPC over stdio and WebSocket. File ops sandboxed to project root.

### 3.5 Accessibility tooling
- CLI `a11y` command using axe-core.
- Dev overlay component that highlights failures (basic).

### 3.6 Docs and examples
- Docs site (Storybook 8 for playground + Nextra/Docusaurus for guides).
- Interactive token playground (textarea JSON -> live CSS vars).
- Example Next.js starter repo.

### 3.7 Policies and governance
- Versioning and upgrade policy.
- Contribution guide and Code of Conduct.
- Non functional requirements enforced in CI.

## 4. Out of scope
- Svelte, Vue, Angular renderers (later).
- Full Radix parity beyond listed components.
- Visual builders.
- Design tool plugins.
- Complex flows beyond auth.
- Server-driven theme negotiation.

## 5. Functional requirements (detail)

### Tokens
- FR-T1: `tokens import` accepts Style Dictionary and Figma Tokens JSON.
- FR-T2: `tokens build` outputs `/styles/tokens.css` and Tailwind fragment.
- FR-T3: Theme + mode switch < 50 ms on laptop, < 100 ms on mobile.

### Components
- FR-C1: Expose `data-state` and `data-disabled` attrs.
- FR-C2: No hardcoded colors. Use CSS vars only.
- FR-C3: Keyboard navigation per WAI-ARIA APG.

### CLI
- FR-CLI1: `init` detects Next or Vite and patches Tailwind config and globals.
- FR-CLI2: `add` writes files to `components/ui` and updates imports.
- FR-CLI3: `upgrade` reads header version comment and does a three way diff.
- FR-CLI4: All commands support `--dry` and `--diff`.

### MCP
- FR-MCP1: Tool outputs match CLI behavior.
- FR-MCP2: Inputs and outputs validated by shared Zod schemas.

### Accessibility
- FR-A11Y1: `a11y` fails CI when violations > 0 in strict mode.
- FR-A11Y2: Overlay shows rule id and link.

### Docs
- FR-D1: Copy-paste snippets compile as-is.
- FR-D2: Each component page lists props, variants, a11y notes.

## 6. Non functional requirements (summary)
See `docs/requirements/non-functional.md`. Key: bundle budgets, axe zero violations, CLI init < 5 s cold, 80%+ coverage, strict TS.

## 7. Success metrics
- Setup to themed project in under 1 hour.
- 8 core components passing tests.
- 0 a11y violations in example app.
- ≥ 3 external contributor PRs in first month.
- Bundle budgets met in CI.

## 8. Risks and cut lines
- LLM code drift. Mitigation: contract tests and lint rules.
- Diff/upgrade pain. Mitigation: template headers, diff3, clear docs.
- Cut order if late: 1) overlay UI 2) Toast component 3) MCP scaffold_flow.

## 9. Dependencies and constraints
- Node 18+, React 18+, Tailwind 3.4+.
- pnpm + Turbo.
- Storybook 8 or Ladle alternative later.

## 10. Milestones (suggested)
- M0 Docs freeze
- M1 Tokens + theming
- M2 Components
- M3 CLI
- M4 MCP
- M5 Docs + example
- M6 Beta (v0.1)

## 11. Definition of done (summary)
- Code, tests, stories, docs, axe pass, bundle check, changeset.
- CLI/MCP integration test on blank Next/Vite app.
Detailed list in `docs/checklists/dod.md`.

## 12. Open questions
- Story tool final choice? (Storybook picked, revisit if heavy)
- Template distribution: npm vs git tag
Track in `docs/open-questions.md`.
