import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A compact two-state toggle, themed with [RefractionTheme].
///
/// `RefractionSwitch` is the Flutter analogue of the `RefractionSwitch`
/// component from the React, Angular and Astro Refraction UI packages
/// (a shadcn-equivalent pattern). It paints the off state with
/// [RefractionColors.input], the on state with [RefractionColors.primary]
/// and surfaces a hover ring drawn from [RefractionColors.ring].
///
/// Use it for instant boolean toggles such as feature flags or
/// notification preferences.
///
/// ```dart
/// bool wifi = true;
/// RefractionSwitch(
///   value: wifi,
///   onChanged: (next) => setState(() => wifi = next),
/// );
/// ```
class RefractionSwitch extends StatefulWidget {
  /// Whether the switch is currently in the on state.
  final bool value;

  /// Called with the new boolean when the user toggles the switch.
  ///
  /// Set to `null` (or set [disabled] to `true`) to render as read-only.
  final ValueChanged<bool>? onChanged;

  /// When `true`, the switch is rendered with reduced opacity, the cursor
  /// changes to a forbidden symbol on web/desktop, and taps are ignored.
  final bool disabled;

  /// Creates a switch bound to [value].
  const RefractionSwitch({
    super.key,
    required this.value,
    this.onChanged,
    this.disabled = false,
  });

  @override
  State<RefractionSwitch> createState() => _RefractionSwitchState();
}

class _RefractionSwitchState extends State<RefractionSwitch> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final backgroundColor = widget.value ? colors.primary : colors.input;
    final thumbColor = colors.background;

    return Semantics(
      toggled: widget.value,
      enabled: !widget.disabled,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        cursor: widget.disabled
            ? SystemMouseCursors.forbidden
            : SystemMouseCursors.click,
        child: GestureDetector(
          onTap: widget.disabled
              ? null
              : () {
                  if (widget.onChanged != null) {
                    widget.onChanged!(!widget.value);
                  }
                },
          child: Opacity(
            opacity: widget.disabled ? 0.5 : 1.0,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 36,
              height: 20,
              decoration: BoxDecoration(
                color: backgroundColor,
                borderRadius: BorderRadius.circular(10),
                boxShadow: _isHovered && !widget.disabled
                    ? [
                        BoxShadow(
                          color: colors.ring,
                          spreadRadius: 2,
                          blurRadius: 4,
                        ),
                      ]
                    : null,
              ),
              child: Stack(
                children: [
                  AnimatedPositioned(
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeInOut,
                    left: widget.value ? 18 : 2,
                    top: 2,
                    child: Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        color: thumbColor,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 2,
                            offset: const Offset(0, 1),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
