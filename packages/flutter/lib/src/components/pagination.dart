import 'package:flutter/material.dart';
import 'button.dart';
import '../theme/refraction_theme.dart';

/// Renders a responsive pagination control with page numbers, next/previous
/// buttons, and automatic ellipsis collapsing for large page ranges.
class RefractionPagination extends StatelessWidget {
  /// The currently active page, 1-indexed.
  final int currentPage;

  /// The total number of pages.
  final int totalPages;

  /// Called when the user taps a different page, previous, or next.
  final ValueChanged<int>? onPageChanged;

  /// The number of page numbers to show on either side of the [currentPage].
  final int siblingCount;
  
  /// The number of always-visible pages at the beginning and end.
  final int boundaryCount;

  /// Whether to render the previous and next buttons.
  final bool showControls;

  /// Custom icon for the previous button. Defaults to `Icons.chevron_left`.
  final Widget? previousIcon;

  /// Custom icon for the next button. Defaults to `Icons.chevron_right`.
  final Widget? nextIcon;

  /// Optional text label for the previous button. If provided, the button
  /// renders with text and an icon instead of just an icon.
  final String? previousLabel;

  /// Optional text label for the next button. If provided, the button
  /// renders with text and an icon instead of just an icon.
  final String? nextLabel;

  /// Custom widget for the ellipsis. Defaults to `Icons.more_horiz`.
  final Widget? ellipsisIcon;

  /// Creates a [RefractionPagination].
  const RefractionPagination({
    super.key,
    required this.currentPage,
    required this.totalPages,
    this.onPageChanged,
    this.siblingCount = 1,
    this.boundaryCount = 1,
    this.showControls = true,
    this.previousIcon,
    this.nextIcon,
    this.previousLabel = 'Previous',
    this.nextLabel = 'Next',
    this.ellipsisIcon,
  })  : assert(currentPage > 0 || totalPages == 0),
        assert(totalPages >= 0),
        assert(totalPages == 0 || currentPage <= totalPages);

  List<dynamic> _generatePagination() {
    if (totalPages == 0) return [];
    
    final List<dynamic> items = [];
    final totalPageNumbersVisible = boundaryCount * 2 + 3 + siblingCount * 2;

    if (totalPages <= totalPageNumbersVisible) {
      for (int i = 1; i <= totalPages; i++) {
        items.add(i);
      }
      return items;
    }

    final startPage = currentPage - siblingCount;
    final endPage = currentPage + siblingCount;

    final showLeftEllipsis = startPage > boundaryCount + 2;
    final showRightEllipsis = endPage < totalPages - boundaryCount - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
      final leftItemCount = boundaryCount + 2 + 2 * siblingCount;
      for (int i = 1; i <= leftItemCount; i++) {
        items.add(i);
      }
      items.add('ellipsis');
      for (int i = totalPages - boundaryCount + 1; i <= totalPages; i++) {
        items.add(i);
      }
    } else if (showLeftEllipsis && !showRightEllipsis) {
      for (int i = 1; i <= boundaryCount; i++) {
        items.add(i);
      }
      items.add('ellipsis');
      final rightItemCount = boundaryCount + 2 + 2 * siblingCount;
      for (int i = totalPages - rightItemCount + 1; i <= totalPages; i++) {
        items.add(i);
      }
    } else if (showLeftEllipsis && showRightEllipsis) {
      for (int i = 1; i <= boundaryCount; i++) {
        items.add(i);
      }
      items.add('ellipsis');
      for (int i = startPage; i <= endPage; i++) {
        items.add(i);
      }
      items.add('ellipsis');
      for (int i = totalPages - boundaryCount + 1; i <= totalPages; i++) {
        items.add(i);
      }
    }
    return items;
  }

  @override
  Widget build(BuildContext context) {
    if (totalPages == 0) return const SizedBox.shrink();

    final items = _generatePagination();

    return Wrap(
      spacing: 4.0,
      runSpacing: 4.0,
      alignment: WrapAlignment.center,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        if (showControls)
          _PaginationButton(
            icon: previousIcon ?? const Icon(Icons.chevron_left, size: 16),
            label: previousLabel,
            isNext: false,
            onPressed: currentPage > 1
                ? () => onPageChanged?.call(currentPage - 1)
                : null,
          ),
        for (final item in items)
          if (item == 'ellipsis')
            _PaginationEllipsis(icon: ellipsisIcon)
          else
            _PaginationPage(
              page: item as int,
              isActive: item == currentPage,
              onPressed: () {
                if (item != currentPage) onPageChanged?.call(item);
              },
            ),
        if (showControls)
          _PaginationButton(
            icon: nextIcon ?? const Icon(Icons.chevron_right, size: 16),
            label: nextLabel,
            isNext: true,
            onPressed: currentPage < totalPages
                ? () => onPageChanged?.call(currentPage + 1)
                : null,
          ),
      ],
    );
  }
}

class _PaginationButton extends StatelessWidget {
  final Widget icon;
  final String? label;
  final VoidCallback? onPressed;
  final bool isNext;

  const _PaginationButton({
    required this.icon,
    this.label,
    required this.onPressed,
    this.isNext = false,
  });

  @override
  Widget build(BuildContext context) {
    final hasLabel = label != null && label!.isNotEmpty;
    
    if (hasLabel) {
      return RefractionButton(
        variant: RefractionButtonVariant.ghost,
        size: RefractionButtonSize.defaultSize,
        onPressed: onPressed,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (!isNext) ...[
              icon,
              const SizedBox(width: 4),
              Text(label!),
            ] else ...[
              Text(label!),
              const SizedBox(width: 4),
              icon,
            ],
          ],
        ),
      );
    }

    return Semantics(
      label: isNext ? 'Next page' : 'Previous page',
      button: true,
      enabled: onPressed != null,
      child: RefractionButton(
        variant: RefractionButtonVariant.ghost,
        size: RefractionButtonSize.icon,
        onPressed: onPressed,
        child: icon,
      ),
    );
  }
}

class _PaginationPage extends StatelessWidget {
  final int page;
  final bool isActive;
  final VoidCallback? onPressed;

  const _PaginationPage({
    required this.page,
    required this.isActive,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Page $page',
      button: true,
      selected: isActive,
      child: RefractionButton(
        variant: isActive
            ? RefractionButtonVariant.outline
            : RefractionButtonVariant.ghost,
        size: RefractionButtonSize.icon,
        onPressed: onPressed,
        child: Text('$page'),
      ),
    );
  }
}

class _PaginationEllipsis extends StatelessWidget {
  final Widget? icon;

  const _PaginationEllipsis({this.icon});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    return Semantics(
      label: 'More pages',
      child: Container(
        width: 36.0,
        height: 36.0,
        alignment: Alignment.center,
        child: icon ??
            Icon(
              Icons.more_horiz,
              size: 16,
              color: theme.colors.foreground,
            ),
      ),
    );
  }
}
