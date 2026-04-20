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

  /// Factory constructor for the standard light theme
  factory RefractionThemeData.light() {
    return const RefractionThemeData(
      colors: RefractionColors.light,
      borderRadius: 8.0,
      softShadow: [
        BoxShadow(
          color: Color(0x0C000000),
          blurRadius: 2,
          offset: Offset(0, 1),
        ),
        BoxShadow(
          color: Color(0x0A000000),
          blurRadius: 3,
          offset: Offset(0, 1),
        ),
      ],
      heavyShadow: [
        BoxShadow(
          color: Color(0x19000000),
          blurRadius: 10,
          offset: Offset(0, 4),
        ),
        BoxShadow(
          color: Color(0x0C000000),
          blurRadius: 4,
          offset: Offset(0, 2),
        ),
      ],
    );
  }

  /// Factory constructor for the standard dark theme
  factory RefractionThemeData.dark() {
    return const RefractionThemeData(
      colors: RefractionColors.dark,
      borderRadius: 8.0,
      softShadow: [
        BoxShadow(
          color: Color(0x33000000),
          blurRadius: 4,
          offset: Offset(0, 2),
        ),
      ],
      heavyShadow: [
        BoxShadow(
          color: Color(0x66000000),
          blurRadius: 15,
          offset: Offset(0, 8),
        ),
      ],
    );
  }

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
