import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A lightweight floating panel anchored to a [trigger] widget.
///
/// `RefractionPopover` mirrors the `RefractionPopover` component from the
/// React, Angular and Astro flavours of Refraction UI (a shadcn-equivalent
/// pattern). Tapping the [trigger] opens an [Overlay] containing [content]
/// positioned just below the trigger; tapping anywhere else dismisses it.
///
/// The popover paints itself with [RefractionColors.popover] and animates
/// in with a quick scale + fade. It is best suited for medium-density UI
/// such as filter pickers, share menus or quick-edit forms. For longer
/// blocking interactions prefer a dialog instead.
///
/// ```dart
/// RefractionPopover(
///   trigger: const RefractionButton(label: 'Filters'),
///   content: Padding(
///     padding: const EdgeInsets.all(12),
///     child: Column(
///       children: const [
///         Text('Filter by status'),
///         // ...
///       ],
///     ),
///   ),
/// );
/// ```
///
/// See also:
///
///  * [RefractionTooltip] for a smaller, hover-only variant.
class RefractionPopover extends StatefulWidget {
  /// The widget the user taps to toggle the popover.
  final Widget trigger;

  /// The content rendered inside the floating panel when open.
  final Widget content;

  /// Pixel offset applied to the popover relative to the bottom of [trigger].
  ///
  /// Defaults to `Offset(0, 8)` which leaves an 8px gap.
  final Offset offset;

  /// Creates a popover anchored to [trigger] showing [content] when tapped.
  const RefractionPopover({
    super.key,
    required this.trigger,
    required this.content,
    this.offset = const Offset(0, 8),
  });

  @override
  State<RefractionPopover> createState() => _RefractionPopoverState();
}

class _RefractionPopoverState extends State<RefractionPopover> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _isOpen = false;

  void _togglePopover() {
    if (_isOpen) {
      _closePopover();
    } else {
      _showPopover();
    }
  }

  void _showPopover() {
    final RenderBox renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    _overlayEntry = OverlayEntry(
      builder: (context) => Stack(
        children: [
          // Invisible dismiss barrier
          GestureDetector(
            behavior: HitTestBehavior.translucent,
            onTap: _closePopover,
            child: Container(color: Colors.transparent),
          ),
          Positioned(
            width: 250, // Default width
            child: CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              offset: widget.offset + Offset(0, size.height),
              child: Material(
                color: Colors.transparent,
                child: TweenAnimationBuilder<double>(
                  duration: const Duration(milliseconds: 150),
                  curve: Curves.easeOutCubic,
                  tween: Tween(begin: 0.95, end: 1.0),
                  builder: (context, scale, child) {
                    return Transform.scale(
                      scale: scale,
                      alignment: Alignment.topCenter,
                      child: Opacity(
                        opacity: (scale - 0.95) * 20, // Fade in fast
                        child: Container(
                          decoration: BoxDecoration(
                            color: colors.popover,
                            borderRadius: BorderRadius.circular(
                              theme.borderRadius,
                            ),
                            border: Border.all(color: colors.border),
                            boxShadow: theme.data.heavyShadow,
                          ),
                          child: DefaultTextStyle(
                            style: theme.data.textStyle,
                            child: widget.content,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
    setState(() => _isOpen = true);
  }

  void _closePopover() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    if (mounted) {
      setState(() => _isOpen = false);
    }
  }

  @override
  void dispose() {
    _closePopover();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: GestureDetector(onTap: _togglePopover, child: widget.trigger),
    );
  }
}
