---
id: PKG-CORE
track: architecture
depends_on: ["TOKENS-SCHEMA", "COMP-API-CONTRACT", "ENGINE-ADAPTER-IFACE"]
size: XL
labels: [feat, infra, architecture]
status: pending
---

## Summary

Define and implement the **headless core architecture** — every refraction-ui component ships as a framework-agnostic TypeScript package (`@refraction-ui/<component>`) containing state machines, ARIA computation, keyboard interaction, and validation. Framework wrappers (React, Angular, Astro) are thin adapter packages that bind the core to each framework's reactivity system.

## Architecture

```
User installs:     @refraction-ui/react-button
Which depends on:  @refraction-ui/button (headless core)

                    ┌─────────────────────────┐
                    │   @refraction-ui/button  │  ← headless core
                    │   (pure TypeScript)       │
                    │                           │
                    │  • State machine          │
                    │  • ARIA attribute map      │
                    │  • Keyboard handlers       │
                    │  • CSS contract (tokens)   │
                    │  • Prop types / validation │
                    └──────────┬────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
   ┌──────────▼──────┐ ┌──────▼────────┐ ┌─────▼──────────┐
   │ react-button    │ │ angular-button│ │ astro-button   │
   │ (React hooks +  │ │ (Signals +   │ │ (Astro component│
   │  JSX wrapper)   │ │  template)   │ │  + islands)    │
   └─────────────────┘ └──────────────┘ └────────────────┘
```

## Headless Core Contract

Every `@refraction-ui/<component>` package exports:

```typescript
// @refraction-ui/button

// 1. State machine / logic
export interface ButtonState { ... }
export interface ButtonProps { ... }
export function createButton(props: ButtonProps): ButtonAPI

// 2. ARIA attributes
export function getButtonAriaProps(state: ButtonState): Record<string, string>

// 3. Keyboard handlers
export function getButtonKeyboardHandlers(state: ButtonState): KeyboardHandlerMap

// 4. CSS token contract
export const buttonTokens: TokenContract  // what CSS custom properties this component reads

// 5. Types
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'xs' | 'sm' | 'default' | 'lg' | 'icon'
```

## Framework Wrapper Contract

Every `@refraction-ui/react-<component>` package exports:

```tsx
// @refraction-ui/react-button
import { createButton, type ButtonProps } from '@refraction-ui/button'

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const api = createButton(props)
  // Bind state machine to React hooks
  // Render JSX with ARIA props and keyboard handlers
})

export { buttonVariants } from '@refraction-ui/button'
```

Every `@refraction-ui/angular-<component>` package exports:

```typescript
// @refraction-ui/angular-button
import { createButton } from '@refraction-ui/button'

@Component({ selector: 'rfr-button', ... })
export class RfrButton {
  // Bind state machine to Angular signals
}

@NgModule({ declarations: [RfrButton], exports: [RfrButton] })
export class RfrButtonModule {}
```

Every `@refraction-ui/astro-<component>` package exports:

```astro
---
// @refraction-ui/astro-button
import { getButtonAriaProps, buttonTokens } from '@refraction-ui/button'
// Astro components are server-rendered by default
// Interactive components use client:load islands
---
<button {...getButtonAriaProps(props)} class={computedClasses}>
  <slot />
</button>
```

## Monorepo Package Layout

```
packages/
  # ─── Headless Core (pure TS, zero framework deps) ───
  button/               → @refraction-ui/button
  input/                → @refraction-ui/input
  textarea/             → @refraction-ui/textarea
  input-group/          → @refraction-ui/input-group
  dialog/               → @refraction-ui/dialog
  popover/              → @refraction-ui/popover
  tooltip/              → @refraction-ui/tooltip
  dropdown-menu/        → @refraction-ui/dropdown-menu
  command/              → @refraction-ui/command
  toast/                → @refraction-ui/toast
  tabs/                 → @refraction-ui/tabs
  badge/                → @refraction-ui/badge
  skeleton/             → @refraction-ui/skeleton
  calendar/             → @refraction-ui/calendar
  collapsible/          → @refraction-ui/collapsible
  device-frame/         → @refraction-ui/device-frame
  theme/                → @refraction-ui/theme
  auth/                 → @refraction-ui/auth
  navbar/               → @refraction-ui/navbar
  bottom-nav/           → @refraction-ui/bottom-nav
  sidebar/              → @refraction-ui/sidebar
  breadcrumbs/          → @refraction-ui/breadcrumbs
  footer/               → @refraction-ui/footer
  mobile-nav/           → @refraction-ui/mobile-nav
  resizable-layout/     → @refraction-ui/resizable-layout
  tv-layout/            → @refraction-ui/tv-layout
  search-bar/           → @refraction-ui/search-bar
  language-selector/    → @refraction-ui/language-selector
  version-selector/     → @refraction-ui/version-selector
  feedback-dialog/      → @refraction-ui/feedback-dialog
  inline-editor/        → @refraction-ui/inline-editor
  data-table/           → @refraction-ui/data-table
  progress-display/     → @refraction-ui/progress-display
  video-player/         → @refraction-ui/video-player
  markdown-renderer/    → @refraction-ui/markdown-renderer
  code-editor/          → @refraction-ui/code-editor
  slide-viewer/         → @refraction-ui/slide-viewer
  animated-text/        → @refraction-ui/animated-text
  install-prompt/       → @refraction-ui/install-prompt
  content-protection/   → @refraction-ui/content-protection
  auth-guard/           → @refraction-ui/auth-guard
  login-form/           → @refraction-ui/login-form
  signup-form/          → @refraction-ui/signup-form
  forgot-password/      → @refraction-ui/forgot-password

  # ─── React Wrappers ───
  react-button/         → @refraction-ui/react-button
  react-input/          → @refraction-ui/react-input
  react-dialog/         → @refraction-ui/react-dialog
  react-theme/          → @refraction-ui/react-theme
  react-auth/           → @refraction-ui/react-auth
  react-navbar/         → @refraction-ui/react-navbar
  ... (one per headless core)

  # ─── Angular Wrappers ───
  angular-button/       → @refraction-ui/angular-button
  angular-input/        → @refraction-ui/angular-input
  angular-dialog/       → @refraction-ui/angular-dialog
  ... (one per headless core)

  # ─── Astro Wrappers ───
  astro-button/         → @refraction-ui/astro-button
  astro-input/          → @refraction-ui/astro-input
  astro-dialog/         → @refraction-ui/astro-dialog
  ... (one per headless core)

  # ─── Domain Packages (already framework-specific or pure TS) ───
  charts/               → @refraction-ui/charts
  blocks/               → @refraction-ui/blocks
  media/                → @refraction-ui/media
  ai/                   → @refraction-ui/ai
  i18n/                 → @refraction-ui/i18n
  tailwind-config/      → @refraction-ui/tailwind-config
  tokens-core/          → @refraction-ui/tokens-core (exists)
  cli/                  → @refraction-ui/cli (exists)

  # ─── Meta Packages (convenience bundles) ───
  react/                → @refraction-ui/react (re-exports all react-* packages)
  angular/              → @refraction-ui/angular (re-exports all angular-* packages)
  astro/                → @refraction-ui/astro (re-exports all astro-* packages)
```

## Shared Infrastructure

Packages that every core and wrapper package depends on:

```
packages/
  shared/               → @refraction-ui/shared
    src/
      types.ts          # Common types (Size, Variant, etc.)
      tokens.ts         # CSS token contract types
      aria.ts           # ARIA attribute helpers
      keyboard.ts       # Keyboard handler types and utilities
      state-machine.ts  # Minimal state machine utility
      cn.ts             # Class merge utility (clsx + tailwind-merge)
```

## Acceptance Criteria

- [ ] ADR documenting headless core architecture decision
- [ ] `@refraction-ui/shared` package with common types and utilities
- [ ] Package generator script/template for scaffolding new core + wrapper packages
- [ ] Build pipeline: each package builds independently via tsup/unbuild
- [ ] Publish pipeline: changesets for independent versioning per package
- [ ] pnpm-workspace.yaml updated for `packages/*` glob
- [ ] turbo.json updated with per-package build/test/lint tasks
- [ ] CI: test matrix runs per-package, only affected packages on PR
- [ ] Documentation: "Creating a new component" guide for contributors
- [ ] At least one component (Button) fully implemented as proof-of-concept:
  - `@refraction-ui/button` (headless)
  - `@refraction-ui/react-button` (React wrapper)
  - `@refraction-ui/angular-button` (Angular wrapper)
  - `@refraction-ui/astro-button` (Astro wrapper)

## Why This Architecture

1. **Pick what you need**: `pnpm add @refraction-ui/react-dialog` — no bloat
2. **Framework freedom**: Same logic powering React, Angular, Astro, Vue, Svelte
3. **Independent versioning**: Patch the button without touching the dialog
4. **Testable core**: Headless logic is pure TS — easy to unit test without DOM
5. **SSR-friendly**: Astro gets server-rendered components; React/Angular get hydrated ones
6. **Proven pattern**: This is how Radix, Ark UI, Kobalte, and Zag.js work

## Prior Art

- **Zag.js** — headless state machines for UI components (closest to this approach)
- **Ark UI** — Zag-powered components for React, Vue, Solid
- **Radix UI** — per-component React packages (`@radix-ui/react-dialog`)
- **Kobalte** — headless components for Solid (same pattern for different framework)
- **Angular CDK** — headless utilities that Angular Material builds on

## Notes

- Astro is a natural fit because Astro components are server-rendered HTML by default — the headless core provides ARIA/class computation at build time, and interactive components use `client:load` islands with the React/Vue wrapper underneath
- The meta packages (`@refraction-ui/react`, `@refraction-ui/angular`, `@refraction-ui/astro`) are optional convenience bundles — users who want everything can install one package
- Domain packages (charts, blocks, media, ai, i18n) may start React-only and add framework wrappers later — they're complex enough that headless extraction is a Phase 2 concern
