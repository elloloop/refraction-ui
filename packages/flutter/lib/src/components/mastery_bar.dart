import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Height presets for the [RefractionMasteryBar] track.
enum RefractionMasteryBarSize {
  /// Height of 6.0.
  sm,

  /// Height of 8.0.
  md,

  /// Height of 12.0.
  lg,
}

/// RefractionMasteryBar — a labelled linear progress bar for skill/concept mastery.
///
/// Renders a progress bar with an optional header row containing a leading label (left)
/// and a trailing label (right).
///
/// Mirrors the react-mastery-bar / astro-mastery-bar equivalents.
class RefractionMasteryBar extends StatelessWidget {
  /// Progress value (0–100). Values outside this range are clamped.
  final double value;

  /// Label shown on the right side of the header row.
  final String? label;

  /// Label shown on the left side of the header row.
  final String? leadingLabel;

  /// Visual size of the track. Defaults to [RefractionMasteryBarSize.md].
  final RefractionMasteryBarSize size;

  /// Renders the fill at reduced opacity to indicate a muted/secondary state.
  final bool muted;

  /// Creates a [RefractionMasteryBar].
  const RefractionMasteryBar({
    super.key,
    required this.value,
    this.label,
    this.leadingLabel,
    this.size = RefractionMasteryBarSize.md,
    this.muted = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    final clampedValue = value.clamp(0.0, 100.0);
    final hasHeader = leadingLabel != null || label != null;

    double trackHeight;
    switch (size) {
      case RefractionMasteryBarSize.sm:
        trackHeight = 6.0;
        break;
      case RefractionMasteryBarSize.md:
        trackHeight = 8.0;
        break;
      case RefractionMasteryBarSize.lg:
        trackHeight = 12.0;
        break;
    }

    Widget? headerRow;
    if (hasHeader) {
      headerRow = Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            if (leadingLabel != null)
              Text(
                leadingLabel!,
                style: theme.textStyle.copyWith(
                  fontSize: 12,
                  color: colors.mutedForeground,
                ),
              )
            else
              const SizedBox(),
            if (label != null)
              Text(
                label!,
                style: theme.textStyle.copyWith(
                  fontSize: 12,
                  color: colors.mutedForeground,
                ),
              ),
          ],
        ),
      );
    }

    final track = Container(
      width: double.infinity,
      height: trackHeight,
      decoration: BoxDecoration(
        color: colors.muted,
        borderRadius: BorderRadius.circular(100),
      ),
      clipBehavior: Clip.antiAlias,
      alignment: Alignment.centerLeft,
      child: FractionallySizedBox(
        widthFactor: clampedValue / 100.0,
        heightFactor: 1.0,
        child: Container(
          decoration: BoxDecoration(
            color: muted ? colors.primary.withValues(alpha: 0.7) : colors.primary,
            borderRadius: BorderRadius.circular(100),
          ),
        ),
      ),
    );

    return Semantics(
      value: '${clampedValue.toStringAsFixed(0)}%',
      label: leadingLabel ?? 'Mastery progress',
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (headerRow != null) headerRow,
          track,
        ],
      ),
    );
  }
}
