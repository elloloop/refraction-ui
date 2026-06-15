import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Data structure representing a single step in the [RefractionNumberedSteps].
class RefractionNumberedStepItem {
  /// Step title displayed prominently below the ordinal badge.
  final Widget title;

  /// Step body copy displayed below the title.
  final Widget body;

  /// Creates a [RefractionNumberedStepItem].
  const RefractionNumberedStepItem({
    required this.title,
    required this.body,
  });
}

/// RefractionNumberedSteps — a static how-it-works step grid.
///
/// Renders a responsive grid of step cards, each with a zero-padded ordinal badge
/// (01, 02…), a title, and body copy.
///
/// Mirrors the react-numbered-steps / astro-numbered-steps equivalents.
class RefractionNumberedSteps extends StatelessWidget {
  /// The step items to display.
  final List<RefractionNumberedStepItem> items;

  /// Number of columns. Defaults to auto calculation clamped between 2 and 5.
  final int? columns;

  /// Spacing between steps. Defaults to 24.0.
  final double gap;

  /// Creates a [RefractionNumberedSteps].
  const RefractionNumberedSteps({
    super.key,
    required this.items,
    this.columns,
    this.gap = 24.0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    int defaultColumns(int count) {
      return count.clamp(2, 5);
    }

    final targetColumns = columns ?? defaultColumns(items.length);

    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 600;
        final cols = isNarrow ? 1 : targetColumns;

        final List<Widget> rows = [];
        for (int i = 0; i < items.length; i += cols) {
          final rowChildren = <Widget>[];
          for (int j = 0; j < cols; j++) {
            final index = i + j;
            if (index < items.length) {
              final item = items[index];
              final ordinalStr = (index + 1).toString().padLeft(2, '0');

              rowChildren.add(
                Expanded(
                  flex: 1,
                  child: Semantics(
                    container: true,
                    label: 'Step $ordinalStr',
                    child: Container(
                      padding: const EdgeInsets.all(20.0),
                      decoration: BoxDecoration(
                        color: colors.card,
                        borderRadius: BorderRadius.circular(12.0),
                        border: Border.all(color: colors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            ordinalStr,
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 14.0,
                              fontWeight: FontWeight.w500,
                            ).copyWith(color: colors.primary),
                          ),
                          const SizedBox(height: 8),
                          DefaultTextStyle(
                            style: theme.textStyle.copyWith(
                              fontSize: 14.0,
                              fontWeight: FontWeight.bold,
                              color: colors.foreground,
                            ),
                            child: item.title,
                          ),
                          const SizedBox(height: 4),
                          DefaultTextStyle(
                            style: theme.textStyle.copyWith(
                              fontSize: 12.0,
                              color: colors.mutedForeground,
                              height: 1.5,
                            ),
                            child: item.body,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
              if (j < cols - 1 && index + 1 < items.length) {
                rowChildren.add(SizedBox(width: gap));
              }
            } else {
              rowChildren.add(const Expanded(flex: 1, child: SizedBox.shrink()));
              if (j < cols - 1) {
                rowChildren.add(SizedBox(width: gap));
              }
            }
          }
          rows.add(
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: rowChildren,
            ),
          );
          if (i + cols < items.length) {
            rows.add(SizedBox(height: gap));
          }
        }

        return Semantics(
          label: 'Numbered steps',
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: rows,
          ),
        );
      },
    );
  }
}
