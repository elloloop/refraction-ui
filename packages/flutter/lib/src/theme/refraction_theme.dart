import 'package:flutter/material.dart';
import 'refraction_colors.dart';

class RefractionTheme extends InheritedTheme {
  final RefractionColors colors;
  final double borderRadius;

  const RefractionTheme({
    Key? key,
    required this.colors,
    this.borderRadius = 8.0,
    required Widget child,
  }) : super(key: key, child: child);

  static RefractionTheme? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<RefractionTheme>();
  }

  static RefractionTheme of(BuildContext context) {
    final RefractionTheme? result = maybeOf(context);
    assert(result != null, 'No RefractionTheme found in context');
    return result!;
  }

  @override
  bool updateShouldNotify(RefractionTheme oldWidget) {
    return colors != oldWidget.colors || borderRadius != oldWidget.borderRadius;
  }

  @override
  Widget wrap(BuildContext context, Widget child) {
    return RefractionTheme(
      colors: colors,
      borderRadius: borderRadius,
      child: child,
    );
  }
}

extension RefractionThemeExtension on BuildContext {
  RefractionColors get refractionColors => RefractionTheme.of(this).colors;
}
