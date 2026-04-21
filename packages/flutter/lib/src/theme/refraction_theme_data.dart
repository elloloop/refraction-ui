import 'package:flutter/material.dart';
import 'refraction_colors.dart';

class RefractionThemeData {
  final RefractionColors colors;
  final double borderRadius;
  final String? fontFamily;
  final List<BoxShadow>? softShadow;
  final List<BoxShadow>? heavyShadow;

  const RefractionThemeData({
    required this.colors,
    this.borderRadius = 8.0,
    this.fontFamily,
    this.softShadow,
    this.heavyShadow,
  });

  /// Factory constructor for the Minimal palette (Apple/Nike style)
  factory RefractionThemeData.minimalLight() => RefractionThemeData(
    colors: RefractionColors.minimalLight,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );
  factory RefractionThemeData.minimalDark() => RefractionThemeData(
    colors: RefractionColors.minimalDark,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  /// Factory constructor for the Fintech palette (Revolut style)
  factory RefractionThemeData.fintechLight() => RefractionThemeData(
    colors: RefractionColors.fintechLight,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );
  factory RefractionThemeData.fintechDark() => RefractionThemeData(
    colors: RefractionColors.fintechDark,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  /// Factory constructor for the Wellness palette (Flo/Headspace style)
  factory RefractionThemeData.wellnessLight() => RefractionThemeData(
    colors: RefractionColors.wellnessLight,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );
  factory RefractionThemeData.wellnessDark() => RefractionThemeData(
    colors: RefractionColors.wellnessDark,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  /// Factory constructor for the Creative palette (Discord/Figma style)
  factory RefractionThemeData.creativeLight() => RefractionThemeData(
    colors: RefractionColors.creativeLight,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );
  factory RefractionThemeData.creativeDark() => RefractionThemeData(
    colors: RefractionColors.creativeDark,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  /// Factory constructor for the Productivity palette (Linear style)
  factory RefractionThemeData.productivityLight() => RefractionThemeData(
    colors: RefractionColors.productivityLight,
    softShadow: _lightSoftShadow,
    heavyShadow: _lightHeavyShadow,
  );
  factory RefractionThemeData.productivityDark() => RefractionThemeData(
    colors: RefractionColors.productivityDark,
    softShadow: _darkSoftShadow,
    heavyShadow: _darkHeavyShadow,
  );

  /// Default aliases mapping to Minimal
  factory RefractionThemeData.light() => RefractionThemeData.minimalLight();
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

  /// Generates a base text style using this theme's configuration
  TextStyle get textStyle {
    return TextStyle(fontFamily: fontFamily, color: colors.foreground);
  }
}
