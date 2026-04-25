import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class RefractionProgress extends StatelessWidget {
  final double value;
  final double height;
  final Color? color;

  const RefractionProgress({
    super.key,
    required this.value,
    this.height = 8.0,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final clampedValue = value.clamp(0.0, 1.0);
    final progressColor = color ?? theme.colors.primary;

    return Container(
      width: double.infinity,
      height: height,
      decoration: BoxDecoration(
        color: theme.colors.muted,
        borderRadius: BorderRadius.circular(height / 2),
      ),
      clipBehavior: Clip.antiAlias,
      child: LayoutBuilder(
        builder: (context, constraints) {
          return Stack(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeOutCubic,
                width: constraints.maxWidth * clampedValue,
                height: height,
                decoration: BoxDecoration(
                  color: progressColor,
                  borderRadius: BorderRadius.circular(height / 2),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class RefractionSlider extends StatelessWidget {
  final double value;
  final double min;
  final double max;
  final ValueChanged<double>? onChanged;
  final Color? activeColor;
  final Color? inactiveColor;

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
        overlayColor: (activeColor ?? theme.colors.primary).withValues(alpha: 0.2),
        trackHeight: 8.0,
        thumbShape: const RoundSliderThumbShape(
          enabledThumbRadius: 10.0,
          elevation: 2,
          pressedElevation: 4,
        ),
        overlayShape: const RoundSliderOverlayShape(overlayRadius: 20.0),
        trackShape: const RoundedRectSliderTrackShape(),
      ),
      child: Slider(
        value: value,
        min: min,
        max: max,
        onChanged: onChanged,
      ),
    );
  }
}
