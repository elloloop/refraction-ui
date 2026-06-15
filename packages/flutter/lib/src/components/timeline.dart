import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

/// Layout orientation of the timeline.
enum RefractionTimelineOrientation {
  /// Items stack vertically with a left-aligned marker rail.
  vertical,

  /// Items sit side-by-side horizontally with the marker rail running across.
  horizontal,
}

/// Visual status of a single timeline item.
enum RefractionTimelineItemStatus {
  /// Event completed.
  done,

  /// Event currently active.
  current,

  /// Event upcoming.
  upcoming,

  /// Default state.
  defaultStatus,
}

/// Data describing a single event in the timeline.
class RefractionTimelineItemData {
  /// Unique identifier for the item.
  final String id;

  /// Primary label shown beside or below the marker.
  final String title;

  /// Optional timestamp / date string.
  final String? time;

  /// Additional detail text.
  final String? description;

  /// Visual status of this item. Defaults to [RefractionTimelineItemStatus.defaultStatus].
  final RefractionTimelineItemStatus status;

  /// Creates a [RefractionTimelineItemData].
  const RefractionTimelineItemData({
    required this.id,
    required this.title,
    this.time,
    this.description,
    this.status = RefractionTimelineItemStatus.defaultStatus,
  });
}

/// A time-ordered list of events with a marker rail.
///
/// Mirrors the React/Astro `Timeline` component. Supports vertical (default)
/// and horizontal orientations.
///
/// ```dart
/// RefractionTimeline(
///   items: const [
///     RefractionTimelineItemData(
///       id: '1',
///       title: 'Project Started',
///       time: 'Jan 2026',
///       status: RefractionTimelineItemStatus.done,
///     ),
///     RefractionTimelineItemData(
///       id: '2',
///       title: 'Beta Launch',
///       time: 'Feb 2026',
///       status: RefractionTimelineItemStatus.current,
///     ),
///     RefractionTimelineItemData(
///       id: '3',
///       title: 'Production Release',
///       time: 'Mar 2026',
///       status: RefractionTimelineItemStatus.upcoming,
///     ),
///   ],
/// )
/// ```
class RefractionTimeline extends StatelessWidget {
  /// Ordered list of events to display.
  final List<RefractionTimelineItemData> items;

  /// Layout direction. Defaults to [RefractionTimelineOrientation.vertical].
  final RefractionTimelineOrientation orientation;

  /// Optional render override for a single item.
  final Widget Function(
    BuildContext context,
    RefractionTimelineItemData item,
    int index,
    bool isLast,
  )? renderItem;

  /// Creates a [RefractionTimeline].
  const RefractionTimeline({
    super.key,
    required this.items,
    this.orientation = RefractionTimelineOrientation.vertical,
    this.renderItem,
  });

  @override
  Widget build(BuildContext context) {
    final isVertical = orientation == RefractionTimelineOrientation.vertical;

    final List<Widget> children = [];
    for (var i = 0; i < items.length; i++) {
      final isLast = i == items.length - 1;
      if (renderItem != null) {
        children.add(renderItem!(context, items[i], i, isLast));
      } else {
        children.add(
          _TimelineItem(
            item: items[i],
            orientation: orientation,
            isLast: isLast,
          ),
        );
      }
    }

    if (isVertical) {
      return Semantics(
        container: true,
        label: 'Timeline',
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: children,
        ),
      );
    } else {
      return Semantics(
        container: true,
        label: 'Timeline',
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: children,
          ),
        ),
      );
    }
  }
}

class _TimelineItem extends StatelessWidget {
  final RefractionTimelineItemData item;
  final RefractionTimelineOrientation orientation;
  final bool isLast;

  const _TimelineItem({
    required this.item,
    required this.orientation,
    required this.isLast,
  });

  Widget _buildMarker(BuildContext context, RefractionTheme theme) {
    final colors = theme.colors;

    switch (item.status) {
      case RefractionTimelineItemStatus.done:
        return Container(
          width: 12.0,
          height: 12.0,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: colors.primary,
            border: Border.all(color: colors.primary, width: 2.0),
          ),
        );
      case RefractionTimelineItemStatus.current:
        // Double-ring indicator
        return Container(
          width: 20.0,
          height: 20.0,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: colors.primary, width: 2.0),
          ),
          padding: const EdgeInsets.all(2.0),
          alignment: Alignment.center,
          child: Container(
            width: 12.0,
            height: 12.0,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: colors.background,
              border: Border.all(color: colors.primary, width: 2.0),
            ),
          ),
        );
      case RefractionTimelineItemStatus.upcoming:
        return Container(
          width: 12.0,
          height: 12.0,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: colors.muted,
            border: Border.all(
              color: colors.mutedForeground.withValues(alpha: 0.3),
              width: 2.0,
            ),
          ),
        );
      case RefractionTimelineItemStatus.defaultStatus:
        return Container(
          width: 12.0,
          height: 12.0,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: colors.background,
            border: Border.all(color: colors.border, width: 2.0),
          ),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final isVertical = orientation == RefractionTimelineOrientation.vertical;

    final marker = _buildMarker(context, theme);

    if (isVertical) {
      return IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Left gutter containing marker and vertical line
            SizedBox(
              width: 24.0,
              child: Stack(
                alignment: Alignment.topCenter,
                children: [
                  if (!isLast)
                    Positioned(
                      top: 12.0,
                      bottom: 0.0,
                      child: Container(
                        width: 2.0,
                        color: colors.border,
                      ),
                    ),
                  // Render marker at the top of the gutter
                  Padding(
                    padding: const EdgeInsets.only(top: 2.0),
                    child: marker,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16.0),
            // Content next to gutter
            Expanded(
              child: Padding(
                padding: EdgeInsets.only(bottom: isLast ? 0.0 : 32.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (item.time != null && item.time!.isNotEmpty)
                      Text(
                        item.time!,
                        style: theme.data.textStyle.copyWith(
                          fontSize: 12.0,
                          color: colors.mutedForeground,
                        ),
                      ),
                    Text(
                      item.title,
                      style: theme.data.textStyle.copyWith(
                        fontSize: 14.0,
                        fontWeight: FontWeight.w500,
                        color: colors.foreground,
                      ),
                    ),
                    if (item.description != null && item.description!.isNotEmpty) ...[
                      const SizedBox(height: 2.0),
                      Text(
                        item.description!,
                        style: theme.data.textStyle.copyWith(
                          fontSize: 12.0,
                          color: colors.mutedForeground,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    } else {
      // Horizontal orientation layout
      return SizedBox(
        width: 150.0,
        child: Stack(
          children: [
            // Connector line behind marker
            if (!isLast)
              Positioned(
                top: 11.0, // center of a 12px marker (or close to 20px current marker)
                left: 75.0, // center of item
                right: 0.0,
                child: Container(
                  height: 2.0,
                  color: colors.border,
                ),
              ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Marker at the top
                Container(
                  height: 24.0,
                  alignment: Alignment.center,
                  child: marker,
                ),
                const SizedBox(height: 12.0),
                // Content block below marker
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (item.time != null && item.time!.isNotEmpty)
                        Text(
                          item.time!,
                          style: theme.data.textStyle.copyWith(
                            fontSize: 12.0,
                            color: colors.mutedForeground,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      Text(
                        item.title,
                        style: theme.data.textStyle.copyWith(
                          fontSize: 14.0,
                          fontWeight: FontWeight.w500,
                          color: colors.foreground,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      if (item.description != null && item.description!.isNotEmpty) ...[
                        const SizedBox(height: 2.0),
                        Text(
                          item.description!,
                          style: theme.data.textStyle.copyWith(
                            fontSize: 12.0,
                            color: colors.mutedForeground,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }
  }
}
