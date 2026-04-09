---
id: PKG-REACT
track: packages
depends_on: ["TOKENS-SCHEMA", "COMP-API-CONTRACT"]
size: L
labels: [feat, infra]
status: superseded
---

## Summary

~~Create `@elloloop/react` package — the core React component library.~~

**SUPERSEDED** by the per-component headless architecture. See:

- **PKG-CORE** — headless architecture definition
- **PKG-SHARED** — shared types and utilities
- **PKG-REACT-META** — `@elloloop/react` is now a convenience meta-package that re-exports all `@elloloop/react-*` packages
- **PKG-ANGULAR-META** — Angular wrapper infrastructure
- **PKG-ASTRO-META** — Astro wrapper infrastructure

Each component is now its own package pair:
- `@elloloop/<component>` — headless core (pure TS)
- `@elloloop/react-<component>` — React wrapper
- `@elloloop/angular-<component>` — Angular wrapper
- `@elloloop/astro-<component>` — Astro wrapper
