---
"@refraction-ui/react-app-shell": minor
"@refraction-ui/react-carousel": minor
"@refraction-ui/react-radio": minor
"@refraction-ui/react-sheet": minor
"@refraction-ui/react-resizable-layout": minor
"@refraction-ui/react-mobile-nav": minor
"@refraction-ui/react-search-bar": minor
"@refraction-ui/react-language-selector": minor
"@refraction-ui/react-version-selector": minor
---

feat: dev-only devWarn at compound/context guards (Wave 1 footgun rollout, Batch 1D)

Adds an env-guarded, warn-once `devWarn` from `@refraction-ui/shared`
immediately before each existing compound/context `throw` in the
`compound-context-throw` footgun packages. The throw is unchanged; the
`devWarn` adds an actionable dev-only diagnostic with a stable, greppable
`code` per guard. Compiled out / silent in production. No new dependencies;
no telemetry-library dependency (per epic #254 / #256 policy).
