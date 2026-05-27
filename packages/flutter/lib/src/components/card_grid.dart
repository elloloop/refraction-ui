import 'package:flutter/material.dart';

/// A responsive grid layout designed specifically for laying out widgets
/// (typically [RefractionCard]s).
///
/// Uses [LayoutBuilder] to adjust the number of columns based on the
/// available width and a specified [minCardWidth]. This allows the grid
/// to automatically scale from a single column on narrow screens to
/// multiple columns on wide screens without hardcoded breakpoints.
class RefractionCardGrid extends StatelessWidget {
  /// The widgets to display in the grid.
  final List<Widget> children;

  /// The minimum width each card should have. The grid calculates the
  /// maximum number of columns that can fit while respecting this constraint.
  final double minCardWidth;

  /// The horizontal spacing between cards in a row.
  final double crossAxisSpacing;

  /// The vertical spacing between rows of cards.
  final double mainAxisSpacing;

  /// The ratio of the cross-axis to the main-axis extent of each child.
  final double childAspectRatio;

  /// Whether the grid should shrink-wrap its contents. Defaults to true.
  final bool shrinkWrap;

  /// The scroll physics to use for the grid. Defaults to
  /// [NeverScrollableScrollPhysics] since card grids are typically
  /// embedded within larger scrolling pages.
  final ScrollPhysics? physics;

  /// Creates a responsive grid of cards.
  const RefractionCardGrid({
    super.key,
    required this.children,
    this.minCardWidth = 250.0,
    this.crossAxisSpacing = 16.0,
    this.mainAxisSpacing = 16.0,
    this.childAspectRatio = 1.0,
    this.shrinkWrap = true,
    this.physics = const NeverScrollableScrollPhysics(),
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final double width = constraints.maxWidth;

        // Calculate max columns that can fit based on minCardWidth and spacing
        int crossAxisCount = 1;
        if (width.isFinite) {
          crossAxisCount =
              ((width + crossAxisSpacing) / (minCardWidth + crossAxisSpacing))
                  .floor();
          if (crossAxisCount < 1) crossAxisCount = 1;
        }

        return GridView.builder(
          shrinkWrap: shrinkWrap,
          physics: physics,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: crossAxisSpacing,
            mainAxisSpacing: mainAxisSpacing,
            childAspectRatio: childAspectRatio,
          ),
          itemCount: children.length,
          itemBuilder: (context, index) => children[index],
        );
      },
    );
  }
}
