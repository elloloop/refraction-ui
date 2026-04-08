---
id: PKG-REACT
track: packages
depends_on: ["TOKENS-SCHEMA", "COMP-API-CONTRACT"]
size: L
labels: [feat, infra]
status: superseded
---

## Summary

~~Create `@refraction-ui/react` package — the core React component library.~~

**SUPERSEDED** by the per-component headless architecture. See:

- **PKG-CORE** — headless architecture definition
- **PKG-SHARED** — shared types and utilities
- **PKG-REACT-META** — `@refraction-ui/react` is now a convenience meta-package that re-exports all `@refraction-ui/react-*` packages
- **PKG-ANGULAR-META** — Angular wrapper infrastructure
- **PKG-ASTRO-META** — Astro wrapper infrastructure

Each component is now its own package pair:
- `@refraction-ui/<component>` — headless core (pure TS)
- `@refraction-ui/react-<component>` — React wrapper
- `@refraction-ui/angular-<component>` — Angular wrapper
- `@refraction-ui/astro-<component>` — Astro wrapper
