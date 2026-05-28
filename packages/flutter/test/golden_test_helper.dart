import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget buildThemedChild(
  Widget child,
  ThemeData themeData,
  RefractionThemeData refractionData,
) {
  return MaterialApp(
    theme: themeData,
    debugShowCheckedModeBanner: false,
    home: RefractionTheme(
      data: refractionData,
      child: Scaffold(
        backgroundColor: refractionData.colors.background,
        body: Center(
          child: DefaultTextStyle(
            style: refractionData.textStyle.copyWith(
              color: refractionData.colors.foreground,
            ),
            child: child,
          ),
        ),
      ),
    ),
  );
}
