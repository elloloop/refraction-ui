---
id: PKG-CORE
track: architecture
depends_on: ["TOKENS-SCHEMA", "COMP-API-CONTRACT", "ENGINE-ADAPTER-IFACE"]
size: XL
labels: [feat, infra, architecture]
status: pending
---

## Summary

Define and implement the **headless core architecture** — every refraction-ui component ships as a framework-agnostic TypeScript package (`@elloloop/<component>`) containing state machines, ARIA computation, keyboard interaction, and validation. Framework wrappers (React, Angular, Astro) are thin adapter packages that bind the core to each framework's reactivity system.

## Architecture

```
User installs:     @elloloop/react-button
Which depends on:  @elloloop/button (headless core)

                    ┌─────────────────────────┐
                    │   @elloloop/button  │  ← headless core
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

Every `@elloloop/<component>` package exports:

```typescript
// @elloloop/button

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

Every `@elloloop/react-<component>` package exports:

```tsx
// @elloloop/react-button
import { createButton, type ButtonProps } from '@elloloop/button'

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const api = createButton(props)
  // Bind state machine to React hooks
  // Render JSX with ARIA props and keyboard handlers
})

export { buttonVariants } from '@elloloop/button'
```

Every `@elloloop/angular-<component>` package exports:

```typescript
// @elloloop/angular-button
import { createButton } from '@elloloop/button'

@Component({ selector: 'rfr-button', ... })
export class RfrButton {
  // Bind state machine to Angular signals
}

@NgModule({ declarations: [RfrButton], exports: [RfrButton] })
export class RfrButtonModule {}
```

Every `@elloloop/astro-<component>` package exports:

```astro
---
// @elloloop/astro-button
import { getButtonAriaProps, buttonTokens } from '@elloloop/button'
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
  button/               → @elloloop/button
  input/                → @elloloop/input
  textarea/             → @elloloop/textarea
  input-group/          → @elloloop/input-group
  dialog/               → @elloloop/dialog
  popover/              → @elloloop/popover
  tooltip/              → @elloloop/tooltip
  dropdown-menu/        → @elloloop/dropdown-menu
  command/              → @elloloop/command
  toast/                → @elloloop/toast
  tabs/                 → @elloloop/tabs
  badge/                → @elloloop/badge
  skeleton/             → @elloloop/skeleton
  calendar/             → @elloloop/calendar
  collapsible/          → @elloloop/collapsible
  device-frame/         → @elloloop/device-frame
  theme/                → @elloloop/theme
  auth/                 → @elloloop/auth
  navbar/               → @elloloop/navbar
  bottom-nav/           → @elloloop/bottom-nav
  sidebar/              → @elloloop/sidebar
  breadcrumbs/          → @elloloop/breadcrumbs
  footer/               → @elloloop/footer
  mobile-nav/           → @elloloop/mobile-nav
  resizable-layout/     → @elloloop/resizable-layout
  tv-layout/            → @elloloop/tv-layout
  search-bar/           → @elloloop/search-bar
  language-selector/    → @elloloop/language-selector
  version-selector/     → @elloloop/version-selector
  feedback-dialog/      → @elloloop/feedback-dialog
  inline-editor/        → @elloloop/inline-editor
  data-table/           → @elloloop/data-table
  progress-display/     → @elloloop/progress-display
  video-player/         → @elloloop/video-player
  markdown-renderer/    → @elloloop/markdown-renderer
  code-editor/          → @elloloop/code-editor
  slide-viewer/         → @elloloop/slide-viewer
  animated-text/        → @elloloop/animated-text
  install-prompt/       → @elloloop/install-prompt
  content-protection/   → @elloloop/content-protection
  auth-guard/           → @elloloop/auth-guard
  login-form/           → @elloloop/login-form
  signup-form/          → @elloloop/signup-form
  forgot-password/      → @elloloop/forgot-password

  # ─── React Wrappers ───
  react-button/         → @elloloop/react-button
  react-input/          → @elloloop/react-input
  react-dialog/         → @elloloop/react-dialog
  react-theme/          → @elloloop/react-theme
  react-auth/           → @elloloop/react-auth
  react-navbar/         → @elloloop/react-navbar
  ... (one per headless core)

  # ─── Angular Wrappers ───
  angular-button/       → @elloloop/angular-button
  angular-input/        → @elloloop/angular-input
  angular-dialog/       → @elloloop/angular-dialog
  ... (one per headless core)

  # ─── Astro Wrappers ───
  astro-button/         → @elloloop/astro-button
  astro-input/          → @elloloop/astro-input
  astro-dialog/         → @elloloop/astro-dialog
  ... (one per headless core)

  # ─── Domain Packages (already framework-specific or pure TS) ───
  charts/               → @elloloop/charts
  blocks/               → @elloloop/blocks
  media/                → @elloloop/media
  ai/                   → @elloloop/ai
  i18n/                 → @elloloop/i18n
  tailwind-config/      → @elloloop/tailwind-config
  tokens-core/          → @elloloop/tokens-core (exists)
  cli/                  → @elloloop/cli (exists)

  # ─── Meta Packages (convenience bundles) ───
  react/                → @elloloop/react (re-exports all react-* packages)
  angular/              → @elloloop/angular (re-exports all angular-* packages)
  astro/                → @elloloop/astro (re-exports all astro-* packages)
```

## Shared Infrastructure

Packages that every core and wrapper package depends on:

```
packages/
  shared/               → @elloloop/shared
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
- [ ] `@elloloop/shared` package with common types and utilities
- [ ] Package generator script/template for scaffolding new core + wrapper packages
- [ ] Build pipeline: each package builds independently via tsup/unbuild
- [ ] Publish pipeline: changesets for independent versioning per package
- [ ] pnpm-workspace.yaml updated for `packages/*` glob
- [ ] turbo.json updated with per-package build/test/lint tasks
- [ ] CI: test matrix runs per-package, only affected packages on PR
- [ ] Documentation: "Creating a new component" guide for contributors
- [ ] At least one component (Button) fully implemented as proof-of-concept:
  - `@elloloop/button` (headless)
  - `@elloloop/react-button` (React wrapper)
  - `@elloloop/angular-button` (Angular wrapper)
  - `@elloloop/astro-button` (Astro wrapper)

## Why This Architecture

1. **Pick what you need**: `pnpm add @elloloop/react-dialog` — no bloat
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
- The meta packages (`@elloloop/react`, `@elloloop/angular`, `@elloloop/astro`) are optional convenience bundles — users who want everything can install one package
- Domain packages (charts, blocks, media, ai, i18n) may start React-only and add framework wrappers later — they're complex enough that headless extraction is a Phase 2 concern
