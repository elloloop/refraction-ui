---
'@refraction-ui/react': patch
---

Fix tree-shaking of the published meta package. Previously `import { Button } from '@refraction-ui/react'` bundled the entire library (494 kB minified) because tsup collapsed all ~128 adapters into a single `dist/index.js`, anchoring every component behind impure module-scope statements.

Two changes fix it:

1. All 249 top-level `X.displayName = '…'` assignment side effects in the react adapters are gone. `forwardRef` arrow bodies are now named function expressions (`React.forwardRef(function Foo(props, ref) { … })`) and components whose binding name already matched simply dropped the line, so React DevTools keeps showing the same component names without the impure assignments.
2. The meta's ESM build is now emitted as one module per adapter (plus shared chunks) with `dist/index.js` reduced to pure re-export statements, so consumer bundlers can drop unused component modules at module granularity (`sideEffects: false`). The CJS build and the published export surface are unchanged.

Importing a single component now bundles ~8 kB instead of 494 kB.
