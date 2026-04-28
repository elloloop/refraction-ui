# @refraction-ui/react

## 0.4.0

### Minor Changes

- a41fd2f: Add `@refraction-ui/react-combobox` — searchable select with keyboard navigation.

  Compound API: `Combobox`, `ComboboxTrigger`, `ComboboxContent`, `ComboboxInput`, `ComboboxList`, `ComboboxItem`, `ComboboxEmpty`. Supports controlled/uncontrolled value and open state, default case-insensitive substring filter (overridable via `filter` prop), arrow / Home / End keyboard navigation, ESC / Tab / click-outside dismiss, portal rendering, ARIA `combobox` / `listbox` / `option` roles with `aria-activedescendant`, and `data-state` / `data-highlighted` theming hooks.

  Implemented from scratch — no Radix, no Headless UI, no downshift — and shipped via the `@refraction-ui/react` meta package.

- a41fd2f: Add `@refraction-ui/react-form` — opinionated wrappers around `react-hook-form` for consistent validation styling.

  Components: `Form` (alias of `FormProvider`), `FormField` (Controller wrapper), `FormItem`, `FormLabel`, `FormControl` (Slot that injects `id` / `aria-describedby` / `aria-invalid`), `FormDescription`, `FormMessage`. Plus the `useFormField()` hook for custom controls, and convenience re-exports of the most common RHF symbols (`useForm`, `Controller`, `useFormContext`, etc.).

  `react-hook-form` is an **optional peer dependency** (`>=7.43.0`). The `@refraction-ui/react` meta package adds the same optional peer so consumers who don't use the form helpers don't need to install it. A small inline `Slot` (~80 LOC) replaces the typical `@radix-ui/react-slot` dependency, keeping zero non-RHF runtime deps.

- a41fd2f: Add `@refraction-ui/react-sheet` — a transient slide-in panel primitive (Sheet / Drawer).

  Distinct from `@refraction-ui/react-sidebar` (persistent navigation), Sheet is for mobile nav, share menus, and side-modals. Symmetric API to `Dialog`: compound components (`Sheet`, `SheetTrigger`, `SheetOverlay`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose`), controlled/uncontrolled `open`, `onOpenChange`, focus trap, ESC-to-close, click-outside, focus restoration. Adds a `side` prop (`'top' | 'right' | 'bottom' | 'left'`, default `'right'`).

  Implemented from scratch — no Radix or Headless UI dependency. Re-exported from the `@refraction-ui/react` meta package.

- a41fd2f: Ship a default `styles.css` bundle for opt-in consumers.

  `@refraction-ui/react` is fully headless — every component reads CSS custom properties from `:root`. Consumers who didn't already define ~18 tokens (background, foreground, primary, border, radius, shadows, etc.) had to set them up before components looked right.

  You can now opt in with a single import:

  ```ts
  import "@refraction-ui/react/styles.css";
  ```

  This stylesheet defines 177 tokens grouped by colors, charts, sidebar, shape, typography, shadows, glass/overlay, spacing, layout, borders, behavior, selection, and motion — sourced from the canonical `refractionTheme` (formerly `glassaTheme`) at `packages/tailwind-config/src/themes/glassa.ts`. Dark mode covers both `.dark` and `[data-theme="dark"]` selectors so it works regardless of how `ThemeProvider` is configured.

  The import is fully opt-in — consumers who already define their own tokens (e.g. via Tailwind config or app `globals.css`) should not import it and will see no change in behavior. Override any individual token by redefining it in your own stylesheet after this one.

- a41fd2f: Ship TypeScript declaration files (`.d.ts` / `.d.cts`).

  Previously the meta package was published with `dts: false` because of historical export-name conflicts. Those conflicts have already been resolved via renamed re-exports (`progressBarVariants` / `optionVariants` / `STATUS_COLORS` / `STATUS_LABELS` / etc.), so DTS generation has now been enabled. Consumers using `@refraction-ui/react` no longer need a manual ambient shim and will get full IntelliSense and type-checking.

- a41fd2f: **Breaking change:** `ThemeProvider`, `ThemeToggle`, `useTheme`, `ThemeScript`, and theme types are no longer exported from the main entry of `@refraction-ui/react`. They've moved to an opt-in subpath so they don't clash with consumers' existing theme systems (e.g. `next-themes`).

  Migration:

  ```diff
  - import { ThemeProvider, useTheme } from '@refraction-ui/react'
  + import { ThemeProvider, useTheme } from '@refraction-ui/react/theme'
  ```

  `@refraction-ui/react-theme` is unaffected — if you import directly from there, no change is needed.

  (This is technically a breaking change but is being shipped as a `minor` per `0.x` semver convention.)

### Patch Changes

- a41fd2f: Eliminate internal `Card2` / `STATUS_COLORS2` / `progressBarVariants2` / `optionVariants2` symbols from the `@refraction-ui/react` bundled output.

  When esbuild bundled the meta package, it had to disambiguate two top-level symbols with the same name across subpackages — even though the public export map already aliased them — so it appended digits to the local. Public APIs were unaffected, but the artifact was visible to anyone reading the dist.

  Renamed the underlying internal locals so they no longer collide:

  - `react-app-shell`: internal `Card` helper → `AuthShellCard` (the `<AuthShell.Card>` compound API is unchanged).
  - `status-indicator`: internal `STATUS_COLORS` / `STATUS_LABELS` → `STATUS_INDICATOR_COLORS` / `STATUS_INDICATOR_LABELS`, re-exported under their original names.
  - `slide-viewer`: internal `progressBarVariants` → `slideViewerProgressBarVariants`, re-exported as `progressBarVariants`.
  - `version-selector`: internal `optionVariants` → `versionSelectorOptionVariants`, re-exported as `optionVariants`.

  No public API change for any consumer; this is a pure bundle-hygiene patch.

## 0.3.6

### Patch Changes

- 6319dc8: Trigger full publish cycle to synchronize npm latest tag

## 0.3.5

### Patch Changes

- 96260fb: feat(keyboard-shortcut): introduce global Alt-to-reveal shortcut system

  - Added global `AltHintState` and `SANE_DEFAULTS` to the core `keyboard-shortcut` package.
  - Created `ShortcutProvider`, `useShortcut` hook, and `ShortcutHint` component in `react-keyboard-shortcut`.
  - Integrated `ShortcutHint` and `useShortcut` into `react-button`.
  - Updated `docs-site` to use the global `ShortcutProvider`.

## 0.3.4

### Patch Changes

- fix: trigger fresh release for select component fixes

  - Fixed select keyboard navigation and hover styles that were missed in the previous force-pushed release.

## 0.3.3

### Patch Changes

- fix: direct version bump to bypass canary tag and publish to latest

## 0.3.2

### Patch Changes

- d6c99d0: fix: force version bump to resolve npm registry canary conflict

## 0.3.1

### Patch Changes

- a1bbf02: fix: move all internal workspace package references to devDependencies to prevent EUNSUPPORTEDPROTOCOL during npm install of meta-packages

## 0.3.0

### Minor Changes

- 29a896e: feat(command-input): add robust headless rich text command input primitive (like Slack/ChatGPT) for complex mentions and slashed commands
- 29a896e: feat: add robust HTTP wrapper client with auth interceptors and type safety
  feat: add location-selector component featuring independent, autocomplete-enabled Country and Language selection dropdowns (powered by core i18n logic)

### Patch Changes

- Updated dependencies [29a896e]
- Updated dependencies [29a896e]
  - @refraction-ui/react-command-input@1.0.1
  - @refraction-ui/react-payment@0.3.0

## 0.2.1

### Patch Changes

- dabcbd6: chore: force release to update latest npm tags
  - @refraction-ui/react-callout@0.1.2
  - @refraction-ui/react-card-grid@0.1.2
  - @refraction-ui/react-carousel@0.1.2
  - @refraction-ui/react-code-block@0.1.2
  - @refraction-ui/react-link-card@0.1.2
  - @refraction-ui/react-pagination@0.1.2
  - @refraction-ui/react-payment@0.2.1
  - @refraction-ui/react-skip-to-content@0.1.2
  - @refraction-ui/react-slider@0.1.2
  - @refraction-ui/react-steps@0.1.2
  - @refraction-ui/react-table-of-contents@0.1.2

## 0.2.0

### Minor Changes

- f7c05bb: feat: Massive multi-framework expansion! Added Table of Contents, Carousel, Slider, and Pagination components across React, Astro, Angular, and Vue. Updated all documentation pages to natively display code tabs for every supported framework. Implemented Design Tokens Zod Schema and EngineAdapter interface with a proof-of-concept Radix Dialog wrapper.
- 871b0cc: feat: add payment component wrapper for Stripe integration
- b6293a6: feat: add remaining requested components (Callout, Steps, FileTree, Icon System, SkipToContent, CodeBlock, LinkCard, CardGrid) across all supported frameworks

### Patch Changes

- 89882b5: feat: add accordion component
- ec93176: chore: verify automated canary publish from GitHub Actions
- 33d3a5e: fix: resolve horizontal scrollbar/overflow issues on mobile viewports for DataTable, Tabs, and Breadcrumbs components
- 6f4b3cd: fix: add trailingSlash to next config to fix Next.js 404 issue on GitHub Pages
  feat: implement Accordion interactive examples
- c083c7d: docs: update readme to reflect supported and planned frameworks and trigger a final release test
- 4bd4185: chore: final verification of per-package OIDC publishing logic
- Updated dependencies [8a746a4]
- Updated dependencies [ecacee5]
  - @refraction-ui/react-payment@0.2.0
  - @refraction-ui/react-table-of-contents@0.1.1
  - @refraction-ui/react-carousel@0.1.1
  - @refraction-ui/react-slider@0.1.1
  - @refraction-ui/react-pagination@0.1.1
  - @refraction-ui/react-callout@0.1.1
  - @refraction-ui/react-steps@0.1.1
  - @refraction-ui/react-skip-to-content@0.1.1
  - @refraction-ui/react-code-block@0.1.1
  - @refraction-ui/react-link-card@0.1.1
  - @refraction-ui/react-card-grid@0.1.1

## 0.1.2

### Patch Changes

- 30d38ee: chore: test new changesets + oidc release workflow
