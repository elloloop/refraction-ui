# @refraction-ui/react-app-shell

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
  - @refraction-ui/app-shell@0.1.7

## 0.1.7

### Patch Changes

- a41fd2f: Eliminate internal `Card2` / `STATUS_COLORS2` / `progressBarVariants2` / `optionVariants2` symbols from the `@refraction-ui/react` bundled output.

  When esbuild bundled the meta package, it had to disambiguate two top-level symbols with the same name across subpackages — even though the public export map already aliased them — so it appended digits to the local. Public APIs were unaffected, but the artifact was visible to anyone reading the dist.

  Renamed the underlying internal locals so they no longer collide:

  - `react-app-shell`: internal `Card` helper → `AuthShellCard` (the `<AuthShell.Card>` compound API is unchanged).
  - `status-indicator`: internal `STATUS_COLORS` / `STATUS_LABELS` → `STATUS_INDICATOR_COLORS` / `STATUS_INDICATOR_LABELS`, re-exported under their original names.
  - `slide-viewer`: internal `progressBarVariants` → `slideViewerProgressBarVariants`, re-exported as `progressBarVariants`.
  - `version-selector`: internal `optionVariants` → `versionSelectorOptionVariants`, re-exported as `optionVariants`.

  No public API change for any consumer; this is a pure bundle-hygiene patch.

## 0.1.6

### Patch Changes

- Updated dependencies [6319dc8]
  - @refraction-ui/shared@0.1.4
  - @refraction-ui/app-shell@0.1.6

## 0.1.5

### Patch Changes

- Updated dependencies [83cf3d8]
  - @refraction-ui/app-shell@0.1.5

## 0.1.4

### Patch Changes

- f98992f: fix: update component configurations and dependencies
- Updated dependencies [f98992f]
  - @refraction-ui/app-shell@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies [dabcbd6]
  - @refraction-ui/shared@0.1.3
  - @refraction-ui/app-shell@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [c083c7d]
  - @refraction-ui/shared@0.1.2
  - @refraction-ui/app-shell@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [30d38ee]
  - @refraction-ui/shared@0.1.1
  - @refraction-ui/app-shell@0.1.1
