import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

enum RefractionInputGroupOrientation { horizontal, vertical }

/// Groups multiple inputs or addons together.
class RefractionInputGroup extends StatelessWidget {
  final List<Widget> children;
  final RefractionInputGroupOrientation orientation;

  const RefractionInputGroup({
    super.key,
    required this.children,
    this.orientation = RefractionInputGroupOrientation.horizontal,
  });

  @override
  Widget build(BuildContext context) {
    if (orientation == RefractionInputGroupOrientation.horizontal) {
      return IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: children.map((c) => Expanded(child: c)).toList(),
        ),
      );
    } else {
      return IntrinsicWidth(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: children,
        ),
      );
    }
  }
}

/// An addon for [RefractionInputGroup], typically used for text or icons
/// that sit alongside an input field.
class RefractionInputGroupAddon extends StatelessWidget {
  final Widget child;

  const RefractionInputGroupAddon({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: theme.colors.muted,
        border: Border.all(color: theme.colors.border),
      ),
      alignment: Alignment.center,
      child: DefaultTextStyle(
        style: TextStyle(color: theme.colors.mutedForeground, fontSize: 14),
        child: child,
      ),
    );
  }
}
