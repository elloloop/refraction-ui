import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

enum RefractionButtonVariant {
  primary,
  destructive,
  outline,
  secondary,
  ghost,
  link,
}

enum RefractionButtonSize { defaultSize, sm, lg, icon }

class RefractionButton extends StatefulWidget {
  final VoidCallback? onPressed;
  final Widget child;
  final RefractionButtonVariant variant;
  final RefractionButtonSize size;
  final bool isLoading;

  const RefractionButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.variant = RefractionButtonVariant.primary,
    this.size = RefractionButtonSize.defaultSize,
    this.isLoading = false,
  });

  @override
  State<RefractionButton> createState() => _RefractionButtonState();
}

class _RefractionButtonState extends State<RefractionButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    Color backgroundColor;
    Color foregroundColor;
    Color? borderColor;

    switch (widget.variant) {
      case RefractionButtonVariant.destructive:
        backgroundColor = _isHovered
            ? colors.destructive.withValues(alpha: 0.9)
            : colors.destructive;
        foregroundColor = colors.destructiveForeground;
        break;
      case RefractionButtonVariant.outline:
        backgroundColor = _isHovered ? colors.accent : Colors.transparent;
        foregroundColor = _isHovered
            ? colors.accentForeground
            : colors.foreground;
        borderColor = colors.input;
        break;
      case RefractionButtonVariant.secondary:
        backgroundColor = _isHovered
            ? colors.secondary.withValues(alpha: 0.8)
            : colors.secondary;
        foregroundColor = colors.secondaryForeground;
        break;
      case RefractionButtonVariant.ghost:
        backgroundColor = _isHovered ? colors.accent : Colors.transparent;
        foregroundColor = _isHovered
            ? colors.accentForeground
            : colors.foreground;
        break;
      case RefractionButtonVariant.link:
        backgroundColor = Colors.transparent;
        foregroundColor = colors.primary;
        break;
      case RefractionButtonVariant.primary:
        backgroundColor = _isHovered
            ? colors.primary.withValues(alpha: 0.9)
            : colors.primary;
        foregroundColor = colors.primaryForeground;
        break;
    }

    if (widget.onPressed == null) {
      backgroundColor = backgroundColor.withValues(alpha: 0.5);
      foregroundColor = foregroundColor.withValues(alpha: 0.5);
      if (borderColor != null) borderColor = borderColor.withValues(alpha: 0.5);
    }

    EdgeInsetsGeometry padding;
    double fontSize;
    double? minWidth;
    double? minHeight;

    switch (widget.size) {
      case RefractionButtonSize.sm:
        padding = const EdgeInsets.symmetric(horizontal: 12, vertical: 8);
        fontSize = 12.0;
        minHeight = 32.0;
        break;
      case RefractionButtonSize.lg:
        padding = const EdgeInsets.symmetric(horizontal: 32, vertical: 12);
        fontSize = 16.0;
        minHeight = 44.0;
        break;
      case RefractionButtonSize.icon:
        padding = EdgeInsets.zero;
        fontSize = 16.0;
        minWidth = 36.0;
        minHeight = 36.0;
        break;
      case RefractionButtonSize.defaultSize:
        padding = const EdgeInsets.symmetric(horizontal: 16, vertical: 10);
        fontSize = 14.0;
        minHeight = 36.0;
        break;
    }

    Widget content = DefaultTextStyle(
      style: theme.data.textStyle.copyWith(
        color: foregroundColor,
        fontSize: fontSize,
        fontWeight: FontWeight.w500,
        decoration: widget.variant == RefractionButtonVariant.link && _isHovered
            ? TextDecoration.underline
            : TextDecoration.none,
      ),
      child: widget.isLoading
          ? SizedBox(
              width: fontSize,
              height: fontSize,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(foregroundColor),
              ),
            )
          : widget.child,
    );

    return Semantics(
      button: true,
      enabled: widget.onPressed != null,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        cursor: widget.onPressed == null
            ? SystemMouseCursors.forbidden
            : SystemMouseCursors.click,
        child: GestureDetector(
          onTap: widget.isLoading ? null : widget.onPressed,
          behavior: HitTestBehavior.opaque,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeInOut,
            constraints: BoxConstraints(
              minWidth: minWidth ?? 0.0,
              minHeight: minHeight,
            ),
            padding: padding,
            decoration: BoxDecoration(
              color: backgroundColor,
              borderRadius: BorderRadius.circular(theme.borderRadius),
              border: borderColor != null
                  ? Border.all(color: borderColor)
                  : null,
            ),
            alignment: Alignment.center,
            child: content,
          ),
        ),
      ),
    );
  }
}
