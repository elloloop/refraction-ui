# @refraction-ui/react-dialog

## 0.2.0

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
  - @refraction-ui/dialog@0.1.6

## 0.1.5

### Patch Changes

- Updated dependencies [6319dc8]
  - @refraction-ui/shared@0.1.4
  - @refraction-ui/dialog@0.1.5

## 0.1.4

### Patch Changes

- f98992f: fix: update component configurations and dependencies
- Updated dependencies [f98992f]
  - @refraction-ui/dialog@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies [dabcbd6]
  - @refraction-ui/shared@0.1.3
  - @refraction-ui/dialog@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [c083c7d]
  - @refraction-ui/shared@0.1.2
  - @refraction-ui/dialog@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [30d38ee]
  - @refraction-ui/shared@0.1.1
  - @refraction-ui/dialog@0.1.1
