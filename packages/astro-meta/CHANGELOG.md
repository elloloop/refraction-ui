# @refraction-ui/astro

## 0.15.1

### Patch Changes

- c3158d7: feat: add Mascot component (Tobi the Tortoise) supporting interactive bobbing, sprout swaying, and blinking states across React and Astro adapters.

## 0.15.0

### Minor Changes

- 69f42ee: Add 3 components from the loopwyse Interview Loops design: `KanbanBoard`
  (stage-column board with cards, counts, and overflow), `SortableList`
  (drag-to-reorder list with a grip handle and keyboard reordering), and
  `SlotPicker` (Calendly-style day + time-slot booking picker). Each ships as a
  headless core plus React and Astro adapters, with a docs-site page and
  Storybook story. Available from the `@refraction-ui/react` and
  `@refraction-ui/astro` metas.

## 0.14.0

### Minor Changes

- 3fb0f32: Add 9 marketing / landing components: `SectionHead`, `StatGrid`,
  `NumberedSteps`, `PricingCard`, `BrandNetworkCell`, `MarqueeStrip`,
  `BrowserChromeMock`, `MasteryBar` (a standalone labelled linear progress bar),
  and `AudienceFeatureCard`. Each ships as a headless core plus React and Astro
  adapters, with a docs-site page and Storybook story. Available from the
  `@refraction-ui/react` and `@refraction-ui/astro` metas.

## 0.13.0

### Minor Changes

- 342214a: Add 23 net-new components from the easyloops design-parity audit, across three
  product surfaces:

  - **Video conferencing**: `VideoTile`, `VideoGrid`, `CallControls`,
    `LiveCaptions`, `LiveTranscript`, `AudioRoom`, `FloatingReactions`,
    `PreCallLobby`.
  - **Canvas / diagramming**: `InfiniteCanvas`, `StickyNote`, `FlowEditor`,
    `GraphView`, `LiveCursors`, `MiniMap`.
  - **Code-IDE chrome**: `EditorTabs`, `Terminal`, `TestResults`,
    `EditorStatusBar`.
  - **Forms / assessment**: `RatingScale`, `Wizard`, `RadialGauge`, `Timeline`,
    `Checklist`.

  Each ships as a headless core plus React and Astro adapters, with a docs-site
  page and Storybook story. Available from the `@refraction-ui/react` and
  `@refraction-ui/astro` metas.

## 0.12.0

### Minor Changes

- 117fad0: Add auth-surface components (#330–#334), each as a headless core + React and Astro adapters wired into the metas:

  - **SegmentedControl / SegmentedControlItem** — compact, radio-semantics single-choice value picker (roving focus, arrow keys, `sm|md`, controlled/uncontrolled).
  - **PasswordInput** — `Input` wrapper with a show/hide toggle; plus a new `validationState` (`valid|invalid`) affordance and `leadingIcon` slot on **Input** itself.
  - **SocialAuthButton / SocialAuthRow** — OAuth provider buttons with bundled brand icons, `loading`, and a "Last used" badge.
  - **Separator** — horizontal/vertical rule with an optional centered label (the `──── or ────` divider).
  - **EmptyState / ConfirmationCard** — centered icon-chip + title + body + actions stack with `tone` tints and an optional bordered surface.

## 0.11.1

### Patch Changes

- 69bb85c: API ergonomics + parity:

  - **Button** — `<Button variant="primary">` now renders as the default (most-emphasized) button instead of silently falling through to the unstyled base. `primary` is a typed alias of `default`; behaviour is identical. Fixes muscle-memory regressions seen migrating from MUI/Chakra/Mantine. (issue #201)
  - **StatusIndicator** — accepts composable `children` as a fallback for `label`, matching every other refraction-ui primitive. `<StatusIndicator type="success">Microphone · ready</StatusIndicator>` now renders the children instead of dropping them. `aria-label` is derived from children when they are a string. (issue #200)
  - **ThemeScript** — gains `defaultMode` and `enableSystem` props so the pre-paint inline script stays in sync with `ThemeProvider` on the no-storage path. Setting `defaultMode="light"` (or `enableSystem={false}`) now skips the `prefers-color-scheme` fall-through, fixing dark→light flashes for brand-consistent apps. Defaults preserve the prior behaviour. (issue #317)
  - **Astro meta** — wires up `@refraction-ui/astro-voice-pill` and `@refraction-ui/astro-waveform` so they're reachable from `@refraction-ui/astro` (they were listed as deps but not re-exported). (issues #191, #192)

- bcb7b78: Docs + Storybook follow-up to the API ergonomics fixes:

  - **Button** — new `PrimaryAlias` story + dedicated docs section showing `variant="primary"` renders identically to `variant="default"`. Variants table updated.
  - **StatusIndicator** — fixed broken docs example (was passing `status=` instead of the real prop `type=`). Added `WithChildren` and `DotOnly` stories + new docs sections for the children-fallback and dot-only patterns. Props table now lists `children` and `pulse`'s pending-default behaviour.
  - **Theme** — Storybook stories expanded to three doc cards (Overview / `defaultMode` / Resolution Order). New `/theme/api` docs page documents `ThemeProvider`, `ThemeScript`, and `useTheme` together with the full SSR-safe setup pattern (mirrors `defaultMode` between head script and provider).

  No runtime/source changes — pure docs + Storybook.

## 0.11.0

### Minor Changes

- 60ddb5a: Visual redesign of the Chat composer and the CookieConsent banner. The Chat composer is now a unified rounded input card (textarea + bottom bar with attach / formatting toolbar / send), with the inline error + retry banner restored (new optional `error`/`onRetry` props on `Composer`). The CookieConsent banner gets a cookie-icon header, a clearer button hierarchy (Customize / Reject all / Accept all), and switch-style category toggles in the settings view; the Astro `CookieConsent` mirrors the new look.

## 0.10.0

### Minor Changes

- 24c5a7b: Conversation — refine the reply-threading strategy. Replies to _any_ message in a thread (the root or a mid-thread reply) now group under the originating root (one level deep) while remembering the specific message replied to via `replyToId` (used for the quote). The "💬 N replies" count now shows on the originating message in **both** inline and panel modes, and a new `replyTo(messageId)` action + `replyTarget` state lets a reply target a specific mid-thread message while still grouping under the root.

## 0.9.0

### Minor Changes

- 73e3632: Add Conversation / Chat.

  A headless multi-conversation chat store (`createConversation`) with reply-threads, two threading modes (`inline` — replies quote their parent in the timeline and open a thread panel; `panel` — Slack-style, only roots in the timeline), reactions, edit/delete, retry/stop, and streaming through a backend-agnostic `ChatTransport` (SSE / WebSocket / fetch — the consumer's choice; nothing about the backend leaks into the UI).

  - **React** (`@refraction-ui/react`): `useConversation()` hook + a batteries-included `Chat` component — conversation sidebar, mode toggle, thread side panel, rich content (markdown / code / gifs / attachments), reactions, edit/delete, and a streaming typing indicator.
  - **Astro** (`@refraction-ui/astro`): a server-rendered `Chat` that renders both modes from the headless store and surfaces interactivity as semantic `rfr:*` CustomEvents the host app wires to its backend.

- 0cf2f56: Add CookieConsent — a headless, GDPR-style cookie-consent store (categories, accept all / reject all / save preferences, versioned persistence via a swappable storage adapter) with a React banner (`useCookieConsent` + `CookieConsent`, localStorage by default) and a server-rendered Astro `CookieConsent` banner that persists via localStorage and emits `rfr:cookie-consent`.

## 0.8.1

### Patch Changes

- 3be83e5: Remove Angular support entirely and make `@refraction-ui/shared` private.

  - Deleted all `packages/angular-*` packages, including the `@refraction-ui/angular` meta (`angular-meta`), `angular-logger`, and `angular-analytics`. `@refraction-ui/angular` is no longer published.
  - Removed Angular wiring from `update-meta-packages.cjs`, the now-dead `update-angular-meta.cjs` script, the root `@angular/*` pnpm overrides, and the root `zone.js` devDependency/override.
  - Removed all Angular pages, framework tabs, code samples, and references from the docs site, README, instrumentation policy, and the Flutter package README/comments.
  - `@refraction-ui/shared` is now `private: true` (no `publishConfig`). It is embedded into the published `@refraction-ui/react` and `@refraction-ui/astro` metas and is never published standalone. Both metas remain fully self-contained — verified by the meta self-containment tests and a pack-test (0 `@refraction-ui/*` import/require/export references in the packed runtime/declaration/shipped-source output).

  The published npm packages are now exactly: `@refraction-ui/react`, `@refraction-ui/astro`, and `@refraction-ui/tailwind-config`. The patch bump on the metas reflects the changed embedded `@refraction-ui/shared` source.

## 0.8.0

### Minor Changes

- 6c85463: feat: re-surface the GA4 / Azure App Insights / PostHog analytics sinks through the per-framework metas, embedded so no meta ships a private package reference

  The framework analytics adapters again re-export `createGA4Sink`,
  `createAppInsightsSink`, and `createPostHogSink` (plus their direct-mode
  factories, option/type contracts, and the optional lazy PostHog
  `startSessionReplay`). Consumers of `@refraction-ui/react|astro|angular`
  can fan analytics out to GA4 / Azure / PostHog without depending on the
  private sink packages directly.

  Unlike the reverted attempt, the sinks are now genuinely **embedded** by the
  metas:

  - `@refraction-ui/react`: `embed-internal-types` now rewrites subpath
    specifiers (e.g. `@refraction-ui/analytics-sink-posthog/replay`) to the
    embedded declaration entry, so the shipped `.d.ts`/`.d.cts` and bundled JS
    contain zero `@refraction-ui/*` references.
  - `@refraction-ui/astro`: the meta build now rewrites subpath specifiers to
    the copied source, so the shipped `dist/` contains zero bare
    `@refraction-ui/*` import/export/require references (Astro components ship
    as raw `.astro`/`.ts` source by necessity — the consumer's Astro toolchain
    compiles them).

  Each meta now carries a `__tests__/meta.test.ts` self-contained guardrail to
  prevent this drift from recurring.

## 0.7.0

### Minor Changes

- 7ecb568: feat: surface the GA4, Azure App Insights, and PostHog analytics sink factories through the per-framework meta packages

  The framework analytics adapters now re-export `createGA4Sink`,
  `createAppInsightsSink`, and `createPostHogSink` (plus their direct-mode
  factories, option/type contracts, and the optional lazy PostHog
  `startSessionReplay`), so consumers of `@refraction-ui/react|astro|angular`
  can fan analytics out to GA4 / Azure / PostHog without depending on the
  private sink packages directly.

## 0.6.0

### Minor Changes

- f31e058: feat: surface telemetry (logger) and analytics adapters through the per-framework meta packages

## 0.5.1

### Patch Changes

- 01c7f71: Fix VoicePill and Waveform docs behavior, add inline VoicePill placement and Waveform amplitude control, smooth generated waveform animation, and patch audited dependency versions.

## 0.5.0

### Minor Changes

- Add VoicePill and Waveform primitives to the Astro and Angular framework packages.

## 0.4.7

### Patch Changes

- 6319dc8: Trigger full publish cycle to synchronize npm latest tag

## 0.4.6

### Patch Changes

- fix: trigger fresh release for select component fixes

  - Fixed select keyboard navigation and hover styles that were missed in the previous force-pushed release.

## 0.4.5

### Patch Changes

- fix: direct version bump to bypass canary tag and publish to latest

## 0.4.4

### Patch Changes

- 5f12c8a: fix(astro): bundle transitive workspace dependencies in astro-meta to resolve missing core logic

  - Updated custom build script for astro-meta to dynamically traverse and bundle all internal `@refraction-ui/*` dependencies (e.g. `app-shell`, `ai`, `auth`, `charts`) that are required by the Astro components.
  - Ensures the single-package distribution is completely standalone and does not throw 404s when attempting to resolve internal core packages.

## 0.4.3

### Patch Changes

- d6c99d0: fix: force version bump to resolve npm registry canary conflict

## 0.4.2

### Patch Changes

- dff56a1: fix: implement source copier build strategy for astro meta-package

  - Added a custom build script that consolidates all private `astro-*` workspace components into a single `dist` directory.
  - Updated internal imports to relative paths.
  - Configured the meta-package to export the unified `dist` folder.
  - Ensures consumers can use the library as a single package while retaining Astro's native component optimizations.

## 0.4.1

### Patch Changes

- a1bbf02: fix: move all internal workspace package references to devDependencies to prevent EUNSUPPORTEDPROTOCOL during npm install of meta-packages

## 0.4.0

### Minor Changes

- 29a896e: feat(command-input): add robust headless rich text command input primitive (like Slack/ChatGPT) for complex mentions and slashed commands
- 29a896e: feat: add robust HTTP wrapper client with auth interceptors and type safety
  feat: add location-selector component featuring independent, autocomplete-enabled Country and Language selection dropdowns (powered by core i18n logic)

### Patch Changes

- @refraction-ui/astro-command-input@0.1.1
- @refraction-ui/astro-payment@0.1.3

## 0.3.1

### Patch Changes

- dabcbd6: chore: force release to update latest npm tags
  - @refraction-ui/astro-callout@0.1.2
  - @refraction-ui/astro-card-grid@0.1.2
  - @refraction-ui/astro-carousel@0.1.2
  - @refraction-ui/astro-code-block@0.1.2
  - @refraction-ui/astro-link-card@0.1.2
  - @refraction-ui/astro-pagination@0.1.2
  - @refraction-ui/astro-payment@0.1.2
  - @refraction-ui/astro-skip-to-content@0.1.2
  - @refraction-ui/astro-slider@0.1.2
  - @refraction-ui/astro-steps@0.1.2
  - @refraction-ui/astro-table-of-contents@0.1.2

## 0.3.0

### Minor Changes

- f7c05bb: feat: Massive multi-framework expansion! Added Table of Contents, Carousel, Slider, and Pagination components across React, Astro, Angular, and Vue. Updated all documentation pages to natively display code tabs for every supported framework. Implemented Design Tokens Zod Schema and EngineAdapter interface with a proof-of-concept Radix Dialog wrapper.
- 871b0cc: feat: add payment component wrapper for Stripe integration
- b6293a6: feat: add remaining requested components (Callout, Steps, FileTree, Icon System, SkipToContent, CodeBlock, LinkCard, CardGrid) across all supported frameworks

### Patch Changes

- 89882b5: feat: add accordion component
- ec93176: chore: verify automated canary publish from GitHub Actions
- 33d3a5e: fix: resolve horizontal scrollbar/overflow issues on mobile viewports for DataTable, Tabs, and Breadcrumbs components
- c083c7d: docs: update readme to reflect supported and planned frameworks and trigger a final release test
- 4bd4185: chore: final verification of per-package OIDC publishing logic
  - @refraction-ui/astro-table-of-contents@0.1.1
  - @refraction-ui/astro-carousel@0.1.1
  - @refraction-ui/astro-slider@0.1.1
  - @refraction-ui/astro-pagination@0.1.1
  - @refraction-ui/astro-payment@0.1.1
  - @refraction-ui/astro-callout@0.1.1
  - @refraction-ui/astro-steps@0.1.1
  - @refraction-ui/astro-skip-to-content@0.1.1
  - @refraction-ui/astro-code-block@0.1.1
  - @refraction-ui/astro-link-card@0.1.1
  - @refraction-ui/astro-card-grid@0.1.1

## 0.2.0

### Minor Changes

- 370a1c7: feat: add Astro component wrappers for all UI components

  Added Astro versions of all 60 refraction-ui components, wrapping the
  headless core packages with native .astro component files.
