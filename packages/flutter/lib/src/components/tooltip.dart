import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A short hover/long-press hint anchored to a child widget.
///
/// `RefractionTooltip` is the Flutter sibling of the `RefractionTooltip`
/// component from the React, Angular and Astro Refraction UI packages
/// (a shadcn-equivalent pattern). It wraps Flutter's built-in [Tooltip]
/// but swaps in [RefractionColors.popover], [RefractionColors.popoverForeground]
/// and [RefractionColors.border] for the visual treatment so it matches
/// the rest of the design system.
///
/// Tooltips fire on hover for mouse pointers and on long-press for touch.
/// They are best used for short hints (a few words). For richer content
/// reach for [RefractionPopover].
///
/// ```dart
/// RefractionTooltip(
///   message: const Text('Copy to clipboard'),
///   child: IconButton(
///     icon: const Icon(Icons.copy),
///     onPressed: () {/* ... */},
///   ),
/// );
/// ```
class RefractionTooltip extends StatelessWidget {
  /// The hint shown when the tooltip is visible.
  ///
  /// Any widget is accepted — typically a [Text] but rich content such as
  /// a [Row] of icon + label also works.
  final Widget message;

  /// The widget the tooltip is attached to.
  final Widget child;

  /// How long the pointer must hover before the tooltip is shown.
  ///
  /// Defaults to 300 ms.
  final Duration waitDuration;

  /// Creates a tooltip that displays [message] above [child].
  const RefractionTooltip({
    super.key,
    required this.message,
    required this.child,
    this.waitDuration = const Duration(milliseconds: 300),
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    return Tooltip(
      richMessage: WidgetSpan(
        child: DefaultTextStyle(
          style: TextStyle(
            color: colors.popoverForeground,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
          child: message,
        ),
      ),
      waitDuration: waitDuration,
      decoration: BoxDecoration(
        color: colors.popover,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: colors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      preferBelow: false,
      verticalOffset: 24,
      child: child,
    );
  }
}
