---
'@refraction-ui/react': patch
---

Importing anything from `@refraction-ui/react` no longer makes webpack / Next.js warn "Critical dependency: the request of a dependency is an expression". The optional analytics and telemetry SDKs are loaded with `import(/* webpackIgnore: true */ …)`, so bundlers leave those runtime-optional imports alone.
