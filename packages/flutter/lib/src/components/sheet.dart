import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

enum RefractionSheetSide { left, right, top, bottom }

class RefractionSheet {
  static Future<T?> show<T>({
    required BuildContext context,
    required Widget content,
    Widget? title,
    Widget? description,
    List<Widget>? actions,
    RefractionSheetSide side = RefractionSheetSide.right,
    bool barrierDismissible = true,
    double? width,
    double? height,
    bool showDragHandle = false,
  }) {
    final themeProvider = RefractionTheme.of(context);
    final theme = themeProvider.data;
    final colors = theme.colors;

    final defaultWidth = (side == RefractionSheetSide.left || side == RefractionSheetSide.right) ? 384.0 : double.infinity;
    final defaultHeight = (side == RefractionSheetSide.top || side == RefractionSheetSide.bottom) ? MediaQuery.of(context).size.height * 0.4 : double.infinity;

    return showGeneralDialog<T>(
      context: context,
      barrierColor: Colors.black54,
      barrierDismissible: barrierDismissible,
      barrierLabel: 'Dismiss',
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (context, animation, secondaryAnimation) {
        return const SizedBox.shrink();
      },
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        Offset begin;
        switch (side) {
          case RefractionSheetSide.left:
            begin = const Offset(-1.0, 0.0);
            break;
          case RefractionSheetSide.right:
            begin = const Offset(1.0, 0.0);
            break;
          case RefractionSheetSide.top:
            begin = const Offset(0.0, -1.0);
            break;
          case RefractionSheetSide.bottom:
            begin = const Offset(0.0, 1.0);
            break;
        }

        final curve = CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutCubic,
          reverseCurve: Curves.easeInCubic,
        );

        final sheet = Align(
          alignment: _getAlignment(side),
          child: RefractionTheme(
            data: theme,
            child: _DraggableSheet(
              side: side,
              onDismiss: () => Navigator.of(context).pop(),
              child: Material(
                color: colors.background,
                elevation: theme.heavyShadow != null ? 0 : 16,
                shape: _getShape(side, theme.borderRadius),
                child: Container(
                  width: width ?? defaultWidth,
                  height: height ?? defaultHeight,
                  decoration: BoxDecoration(
                    color: colors.background,
                    border: _getBorder(side, colors.border),
                  ),
                  child: SafeArea(
                    left: side == RefractionSheetSide.left,
                    right: side == RefractionSheetSide.right,
                    top: side == RefractionSheetSide.top,
                    bottom: side == RefractionSheetSide.bottom,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (showDragHandle)
                          Center(
                            child: Padding(
                              padding: const EdgeInsets.only(top: 12.0, bottom: 8.0),
                              child: Container(
                                width: 32,
                                height: 4,
                                decoration: BoxDecoration(
                                  color: colors.mutedForeground.withValues(alpha: 0.3),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                            ),
                          ),
                        if (title != null || description != null)
                          Padding(
                            padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (title != null)
                                  DefaultTextStyle(
                                    style: theme.textStyle.copyWith(
                                      color: colors.foreground,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                      letterSpacing: -0.5,
                                    ),
                                    child: title,
                                  ),
                                if (title != null && description != null)
                                  const SizedBox(height: 4),
                                if (description != null)
                                  DefaultTextStyle(
                                    style: theme.textStyle.copyWith(
                                      color: colors.mutedForeground,
                                      fontSize: 14,
                                    ),
                                    child: description,
                                  ),
                              ],
                            ),
                          ),
                        Expanded(
                          child: SingleChildScrollView(
                            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
                            child: DefaultTextStyle(
                              style: theme.textStyle.copyWith(
                                color: colors.foreground,
                                fontSize: 14,
                              ),
                              child: content,
                            ),
                          ),
                        ),
                        if (actions != null)
                          Padding(
                            padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: actions.map((a) => Padding(
                                padding: const EdgeInsets.only(left: 8.0),
                                child: a,
                              )).toList(),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );

        return SlideTransition(
          position: Tween<Offset>(begin: begin, end: Offset.zero).animate(curve),
          child: sheet,
        );
      },
    );
  }

  static Alignment _getAlignment(RefractionSheetSide side) {
    switch (side) {
      case RefractionSheetSide.left: return Alignment.centerLeft;
      case RefractionSheetSide.right: return Alignment.centerRight;
      case RefractionSheetSide.top: return Alignment.topCenter;
      case RefractionSheetSide.bottom: return Alignment.bottomCenter;
    }
  }

  static ShapeBorder _getShape(RefractionSheetSide side, double radius) {
    return const RoundedRectangleBorder();
  }

  static Border _getBorder(RefractionSheetSide side, Color color) {
    final borderSide = BorderSide(color: color);
    switch (side) {
      case RefractionSheetSide.left: return Border(right: borderSide);
      case RefractionSheetSide.right: return Border(left: borderSide);
      case RefractionSheetSide.top: return Border(bottom: borderSide);
      case RefractionSheetSide.bottom: return Border(top: borderSide);
    }
  }
}

class _DraggableSheet extends StatefulWidget {
  final RefractionSheetSide side;
  final VoidCallback onDismiss;
  final Widget child;

  const _DraggableSheet({
    required this.side,
    required this.onDismiss,
    required this.child,
  });

  @override
  State<_DraggableSheet> createState() => _DraggableSheetState();
}

class _DraggableSheetState extends State<_DraggableSheet> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  double _dragOffset = 0.0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _controller.addListener(() {
      setState(() {
        _dragOffset = _controller.value;
      });
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleDragUpdate(DragUpdateDetails details, double dimension) {
    setState(() {
      double delta = 0;
      switch (widget.side) {
        case RefractionSheetSide.left:
          delta = details.delta.dx;
          if (_dragOffset + delta < 0) _dragOffset += delta;
          break;
        case RefractionSheetSide.right:
          delta = details.delta.dx;
          if (_dragOffset + delta > 0) _dragOffset += delta;
          break;
        case RefractionSheetSide.top:
          delta = details.delta.dy;
          if (_dragOffset + delta < 0) _dragOffset += delta;
          break;
        case RefractionSheetSide.bottom:
          delta = details.delta.dy;
          if (_dragOffset + delta > 0) _dragOffset += delta;
          break;
      }
    });
  }

  void _handleDragEnd(DragEndDetails details, double dimension) {
    double threshold = dimension * 0.3;
    bool shouldDismiss = false;

    switch (widget.side) {
      case RefractionSheetSide.left:
        shouldDismiss = _dragOffset < -threshold || details.primaryVelocity! < -500;
        break;
      case RefractionSheetSide.right:
        shouldDismiss = _dragOffset > threshold || details.primaryVelocity! > 500;
        break;
      case RefractionSheetSide.top:
        shouldDismiss = _dragOffset < -threshold || details.primaryVelocity! < -500;
        break;
      case RefractionSheetSide.bottom:
        shouldDismiss = _dragOffset > threshold || details.primaryVelocity! > 500;
        break;
    }

    if (shouldDismiss) {
      widget.onDismiss();
    } else {
      _controller.value = _dragOffset;
      _controller.animateTo(0, curve: Curves.easeOut);
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isHorizontal = widget.side == RefractionSheetSide.left || widget.side == RefractionSheetSide.right;
        final dimension = isHorizontal ? constraints.maxWidth : constraints.maxHeight;

        return GestureDetector(
          onHorizontalDragUpdate: isHorizontal ? (d) => _handleDragUpdate(d, dimension) : null,
          onHorizontalDragEnd: isHorizontal ? (d) => _handleDragEnd(d, dimension) : null,
          onVerticalDragUpdate: !isHorizontal ? (d) => _handleDragUpdate(d, dimension) : null,
          onVerticalDragEnd: !isHorizontal ? (d) => _handleDragEnd(d, dimension) : null,
          child: Transform.translate(
            offset: isHorizontal ? Offset(_dragOffset, 0) : Offset(0, _dragOffset),
            child: widget.child,
          ),
        );
      },
    );
  }
}
