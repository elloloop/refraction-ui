/**
 * @refraction-ui/react
 *
 * RSC client boundary: this meta re-exports React providers / hooks /
 * interactive components (createContext, useRef, useContext, …), so the
 * published bundle must carry a leading `'use client'` directive — otherwise
 * importing `@refraction-ui/react` from a Next.js App Router Server
 * Component (e.g. mounting a Provider in `app/layout.tsx`) fails
 * `next build` with the "createContext only works in a Client Component"
 * RSC error. Do NOT add a `'use client'` directive here: tsup/esbuild drop
 * it when bundling and the `treeshake` (Rollup) pass only emits a
 * "module level directives ... ignored" warning. The directive is injected
 * deterministically post-build by scripts/ensure-use-client.mjs (guarded by
 * a meta.test.ts regression test). The server-safe headless factories also
 * re-exported here (createAnalytics/createTelemetry/createAI/cn/cva/…) are
 * part of this client module — instantiate them inside the client boundary.
 *
 * Meta package that re-exports all @refraction-ui/react-* component packages.
 * Consumers install this single package and import everything from it:
 *
 *   import { Button, Dialog } from '@refraction-ui/react'
 *
 * The individual react-* adapter packages are private and never published —
 * this meta is the only supported entry point.
 */

// Core / theme
// NOTE: Theme exports moved to opt-in subpath '@refraction-ui/react/theme'
// to avoid name clashes with consumers' existing theme systems (e.g. next-themes).
// Import via: `import { ThemeProvider } from '@refraction-ui/react/theme'`
//
// RHF-backed Form exports also live behind an opt-in subpath so the root
// package does not force every consumer to resolve react-hook-form.
// Import via: `import { Form, useForm } from '@refraction-ui/react/form'`

// Components (alphabetical)
export * from '@refraction-ui/react-accordion'
export * from '@refraction-ui/react-ai'
export * from '@refraction-ui/react-animated-text'
export * from '@refraction-ui/react-auth'
export * from '@refraction-ui/react-badge'
export * from '@refraction-ui/react-bottom-nav'
export * from '@refraction-ui/react-breadcrumbs'
export * from '@refraction-ui/react-button'
export * from '@refraction-ui/react-calendar'
export * from '@refraction-ui/react-charts'
export * from '@refraction-ui/react-code-editor'
export * from '@refraction-ui/react-collapsible'
export * from '@refraction-ui/react-combobox'
export * from '@refraction-ui/react-command'
// react-command-input: conflicts with react-command on CommandInput /
// CommandInputProps (react-command's compound palette input keeps the stable
// public name). The standalone trigger-detection input is exposed under an
// alias instead.
export {
  CommandInput as StandaloneCommandInput,
  type CommandInputProps as StandaloneCommandInputProps,
} from '@refraction-ui/react-command-input'
export * from '@refraction-ui/react-composer'
export * from '@refraction-ui/react-conversation'
export * from '@refraction-ui/react-content-protection'
export * from '@refraction-ui/react-cookie-consent'
export * from '@refraction-ui/react-data-table'
export * from '@refraction-ui/react-device-frame'
export * from '@refraction-ui/react-dialog'
export * from '@refraction-ui/react-dropdown-menu'
export * from '@refraction-ui/react-feedback-dialog'
export * from '@refraction-ui/react-footer'
export * from '@refraction-ui/react-inline-editor'
export * from '@refraction-ui/react-input'
export * from '@refraction-ui/react-input-group'
export * from '@refraction-ui/react-install-prompt'
export * from '@refraction-ui/react-location-selector'
export * from '@refraction-ui/react-markdown-renderer'
export * from '@refraction-ui/react-mascot'
export * from '@refraction-ui/react-mobile-nav'
export * from '@refraction-ui/react-navbar'
export * from '@refraction-ui/react-popover'
export * from '@refraction-ui/react-search-bar'
export * from '@refraction-ui/react-sidebar'
export * from '@refraction-ui/react-sheet'
export * from '@refraction-ui/react-skeleton'
export * from '@refraction-ui/react-slot'
export * from '@refraction-ui/react-tabs'
export * from '@refraction-ui/react-textarea'
export * from '@refraction-ui/react-toast'
export * from '@refraction-ui/react-tooltip'
export * from '@refraction-ui/react-video-player'
export * from '@refraction-ui/react-voice-pill'
export * from '@refraction-ui/react-waveform'

// --- Packages with conflicting export names ---
// react-progress-display and react-slide-viewer both export `progressBarVariants`.
// react-language-selector and react-version-selector both export `optionVariants`.
// We re-export everything except the conflicts, then provide renamed aliases.

// react-progress-display: has progressBarVariants (keep as-is, re-export everything)
export * from '@refraction-ui/react-progress-display'

// react-slide-viewer: conflicts on progressBarVariants
export {
  SlideViewer,
  type SlideViewerProps,
  type SlideData,
  type BookmarkType,
  type SlideType,
  type SlideViewerAPI,
  type SlideViewerState,
  slideViewerVariants,
  progressBarVariants as slideViewerProgressBarVariants,
  slideTypeBadgeVariants,
  slideViewerTokens,
} from '@refraction-ui/react-slide-viewer'

// react-language-selector: has optionVariants (keep as-is, re-export everything)
export * from '@refraction-ui/react-language-selector'

// react-version-selector: conflicts on optionVariants
export {
  VersionSelector,
  type VersionSelectorProps,
  versionSelectorVariants,
  optionVariants as versionSelectorOptionVariants,
  latestBadgeVariants,
  type VersionOption,
} from '@refraction-ui/react-version-selector'

// react-resizable-layout
export * from '@refraction-ui/react-resizable-layout'

// --- Additional packages (with conflict handling) ---

// react-app-shell: conflicts with react-sidebar on sidebarVariants, sidebarItemVariants
export {
  AppShell,
  type AppShellProps,
      } from '@refraction-ui/react-app-shell'

// react-diff-viewer: re-exports sidebarVariants/sidebarItemVariants from its
// headless core, which clash with react-sidebar's (exported above). Keep the
// pre-existing react-sidebar names stable and expose the diff-viewer variants
// under aliases instead.
export {
  DiffViewer,
  type DiffViewerProps,
  createDiffViewer,
  diffViewerVariants,
  sidebarVariants as diffViewerSidebarVariants,
  sidebarItemVariants as diffViewerSidebarItemVariants,
  tabBarVariants,
  tabVariants,
  statusBarVariants,
  diffViewerTokens,
  type DiffFile,
  type DiffFileStatus,
  type DiffViewerTheme,
  type DiffViewMode,
  type DiffViewerAPI,
  type DiffViewerState,
} from '@refraction-ui/react-diff-viewer'

// react-avatar: keep as-is (primary source of avatarVariants, AvatarSize)
export * from '@refraction-ui/react-avatar'

// react-avatar-group: conflicts with react-avatar on AvatarSize, avatarVariants
// and react-presence-indicator on PresenceStatus
export {
  AvatarGroup,
  type AvatarGroupProps,
    } from '@refraction-ui/react-avatar-group'

export * from '@refraction-ui/react-card'
export * from '@refraction-ui/react-checkbox'

// react-date-picker: conflicts with react-calendar on CalendarDay
export {
  DatePicker,
  type DatePickerProps,
    } from '@refraction-ui/react-date-picker'


export * from '@refraction-ui/react-emoji-picker'
export * from '@refraction-ui/react-file-upload'
export * from '@refraction-ui/react-keyboard-shortcut'
export * from '@refraction-ui/react-otp-input'

// react-presence-indicator: conflicts with react-status-indicator on STATUS_COLORS, STATUS_LABELS
export {
  PresenceIndicator,
  type PresenceIndicatorProps,
      STATUS_COLORS as PRESENCE_STATUS_COLORS,
  STATUS_LABELS as PRESENCE_STATUS_LABELS,
} from '@refraction-ui/react-presence-indicator'

export * from '@refraction-ui/react-radio'
export * from '@refraction-ui/react-rating-scale'
export * from '@refraction-ui/react-reaction-bar'
export * from '@refraction-ui/react-rich-editor'
export * from '@refraction-ui/react-select'
export * from '@refraction-ui/react-status-indicator'
export * from '@refraction-ui/react-switch'
export * from '@refraction-ui/react-thread-view'

export * from '@refraction-ui/react-table-of-contents'
export * from '@refraction-ui/react-carousel'
export * from '@refraction-ui/react-slider'
export * from '@refraction-ui/react-pagination'

export * from '@refraction-ui/react-callout'
export * from '@refraction-ui/react-steps'
export * from '@refraction-ui/react-file-tree'
export * from '@refraction-ui/react-icon-system'
export * from '@refraction-ui/react-skip-to-content'
export * from '@refraction-ui/react-code-block'
export * from '@refraction-ui/react-link-card'
export * from '@refraction-ui/react-card-grid'


export * from '@refraction-ui/react-payment'
export * from '@refraction-ui/react-logger'
export * from '@refraction-ui/react-analytics'

// Issues #330-#334 — auth surface components
export * from '@refraction-ui/react-segmented-control'
export * from '@refraction-ui/react-password-input'
export * from '@refraction-ui/react-social-auth-button'
export * from '@refraction-ui/react-separator'
export * from '@refraction-ui/react-empty-state'

// easyloops design-parity wave 1 (Cluster C + D)
export * from '@refraction-ui/react-wizard'
export * from '@refraction-ui/react-radial-gauge'
export * from '@refraction-ui/react-timeline'
export * from '@refraction-ui/react-checklist'
export * from '@refraction-ui/react-editor-tabs'
export * from '@refraction-ui/react-terminal'
export * from '@refraction-ui/react-test-results'
export * from '@refraction-ui/react-editor-status-bar'

// easyloops design-parity wave 2 (Cluster A — video)
export * from '@refraction-ui/react-video-tile'
export * from '@refraction-ui/react-video-grid'
export * from '@refraction-ui/react-call-controls'
export * from '@refraction-ui/react-live-captions'
export * from '@refraction-ui/react-live-transcript'
export * from '@refraction-ui/react-audio-room'
export * from '@refraction-ui/react-floating-reactions'
export * from '@refraction-ui/react-pre-call-lobby'

// easyloops design-parity wave 3 (Cluster B — canvas)
export * from '@refraction-ui/react-infinite-canvas'
export * from '@refraction-ui/react-sticky-note'
export * from '@refraction-ui/react-flow-editor'
export * from '@refraction-ui/react-graph-view'
export * from '@refraction-ui/react-live-cursors'
export * from '@refraction-ui/react-mini-map'

// easyloops marketing components wave
export * from '@refraction-ui/react-section-head'
export * from '@refraction-ui/react-stat-grid'
export * from '@refraction-ui/react-numbered-steps'
export * from '@refraction-ui/react-pricing-card'
export * from '@refraction-ui/react-brand-network-cell'
export * from '@refraction-ui/react-marquee-strip'
export * from '@refraction-ui/react-browser-chrome-mock'
export * from '@refraction-ui/react-mastery-bar'
export * from '@refraction-ui/react-audience-feature-card'

// loopwyse pipeline components
export * from '@refraction-ui/react-sortable-list'
export * from '@refraction-ui/react-kanban-board'
export * from '@refraction-ui/react-slot-picker'
