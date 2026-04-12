/**
 * @refraction-ui/react
 *
 * Meta package that re-exports all @refraction-ui/react-* component packages.
 * Allows consumers to install everything from a single package:
 *
 *   import { Button, Dialog, ThemeProvider } from '@refraction-ui/react'
 *
 * Or install individual packages for smaller bundles:
 *
 *   import { Button } from '@refraction-ui/react-button'
 */

// Core / theme
export * from '@refraction-ui/react-theme'

// Components (alphabetical)
export * from '@refraction-ui/react-accordion'
// Note: react-ai and react-charts are stubs with no exports yet.
// They are included as dependencies but skipped here until they have exports.
export * from '@refraction-ui/react-animated-text'
export * from '@refraction-ui/react-auth'
export * from '@refraction-ui/react-badge'
export * from '@refraction-ui/react-bottom-nav'
export * from '@refraction-ui/react-breadcrumbs'
export * from '@refraction-ui/react-button'
export * from '@refraction-ui/react-calendar'
export * from '@refraction-ui/react-code-editor'
export * from '@refraction-ui/react-collapsible'
export * from '@refraction-ui/react-command'
export * from '@refraction-ui/react-content-protection'
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
export * from '@refraction-ui/react-markdown-renderer'
export * from '@refraction-ui/react-mobile-nav'
export * from '@refraction-ui/react-navbar'
export * from '@refraction-ui/react-popover'
export * from '@refraction-ui/react-search-bar'
export * from '@refraction-ui/react-sidebar'
export * from '@refraction-ui/react-skeleton'
export * from '@refraction-ui/react-tabs'
export * from '@refraction-ui/react-textarea'
export * from '@refraction-ui/react-toast'
export * from '@refraction-ui/react-tooltip'
export * from '@refraction-ui/react-video-player'

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
  appShellVariants,
  appShellContentVariants,
  appShellTokens,
} from '@refraction-ui/react-app-shell'

// react-avatar: keep as-is (primary source of avatarVariants, AvatarSize)
export * from '@refraction-ui/react-avatar'

// react-avatar-group: conflicts with react-avatar on AvatarSize, avatarVariants
// and react-presence-indicator on PresenceStatus
export {
  AvatarGroup,
  type AvatarGroupProps,
  avatarGroupVariants,
  avatarGroupTokens,
} from '@refraction-ui/react-avatar-group'

export * from '@refraction-ui/react-card'
export * from '@refraction-ui/react-checkbox'

// react-date-picker: conflicts with react-calendar on CalendarDay
export {
  DatePicker,
  type DatePickerProps,
  datePickerVariants,
  datePickerTokens,
} from '@refraction-ui/react-date-picker'

export * from '@refraction-ui/react-diff-viewer'
export * from '@refraction-ui/react-emoji-picker'
export * from '@refraction-ui/react-file-upload'
export * from '@refraction-ui/react-keyboard-shortcut'
export * from '@refraction-ui/react-otp-input'

// react-presence-indicator: conflicts with react-status-indicator on STATUS_COLORS, STATUS_LABELS
export {
  PresenceIndicator,
  type PresenceIndicatorProps,
  presenceIndicatorVariants,
  presenceIndicatorTokens,
  STATUS_COLORS as PRESENCE_STATUS_COLORS,
  STATUS_LABELS as PRESENCE_STATUS_LABELS,
} from '@refraction-ui/react-presence-indicator'

export * from '@refraction-ui/react-radio'
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
