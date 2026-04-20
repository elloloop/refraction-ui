import 'package:flutter/material.dart';
import 'refraction_colors.dart';
import 'refraction_theme_data.dart';

class RefractionTheme extends InheritedTheme {
  final RefractionThemeData data;

  const RefractionTheme({super.key, required this.data, required super.child});

  // Forward properties for backwards compatibility
  RefractionColors get colors => data.colors;
  double get borderRadius => data.borderRadius;

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
    return data != oldWidget.data;
  }

  @override
  Widget wrap(BuildContext context, Widget child) {
    return RefractionTheme(data: data, child: child);
  }
}

extension RefractionThemeExtension on BuildContext {
  RefractionThemeData get refractionTheme => RefractionTheme.of(this).data;
  RefractionColors get refractionColors => RefractionTheme.of(this).colors;
}
