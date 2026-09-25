import 'package:flutter/widgets.dart';

import 'refraction_theme.dart';

/// Paints the theme's keyboard focus ring around [child] while [visible].
///
/// The ring is drawn outside the child (offset by
/// `RefractionThemeData.focusRingOffset`) in `RefractionColors.focusRing`
/// at `focusRingWidth`, so it never shifts layout and never sits on the
/// control's own border. Pass the child's corner [borderRadius] so the ring
/// follows its shape.
///
/// Show it for keyboard focus only — pair it with
/// [FocusableActionDetector.onShowFocusHighlight], which reports focus only
/// in keyboard/traditional highlight mode, so a mouse click or a tap never
/// draws a ring.
///
/// ```dart
/// FocusableActionDetector(
///   onShowFocusHighlight: (v) => setState(() => _focused = v),
///   child: RefractionFocusRing(
///     visible: _focused,
///     borderRadius: BorderRadius.circular(theme.radiusMd),
///     child: button,
///   ),
/// )
/// ```
class RefractionFocusRing extends StatelessWidget {
  /// Whether the ring is painted.
  final bool visible;

  /// Corner radius of [child]; the ring grows it by the ring offset.
  final BorderRadius borderRadius;

  /// The focused control.
  final Widget child;

  /// Creates a focus ring around [child].
  const RefractionFocusRing({
    super.key,
    required this.visible,
    required this.child,
    this.borderRadius = BorderRadius.zero,
  });

  @override
  Widget build(BuildContext context) {
    if (!visible) return child;
    final theme = RefractionTheme.of(context).data;
    final inset = theme.focusRingOffset + theme.focusRingWidth;
    return CustomPaint(
      foregroundPainter: _FocusRingPainter(
        color: theme.colors.focusRing,
        width: theme.focusRingWidth,
        inset: inset,
        borderRadius: borderRadius,
      ),
      child: child,
    );
  }
}

class _FocusRingPainter extends CustomPainter {
  final Color color;
  final double width;
  final double inset;
  final BorderRadius borderRadius;

  _FocusRingPainter({
    required this.color,
    required this.width,
    required this.inset,
    required this.borderRadius,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Center the stroke on a rect `inset - width/2` outside the child, so the
    // ring's inner edge sits exactly `focusRingOffset` from the child.
    final grow = inset - width / 2;
    final rect = (Offset.zero & size).inflate(grow);
    final radius = BorderRadius.only(
      topLeft: borderRadius.topLeft + Radius.circular(grow),
      topRight: borderRadius.topRight + Radius.circular(grow),
      bottomLeft: borderRadius.bottomLeft + Radius.circular(grow),
      bottomRight: borderRadius.bottomRight + Radius.circular(grow),
    );
    canvas.drawRRect(
      radius.toRRect(rect),
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = width,
    );
  }

  @override
  bool shouldRepaint(_FocusRingPainter old) =>
      old.color != color ||
      old.width != width ||
      old.inset != inset ||
      old.borderRadius != borderRadius;
}
