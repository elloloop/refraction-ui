import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Data structure representing a single stat item in the [RefractionStatGrid].
class RefractionStatGridItem {
  /// The primary value displayed prominently.
  final Widget value;

  /// The descriptive label shown below the value.
  final Widget label;

  /// Creates a [RefractionStatGridItem].
  const RefractionStatGridItem({
    required this.value,
    required this.label,
  });
}

/// RefractionStatGrid — a marketing-style grid of stat callouts.
///
/// Each item shows a large bold value and a small muted label. The grid
/// automatically computes the column count from the number of items, or you can
/// override it with [columns].
///
/// Mirrors the react-stat-grid / astro-stat-grid equivalents.
class RefractionStatGrid extends StatelessWidget {
  /// The stat items to display in the grid.
  final List<RefractionStatGridItem> items;

  /// Number of columns. Defaults to auto calculation based on item count.
  final int? columns;

  /// Spacing between items. Defaults to 32.0.
  final double gap;

  /// Creates a [RefractionStatGrid].
  const RefractionStatGrid({
    super.key,
    required this.items,
    this.columns,
    this.gap = 32.0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    int defaultColumns(int count) {
      if (count <= 1) return 1;
      if (count == 2) return 2;
      return 3;
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
              rowChildren.add(
                Expanded(
                  flex: 1,
                  child: Semantics(
                    container: true,
                    label: 'Stat item',
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        DefaultTextStyle(
                          style: theme.textStyle.copyWith(
                            fontSize: 30,
                            fontWeight: FontWeight.bold,
                            color: colors.primary,
                          ),
                          child: item.value,
                        ),
                        const SizedBox(height: 4),
                        DefaultTextStyle(
                          style: theme.textStyle.copyWith(
                            fontSize: 14,
                            color: colors.mutedForeground,
                            height: 1.4,
                          ),
                          child: item.label,
                        ),
                      ],
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
          label: 'Stat grid',
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: rows,
          ),
        );
      },
    );
  }
}
