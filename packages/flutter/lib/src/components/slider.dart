import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// An interactive single-value slider styled with [RefractionTheme].
///
/// `RefractionSlider` mirrors the `RefractionSlider` component from the
/// React and Astro Refraction UI packages (a shadcn-equivalent
/// pattern). It is a thin wrapper around the Material [Slider] that swaps
/// in Refraction tokens for the track and thumb.
///
/// ```dart
/// double volume = 0.5;
/// RefractionSlider(
///   value: volume,
///   onChanged: (v) => setState(() => volume = v),
/// );
/// ```
class RefractionSlider extends StatelessWidget {
  /// The currently selected value.
  ///
  /// Must lie within `[min, max]`.
  final double value;

  /// The minimum value the slider can take. Defaults to `0.0`.
  final double min;

  /// The maximum value the slider can take. Defaults to `1.0`.
  final double max;

  /// Called as the user drags the thumb.
  ///
  /// Set to `null` to disable interaction.
  final ValueChanged<double>? onChanged;

  /// Optional override for the filled (active) portion of the track.
  /// Defaults to [RefractionColors.primary].
  final Color? activeColor;

  /// Optional override for the unfilled (inactive) portion of the track.
  /// Defaults to [RefractionColors.muted].
  final Color? inactiveColor;

  /// Creates a slider bound to [value] within `[min, max]`.
  const RefractionSlider({
    super.key,
    required this.value,
    this.min = 0.0,
    this.max = 1.0,
    this.onChanged,
    this.activeColor,
    this.inactiveColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;

    return SliderTheme(
      data: SliderThemeData(
        activeTrackColor: activeColor ?? theme.colors.primary,
        inactiveTrackColor: inactiveColor ?? theme.colors.muted,
        thumbColor: theme.colors.background,
        overlayColor: (activeColor ?? theme.colors.primary).withValues(
          alpha: 0.2,
        ),
        trackHeight: 8.0,
        thumbShape: const RoundSliderThumbShape(
          enabledThumbRadius: 10.0,
          elevation: 2,
          pressedElevation: 4,
        ),
        overlayShape: const RoundSliderOverlayShape(overlayRadius: 20.0),
        trackShape: const RoundedRectSliderTrackShape(),
      ),
      child: Slider(value: value, min: min, max: max, onChanged: onChanged),
    );
  }
}
