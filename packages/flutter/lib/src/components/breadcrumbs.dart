import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class BreadcrumbItem {
  final String label;
  final String? href;

  const BreadcrumbItem({required this.label, this.href});
}

class RefractionBreadcrumbs extends StatelessWidget {
  final List<BreadcrumbItem> items;
  final String separator;
  final ValueChanged<String>? onNavigate;

  const RefractionBreadcrumbs({
    super.key,
    required this.items,
    this.separator = '/',
    this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();

    final colors = RefractionTheme.of(context).colors;
    final List<Widget> children = [];

    for (int i = 0; i < items.length; i++) {
      final item = items[i];
      final isLast = i == items.length - 1;

      // The label
      if (item.href != null && !isLast) {
        children.add(
          InkWell(
            onTap: () => onNavigate?.call(item.href!),
            borderRadius: BorderRadius.circular(4),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              child: Text(
                item.label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: colors.mutedForeground,
                ),
              ),
            ),
          ),
        );
      } else {
        children.add(
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
            child: Text(
              item.label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: isLast ? FontWeight.w600 : FontWeight.w500,
                color: isLast ? colors.foreground : colors.mutedForeground,
              ),
            ),
          ),
        );
      }

      // The separator
      if (!isLast) {
        children.add(
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Text(
              separator,
              style: TextStyle(
                fontSize: 14,
                color: colors.mutedForeground.withValues(alpha: 0.5),
              ),
            ),
          ),
        );
      }
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: children,
    );
  }
}
