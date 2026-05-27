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
