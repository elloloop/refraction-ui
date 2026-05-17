# @refraction-ui/react-combobox

## 0.3.0

### Minor Changes

- 0fb7be1: feat: add dev-only `devWarn` at compound-context misuse seams (epic #254 Wave 1, issue #256, batch 1C)

  Adds a warn-once, env-guarded `devWarn` from `@refraction-ui/shared` immediately
  before each existing compound-component context guard `throw` in the high-traffic
  compound-context-throw footgun primitives (Dialog, Tabs, Popover, Tooltip,
  DropdownMenu, Command, Combobox, Form, Accordion, Collapsible). The existing
  `throw` is preserved unchanged — `devWarn` augments it with an actionable,
  greppable message and is fully stripped in production. Per the instrumentation
  policy this is the footgun minority only; no blanket logging, no new deps.

### Patch Changes

- Updated dependencies [cf1d82e]
- Updated dependencies [bfeeb83]
  - @refraction-ui/shared@0.2.0

## 0.2.0

### Minor Changes

- a41fd2f: Add `@refraction-ui/react-combobox` — searchable select with keyboard navigation.

  Compound API: `Combobox`, `ComboboxTrigger`, `ComboboxContent`, `ComboboxInput`, `ComboboxList`, `ComboboxItem`, `ComboboxEmpty`. Supports controlled/uncontrolled value and open state, default case-insensitive substring filter (overridable via `filter` prop), arrow / Home / End keyboard navigation, ESC / Tab / click-outside dismiss, portal rendering, ARIA `combobox` / `listbox` / `option` roles with `aria-activedescendant`, and `data-state` / `data-highlighted` theming hooks.

  Implemented from scratch — no Radix, no Headless UI, no downshift — and shipped via the `@refraction-ui/react` meta package.
