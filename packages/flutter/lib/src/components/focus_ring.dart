import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

/// Gives any pressable keyboard reach: focus, Enter/Space activation and a
/// visible ring in [RefractionColors.ring].
///
/// Use this for custom pressable content and composed message surfaces. The
/// outside ring is painted before its child so native platform views keep their
/// pointer input on macOS, where foreground Flutter paint excludes native hits.
///
/// ```dart
/// RefractionFocusRing(
///   onActivate: save,
///   child: RefractionButton(onPressed: save, child: const Text('Save')),
/// )
/// ```
class RefractionFocusRing extends StatefulWidget {
  /// The pressable to make reachable.
  final Widget child;

  /// What Enter or Space does. Null leaves it unfocusable, like a disabled
  /// button.
  final VoidCallback? onActivate;

  /// The corner radius of the ring; the theme's `radiusMd` by default.
  final double? radius;

  /// An optional external focus node.
  final FocusNode? focusNode;

  /// Whether to take focus when first built.
  final bool autofocus;

  /// Creates a [RefractionFocusRing].
  const RefractionFocusRing({
    super.key,
    required this.child,
    this.onActivate,
    this.radius,
    this.focusNode,
    this.autofocus = false,
  });

  @override
  State<RefractionFocusRing> createState() => _RefractionFocusRingState();
}

class _RefractionFocusRingState extends State<RefractionFocusRing> {
  bool _showRing = false;

  static const double _ringWidth = 2;

  @override
  Widget build(BuildContext context) {
    final theme = context.refractionTheme;
    final onActivate = widget.onActivate;
    return FocusableActionDetector(
      enabled: onActivate != null,
      focusNode: widget.focusNode,
      autofocus: widget.autofocus,
      onShowFocusHighlight: (show) => setState(() => _showRing = show),
      actions: {
        ActivateIntent: CallbackAction<ActivateIntent>(
          onInvoke: (_) {
            onActivate?.call();
            return null;
          },
        ),
      },
      child: DecoratedBox(
        // macOS excludes native platform-view hit testing beneath Flutter
        // overlay paint regions. Paint the outside ring before the child so
        // a focused message never covers its embedded document's input area.
        position: DecorationPosition.background,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(
            (widget.radius ?? theme.radiusMd) + _ringWidth,
          ),
          border: _showRing
              ? Border.all(
                  color: theme.colors.ring,
                  width: _ringWidth,
                  strokeAlign: BorderSide.strokeAlignOutside,
                )
              : null,
        ),
        child: widget.child,
      ),
    );
  }
}
