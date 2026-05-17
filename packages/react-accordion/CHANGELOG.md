# @refraction-ui/react-accordion

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
  - @refraction-ui/accordion@0.1.5

## 0.1.4

### Patch Changes

- Updated dependencies [6319dc8]
  - @refraction-ui/shared@0.1.4
  - @refraction-ui/accordion@0.1.4

## 0.1.3

### Patch Changes

- f98992f: fix: update component configurations and dependencies
- Updated dependencies [f98992f]
  - @refraction-ui/accordion@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [dabcbd6]
  - @refraction-ui/shared@0.1.3
  - @refraction-ui/accordion@0.1.2

## 0.1.1

### Patch Changes

- 89882b5: feat: add accordion component
- 6f4b3cd: fix: add trailingSlash to next config to fix Next.js 404 issue on GitHub Pages
  feat: implement Accordion interactive examples
- Updated dependencies [89882b5]
- Updated dependencies [c083c7d]
  - @refraction-ui/accordion@0.1.1
  - @refraction-ui/shared@0.1.2
