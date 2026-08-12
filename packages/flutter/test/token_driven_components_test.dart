import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

/// Wraps [child] under a [RefractionTheme] carrying [data].
Widget _app(RefractionThemeData data, Widget child) {
  return MaterialApp(
    home: RefractionTheme(
      data: data,
      child: Scaffold(body: Center(child: child)),
    ),
  );
}

BoxDecoration _decorationOf(WidgetTester tester, Finder container) {
  return tester.widget<Container>(container).decoration! as BoxDecoration;
}

void main() {
  group('RefractionButton reads the scale', () {
    testWidgets('corner radius comes from radiusMd, not the flat base', (
      tester,
    ) async {
      final data = RefractionThemeData(
        colors: RefractionColors.light,
        borderRadius: 8,
        radiusMd: 21,
      );
      await tester.pumpWidget(
        _app(data, RefractionButton(onPressed: () {}, child: const Text('Go'))),
      );

      final container = tester.widget<AnimatedContainer>(
        find.descendant(
          of: find.byType(RefractionButton),
          matching: find.byType(AnimatedContainer),
        ),
      );
      final decoration = container.decoration! as BoxDecoration;
      expect(decoration.borderRadius, BorderRadius.circular(21));
    });

    testWidgets('min height comes from controlHeightMd', (tester) async {
      final data = RefractionThemeData(
        colors: RefractionColors.light,
        controlHeightMd: 50,
      );
      await tester.pumpWidget(
        _app(data, RefractionButton(onPressed: () {}, child: const Text('Go'))),
      );

      final container = tester.widget<AnimatedContainer>(
        find.descendant(
          of: find.byType(RefractionButton),
          matching: find.byType(AnimatedContainer),
        ),
      );
      expect(container.constraints!.minHeight, 50);
    });

    testWidgets('horizontal padding comes from the spacing scale', (
      tester,
    ) async {
      final data = RefractionThemeData(
        colors: RefractionColors.light,
        spacingLg: 30,
      );
      await tester.pumpWidget(
        _app(data, RefractionButton(onPressed: () {}, child: const Text('Go'))),
      );

      final container = tester.widget<AnimatedContainer>(
        find.descendant(
          of: find.byType(RefractionButton),
          matching: find.byType(AnimatedContainer),
        ),
      );
      expect(
        container.padding,
        const EdgeInsets.symmetric(horizontal: 30, vertical: 10),
      );
    });
  });

  group('RefractionCard reads the scale', () {
    testWidgets('corner radius comes from radiusLg', (tester) async {
      final data = RefractionThemeData(
        colors: RefractionColors.light,
        borderRadius: 8,
        radiusLg: 30,
      );
      await tester.pumpWidget(
        _app(data, const RefractionCard(child: Text('body'))),
      );

      final decoration = _decorationOf(
        tester,
        find.descendant(
          of: find.byType(RefractionCard),
          matching: find.byType(Container),
        ),
      );
      expect(decoration.borderRadius, BorderRadius.circular(30));
    });

    testWidgets('box shadow comes from elevationSm', (tester) async {
      const shadow = [BoxShadow(color: Color(0xFF123456), blurRadius: 7)];
      final data = RefractionThemeData(
        colors: RefractionColors.light,
        elevationSm: shadow,
      );
      await tester.pumpWidget(
        _app(data, const RefractionCard(child: Text('body'))),
      );

      final decoration = _decorationOf(
        tester,
        find.descendant(
          of: find.byType(RefractionCard),
          matching: find.byType(Container),
        ),
      );
      expect(decoration.boxShadow, shadow);
    });

    testWidgets('header padding comes from spacingXl', (tester) async {
      final data = RefractionThemeData(
        colors: RefractionColors.light,
        spacingXl: 40,
      );
      await tester.pumpWidget(
        _app(data, const RefractionCardHeader(child: Text('title'))),
      );

      final padding = tester.widget<Padding>(
        find
            .descendant(
              of: find.byType(RefractionCardHeader),
              matching: find.byType(Padding),
            )
            .first,
      );
      expect(padding.padding, const EdgeInsets.all(40));
    });
  });

  group('scale defaults keep components pixel-identical', () {
    testWidgets('a default theme renders the button at the base radius', (
      tester,
    ) async {
      final data = RefractionThemeData(
        colors: RefractionColors.light,
        borderRadius: 8,
      );
      await tester.pumpWidget(
        _app(data, RefractionButton(onPressed: () {}, child: const Text('Go'))),
      );

      final container = tester.widget<AnimatedContainer>(
        find.descendant(
          of: find.byType(RefractionButton),
          matching: find.byType(AnimatedContainer),
        ),
      );
      final decoration = container.decoration! as BoxDecoration;
      // radiusMd defaulted to borderRadius, so the corner is unchanged.
      expect(decoration.borderRadius, BorderRadius.circular(8));
      expect(container.constraints!.minHeight, 36);
      expect(
        container.padding,
        const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      );
    });

    testWidgets('a default theme renders the card at the base radius', (
      tester,
    ) async {
      final data = RefractionThemeData.light();
      await tester.pumpWidget(
        _app(data, const RefractionCard(child: Text('body'))),
      );

      final decoration = _decorationOf(
        tester,
        find.descendant(
          of: find.byType(RefractionCard),
          matching: find.byType(Container),
        ),
      );
      // radiusLg defaulted to borderRadius (8); elevationSm defaulted to the
      // theme's soft shadow stack.
      expect(decoration.borderRadius, BorderRadius.circular(8));
      expect(decoration.boxShadow, RefractionThemeData.light().softShadow);
    });
  });
}
