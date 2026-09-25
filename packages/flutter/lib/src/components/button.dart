import 'package:flutter/material.dart';
import '../theme/motion.dart';
import '../theme/refraction_theme.dart';
import 'pressable.dart';

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
/// Mirrors the shadcn-ui `Button` primitive shipped in the React
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

  /// Accessible name announced by screen readers and exposed to web
  /// automation (Flutter web's semantics tree / Playwright `getByRole`).
  ///
  /// **Required in practice for icon-only buttons** ([RefractionButtonSize.icon])
  /// — an [Icon] has no text, so without a label the button is announced as
  /// just "button". Text buttons get their name from the child and can leave
  /// this null.
  final String? semanticLabel;

  /// Optional focus node, e.g. to move focus to the button programmatically.
  final FocusNode? focusNode;

  /// Whether the button takes focus when first built (e.g. the safe action
  /// of a confirm dialog).
  final bool autofocus;

  /// Creates a [RefractionButton].
  const RefractionButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.variant = RefractionButtonVariant.primary,
    this.size = RefractionButtonSize.defaultSize,
    this.isLoading = false,
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
  });

  @override
  State<RefractionButton> createState() => _RefractionButtonState();
}

class _RefractionButtonState extends State<RefractionButton> {
  bool get _enabled => widget.onPressed != null && !widget.isLoading;

  void _activate() {
    if (_enabled) widget.onPressed!();
  }

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(
      RefractionTheme.of(context).data.radiusMd,
    );
    return Semantics(
      button: true,
      enabled: widget.onPressed != null,
      label: widget.semanticLabel,
      onTap: _enabled ? _activate : null,
      child: RefractionPressable(
        onPressed: _enabled ? _activate : null,
        focusNode: widget.focusNode,
        autofocus: widget.autofocus,
        borderRadius: radius,
        builder: (context, state) => _buildSurface(context, state.hovered),
      ),
    );
  }

  Widget _buildSurface(BuildContext context, bool isHovered) {
    final theme = RefractionTheme.of(context);
    final data = theme.data;
    final colors = theme.colors;

    Color backgroundColor;
    Color foregroundColor;
    Color? borderColor;

    switch (widget.variant) {
      case RefractionButtonVariant.destructive:
        backgroundColor = isHovered
            ? colors.destructive.withValues(alpha: 0.9)
            : colors.destructive;
        foregroundColor = colors.destructiveForeground;
        break;
      case RefractionButtonVariant.outline:
        backgroundColor = isHovered ? colors.accent : Colors.transparent;
        foregroundColor = isHovered
            ? colors.accentForeground
            : colors.foreground;
        borderColor = colors.input;
        break;
      case RefractionButtonVariant.secondary:
        backgroundColor = isHovered
            ? colors.secondary.withValues(alpha: 0.8)
            : colors.secondary;
        foregroundColor = colors.secondaryForeground;
        break;
      case RefractionButtonVariant.ghost:
        backgroundColor = isHovered ? colors.accent : Colors.transparent;
        foregroundColor = isHovered
            ? colors.accentForeground
            : colors.foreground;
        break;
      case RefractionButtonVariant.link:
        backgroundColor = Colors.transparent;
        foregroundColor = colors.primary;
        break;
      case RefractionButtonVariant.primary:
        backgroundColor = isHovered
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

    // Padding and control heights read the theme's spacing/control-height
    // scales; the derived defaults equal the historical literals, so sizing is
    // unchanged. The off-scale values (default's 10px vertical inset and lg's
    // 32px horizontal inset) stay literal as they never sat on the 4/8/12/16
    // spacing steps.
    switch (widget.size) {
      case RefractionButtonSize.sm:
        padding = EdgeInsets.symmetric(
          horizontal: data.spacingMd,
          vertical: data.spacingSm,
        );
        fontSize = 12.0;
        minHeight = data.controlHeightSm;
        break;
      case RefractionButtonSize.lg:
        padding = EdgeInsets.symmetric(
          horizontal: 32,
          vertical: data.spacingMd,
        );
        fontSize = 16.0;
        minHeight = data.controlHeightLg;
        break;
      case RefractionButtonSize.icon:
        padding = EdgeInsets.zero;
        fontSize = 16.0;
        minWidth = data.controlHeightMd;
        minHeight = data.controlHeightMd;
        break;
      case RefractionButtonSize.defaultSize:
        padding = EdgeInsets.symmetric(
          horizontal: data.spacingLg,
          vertical: 10,
        );
        fontSize = 14.0;
        minHeight = data.controlHeightMd;
        break;
    }

    Widget content = DefaultTextStyle(
      style: data.textStyle.copyWith(
        color: foregroundColor,
        fontSize: fontSize,
        fontWeight: FontWeight.w500,
        decoration: widget.variant == RefractionButtonVariant.link && isHovered
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
          : IconTheme.merge(
              // Icons read IconTheme, not DefaultTextStyle: without this an
              // icon child keeps the ambient (Material) icon color and is
              // near-invisible on dark variants.
              data: IconThemeData(color: foregroundColor, size: fontSize + 2),
              child: widget.child,
            ),
    );

    final radius = BorderRadius.circular(data.radiusMd);
    final surface = AnimatedContainer(
      duration: RefractionMotion.duration(context, data.motionMedium),
      curve: Curves.easeInOut,
      constraints: BoxConstraints(
        minWidth: minWidth ?? 0.0,
        minHeight: minHeight,
      ),
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor,
        // radiusMd defaults to the base borderRadius, so corners are
        // unchanged; a consumer can now round controls independently of
        // cards via the radius scale.
        borderRadius: radius,
        border: borderColor != null ? Border.all(color: borderColor) : null,
      ),
      // Center with factors 1 hugs the content (a Container `alignment`
      // would stretch the button to the full available width) while still
      // centering it inside the min width/height.
      // A semanticLabel replaces the child's text/icon semantics rather than
      // concatenating with them; the button node keeps its focus state.
      child: Center(
        widthFactor: 1,
        heightFactor: 1,
        child: ExcludeSemantics(
          excluding: widget.semanticLabel != null,
          child: content,
        ),
      ),
    );

    return surface;
  }
}
