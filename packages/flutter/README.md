# refraction_ui

A headless, highly customizable, and fully accessible Flutter UI library — the Flutter port of [Refraction UI](https://github.com/elloloop/refraction-ui).

`refraction_ui` brings the same headless-and-token-driven approach used by Refraction UI's React, Angular, and Astro packages to Flutter. Components consume a single `RefractionThemeData` for tokens (colors, radii, typography), so you can match an existing brand or design system by configuring tokens in one place rather than re-styling each widget.

## Features

A complete primitives set, all driven by `RefractionThemeData`:

- **Layout & navigation** — `RefractionSidebar`, `RefractionTabs`, `RefractionAccordion`, `RefractionBreadcrumbs`, `RefractionBottomNav`, `RefractionNavbar`
- **Inputs & forms** — `RefractionInput`, `RefractionSelect`, `RefractionCheckbox`, `RefractionRadioGroup`, `RefractionSwitch`, `RefractionOtpInput`, `RefractionRichChatInput`
- **Buttons & menus** — `RefractionButton`, `RefractionCommandMenu`, `RefractionDropdown`
- **Feedback** — `RefractionAlert`, `RefractionToast`, `RefractionTooltip`, `RefractionSkeleton`, `RefractionProgress`, `RefractionSlider`
- **Identity** — `RefractionAvatar`, `RefractionBadge`
- **Theming** — `RefractionTheme`, `RefractionThemeData`, `RefractionColors`

All widgets are pure Flutter — no platform channels, no native code. Behavior, accessibility (`Semantics`), and keyboard handling match the platform conventions you'd expect.

## Getting started

Add to your `pubspec.yaml`:

```yaml
dependencies:
  refraction_ui: ^0.1.0
```

Then wrap your app in `RefractionTheme` near the root, supplying a `RefractionThemeData`:

```dart
import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  runApp(
    RefractionTheme(
      data: RefractionThemeData.light(),  // or .dark()
      child: const MyApp(),
    ),
  );
}
```

Every component below this point reads its tokens from `RefractionTheme.of(context)`.

## Usage

Buttons:

```dart
RefractionButton(
  variant: RefractionButtonVariant.primary,
  onPressed: () => debugPrint('tapped'),
  child: const Text('Submit'),
)
```

Inputs:

```dart
RefractionInput(
  controller: _controller,
  placeholder: 'name@example.com',
  onChanged: (value) => setState(() => _email = value),
)
```

Tabs:

```dart
RefractionTabs(
  tabs: const ['Overview', 'Activity', 'Settings'],
  contents: [OverviewPage(), ActivityPage(), SettingsPage()],
)
```

Custom theme tokens:

```dart
RefractionTheme(
  data: RefractionThemeData.light().copyWith(
    colors: const RefractionColors.light().copyWith(
      primary: Color(0xFF6366F1),
      primaryForeground: Colors.white,
    ),
    borderRadius: 12.0,
  ),
  child: const MyApp(),
)
```

Longer end-to-end examples (a complete demo app showing every component, plus role-specific dashboards and a developer tools harness) live under [`example/`](https://github.com/elloloop/refraction-ui/tree/main/packages/flutter/example).

## Additional information

- **Source & issues**: [github.com/elloloop/refraction-ui](https://github.com/elloloop/refraction-ui) (this Flutter package lives under `packages/flutter/`)
- **Sister packages**: React (`@refraction-ui/react`), Angular (`@refraction-ui/angular-*`), Astro (`@refraction-ui/astro-*`) — same design tokens, framework-idiomatic APIs.
- **Design tokens**: shared across all framework packages, so an app mixing Flutter (mobile) and React (web) can keep visual parity by exporting the same `RefractionColors` values to both.
- **License**: MIT.
