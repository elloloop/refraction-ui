import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Visual sizes for [RefractionCallControls] and [RefractionCallControlButton].
enum RefractionCallControlsSize {
  /// Small size control bar and buttons.
  sm,

  /// Medium (default) size control bar and buttons.
  md,
}

/// Visual/semantic tones for a [RefractionCallControlButton].
enum RefractionCallControlTone {
  /// Neutral muted appearance (standard inactive/toggled-off state).
  defaultTone,

  /// Primary/highlighted appearance (active/toggled-on state).
  active,

  /// Red/danger appearance (e.g. leave call or muted indicator).
  destructive,
}

/// A round meeting-control button for a call control toolbar.
///
/// Features:
/// - Tone variants (default, active, destructive)
/// - Optional pressed/toggled state for accessibility
/// - Icon content only (label is for screen readers/accessibility only)
class RefractionCallControlButton extends StatefulWidget {
  /// Accessible label (used for [Semantics] and visible to screen readers).
  final String label;

  /// Optional icon rendered inside the button.
  final Widget? icon;

  /// Visual/semantic tone of the button. Defaults to [RefractionCallControlTone.defaultTone].
  final RefractionCallControlTone tone;

  /// Whether this control is currently in a "pressed" / toggled-on state.
  final bool? pressed;

  /// Visual size of the button. Defaults to [RefractionCallControlsSize.md].
  final RefractionCallControlsSize size;

  /// Callback when the button is tapped.
  final VoidCallback? onPressed;

  /// Creates a [RefractionCallControlButton].
  const RefractionCallControlButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.tone = RefractionCallControlTone.defaultTone,
    this.pressed,
    this.size = RefractionCallControlsSize.md,
  });

  @override
  State<RefractionCallControlButton> createState() => _RefractionCallControlButtonState();
}

class _RefractionCallControlButtonState extends State<RefractionCallControlButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final isSm = widget.size == RefractionCallControlsSize.sm;
    final double buttonSize = isSm ? 36.0 : 44.0;

    Color backgroundColor;
    Color foregroundColor;

    switch (widget.tone) {
      case RefractionCallControlTone.active:
        backgroundColor = _isHovered
            ? colors.primary.withValues(alpha: 0.9)
            : colors.primary;
        foregroundColor = colors.primaryForeground;
        break;
      case RefractionCallControlTone.destructive:
        backgroundColor = _isHovered
            ? colors.destructive.withValues(alpha: 0.9)
            : colors.destructive;
        foregroundColor = colors.destructiveForeground;
        break;
      case RefractionCallControlTone.defaultTone:
        backgroundColor = _isHovered
            ? colors.muted.withValues(alpha: 0.8)
            : colors.muted;
        foregroundColor = colors.foreground;
        break;
    }

    if (widget.onPressed == null) {
      backgroundColor = backgroundColor.withValues(alpha: 0.5);
      foregroundColor = foregroundColor.withValues(alpha: 0.5);
    }

    return Semantics(
      button: true,
      label: widget.label,
      enabled: widget.onPressed != null,
      selected: widget.pressed,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        cursor: widget.onPressed == null
            ? SystemMouseCursors.forbidden
            : SystemMouseCursors.click,
        child: GestureDetector(
          onTap: widget.onPressed,
          behavior: HitTestBehavior.opaque,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeInOut,
            width: buttonSize,
            height: buttonSize,
            decoration: BoxDecoration(
              color: backgroundColor,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: widget.icon != null
                ? IconTheme(
                    data: IconThemeData(
                      color: foregroundColor,
                      size: isSm ? 18 : 22,
                    ),
                    child: widget.icon!,
                  )
                : null,
          ),
        ),
      ),
    );
  }
}

/// A toolbar wrapper for a set of meeting-control buttons.
///
/// Children are typically [RefractionCallControlButton] widgets.
class RefractionCallControls extends StatelessWidget {
  /// Visual size of the toolbar (influences internal padding and gaps).
  /// Defaults to [RefractionCallControlsSize.md].
  final RefractionCallControlsSize size;

  /// The controls/buttons to display inside the toolbar.
  final List<Widget> children;

  /// Creates a [RefractionCallControls] toolbar.
  const RefractionCallControls({
    super.key,
    this.size = RefractionCallControlsSize.md,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final isSm = size == RefractionCallControlsSize.sm;
    final padding = isSm
        ? const EdgeInsets.symmetric(horizontal: 12, vertical: 8)
        : const EdgeInsets.symmetric(horizontal: 16, vertical: 12);
    final gap = isSm ? 6.0 : 8.0;

    return Semantics(
      explicitChildNodes: true,
      container: true,
      child: Container(
        decoration: BoxDecoration(
          color: colors.card,
          borderRadius: BorderRadius.circular(theme.borderRadius),
          border: Border.all(color: colors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 2,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        padding: padding,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            for (int i = 0; i < children.length; i++) ...[
              children[i],
              if (i < children.length - 1) SizedBox(width: gap),
            ],
          ],
        ),
      ),
    );
  }
}
