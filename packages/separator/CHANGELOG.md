# @refraction-ui/separator

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
