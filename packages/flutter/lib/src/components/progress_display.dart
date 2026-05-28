import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

enum ProgressDisplayType {
  linear,
  circular,
}

class RefractionProgressDisplay extends StatelessWidget {
  final double value;
  final String? label;
  final ProgressDisplayType type;
  final Color? color;

  const RefractionProgressDisplay({
    super.key,
    required this.value,
    this.label,
    this.type = ProgressDisplayType.linear,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final indicatorColor = color ?? theme.colors.primary;
    final trackColor = theme.colors.secondary;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: type == ProgressDisplayType.linear
          ? CrossAxisAlignment.start
          : CrossAxisAlignment.center,
      children: [
        if (type == ProgressDisplayType.linear) ...[
          if (label != null)
            Padding(
              padding: EdgeInsets.only(bottom: 8.0),
              child: Text(
                label!,
                style: theme.data.textStyle.copyWith(
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                ),
              ),
            ),
          ClipRRect(
            borderRadius: BorderRadius.circular(theme.borderRadius),
            child: LinearProgressIndicator(
              value: value,
              backgroundColor: trackColor,
              valueColor: AlwaysStoppedAnimation<Color>(indicatorColor),
              minHeight: 8.0,
            ),
          ),
        ] else ...[
          SizedBox(
            width: 48.0,
            height: 48.0,
            child: CircularProgressIndicator(
              value: value,
              backgroundColor: trackColor,
              valueColor: AlwaysStoppedAnimation<Color>(indicatorColor),
              strokeWidth: 4.0,
            ),
          ),
          if (label != null)
            Padding(
              padding: EdgeInsets.only(top: 12.0),
              child: Text(
                label!,
                style: theme.data.textStyle.copyWith(
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                ),
              ),
            ),
        ],
      ],
    );
  }
}
