import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionMascot renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionMascot(
          size: 200.0,
          mood: MascotMood.happy,
        ),
      ),
    );

    // Verify CustomPaint is rendered inside RefractionMascot
    expect(
      find.descendant(
        of: find.byType(RefractionMascot),
        matching: find.byType(CustomPaint),
      ),
      findsOneWidget,
    );
  });

  testWidgets('RefractionMascot handles different moods', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionMascot(
          size: 150.0,
          mood: MascotMood.think,
        ),
      ),
    );

    final mascotFinder = find.descendant(
      of: find.byType(RefractionMascot),
      matching: find.byType(CustomPaint),
    );
    expect(mascotFinder, findsOneWidget);

    final CustomPaint customPaint = tester.widget(mascotFinder);
    final painter = customPaint.painter as MascotPainter;
    expect(painter.mood, MascotMood.think);
  });

  testWidgets('RefractionMascot handles waving mood', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionMascot(
          size: 180.0,
          mood: MascotMood.wave,
        ),
      ),
    );

    final mascotFinder = find.descendant(
      of: find.byType(RefractionMascot),
      matching: find.byType(CustomPaint),
    );
    expect(mascotFinder, findsOneWidget);

    final CustomPaint customPaint = tester.widget(mascotFinder);
    final painter = customPaint.painter as MascotPainter;
    expect(painter.mood, MascotMood.wave);
  });

  testWidgets('RefractionMascot stops animations when animate is false', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionMascot(
          size: 180.0,
          mood: MascotMood.happy,
          animate: false,
        ),
      ),
    );

    final mascotFinder = find.descendant(
      of: find.byType(RefractionMascot),
      matching: find.byType(CustomPaint),
    );
    expect(mascotFinder, findsOneWidget);
    
    // We pump frames to verify it doesn't trigger ongoing animation updates
    await tester.pump(const Duration(seconds: 1));

    final CustomPaint customPaint = tester.widget(mascotFinder);
    final painter = customPaint.painter as MascotPainter;
    expect(painter.bobTranslationY, 0.0);
    expect(painter.sproutRotationAngle, 0.0);
  });
}
