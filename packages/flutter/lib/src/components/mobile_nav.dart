import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A single item in the [RefractionMobileNav].
class RefractionMobileNavItem<T> {
  /// The label of the navigation item.
  final String label;

  /// The icon of the navigation item.
  final Widget icon;

  /// An optional active icon for the navigation item, used when selected.
  final Widget? activeIcon;

  /// Arbitrary value or identifier for this item (e.g., an enum, index, or route string).
  final T value;

  const RefractionMobileNavItem({
    required this.label,
    required this.icon,
    this.activeIcon,
    required this.value,
  });
}

/// A mobile-specific navigation bar (often shown at the bottom or as a specialized header).
/// It accepts navigation items with icons and labels, handles selection state,
/// and triggers callbacks on tap.
class RefractionMobileNav<T> extends StatelessWidget {
  /// The list of items to display in the navigation bar.
  final List<RefractionMobileNavItem<T>> items;

  /// The currently selected value. Determines which item appears active.
  final T? selectedValue;

  /// Callback triggered when an item is tapped.
  final ValueChanged<T>? onSelect;

  /// Whether to show the text labels below the icons. Defaults to true.
  final bool showLabels;

  /// Whether the navigation bar is positioned at the top (e.g., as a header).
  /// If true, the border is drawn at the bottom instead of the top, and safe area is applied at the top.
  final bool isHeader;

  const RefractionMobileNav({
    super.key,
    required this.items,
    this.selectedValue,
    this.onSelect,
    this.showLabels = true,
    this.isHeader = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final border = BorderSide(color: colors.border);

    return Container(
      decoration: BoxDecoration(
        color: colors.background,
        border: Border(
          top: isHeader ? BorderSide.none : border,
          bottom: isHeader ? border : BorderSide.none,
        ),
      ),
      child: SafeArea(
        top: isHeader,
        bottom: !isHeader,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
          child: Row(
            mainAxisAlignment: items.length <= 3
                ? MainAxisAlignment.spaceEvenly
                : MainAxisAlignment.spaceBetween,
            children: items.map((item) {
              final isSelected = item.value == selectedValue;

              Widget icon = isSelected
                  ? (item.activeIcon ?? item.icon)
                  : item.icon;

              return Expanded(
                child: InkWell(
                  onTap: () => onSelect?.call(item.value),
                  borderRadius: BorderRadius.circular(8.0),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconTheme(
                          data: IconThemeData(
                            color: isSelected
                                ? colors.primary
                                : colors.mutedForeground,
                            size: 24,
                          ),
                          child: icon,
                        ),
                        if (showLabels) ...[
                          const SizedBox(height: 4),
                          Text(
                            item.label,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                              color: isSelected
                                  ? colors.primary
                                  : colors.mutedForeground,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
