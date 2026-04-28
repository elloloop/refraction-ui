import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A single segment of a [RefractionBreadcrumbs] trail.
///
/// Items with a non-null [href] (and that are not the final segment) are
/// rendered as tappable links that emit [href] through
/// [RefractionBreadcrumbs.onNavigate]. The last item is always rendered as
/// non-interactive emphasized text representing the current location.
class BreadcrumbItem {
  /// Visible text for this segment.
  final String label;

  /// Optional navigation target. If supplied — and this is not the last
  /// item — the segment becomes tappable.
  final String? href;

  /// Creates a [BreadcrumbItem].
  const BreadcrumbItem({required this.label, this.href});
}

/// A horizontal trail showing the user's location in a hierarchy.
///
/// Renders each [BreadcrumbItem] in [items] separated by [separator]. The
/// final item represents the current page and is bolded. Earlier items with
/// an [BreadcrumbItem.href] are tappable and emit through [onNavigate].
///
/// Mirrors the shadcn-ui `Breadcrumb` primitive shipped in the React,
/// Angular, and Astro Refraction UI packages.
///
/// ```dart
/// RefractionBreadcrumbs(
///   onNavigate: (href) => router.go(href),
///   items: const [
///     BreadcrumbItem(label: 'Home', href: '/'),
///     BreadcrumbItem(label: 'Docs', href: '/docs'),
///     BreadcrumbItem(label: 'Breadcrumbs'),
///   ],
/// )
/// ```
class RefractionBreadcrumbs extends StatelessWidget {
  /// Ordered segments to render, root-to-leaf.
  final List<BreadcrumbItem> items;

  /// Glyph drawn between segments. Defaults to `'/'`. Common alternatives
  /// include `'›'` and `'>'`.
  final String separator;

  /// Called with [BreadcrumbItem.href] when a non-final, linkable segment
  /// is tapped.
  final ValueChanged<String>? onNavigate;

  /// Creates a [RefractionBreadcrumbs] trail.
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
