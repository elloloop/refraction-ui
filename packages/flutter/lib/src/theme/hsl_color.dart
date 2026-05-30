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
