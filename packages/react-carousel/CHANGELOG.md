# @refraction-ui/react-carousel

## 0.2.0

### Minor Changes

- a840321: feat: dev-only devWarn at compound/context guards (Wave 1 footgun rollout, Batch 1D)

  Adds an env-guarded, warn-once `devWarn` from `@refraction-ui/shared`
  immediately before each existing compound/context `throw` in the
  `compound-context-throw` footgun packages. The throw is unchanged; the
  `devWarn` adds an actionable dev-only diagnostic with a stable, greppable
  `code` per guard. Compiled out / silent in production. No new dependencies;
  no telemetry-library dependency (per epic #254 / #256 policy).

### Patch Changes

- Updated dependencies [cf1d82e]
- Updated dependencies [bfeeb83]
  - @refraction-ui/shared@0.2.0
  - @refraction-ui/carousel@0.1.5

## 0.1.4

### Patch Changes

- Updated dependencies [6319dc8]
  - @refraction-ui/shared@0.1.4
  - @refraction-ui/carousel@0.1.4

## 0.1.3

### Patch Changes

- f98992f: fix: update component configurations and dependencies
- Updated dependencies [f98992f]
  - @refraction-ui/carousel@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [dabcbd6]
  - @refraction-ui/shared@0.1.3
  - @refraction-ui/carousel@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [f7c05bb]
- Updated dependencies [c083c7d]
  - @refraction-ui/carousel@0.1.1
  - @refraction-ui/shared@0.1.2
