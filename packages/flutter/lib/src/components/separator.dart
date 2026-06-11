import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Orientation of a [RefractionSeparator].
enum RefractionSeparatorOrientation {
  /// A full-width horizontal rule.
  horizontal,

  /// A full-height vertical rule.
  vertical,
}

/// A thin rule that visually divides content.
///
/// Supports [RefractionSeparatorOrientation.horizontal] and
/// [RefractionSeparatorOrientation.vertical], plus an optional centered
/// [label] — the "labeled divider" variant (`──── or ────`), which is only
/// meaningful for horizontal separators. Mirrors the React/Astro `Separator`.
///
/// ```dart
/// const RefractionSeparator()
/// const RefractionSeparator(label: Text('or'))
/// const RefractionSeparator(orientation: RefractionSeparatorOrientation.vertical)
/// ```
class RefractionSeparator extends StatelessWidget {
  /// Orientation of the rule. Defaults to horizontal.
  final RefractionSeparatorOrientation orientation;

  /// Optional centered label rendered between two flanking lines. Ignored for
  /// vertical separators.
  final Widget? label;

  /// Creates a [RefractionSeparator].
  const RefractionSeparator({
    super.key,
    this.orientation = RefractionSeparatorOrientation.horizontal,
    this.label,
  });

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;
    final line = Container(color: colors.border);

    if (orientation == RefractionSeparatorOrientation.vertical) {
      return Semantics(
        container: true,
        child: SizedBox(width: 1, child: line),
      );
    }

    if (label != null) {
      return Semantics(
        container: true,
        child: Row(
          children: [
            Expanded(child: SizedBox(height: 1, child: line)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: DefaultTextStyle.merge(
                style: TextStyle(
                  fontSize: 12,
                  letterSpacing: 0.5,
                  color: colors.mutedForeground,
                ),
                child: label!,
              ),
            ),
            Expanded(child: SizedBox(height: 1, child: line)),
          ],
        ),
      );
    }

    return Semantics(
      container: true,
      child: SizedBox(height: 1, width: double.infinity, child: line),
    );
  }
}
