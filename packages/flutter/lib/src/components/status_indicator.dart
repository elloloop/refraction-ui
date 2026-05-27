import 'package:flutter/widgets.dart';
import '../theme/refraction_theme.dart';

/// The status type for the status indicator.
enum RefractionStatusType { success, error, warning, info, pending, neutral }

/// A status indicator widget that displays a colored dot with an optional label.
class RefractionStatusIndicator extends StatelessWidget {
  /// The type of the status.
  final RefractionStatusType type;

  /// Optional text label. Takes precedence over [child].
  /// If both are omitted, a default label for the status type is shown.
  final String? label;

  /// Optional composable label content. Used when [label] is omitted.
  final Widget? child;

  /// Whether to show a pulse animation for the status dot.
  /// Defaults to true for [RefractionStatusType.pending].
  final bool? pulse;

  /// Whether to display the label next to the dot. Defaults to true.
  final bool showLabel;

  /// Optional custom text style for the label.
  final TextStyle? textStyle;

  const RefractionStatusIndicator({
    super.key,
    required this.type,
    this.label,
    this.child,
    this.pulse,
    this.showLabel = true,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    final color = _getColor(type);
    final String defaultLabel = _getDefaultLabel(type);

    // Derive the aria label
    String ariaLabel = defaultLabel;
    if (label != null) {
      ariaLabel = label!;
    } else if (child is Text) {
      ariaLabel = (child as Text).data ?? defaultLabel;
    }

    final bool shouldPulse = pulse ?? (type == RefractionStatusType.pending);

    Widget dot = Container(
      width: 8.0,
      height: 8.0,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );

    if (shouldPulse) {
      dot = _PulseAnimator(child: dot);
    }

    final theme = RefractionTheme.of(context);

    Widget labelWidget = const SizedBox.shrink();
    if (showLabel) {
      if (child != null && label == null) {
        labelWidget = child!;
      } else {
        labelWidget = Text(
          label ?? defaultLabel,
          style:
              textStyle ??
              theme.data.textStyle.copyWith(
                color: theme.colors.mutedForeground,
                fontSize: 14.0,
                height: 1.4,
              ),
        );
      }
    }

    return Semantics(
      label: ariaLabel,
      liveRegion: true,
      container: true,
      child: ExcludeSemantics(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            dot,
            if (showLabel) const SizedBox(width: 6.0),
            if (showLabel) labelWidget,
          ],
        ),
      ),
    );
  }

  Color _getColor(RefractionStatusType type) {
    switch (type) {
      case RefractionStatusType.success:
        return const Color(0xFF22C55E); // green-500
      case RefractionStatusType.error:
        return const Color(0xFFEF4444); // red-500
      case RefractionStatusType.warning:
        return const Color(0xFFEAB308); // yellow-500
      case RefractionStatusType.info:
        return const Color(0xFF3B82F6); // blue-500
      case RefractionStatusType.pending:
        return const Color(0xFFF97316); // orange-500
      case RefractionStatusType.neutral:
        return const Color(0xFF9CA3AF); // gray-400
    }
  }

  String _getDefaultLabel(RefractionStatusType type) {
    switch (type) {
      case RefractionStatusType.success:
        return 'Success';
      case RefractionStatusType.error:
        return 'Error';
      case RefractionStatusType.warning:
        return 'Warning';
      case RefractionStatusType.info:
        return 'Info';
      case RefractionStatusType.pending:
        return 'Pending';
      case RefractionStatusType.neutral:
        return 'Neutral';
    }
  }
}

class _PulseAnimator extends StatefulWidget {
  final Widget child;

  const _PulseAnimator({required this.child});

  @override
  State<_PulseAnimator> createState() => _PulseAnimatorState();
}

class _PulseAnimatorState extends State<_PulseAnimator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1), // 1s down, 1s up = 2s total cycle
    )..repeat(reverse: true);

    _animation = Tween<double>(
      begin: 1.0,
      end: 0.5,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(opacity: _animation, child: widget.child);
  }
}
