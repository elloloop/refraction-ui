import 'package:flutter/material.dart';

/// Parses an HSL string defined in the Refraction CSS tokens (e.g. "250 50% 50%")
/// and converts it to a Flutter [Color].
///
/// Our CSS variables use the format `H S% L%` without the `hsl()` wrapper.
class HslColor {
  /// Parses a string like "240 10% 4%" into a Flutter Color.
  static Color parse(String hslString) {
    try {
      final parts = hslString.split(' ').where((p) => p.isNotEmpty).toList();
      if (parts.length != 3) {
        throw FormatException('Expected H S L format, got: $hslString');
      }

      final h = double.parse(parts[0]);
      final s = double.parse(parts[1].replaceAll('%', '')) / 100;
      final l = double.parse(parts[2].replaceAll('%', '')) / 100;

      return HSLColor.fromAHSL(1.0, h, s, l).toColor();
    } catch (e) {
      debugPrint('Failed to parse HSL color: $hslString. Error: $e');
      return Colors.transparent;
    }
  }
}

/// Small, dependency-free color transforms used to derive the extended
/// semantic roles (hover/active steps, soft tints, hairline borders, a
/// categorical chart ramp) from the base palette tokens.
///
/// These are the fallbacks behind [RefractionColors]' derived getters: when a
/// consumer does not supply an explicit value for an extended role, the getter
/// computes a sensible default from an existing token via one of these
/// operations, so a bare palette still exposes the full vocabulary.
class ColorMath {
  const ColorMath._();

  /// Darkens [color] by [amount] (0.0–1.0) by reducing its HSL lightness.
  ///
  /// Used for the `primaryHover` (~6%) and `primaryActive` (~12%) brand
  /// depth steps. The result is clamped to a valid lightness range.
  static Color darken(Color color, double amount) {
    final hsl = HSLColor.fromColor(color);
    final lightness = (hsl.lightness - amount).clamp(0.0, 1.0);
    return hsl.withLightness(lightness).toColor();
  }

  /// Returns [overlay] laid over [base] at opacity [amount] (0.0 = [base],
  /// 1.0 = [overlay]).
  ///
  /// Used for soft brand/second-hue tints (e.g. `primarySoft` = the brand at
  /// ~12% over the background) and the hairline `borderSubtle` (the border
  /// pulled ~50% toward the background).
  static Color mix(Color base, Color overlay, double amount) {
    return Color.lerp(base, overlay, amount)!;
  }

  /// Rotates the hue of [color] by [degrees] around the color wheel, keeping
  /// saturation and lightness.
  ///
  /// Seeds a categorical chart ramp (`chart1`–`chart5`) from a single brand
  /// color so a bare palette still yields visually distinct series colors.
  static Color rotateHue(Color color, double degrees) {
    final hsl = HSLColor.fromColor(color);
    final hue = (hsl.hue + degrees) % 360.0;
    return hsl.withHue(hue < 0 ? hue + 360.0 : hue).toColor();
  }
}
