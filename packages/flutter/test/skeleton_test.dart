import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(body: child),
      ),
    );
  }

  double opacityOf(WidgetTester tester) {
    return tester
        .widget<FadeTransition>(
          find.descendant(
            of: find.byType(RefractionSkeleton),
            matching: find.byType(FadeTransition),
          ),
        )
        .opacity
        .value;
  }

  group('RefractionSkeleton', () {
    testWidgets('honors explicit width and height', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionSkeleton(width: 120, height: 20, animate: false),
        ),
      );

      expect(
        tester.getSize(find.byType(RefractionSkeleton)),
        const Size(120, 20),
      );
    });

    testWidgets('circular shape mirrors width into height', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionSkeleton(
            shape: SkeletonShape.circular,
            width: 40,
            animate: false,
          ),
        ),
      );

      expect(
        tester.getSize(find.byType(RefractionSkeleton)),
        const Size(40, 40),
      );
    });

    testWidgets('text shape defaults to a 16px line', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionSkeleton(
            shape: SkeletonShape.text,
            width: 200,
            animate: false,
          ),
        ),
      );

      expect(tester.getSize(find.byType(RefractionSkeleton)).height, 16.0);
    });

    testWidgets('pulses opacity while animating and stays solid when not', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(const RefractionSkeleton(width: 100, height: 100)),
      );
      final initial = opacityOf(tester);
      await tester.pump(const Duration(milliseconds: 500));
      expect(opacityOf(tester), isNot(initial));

      await tester.pumpWidget(
        buildApp(const RefractionSkeleton(width: 100, animate: false)),
      );
      expect(opacityOf(tester), 1.0);
      await tester.pump(const Duration(milliseconds: 500));
      expect(opacityOf(tester), 1.0);
    });

    testWidgets('RefractionSkeletonText renders one skeleton per line', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const SizedBox(
            width: 300,
            child: RefractionSkeletonText(lines: 4, animate: false),
          ),
        ),
      );

      expect(find.byType(RefractionSkeleton), findsNWidgets(4));
    });
  });
}
