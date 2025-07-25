# Refraction UI Architecture

## Goals

- Shadcn-like DX: source files, Tailwind, copy‑paste friendly.
- Radix-compatible surface, but engine-swappable.
- **Multiple named themes (“brands”) are first-class.**
- **Each theme must provide at least light and dark modes with runtime switching.**
- Token-first theming with live switching and external token imports.
- CLI and MCP server to automate generation, upgrades and a11y checks.
- Framework path: React now, Svelte/Vue/Angular later via shared core logic.

## Non-goals (for v0)

- Full design tool sync beyond token import.
- Complex visual builders.
- Perfect parity with every Radix component on day 1.

## High-level picture

- `packages/`
  - `tokens-core`: token schema, loaders, CSS var emitter, Tailwind helpers.
  - `react`: headless primitives + styled wrappers.
  - `engines/`: adapters (radix, headlessui, etc).
  - `cli`: generator, patchers, a11y runner.
  - `mcp-server`: JSON-RPC tools wrapping the CLI core.
- `templates/`: component and flow blueprints per framework.
- `docs/`: this folder.
- `issues/`: markdown issue specs with deps.

**Data flow**  
`refraction-tokens.json` → tokens-core builds CSS vars → components consume CSS vars → CLI writes source files → MCP exposes the same generators to IDEs or LLMs.

## Build and test

- pnpm workspaces + Turbo.
- TSUP or Vite builds.
- Vitest + Testing Library + axe-core.
- Playwright for interaction.
- Storybook or Ladle for visual docs.

## Accessibility

- axe-core checks in CI.
- Dev overlay for manual checks.
- ESLint preset for JSX a11y patterns.

## Extensibility

- New engines implement the EngineAdapter contract.
- New frameworks use the core logic package and their own renderer.
- Templates are versioned to support upgrades.
