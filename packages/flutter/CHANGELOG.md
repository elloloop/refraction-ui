## 0.45.0

- **Chat**: Add `RefractionComposer` — a headless-core chat composer with auto-grow (viewport-capped), IME-safe Enter-to-send, `@`mention / `/`slash / `:emoji:` / `#`tag trigger suggestions committing atomic tokens, an attachments tray, injectable drafts, edit-in-place, busy/stop primary action, `compact`/`comfortable`/`spacious` density variants, RTL mirroring, and full Semantics. The pure-Dart `ComposerCore` (`lib/src/core/`) has zero `package:flutter` imports and emits structured `{plainText, tokens[]}` output identical to the React core.
- **Fix**: Export `RefractionMobileNav` from the package barrel (shipped in 0.42.0 but never exported, so consumers couldn't import it).

## 0.44.0

- **Marketing / Landing**: Add `RefractionSectionHead`, `RefractionStatGrid`, `RefractionNumberedSteps`, `RefractionPricingCard`, `RefractionBrandNetworkCell`, `RefractionMarqueeStrip`, `RefractionBrowserChromeMock`, `RefractionMasteryBar`, and `RefractionAudienceFeatureCard` (#385).
- **Video Conferencing**: Add `RefractionVideoTile`, `RefractionVideoGrid`, `RefractionCallControls`, `RefractionLiveCaptions`, `RefractionLiveTranscript`, `RefractionAudioRoom`, `RefractionFloatingReactions`, and `RefractionPreCallLobby` (#384).
- **Canvas / Diagramming**: Add `RefractionInfiniteCanvas`, `RefractionStickyNote`, `RefractionFlowEditor`, `RefractionGraphView`, `RefractionLiveCursors`, and `RefractionMiniMap` (#384).
- **Forms / Assessment**: Add `RefractionRatingScale`, `RefractionWizard`, `RefractionRadialGauge`, `RefractionTimeline`, and `RefractionChecklist` (#384).
- **Pipeline**: Add `RefractionSortableList`, `RefractionKanbanBoard`, and `RefractionSlotPicker` (#389).
- **IDE Chrome**: Add `RefractionEditorTabs`, `RefractionTerminal`, `RefractionTestResults`, and `RefractionEditorStatusBar` (#384).

  Brings the Flutter package to complete component parity with all React/Astro easyloops and loopwyse components (Epics #259).

## 0.43.0

- **Auth surface**: Add `RefractionSegmentedControl` — a pill-shaped, radio-semantics value picker with an animated active segment, `sm`/`md` sizes, controlled/uncontrolled usage, and roving arrow/Home/End keyboard navigation.
- **Auth surface**: Add `RefractionPasswordField` — a password input with a built-in show/hide toggle — and extend `RefractionInput` with `validationState` (valid/invalid border + trailing check) and `leadingIcon`.
- **Auth surface**: Add `RefractionSocialAuthButton` / `RefractionSocialAuthRow` — branded Google/GitHub/Microsoft/Apple sign-in buttons with `loading` and a "Last used" badge, plus a responsive one-/two-column row.
- **Auth surface**: Add `RefractionSeparator` — horizontal/vertical rule with an optional centered label (labeled divider).
- **Auth surface**: Add `RefractionEmptyState` / `RefractionConfirmationCard` — a centered icon-chip + title/body/actions column with tone tints and an optional bordered surface.

  Brings the Flutter package to parity with the React/Astro auth-surface components (#330–#334, #339).

## 0.42.0

- **Navigation**: Add `RefractionMobileNav`, a mobile-first bottom/top navigation bar component with integrated icon and label states.

## 0.41.0

- **Accessibility**: Add `RefractionSkipToContent`, an accessibility-first widget that remains visually hidden until focused via keyboard navigation, allowing screen reader and keyboard users to bypass heavy navigation bars.

## 0.40.0

- **Data Presentation**: Add `RefractionVersionSelector`, a dropdown-like widget tailored for displaying and switching between software documentation versions.

## 0.39.0

- **Data Presentation**: Add `RefractionLogger`, a console/log output viewer widget with severity filtering and copy-to-clipboard functionality.

## 0.38.0

- **Data Presentation**: Add `RefractionKeyboardShortcut`, a widget designed to cleanly format and style keyboard shortcut representations (like ⌘ K).

## 0.37.0

- **Data Presentation**: Add `RefractionStatusIndicator`, a customizable status widget for displaying system states (Operational, Degraded, etc.) with support for pulsing animations.

## 0.36.0

- **Data Presentation**: Add `RefractionPresenceIndicator`, a highly customizable status indicator widget often used in tandem with Avatars to denote online presence.

## 0.35.0

- **Data Presentation**: Add `RefractionConversation`, a wrapper component for rendering highly customizable linear chat streams (like SMS or chatbots).

## 0.34.0

- **Data Presentation**: Add `RefractionThreadView`, a wrapper component designed for rendering linear sequences of messages with robust nesting support.

## 0.33.0

- **Data Entry**: Add `RefractionCalendar`, a highly customizable date selection widget supporting single, multiple, and range selection modes.

## 0.32.0

- **Commerce**: Add `RefractionPayment`, a wrapper component for rendering highly customizable payment summaries and order breakdowns.

## 0.31.0

- **Data Entry**: Add `RefractionForm`, a comprehensive wrapper for managing form state, input validation, submission loading states, and error messaging.

## 0.30.0

- **Data Presentation**: Add `RefractionContentProtection`, a wrapper component for blurring, overlaying, and gating content (e.g., paywalls, age gates).

## 0.29.0

- **Feedback Components**: Add `RefractionFeedbackDialog`, providing a pre-built modal logic for collecting structured user feedback with honeypot and email validation.

## 0.28.0

- **Feedback Components**: Add `RefractionCookieConsent`, providing a customizable headless prompt for managing cookie preferences and GDPR compliance.

## 0.27.0

- **Feedback Components**: Add `RefractionInstallPrompt`, providing a customizable headless prompt for triggering app installation flows (PWA/Home Screen).

## 0.26.0

- **Feedback Components**: Add `RefractionCallout`, providing prominent headless banners for hints, warnings, and error highlights with 5 distinct semantic variants.

## 0.25.0

- **Layout Components**: Add `RefractionSheet`, providing a headless modal side-sheet with drag-to-dismiss gestures for all four edges.

## 0.24.0

- **Data Components**: Add `RefractionDropdownMenu`, providing deeply nested menus with groups, dividers, shortcuts, and disabled states.

## 0.23.0

- **Data Components**: Add `RefractionReactionBar`, providing a headless emoji/icon reaction row with state tracking and tap callbacks.

## 0.22.0

- **Data Components**: Add `RefractionAnimatedText`, providing headless text animations (`fade`, `typewriter`, `slideUp`) with robust typography token integration.

## 0.21.0

- **Data Components**: Add `RefractionCharts`, providing headless data visualization components (`RefractionLineChart`, `RefractionBarChart`, `RefractionPieChart`) with complete theming support.

## 0.20.0

- **Data Components**: Add `RefractionSlideViewer`, providing a headless swipeable slide presentation component with standard web parity.

## 0.19.0

- **Layout Components**: Add `RefractionDeviceFrame`, rendering standard device mockup outlines (iPhone, iPad, Android) powered by `RefractionTheme` styling tokens.

## 0.18.0

- **Data Components**: Add `RefractionDiffViewer`, providing a headless side-by-side or inline code diff visualization powered by `RefractionTheme` styling tokens.

## 0.17.0

- **Data Components**: Add `RefractionMarkdownRenderer`, integrating `flutter_markdown` seamlessly with `RefractionTheme` to map standard markdown tags to Refraction typography tokens.

## 0.16.0

- **Media Components**: Add `RefractionVoicePill`, providing an animated status pill for active recording states, powered by `RefractionTheme` styling tokens.

## 0.15.0

- **Media Components**: Add `RefractionWaveform`, which uses `CustomPainter` to dynamically render audio amplitudes as responsive, theme-aware bars.

## 0.14.0

- **Media Components**: Add `RefractionVideoPlayer`, providing a headless UI shell (play/pause, progress slider, volume controls) overlaying standard video playback, fully synchronized with `RefractionTheme`.

## 0.13.0

- **Data Components**: Add `RefractionTableOfContents` with deep nesting support and semantic token mapping for foreground and muted elements.

## 0.12.0

- **Layout Components**: Add `RefractionAppShell` which provides a foundational layout structure with responsive headers, footers, sidebars, and main content regions.

## 0.11.0

- **Layout Components**: Add `RefractionCardGrid` leveraging responsive algorithms and `LayoutBuilder` constraints to auto-calculate cross-axis alignments.

## 0.10.0

- **Layout Components**: Add `RefractionResizableLayout` providing deeply customizable horizontal/vertical split panels with drag handles and boundary constraints.

## 0.9.0

- **Navigation Components**: Add `RefractionSteps` supporting vertical/horizontal rendering, custom step states, and connector builders.

## 0.8.0

- **Navigation Components**: Add `RefractionPagination` featuring exhaustive logical ellipses boundaries and exact algorithmic match for shadcn/MUI style arrays.

## 0.7.0

- **Data Components**: Add `RefractionFileTree` featuring recursively rendered and deeply nested files/folders with comprehensive keyboard navigation and interaction scaling tests.

## 0.6.0

- **Layout Components**: Add `RefractionCollapsible` leveraging `SizeTransition` for fluid expand/collapse animations and comprehensive state tests.

## 0.5.0

- **Layout Components**: Add `RefractionCarousel` built on top of `PageView` with >100 comprehensive gesture tests and full theme propagation.

## 0.4.0

- **Data Components**: Add `RefractionDataTable` with sorting, filtering, row selection, and comprehensive gesture-based interaction tests.
- **Architecture**: Fix `RefractionCodeEditor` touch interactions by replacing `EditableText` with `TextField`.
- **Theming**: Implement strict `TextSelectionTheme` boundaries across all text inputs (`input.dart`, `code_editor.dart`, `chat_input.dart`, `date_picker.dart`, etc.) to guarantee selection highlights and handles use `RefractionTheme` instead of falling back to the OS Material theme.

## 0.3.0

Implements the "Wave 1" Flutter UI components, bringing 11 new headless, themeable components mapped directly from the Web specifications, closing a major portion of the Component Parity epic.

- **Forms & Inputs**: Add `RefractionInputGroup`, `RefractionSearchBar`, `RefractionDatePicker`, `RefractionFileUpload`, `RefractionEmojiPicker`, `RefractionCodeEditor`, `RefractionCommandInput`, `RefractionInlineEditor`, `RefractionLanguageSelector`, `RefractionLocationSelector`, and `RefractionRichEditor`.
- **Bug Fixes**: Fixed a critical generic inference bug within `RefractionSelect.createState` that caused infinite flex constraints during testing.

## 0.2.0

Adds the Flutter telemetry and analytics surfaces that were missing from the
initial pub.dev release.

- Add the telemetry core with presets, redaction, console/mock/Faro sinks,
  durable delivery, crash capture, lifecycle flush, native context, ATT consent,
  and isolate queue support.
- Add the analytics core with Segment-style envelopes, identity/session
  handling, consent, redaction, HTTP/console/mock sinks, and a namespaced
  `package:refraction_ui/analytics.dart` entrypoint.
- Add mobile analytics adapters for Firebase and PostHog, app background
  session tracking, secure storage abstractions, and iOS privacy/store
  compliance metadata.
- Export telemetry from the main package barrel and analytics from both the
  main barrel and the analytics-specific barrel while preserving the web
  contracts and uniform cross-platform structure.

## 0.1.0

Initial release of `refraction_ui` for Flutter — a headless, highly customizable, fully accessible UI library mirroring the Refraction UI design system.

Components included:

- **Layout & navigation**: Sidebar, Tabs, Accordion
- **Inputs & forms**: Input, Select, Checkbox, Radio, RadioGroup, Switch, OTP Input
- **Buttons & menus**: Button, Command Menu, Dropdown
- **Feedback**: Alert, Toast, Tooltip, Skeleton, Progress, Slider
- **Identity & status**: Avatar, Badge
- **Theming**: `RefractionTheme`, `RefractionThemeData`, `RefractionColors`

All components consume `RefractionThemeData` for theme tokens, matching the headless-and-token-driven approach of the React/Angular/Astro packages.
