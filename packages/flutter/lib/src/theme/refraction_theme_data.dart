import 'package:flutter/material.dart';
import 'refraction_colors.dart';

/// The full visual configuration for a Refraction UI app.
///
/// Bundles the semantic [RefractionColors] palette together with shared
/// values that every component reads — corner radius, optional font family,
/// and the soft/heavy [BoxShadow] stacks used by elevated surfaces such as
/// dialogs, popovers, and cards.
///
/// Use one of the named factory constructors for a curated palette
/// (`minimalLight`, `fintechDark`, `wellnessLight`, `creativeDark`,
/// `productivityLight`, …), or construct directly with a custom
/// [RefractionColors] for a fully bespoke brand.
///
/// Pass the resulting object to a [RefractionTheme] near the root of your
/// app:
///
/// ```dart
/// RefractionTheme(
///   data: RefractionThemeData.fintechDark(),
///   child: const MyApp(),
/// )
/// ```
///
/// Mirrors the `RefractionThemeData` token contract used by the React,
/// Angular, and Astro Refraction UI libraries so design decisions stay
/// portable across platforms.
class RefractionThemeData {
  /// Semantic color tokens (`primary`, `background`, `border`, …) that all
  /// Refraction widgets paint themselves with.
  final RefractionColors colors;

  /// Default corner radius (in logical pixels) applied to buttons, inputs,
  /// cards, and other rounded surfaces. Defaults to `8.0`.
  final double borderRadius;

  /// Optional font family applied through [textStyle]. When `null`, the
  /// platform default is used.
  final String? fontFamily;

  /// Soft, low-opacity shadow stack used for resting elevation — cards,
  /// quiet popovers, subtle floating panels.
  final List<BoxShadow>? softShadow;

  /// Heavier shadow stack used for prominent elevation — dialogs, menus,
  /// command palettes, sheets.
  final List<BoxShadow>? heavyShadow;

  /// Creates a [RefractionThemeData] from explicit tokens.
  ///
  /// Only [colors] is required; [borderRadius] defaults to `8.0` and the
  /// shadow stacks default to `null` (components fall back to flat
  /// surfaces). Most apps should prefer one of the curated factories such
  /// as [RefractionThemeData.light] or [RefractionThemeData.fintechDark].
  const RefractionThemeData({
    required this.colors,
    this.borderRadius = 8.0,
    this.fontFamily,
    this.softShadow,
    this.heavyShadow,
  });

  /// Minimal palette in light mode — pure monochrome, Apple/Nike feel.
  factory RefractionThemeData.minimalLight() => RefractionThemeData(
    colors: RefractionColors.minimalLight,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );

  /// Minimal palette in dark mode — deepest blacks, soft white foregrounds.
  factory RefractionThemeData.minimalDark() => RefractionThemeData(
    colors: RefractionColors.minimalDark,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  /// Fintech palette in light mode — Revolut-style neon green primary on a
  /// crisp neutral surface.
  factory RefractionThemeData.fintechLight() => RefractionThemeData(
    colors: RefractionColors.fintechLight,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );

  /// Fintech palette in dark mode — bright accent green over deep blue-black
  /// chrome.
  factory RefractionThemeData.fintechDark() => RefractionThemeData(
    colors: RefractionColors.fintechDark,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  /// Wellness palette in light mode — warm off-whites, organic taupe
  /// borders, soft coral accents (Flo / Headspace feel).
  factory RefractionThemeData.wellnessLight() => RefractionThemeData(
    colors: RefractionColors.wellnessLight,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );

  /// Wellness palette in dark mode — warm browns and muted coral primaries.
  factory RefractionThemeData.wellnessDark() => RefractionThemeData(
    colors: RefractionColors.wellnessDark,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  /// Creative palette in light mode — Discord/Figma "blurple" energy on
  /// neutral white chrome.
  factory RefractionThemeData.creativeLight() => RefractionThemeData(
    colors: RefractionColors.creativeLight,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );

  /// Creative palette in dark mode — indigo primaries on near-black
  /// surfaces.
  factory RefractionThemeData.creativeDark() => RefractionThemeData(
    colors: RefractionColors.creativeDark,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  /// Productivity palette in light mode — Linear-style subdued blues on
  /// crisp clean grays.
  factory RefractionThemeData.productivityLight() => RefractionThemeData(
    colors: RefractionColors.productivityLight,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );

  /// Productivity palette in dark mode — soft sky blue on graphite.
  factory RefractionThemeData.productivityDark() => RefractionThemeData(
    colors: RefractionColors.productivityDark,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  /// Default light theme. Currently aliases [RefractionThemeData.minimalLight].
  factory RefractionThemeData.light() => RefractionThemeData.minimalLight();

  /// Default dark theme. Currently aliases [RefractionThemeData.minimalDark].
  factory RefractionThemeData.dark() => RefractionThemeData.minimalDark();

  // Mobbin Aesthetics focus on highly diffused, floating, gentle layered shadows rather than stark dark lines.
  static const List<BoxShadow> _lightSoftShadow = [
    BoxShadow(color: Color(0x05000000), blurRadius: 4, offset: Offset(0, 2)),
    BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4)),
  ];

  static const List<BoxShadow> _lightHeavyShadow = [
    BoxShadow(color: Color(0x0A000000), blurRadius: 12, offset: Offset(0, 8)),
    BoxShadow(color: Color(0x05000000), blurRadius: 32, offset: Offset(0, 12)),
  ];

  static const List<BoxShadow> _darkSoftShadow = [
    BoxShadow(color: Color(0x19000000), blurRadius: 8, offset: Offset(0, 2)),
  ];

  static const List<BoxShadow> _darkHeavyShadow = [
    BoxShadow(color: Color(0x2A000000), blurRadius: 24, offset: Offset(0, 10)),
  ];

  /// Returns a copy of this theme data with the given fields replaced.
  ///
  /// Pass only the fields you want to override; everything else is carried
  /// from the receiver. Useful for deriving variants — for example, a
  /// theme with the wellness palette but a custom font:
  ///
  /// ```dart
  /// final branded = RefractionThemeData.wellnessLight()
  ///     .copyWith(fontFamily: 'Inter', borderRadius: 12);
  /// ```
  RefractionThemeData copyWith({
    RefractionColors? colors,
    double? borderRadius,
    String? fontFamily,
    List<BoxShadow>? softShadow,
    List<BoxShadow>? heavyShadow,
  }) {
    return RefractionThemeData(
      colors: colors ?? this.colors,
      borderRadius: borderRadius ?? this.borderRadius,
      fontFamily: fontFamily ?? this.fontFamily,
      softShadow: softShadow ?? this.softShadow,
      heavyShadow: heavyShadow ?? this.heavyShadow,
    );
  }

  /// A base [TextStyle] honoring the theme's [fontFamily] and
  /// [RefractionColors.foreground].
  ///
  /// Use this as the starting point for body copy so text picks up the
  /// active palette automatically and stays readable across light/dark
  /// switches.
  TextStyle get textStyle {
    return TextStyle(fontFamily: fontFamily, color: colors.foreground);
  }
}
