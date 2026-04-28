import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Visual style of a [RefractionButton].
///
/// Each variant has a distinct emphasis level. Pick the lowest-emphasis
/// variant that still communicates the action's importance — this keeps
/// pages legible when many buttons are visible at once.
enum RefractionButtonVariant {
  /// Highest emphasis. Painted with [RefractionColors.primary].
  ///
  /// Use for the primary call-to-action on a screen — for example
  /// `Save`, `Submit`, or `Continue`. Avoid having more than one primary
  /// button per region.
  primary,

  /// Indicates a destructive or irreversible action, painted with
  /// [RefractionColors.destructive].
  ///
  /// Use for `Delete`, `Remove`, `Discard`, etc. Pair with a confirmation
  /// dialog when the action cannot be undone.
  destructive,

  /// Medium emphasis: transparent fill with a visible border.
  ///
  /// Use for secondary actions sitting next to a [primary] button, such
  /// as `Cancel` next to `Save`.
  outline,

  /// Lower emphasis than [primary], painted with
  /// [RefractionColors.secondary].
  ///
  /// Use for alternative actions that should still feel like buttons but
  /// not dominate the layout.
  secondary,

  /// Lowest emphasis. Transparent in the resting state and only highlights
  /// on hover.
  ///
  /// Use for tertiary actions or icon-only buttons inside dense toolbars.
  ghost,

  /// Renders as inline text in [RefractionColors.primary] that underlines on
  /// hover. Use to embed an action inside a sentence or for navigation that
  /// behaves like a hyperlink.
  link,
}

/// Sizing presets for [RefractionButton].
enum RefractionButtonSize {
  /// Standard 36 logical pixel tall button suitable for most forms.
  defaultSize,

  /// Compact 32 logical pixel tall button for dense UI such as toolbars.
  sm,

  /// Large 44 logical pixel tall button for hero call-to-actions.
  lg,

  /// Square button (36×36) sized for a single icon child.
  icon,
}

/// A pressable button with the Refraction visual language.
///
/// Use [variant] to pick the emphasis level (see [RefractionButtonVariant]
/// for guidance) and [size] to pick the height. Set [isLoading] to swap the
/// child for a spinner — taps are ignored while loading. Passing `null` for
/// [onPressed] disables the button: the surface dims and the cursor turns
/// into [SystemMouseCursors.forbidden].
///
/// Mirrors the shadcn-ui `Button` primitive shipped in the React, Angular,
/// and Astro Refraction UI packages.
///
/// ```dart
/// RefractionButton(
///   variant: RefractionButtonVariant.primary,
///   onPressed: _save,
///   child: const Text('Save'),
/// )
///
/// RefractionButton(
///   variant: RefractionButtonVariant.destructive,
///   onPressed: _delete,
///   child: const Text('Delete'),
/// )
///
/// RefractionButton(
///   variant: RefractionButtonVariant.ghost,
///   size: RefractionButtonSize.icon,
///   onPressed: _close,
///   child: const Icon(Icons.close, size: 16),
/// )
/// ```
class RefractionButton extends StatefulWidget {
  /// Called when the button is tapped. Pass `null` to render the button in
  /// a disabled state.
  final VoidCallback? onPressed;

  /// Content of the button. Usually a [Text], an [Icon], or a [Row] of both.
  final Widget child;

  /// Selects the color treatment. Defaults to [RefractionButtonVariant.primary].
  final RefractionButtonVariant variant;

  /// Selects the height and padding. Defaults to
  /// [RefractionButtonSize.defaultSize].
  final RefractionButtonSize size;

  /// When true, the [child] is replaced by a spinner and taps are ignored.
  final bool isLoading;

  /// Creates a [RefractionButton].
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
