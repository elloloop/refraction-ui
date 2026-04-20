import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class RefractionPopover extends StatefulWidget {
  final Widget trigger;
  final Widget content;
  final Offset offset;

  const RefractionPopover({
    Key? key,
    required this.trigger,
    required this.content,
    this.offset = const Offset(0, 8),
  }) : super(key: key);

  @override
  _RefractionPopoverState createState() => _RefractionPopoverState();
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
