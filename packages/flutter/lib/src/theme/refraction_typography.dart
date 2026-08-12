import 'package:flutter/material.dart';

/// Typography tokens for a Refraction UI app: fonts-by-role, a role-based type
/// scale, an optional variable-font weight axis, and a global text-scale
/// factor.
///
/// Like [RefractionColors], every field is optional and every role resolves to
/// a sensible default, so `const RefractionTypography()` already exposes a
/// complete, usable scale. Supply a font-by-role (e.g. a display face distinct
/// from body copy), override an individual role's [TextStyle], set a
/// [variableWeight] to drive a variable font's `wght` axis, or nudge
/// [textScale] to grow/shrink the whole scale — each independently of the rest.
///
/// The role names mirror the React/Astro Refraction type scale so the same
/// design decision travels across platforms.
@immutable
class RefractionTypography {
  /// Font family for large display/headline/title roles. Falls back to
  /// [fontBody] when unset (and ultimately to the ambient font family).
  final String? fontDisplay;

  /// Font family for body/label/caption/kicker roles. When unset, roles
  /// inherit the ambient font family.
  final String? fontBody;

  /// Monospace font family for code and tabular numerals. Advertised as a
  /// token for consumers; not applied to any role in the default scale.
  final String? fontMono;

  /// Serif font family. Advertised as a token for consumers; not applied to
  /// any role in the default scale.
  final String? fontSerif;

  /// Global multiplier applied to every role's `fontSize`. Defaults to `1.0`
  /// (no scaling). Use it for a responsive/accessibility bump without editing
  /// each role.
  final double textScale;

  /// Optional variable-font weight (the `wght` axis, ~1–1000). When set it is
  /// applied as a [FontVariation] to every role, so a single value re-weights
  /// the whole scale on a variable face.
  final double? variableWeight;

  final TextStyle? _display;
  final TextStyle? _headline;
  final TextStyle? _title;
  final TextStyle? _body;
  final TextStyle? _label;
  final TextStyle? _caption;
  final TextStyle? _kicker;

  /// Creates a [RefractionTypography]. All arguments are optional; omitted
  /// roles fall back to the default scale below.
  const RefractionTypography({
    this.fontDisplay,
    this.fontBody,
    this.fontMono,
    this.fontSerif,
    this.textScale = 1.0,
    this.variableWeight,
    TextStyle? display,
    TextStyle? headline,
    TextStyle? title,
    TextStyle? body,
    TextStyle? label,
    TextStyle? caption,
    TextStyle? kicker,
  }) : _display = display,
       _headline = headline,
       _title = title,
       _body = body,
       _label = label,
       _caption = caption,
       _kicker = kicker;

  // Default role scale (family/weight/text-scale are layered on at read time).
  static const TextStyle _displayBase = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.w700,
    height: 1.15,
    letterSpacing: -0.5,
  );
  static const TextStyle _headlineBase = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w700,
    height: 1.2,
    letterSpacing: -0.4,
  );
  static const TextStyle _titleBase = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.3,
    letterSpacing: -0.2,
  );
  static const TextStyle _bodyBase = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );
  static const TextStyle _labelBase = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    height: 1.4,
  );
  static const TextStyle _captionBase = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.4,
  );
  static const TextStyle _kickerBase = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    height: 1.3,
    letterSpacing: 0.8,
  );

  /// Largest role — hero/marketing headlines.
  TextStyle get display => _resolve(_display ?? _displayBase, _displayFont);

  /// Section headline.
  TextStyle get headline => _resolve(_headline ?? _headlineBase, _displayFont);

  /// Card/panel title.
  TextStyle get title => _resolve(_title ?? _titleBase, _displayFont);

  /// Default body copy.
  TextStyle get body => _resolve(_body ?? _bodyBase, fontBody);

  /// Form labels and small emphasis.
  TextStyle get label => _resolve(_label ?? _labelBase, fontBody);

  /// Secondary/caption copy.
  TextStyle get caption => _resolve(_caption ?? _captionBase, fontBody);

  /// Uppercase eyebrow/kicker above a heading.
  TextStyle get kicker => _resolve(_kicker ?? _kickerBase, fontBody);

  String? get _displayFont => fontDisplay ?? fontBody;

  TextStyle _resolve(TextStyle base, String? family) {
    var style = base;
    if (family != null) {
      style = style.copyWith(fontFamily: family);
    }
    if (textScale != 1.0 && style.fontSize != null) {
      style = style.copyWith(fontSize: style.fontSize! * textScale);
    }
    if (variableWeight != null) {
      style = style.copyWith(
        fontVariations: <FontVariation>[FontVariation('wght', variableWeight!)],
      );
    }
    return style;
  }

  /// Returns a copy whose unset font-by-role families fall back to [base].
  ///
  /// [RefractionThemeData] calls this with its `fontFamily` so the whole type
  /// scale defaults to the theme's font, matching the pre-existing behavior of
  /// `RefractionThemeData.textStyle`.
  RefractionTypography resolveFontFamily(String? base) {
    if (base == null) return this;
    return copyWith(
      fontDisplay: fontDisplay ?? base,
      fontBody: fontBody ?? base,
      fontMono: fontMono ?? base,
      fontSerif: fontSerif ?? base,
    );
  }

  /// Returns a copy with the given fields replaced; omitted fields are carried
  /// through from the receiver (including any per-role [TextStyle] overrides).
  RefractionTypography copyWith({
    String? fontDisplay,
    String? fontBody,
    String? fontMono,
    String? fontSerif,
    double? textScale,
    double? variableWeight,
    TextStyle? display,
    TextStyle? headline,
    TextStyle? title,
    TextStyle? body,
    TextStyle? label,
    TextStyle? caption,
    TextStyle? kicker,
  }) {
    return RefractionTypography(
      fontDisplay: fontDisplay ?? this.fontDisplay,
      fontBody: fontBody ?? this.fontBody,
      fontMono: fontMono ?? this.fontMono,
      fontSerif: fontSerif ?? this.fontSerif,
      textScale: textScale ?? this.textScale,
      variableWeight: variableWeight ?? this.variableWeight,
      display: display ?? _display,
      headline: headline ?? _headline,
      title: title ?? _title,
      body: body ?? _body,
      label: label ?? _label,
      caption: caption ?? _caption,
      kicker: kicker ?? _kicker,
    );
  }
}
