import 'package:flutter/material.dart';
import '../theme/motion.dart';
import '../theme/refraction_theme.dart';
import 'pressable.dart';

/// A compact two-state toggle, themed with [RefractionTheme].
///
/// `RefractionSwitch` is the Flutter analogue of the `RefractionSwitch`
/// component from the React and Astro Refraction UI packages
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

  /// Accessible name announced by screen readers and exposed to web
  /// automation. Set it when no adjacent text labels the control.
  final String? semanticLabel;

  /// Creates a switch bound to [value].
  const RefractionSwitch({
    super.key,
    required this.value,
    this.onChanged,
    this.disabled = false,
    this.semanticLabel,
  });

  @override
  State<RefractionSwitch> createState() => _RefractionSwitchState();
}

class _RefractionSwitchState extends State<RefractionSwitch> {
  VoidCallback? get _onPressed => widget.disabled || widget.onChanged == null
      ? null
      : () => widget.onChanged!(!widget.value);

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final duration = RefractionMotion.duration(
      context,
      theme.data.motionMedium,
    );

    return Semantics(
      toggled: widget.value,
      enabled: !widget.disabled,
      label: widget.semanticLabel,
      onTap: _onPressed,
      child: RefractionPressable(
        onPressed: _onPressed,
        borderRadius: const BorderRadius.all(Radius.circular(10)),
        builder: (context, state) => Opacity(
          opacity: widget.disabled ? 0.5 : 1.0,
          child: AnimatedContainer(
            duration: duration,
            width: 36,
            height: 20,
            decoration: BoxDecoration(
              color: widget.value ? colors.primary : colors.input,
              borderRadius: BorderRadius.circular(10),
              boxShadow: state.hovered
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
                  duration: duration,
                  curve: Curves.easeInOut,
                  left: widget.value ? 18 : 2,
                  top: 2,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: colors.background,
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
    );
  }
}
