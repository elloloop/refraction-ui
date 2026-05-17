# @refraction-ui/react-form

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

- a41fd2f: Add `@refraction-ui/react-form` — opinionated wrappers around `react-hook-form` for consistent validation styling.

  Components: `Form` (alias of `FormProvider`), `FormField` (Controller wrapper), `FormItem`, `FormLabel`, `FormControl` (Slot that injects `id` / `aria-describedby` / `aria-invalid`), `FormDescription`, `FormMessage`. Plus the `useFormField()` hook for custom controls, and convenience re-exports of the most common RHF symbols (`useForm`, `Controller`, `useFormContext`, etc.).

  `react-hook-form` is an **optional peer dependency** (`>=7.43.0`). The `@refraction-ui/react` meta package adds the same optional peer so consumers who don't use the form helpers don't need to install it. A small inline `Slot` (~80 LOC) replaces the typical `@radix-ui/react-slot` dependency, keeping zero non-RHF runtime deps.
