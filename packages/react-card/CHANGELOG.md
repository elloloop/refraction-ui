# @refraction-ui/react-card

## 0.2.0

### Minor Changes

- cf18f7e: Add semantic-role token vocabulary (issue #485, React half)

  Additive, non-breaking. Every new token defaults from an existing one, so
  existing palettes and components keep their exact look.

  New CSS custom properties (light + dark, across all six themes):

  - Brand depth: `--primary-hover`, `--primary-active`, `--primary-soft`,
    `--primary-soft-foreground`, plus a `--primary-gradient` convention built
    from `--primary` → `--primary-active`.
  - Second brand accent: `--tertiary`, `--tertiary-foreground`,
    `--tertiary-soft`, `--tertiary-soft-foreground`.
  - Ink / surface: `--placeholder`, `--surface-subtle`, `--border-subtle`.
  - Extended status: `--positive`, `--positive-foreground`, `--caution`,
    `--caution-foreground`, `--done`.
  - Shape roles: `--radius-pill` (9999px) and `--radius-sheet`.

  Wired into Tailwind (`bg-tertiary`, `bg-primary-soft`, `bg-surface-subtle`,
  `border-border-subtle`, `bg-primary-gradient`, `rounded-pill`, `rounded-sheet`,
  …) and into components as new variants: Button (`soft`, `tertiary`), Badge
  (`tertiary`, `positive`, `caution`, `done`), Card (`subtle`, `tertiary` tones),
  and Separator (`tone="subtle"` hairline).

### Patch Changes

- Updated dependencies [cf18f7e]
  - @refraction-ui/card@0.2.0

## 0.1.6

### Patch Changes

- Updated dependencies [cf1d82e]
- Updated dependencies [bfeeb83]
  - @refraction-ui/shared@0.2.0
  - @refraction-ui/card@0.1.6

## 0.1.5

### Patch Changes

- Updated dependencies [6319dc8]
  - @refraction-ui/shared@0.1.4
  - @refraction-ui/card@0.1.5

## 0.1.4

### Patch Changes

- f98992f: fix: update component configurations and dependencies
- Updated dependencies [f98992f]
  - @refraction-ui/card@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies [dabcbd6]
  - @refraction-ui/shared@0.1.3
  - @refraction-ui/card@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [c083c7d]
  - @refraction-ui/shared@0.1.2
  - @refraction-ui/card@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [30d38ee]
  - @refraction-ui/shared@0.1.1
  - @refraction-ui/card@0.1.1
