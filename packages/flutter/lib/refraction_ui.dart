/// Refraction UI for Flutter — a headless, accessible, token-driven UI
/// component library.
///
/// Refraction UI ships the same primitive set across React, Astro,
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
export 'src/components/diff_viewer.dart';
export 'src/components/dropdown_menu.dart';
export 'src/components/command_menu.dart';
export 'src/components/radio_group.dart';
export 'src/components/progress_slider.dart';
export 'src/components/alert.dart';
export 'src/components/callout.dart';
export 'src/components/avatar.dart';
export 'src/components/badge.dart';
export 'src/components/button.dart';
export 'src/components/checkbox.dart';
export 'src/components/chat_input.dart';
export 'src/components/dialog.dart';
export 'src/components/install_prompt.dart';
export 'src/components/input.dart';
export 'src/components/input_group.dart';
export 'src/components/search_bar.dart';
export 'src/components/otp_input.dart';
export 'src/components/popover.dart';
export 'src/components/select.dart';
export 'src/components/switch.dart';
export 'src/components/data_table.dart';
export 'src/components/tabs.dart';
export 'src/components/toast.dart';
export 'src/components/tooltip.dart';
export 'src/components/file_upload.dart';
export 'src/components/card.dart';
export 'src/components/card_grid.dart';
export 'src/components/date_picker.dart';
export 'src/components/device_frame.dart';
export 'src/components/navbar.dart';
export 'src/components/sidebar.dart';
export 'src/components/bottom_nav.dart';
export 'src/components/breadcrumbs.dart';
export 'src/components/footer.dart';
export 'src/components/skeleton.dart';
export 'src/components/carousel.dart';
export 'src/components/collapsible.dart';
export 'src/telemetry/telemetry.dart';

// Analytics — headless Segment-spec collector/router (1:1 port of
// @refraction-ui/analytics). Uniform API/structure across web/Android/iOS/
// desktop; platform differences are internal behind conditional imports.
//
// `createConsoleSink` is hidden here because it collides with the telemetry
// module's flat-barrel `createConsoleSink` (telemetry owns the flat barrel,
// unchanged). The full analytics surface — including its `createConsoleSink`
// — is available with no parity loss via the namespaced entrypoint
// `package:refraction_ui/analytics.dart`.
export 'src/analytics/analytics.dart' hide createConsoleSink;
export 'src/components/emoji_picker.dart';
export 'src/components/code_editor.dart';
export 'src/components/command_input.dart';
export 'src/components/inline_editor.dart';
export 'src/components/rich_editor.dart';
export 'src/components/language_selector.dart';
export 'src/components/location_selector.dart';
export 'src/components/file_tree.dart';
export 'src/components/pagination.dart';
export 'src/components/steps.dart';
export 'src/components/resizable_layout.dart';
export 'src/components/app_shell.dart';
export 'src/components/table_of_contents.dart';
export 'src/components/video_player.dart';
export 'src/components/markdown_renderer.dart';
export 'src/components/animated_text.dart';
export 'src/components/slide_viewer.dart';
export 'src/components/charts.dart';


export 'src/components/waveform.dart';
export 'src/components/feedback_dialog.dart';
export 'src/components/voice_pill.dart';
export 'src/components/reaction_bar.dart';
export 'src/components/sheet.dart';
export 'src/components/cookie_consent.dart';
export 'src/components/feedback_dialog.dart';
export 'src/components/content_protection.dart';
export 'src/components/form.dart';
export 'src/components/payment.dart';
export 'src/components/calendar.dart';
export 'src/components/thread_view.dart';
export 'src/components/conversation.dart';
export 'src/components/presence_indicator.dart';
export 'src/components/status_indicator.dart';
export 'src/components/keyboard_shortcut.dart';
export 'src/components/logger.dart';
