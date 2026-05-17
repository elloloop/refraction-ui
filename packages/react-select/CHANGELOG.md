# @refraction-ui/react-select

## 0.2.0

### Minor Changes

- 06b6cbf: feat: dev-only `devWarn` on the silent-default-context footgun (epic #254 Wave 1, #256 Batch 1B)

  `react-charts` sub-charts (`Bars`/`Line`/`Circles`) and `react-select` compound parts (`SelectTrigger`/`SelectContent`/`SelectItem`) previously fell back to a context default with **no error and no signal** when used outside `<Chart>` / `<Select>` (the worst footgun tier per `docs/instrumentation/policy.md`). They now emit a warn-once `devWarn` from `@refraction-ui/shared` at the context-consumption seam.

  Non-breaking by design: no throw is introduced (would be a breaking change for a silent-default context), runtime behaviour is unchanged, and the `devWarn` is env-guarded so it is stripped/silent in production.

### Patch Changes

- Updated dependencies [cf1d82e]
- Updated dependencies [bfeeb83]
  - @refraction-ui/shared@0.2.0
  - @refraction-ui/select@0.1.7

## 0.1.6

### Patch Changes

- Updated dependencies [6319dc8]
  - @refraction-ui/shared@0.1.4
  - @refraction-ui/select@0.1.6

## 0.1.5

### Patch Changes

- 9f20845: fix(select): add missing keyboard navigation and hover styles

  - Added `hover:bg-accent` to `selectItemVariants` so options display visual feedback when hovered.
  - Implemented full keyboard navigation (`ArrowUp`, `ArrowDown`) within `SelectContent` for both React and Astro components.
  - Added automatic focus trap/return so focus correctly returns to the trigger when the dropdown is closed via `Escape` or by making a selection.

- fix: trigger fresh release for select component fixes

  - Fixed select keyboard navigation and hover styles that were missed in the previous force-pushed release.

- Updated dependencies [9f20845]
- Updated dependencies
  - @refraction-ui/select@0.1.5

## 0.1.4

### Patch Changes

- f98992f: fix: update component configurations and dependencies
- Updated dependencies [f98992f]
  - @refraction-ui/select@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies [dabcbd6]
  - @refraction-ui/shared@0.1.3
  - @refraction-ui/select@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [c083c7d]
  - @refraction-ui/shared@0.1.2
  - @refraction-ui/select@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [30d38ee]
  - @refraction-ui/shared@0.1.1
  - @refraction-ui/select@0.1.1
