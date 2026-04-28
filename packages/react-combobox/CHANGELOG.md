# @refraction-ui/react-combobox

## 0.2.0

### Minor Changes

- a41fd2f: Add `@refraction-ui/react-combobox` — searchable select with keyboard navigation.

  Compound API: `Combobox`, `ComboboxTrigger`, `ComboboxContent`, `ComboboxInput`, `ComboboxList`, `ComboboxItem`, `ComboboxEmpty`. Supports controlled/uncontrolled value and open state, default case-insensitive substring filter (overridable via `filter` prop), arrow / Home / End keyboard navigation, ESC / Tab / click-outside dismiss, portal rendering, ARIA `combobox` / `listbox` / `option` roles with `aria-activedescendant`, and `data-state` / `data-highlighted` theming hooks.

  Implemented from scratch — no Radix, no Headless UI, no downshift — and shipped via the `@refraction-ui/react` meta package.
