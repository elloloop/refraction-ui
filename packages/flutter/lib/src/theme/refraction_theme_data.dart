import 'package:flutter/material.dart';
import 'refraction_colors.dart';
import 'refraction_typography.dart';

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
/// Mirrors the `RefractionThemeData` token contract used by the React
/// and Astro Refraction UI libraries so design decisions stay
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

  /// Typography tokens — fonts-by-role, the role-based type scale, an optional
  /// variable-font weight, and a text-scale factor. Defaults to a complete
  /// scale (`const RefractionTypography()`); read [resolvedTypography] to get
  /// the scale with this theme's [fontFamily] folded in.
  final RefractionTypography typography;

  // ---------------------------------------------------------------------------
  // Optional scale tokens.
  //
  // Each is stored as a nullable override with a same-named getter that
  // derives a default from an existing token (the base [borderRadius], the
  // soft/heavy shadow stacks, or a fixed step). Nothing existing has to pass
  // them, and every derived default equals the value components already used,
  // so appearance is unchanged until a consumer opts in.
  // ---------------------------------------------------------------------------

  final List<BoxShadow>? _softShadow;
  final List<BoxShadow>? _heavyShadow;
  final List<BoxShadow>? _elevationSm;
  final List<BoxShadow>? _elevationMd;
  final List<BoxShadow>? _elevationLg;
  final Color? _shadowTint;
  final double? _radiusSm;
  final double? _radiusMd;
  final double? _radiusLg;
  final double? _radiusPill;
  final double? _radiusSheet;
  final double? _spacingXs;
  final double? _spacingSm;
  final double? _spacingMd;
  final double? _spacingLg;
  final double? _spacingXl;
  final double? _gutter;
  final double? _controlHeightSm;
  final double? _controlHeightMd;
  final double? _controlHeightLg;

  /// Soft, low-opacity shadow stack used for resting elevation — cards,
  /// quiet popovers, subtle floating panels. Back-compat alias for
  /// [elevationSm]: returns the explicit `softShadow` if one was given,
  /// otherwise the small elevation step.
  List<BoxShadow>? get softShadow => _softShadow ?? _elevationSm;

  /// Heavier shadow stack used for prominent elevation — dialogs, menus,
  /// command palettes, sheets. Back-compat alias for [elevationLg]: returns
  /// the explicit `heavyShadow` if one was given, otherwise the large
  /// elevation step.
  List<BoxShadow>? get heavyShadow => _heavyShadow ?? _elevationLg;

  /// Small resting elevation. Defaults to [softShadow].
  List<BoxShadow>? get elevationSm => _elevationSm ?? _softShadow;

  /// Medium elevation, between resting and prominent. Defaults to the heavy
  /// stack, then the soft stack.
  List<BoxShadow>? get elevationMd =>
      _elevationMd ?? _heavyShadow ?? _softShadow;

  /// Large, prominent elevation. Defaults to [heavyShadow].
  List<BoxShadow>? get elevationLg => _elevationLg ?? _heavyShadow;

  /// Base color a themed shadow tints toward. Defaults to
  /// `colors.foreground`. Advertised as a token; the built-in shadow stacks
  /// keep their neutral black so appearance is unchanged.
  Color get shadowTint => _shadowTint ?? colors.foreground;

  /// Small corner radius. Defaults to the base [borderRadius].
  double get radiusSm => _radiusSm ?? borderRadius;

  /// Medium corner radius — the default control radius (buttons, inputs).
  /// Defaults to the base [borderRadius].
  double get radiusMd => _radiusMd ?? borderRadius;

  /// Large corner radius — cards, sheets, prominent surfaces. Defaults to the
  /// base [borderRadius] (set it larger for rounder cards than controls).
  double get radiusLg => _radiusLg ?? borderRadius;

  /// Fully-rounded ("pill") radius for chips, avatars, and toggles. Defaults
  /// to `999`.
  double get radiusPill => _radiusPill ?? 999.0;

  /// Bottom-sheet / large-surface radius. Defaults to `borderRadius * 3.5`.
  double get radiusSheet => _radiusSheet ?? borderRadius * 3.5;

  /// Extra-small spacing step. Defaults to `4`.
  double get spacingXs => _spacingXs ?? 4.0;

  /// Small spacing step. Defaults to `8`.
  double get spacingSm => _spacingSm ?? 8.0;

  /// Medium spacing step. Defaults to `12`.
  double get spacingMd => _spacingMd ?? 12.0;

  /// Large spacing step. Defaults to `16`.
  double get spacingLg => _spacingLg ?? 16.0;

  /// Extra-large spacing step — card/section padding. Defaults to `24`.
  double get spacingXl => _spacingXl ?? 24.0;

  /// Gutter between columns/list items. Defaults to `16`.
  double get gutter => _gutter ?? 16.0;

  /// Minimum height for small controls. Defaults to `32`.
  double get controlHeightSm => _controlHeightSm ?? 32.0;

  /// Minimum height for default controls. Defaults to `36`.
  double get controlHeightMd => _controlHeightMd ?? 36.0;

  /// Minimum height for large controls. Defaults to `44`.
  double get controlHeightLg => _controlHeightLg ?? 44.0;

  /// The [typography] scale with this theme's [fontFamily] folded in as the
  /// fallback family for every role, so the scale defaults to the theme font.
  RefractionTypography get resolvedTypography =>
      typography.resolveFontFamily(fontFamily);

  /// Creates a [RefractionThemeData] from explicit tokens.
  ///
  /// Only [colors] is required; [borderRadius] defaults to `8.0`, the shadow
  /// stacks default to `null` (components fall back to flat surfaces), and the
  /// scale tokens ([radiusMd], [spacingXl], [elevationSm], …) each derive a
  /// default from these. Most apps should prefer one of the curated factories
  /// such as [RefractionThemeData.light] or [RefractionThemeData.fintechDark].
  const RefractionThemeData({
    required this.colors,
    this.borderRadius = 8.0,
    this.fontFamily,
    this.typography = const RefractionTypography(),
    List<BoxShadow>? softShadow,
    List<BoxShadow>? heavyShadow,
    List<BoxShadow>? elevationSm,
    List<BoxShadow>? elevationMd,
    List<BoxShadow>? elevationLg,
    Color? shadowTint,
    double? radiusSm,
    double? radiusMd,
    double? radiusLg,
    double? radiusPill,
    double? radiusSheet,
    double? spacingXs,
    double? spacingSm,
    double? spacingMd,
    double? spacingLg,
    double? spacingXl,
    double? gutter,
    double? controlHeightSm,
    double? controlHeightMd,
    double? controlHeightLg,
  }) : _softShadow = softShadow,
       _heavyShadow = heavyShadow,
       _elevationSm = elevationSm,
       _elevationMd = elevationMd,
       _elevationLg = elevationLg,
       _shadowTint = shadowTint,
       _radiusSm = radiusSm,
       _radiusMd = radiusMd,
       _radiusLg = radiusLg,
       _radiusPill = radiusPill,
       _radiusSheet = radiusSheet,
       _spacingXs = spacingXs,
       _spacingSm = spacingSm,
       _spacingMd = spacingMd,
       _spacingLg = spacingLg,
       _spacingXl = spacingXl,
       _gutter = gutter,
       _controlHeightSm = controlHeightSm,
       _controlHeightMd = controlHeightMd,
       _controlHeightLg = controlHeightLg;

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

  static RefractionThemeData refractionLight() => RefractionThemeData(
    colors: RefractionColors.refractionLight,
    borderRadius: 6.0,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );

  static RefractionThemeData refractionDark() => RefractionThemeData(
    colors: RefractionColors.refractionDark,
    borderRadius: 6.0,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  static RefractionThemeData luxeLight() => RefractionThemeData(
    colors: RefractionColors.luxeLight,
    borderRadius: 12.0,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );

  static RefractionThemeData luxeDark() => RefractionThemeData(
    colors: RefractionColors.luxeDark,
    borderRadius: 12.0,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  static RefractionThemeData warmLight() => RefractionThemeData(
    colors: RefractionColors.warmLight,
    borderRadius: 12.0,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );

  static RefractionThemeData warmDark() => RefractionThemeData(
    colors: RefractionColors.warmDark,
    borderRadius: 12.0,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  static RefractionThemeData signalLight() => RefractionThemeData(
    colors: RefractionColors.signalLight,
    borderRadius: 6.0,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );

  static RefractionThemeData signalDark() => RefractionThemeData(
    colors: RefractionColors.signalDark,
    borderRadius: 6.0,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  static RefractionThemeData pulseLight() => RefractionThemeData(
    colors: RefractionColors.pulseLight,
    borderRadius: 16.0,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );

  static RefractionThemeData pulseDark() => RefractionThemeData(
    colors: RefractionColors.pulseDark,
    borderRadius: 16.0,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  static RefractionThemeData monoLight() => RefractionThemeData(
    colors: RefractionColors.monoLight,
    borderRadius: 4.0,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );

  static RefractionThemeData monoDark() => RefractionThemeData(
    colors: RefractionColors.monoDark,
    borderRadius: 4.0,
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
    RefractionTypography? typography,
    List<BoxShadow>? softShadow,
    List<BoxShadow>? heavyShadow,
    List<BoxShadow>? elevationSm,
    List<BoxShadow>? elevationMd,
    List<BoxShadow>? elevationLg,
    Color? shadowTint,
    double? radiusSm,
    double? radiusMd,
    double? radiusLg,
    double? radiusPill,
    double? radiusSheet,
    double? spacingXs,
    double? spacingSm,
    double? spacingMd,
    double? spacingLg,
    double? spacingXl,
    double? gutter,
    double? controlHeightSm,
    double? controlHeightMd,
    double? controlHeightLg,
  }) {
    return RefractionThemeData(
      colors: colors ?? this.colors,
      borderRadius: borderRadius ?? this.borderRadius,
      fontFamily: fontFamily ?? this.fontFamily,
      typography: typography ?? this.typography,
      // Scale tokens carry their raw override state (never the derived
      // default) so an untouched tier keeps deriving from the base tokens.
      softShadow: softShadow ?? _softShadow,
      heavyShadow: heavyShadow ?? _heavyShadow,
      elevationSm: elevationSm ?? _elevationSm,
      elevationMd: elevationMd ?? _elevationMd,
      elevationLg: elevationLg ?? _elevationLg,
      shadowTint: shadowTint ?? _shadowTint,
      radiusSm: radiusSm ?? _radiusSm,
      radiusMd: radiusMd ?? _radiusMd,
      radiusLg: radiusLg ?? _radiusLg,
      radiusPill: radiusPill ?? _radiusPill,
      radiusSheet: radiusSheet ?? _radiusSheet,
      spacingXs: spacingXs ?? _spacingXs,
      spacingSm: spacingSm ?? _spacingSm,
      spacingMd: spacingMd ?? _spacingMd,
      spacingLg: spacingLg ?? _spacingLg,
      spacingXl: spacingXl ?? _spacingXl,
      gutter: gutter ?? _gutter,
      controlHeightSm: controlHeightSm ?? _controlHeightSm,
      controlHeightMd: controlHeightMd ?? _controlHeightMd,
      controlHeightLg: controlHeightLg ?? _controlHeightLg,
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
