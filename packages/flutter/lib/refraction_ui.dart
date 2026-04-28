/// Refraction UI for Flutter — a headless, accessible, token-driven UI
/// component library.
///
/// Refraction UI ships the same primitive set across React, Angular, Astro,
/// and Flutter so a single design language travels with your product across
/// every surface. Components are built on a small set of semantic color
/// tokens (see [RefractionColors]) and a single [RefractionThemeData] so an
/// app-wide visual change is one line. See [RefractionThemeExtension] for
/// the convenience [BuildContext] getters used throughout the docs.
///
/// Live demo of the Flutter primitives:
/// <https://elloloop.github.io/refraction-ui/flutter/>
///
/// ## Getting started
///
/// Wrap your app in a [RefractionTheme] near the root and pass a
/// [RefractionThemeData] — every Refraction widget below it picks up the
/// active palette via the [RefractionThemeExtension] getters on
/// [BuildContext].
///
/// ```dart
/// import 'package:flutter/material.dart';
/// import 'package:refraction_ui/refraction_ui.dart';
///
/// void main() {
///   runApp(
///     RefractionTheme(
///       data: RefractionThemeData.light(),
///       child: const MaterialApp(home: MyHomePage()),
///     ),
///   );
/// }
/// ```
///
/// Switch palettes by swapping the factory — for example
/// `RefractionThemeData.fintechDark()` or `RefractionThemeData.wellnessLight()`.
library;

export 'src/theme/refraction_colors.dart';
export 'src/theme/refraction_theme.dart';
export 'src/theme/refraction_theme_data.dart';
export 'src/components/accordion.dart';
export 'src/components/menus.dart';
export 'src/components/command_menu.dart';
export 'src/components/radio_group.dart';
export 'src/components/progress_slider.dart';
export 'src/components/alert.dart';
export 'src/components/avatar.dart';
export 'src/components/badge.dart';
export 'src/components/button.dart';
export 'src/components/checkbox.dart';
export 'src/components/chat_input.dart';
export 'src/components/dialog.dart';
export 'src/components/input.dart';
export 'src/components/otp_input.dart';
export 'src/components/popover.dart';
export 'src/components/select.dart';
export 'src/components/switch.dart';
export 'src/components/tabs.dart';
export 'src/components/toast.dart';
export 'src/components/tooltip.dart';
export 'src/components/card.dart';
export 'src/components/navbar.dart';
export 'src/components/sidebar.dart';
export 'src/components/bottom_nav.dart';
export 'src/components/breadcrumbs.dart';
export 'src/components/footer.dart';
export 'src/components/skeleton.dart';
