import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class RefractionTooltip extends StatelessWidget {
  final Widget message;
  final Widget child;
  final Duration waitDuration;

  const RefractionTooltip({
    Key? key,
    required this.message,
    required this.child,
    this.waitDuration = const Duration(milliseconds: 300),
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    return Tooltip(
      richMessage: WidgetSpan(
        child: DefaultTextStyle(
          style: TextStyle(
            color: colors.popoverForeground,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
          child: message,
        ),
      ),
      waitDuration: waitDuration,
      decoration: BoxDecoration(
        color: colors.popover,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: colors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      preferBelow: false,
      verticalOffset: 24,
      child: child,
    );
  }
}
