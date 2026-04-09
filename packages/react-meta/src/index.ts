/**
 * @elloloop/react
 *
 * Meta package that re-exports all @elloloop/react-* component packages.
 * Allows consumers to install everything from a single package:
 *
 *   import { Button, Dialog, ThemeProvider } from '@elloloop/react'
 *
 * Or install individual packages for smaller bundles:
 *
 *   import { Button } from '@elloloop/react-button'
 */

// Core / theme
export * from '@elloloop/react-theme'

// Components (alphabetical)
// Note: react-ai and react-charts are stubs with no exports yet.
// They are included as dependencies but skipped here until they have exports.
export * from '@elloloop/react-animated-text'
export * from '@elloloop/react-auth'
export * from '@elloloop/react-badge'
export * from '@elloloop/react-bottom-nav'
export * from '@elloloop/react-breadcrumbs'
export * from '@elloloop/react-button'
export * from '@elloloop/react-calendar'
export * from '@elloloop/react-code-editor'
export * from '@elloloop/react-collapsible'
export * from '@elloloop/react-command'
export * from '@elloloop/react-content-protection'
export * from '@elloloop/react-data-table'
export * from '@elloloop/react-device-frame'
export * from '@elloloop/react-dialog'
export * from '@elloloop/react-dropdown-menu'
export * from '@elloloop/react-feedback-dialog'
export * from '@elloloop/react-footer'
export * from '@elloloop/react-inline-editor'
export * from '@elloloop/react-input'
export * from '@elloloop/react-input-group'
export * from '@elloloop/react-install-prompt'
export * from '@elloloop/react-markdown-renderer'
export * from '@elloloop/react-mobile-nav'
export * from '@elloloop/react-navbar'
export * from '@elloloop/react-popover'
export * from '@elloloop/react-search-bar'
export * from '@elloloop/react-sidebar'
export * from '@elloloop/react-skeleton'
export * from '@elloloop/react-tabs'
export * from '@elloloop/react-textarea'
export * from '@elloloop/react-toast'
export * from '@elloloop/react-tooltip'
export * from '@elloloop/react-video-player'

// --- Packages with conflicting export names ---
// react-progress-display and react-slide-viewer both export `progressBarVariants`.
// react-language-selector and react-version-selector both export `optionVariants`.
// We re-export everything except the conflicts, then provide renamed aliases.

// react-progress-display: has progressBarVariants (keep as-is, re-export everything)
export * from '@elloloop/react-progress-display'

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
} from '@elloloop/react-slide-viewer'

// react-language-selector: has optionVariants (keep as-is, re-export everything)
export * from '@elloloop/react-language-selector'

// react-version-selector: conflicts on optionVariants
export {
  VersionSelector,
  type VersionSelectorProps,
  versionSelectorVariants,
  optionVariants as versionSelectorOptionVariants,
  latestBadgeVariants,
  type VersionOption,
} from '@elloloop/react-version-selector'

// react-resizable-layout
export * from '@elloloop/react-resizable-layout'
