import 'package:flutter/material.dart';
import 'refraction_colors.dart';
import 'refraction_theme_data.dart';

/// Inherited widget that exposes a [RefractionThemeData] to its descendants.
///
/// Place a [RefractionTheme] near the root of your widget tree (typically
/// wrapping your `MaterialApp` or `CupertinoApp`) so that every Refraction
/// UI component below it can resolve colors, radii, shadows, and typography
/// through the [RefractionThemeExtension] getters on [BuildContext].
///
/// This is the Flutter sibling of the React `<RefractionThemeProvider>` and
/// the Angular `RefractionThemeService` — same semantic tokens, same
/// palettes, just plumbed through Flutter's [InheritedTheme] mechanism so it
/// also works correctly across `Navigator` route boundaries.
///
/// ```dart
/// RefractionTheme(
///   data: RefractionThemeData.light(),
///   child: const MyApp(),
/// )
/// ```
class RefractionTheme extends InheritedTheme {
  /// The active theme configuration — palette, radius, shadows, typography.
  final RefractionThemeData data;

  /// Creates a [RefractionTheme] that publishes [data] to its descendants.
  ///
  /// The [child] subtree may read the theme via [RefractionTheme.of] or the
  /// [RefractionThemeExtension] convenience getters on [BuildContext].
  const RefractionTheme({super.key, required this.data, required super.child});

  /// The semantic color tokens from [data]. Convenience shortcut for
  /// `data.colors`.
  RefractionColors get colors => data.colors;

  /// The default corner radius from [data]. Convenience shortcut for
  /// `data.borderRadius`.
  double get borderRadius => data.borderRadius;

  /// Returns the nearest enclosing [RefractionTheme] from [context], or
  /// `null` if none has been installed.
  ///
  /// Use this when a missing theme is a recoverable condition. For the
  /// common case of "I require a theme to render", prefer [of].
  static RefractionTheme? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<RefractionTheme>();
  }

  /// Returns the nearest enclosing [RefractionTheme] from [context].
  ///
  /// In debug builds, asserts that a theme exists in the tree. Always wrap
  /// your app in a [RefractionTheme] before calling this.
  static RefractionTheme of(BuildContext context) {
    final RefractionTheme? result = maybeOf(context);
    assert(result != null, 'No RefractionTheme found in context');
    return result!;
  }

  /// Notifies dependents only when the underlying [data] reference changes.
  @override
  bool updateShouldNotify(RefractionTheme oldWidget) {
    return data != oldWidget.data;
  }

  /// Re-publishes this theme onto a new [child] subtree — required by
  /// [InheritedTheme] so the theme follows widgets pushed through
  /// `Navigator` routes and `Overlay` entries.
  @override
  Widget wrap(BuildContext context, Widget child) {
    return RefractionTheme(data: data, child: child);
  }
}

/// Convenience accessors for [RefractionTheme] from any [BuildContext].
///
/// These let widgets read the active theme without typing
/// `RefractionTheme.of(context).data` everywhere:
///
/// ```dart
/// final colors = context.refractionColors;
/// final radius = context.refractionTheme.borderRadius;
/// ```
extension RefractionThemeExtension on BuildContext {
  /// The active [RefractionThemeData] from the nearest enclosing
  /// [RefractionTheme]. Throws in debug if no theme is installed.
  RefractionThemeData get refractionTheme => RefractionTheme.of(this).data;

  /// The active [RefractionColors] from the nearest enclosing
  /// [RefractionTheme]. Shortcut for `refractionTheme.colors`.
  RefractionColors get refractionColors => RefractionTheme.of(this).colors;
}
