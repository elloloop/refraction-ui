---
"@refraction-ui/astro": patch
---

fix(astro): bundle transitive workspace dependencies in astro-meta to resolve missing core logic

- Updated custom build script for astro-meta to dynamically traverse and bundle all internal `@refraction-ui/*` dependencies (e.g. `app-shell`, `ai`, `auth`, `charts`) that are required by the Astro components.
- Ensures the single-package distribution is completely standalone and does not throw 404s when attempting to resolve internal core packages.
