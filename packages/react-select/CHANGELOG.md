# @refraction-ui/react-select

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
