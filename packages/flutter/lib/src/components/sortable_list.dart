import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Builder function for rendering items inside a [RefractionSortableList].
typedef RefractionSortableItemBuilder<T> = Widget Function(
  T item, {
  required int index,
  required Widget dragHandle,
});

/// A generic, accessible drag-to-reorder vertical list.
///
/// Users can drag elements to reorder them via the [dragHandle] exposed
/// in the [renderItem] builder function.
class RefractionSortableList<T> extends StatelessWidget {
  /// The ordered list of items to render.
  final List<T> items;

  /// Function to extract a unique key for each item.
  final dynamic Function(T item, int index) getKey;

  /// Builder function to render the custom UI content of a single item.
  final RefractionSortableItemBuilder<T> renderItem;

  /// Callback when items have been reordered. Receives the updated list.
  final void Function(List<T>)? onReorder;

  /// When true, disables drag reordering.
  final bool disabled;

  const RefractionSortableList({
    super.key,
    required this.items,
    required this.getKey,
    required this.renderItem,
    this.onReorder,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    Widget buildGrip(int index) {
      final gripIcon = Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: SizedBox(
          width: 16,
          height: 16,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(width: 12, height: 1.5, color: colors.mutedForeground),
              const SizedBox(height: 2),
              Container(width: 12, height: 1.5, color: colors.mutedForeground),
              const SizedBox(height: 2),
              Container(width: 12, height: 1.5, color: colors.mutedForeground),
            ],
          ),
        ),
      );

      if (disabled) {
        return gripIcon;
      }

      return ReorderableDragStartListener(
        index: index,
        child: MouseRegion(
          cursor: SystemMouseCursors.grab,
          child: gripIcon,
        ),
      );
    }

    return Opacity(
      opacity: disabled ? 0.5 : 1.0,
      child: AbsorbPointer(
        absorbing: disabled,
        child: ReorderableListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          buildDefaultDragHandles: false,
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            final key = ValueKey(getKey(item, index));

            return Container(
              key: key,
              margin: const EdgeInsets.symmetric(vertical: 2),
              decoration: BoxDecoration(
                color: colors.card,
                borderRadius: BorderRadius.circular(theme.borderRadius),
                border: Border.all(color: colors.border),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                children: [
                  buildGrip(index),
                  const SizedBox(width: 12),
                  Expanded(
                    child: renderItem(
                      item,
                      index: index,
                      dragHandle: buildGrip(index),
                    ),
                  ),
                ],
              ),
            );
          },
          onReorder: (int oldIndex, int newIndex) {
            if (newIndex > oldIndex) {
              newIndex -= 1;
            }
            if (onReorder != null) {
              final list = List<T>.from(items);
              final element = list.removeAt(oldIndex);
              list.insert(newIndex, element);
              onReorder!(list);
            }
          },
          proxyDecorator: (Widget child, int index, Animation<double> animation) {
            return AnimatedBuilder(
              animation: animation,
              builder: (context, _) {
                return Material(
                  color: Colors.transparent,
                  elevation: 4,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(theme.borderRadius),
                      border: Border.all(color: colors.ring, width: 2),
                    ),
                    child: child,
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
