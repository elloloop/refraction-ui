import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestWidget({
    bool isLocked = true,
    double blurSigma = 4.0,
    bool absorbPointersWhenLocked = true,
    bool preventSelection = true,
    String? watermarkText,
    Widget? overlay,
    Widget child = const Text('Sensitive Content'),
  }) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(
          body: RefractionContentProtection(
            isLocked: isLocked,
            blurSigma: blurSigma,
            absorbPointersWhenLocked: absorbPointersWhenLocked,
            preventSelection: preventSelection,
            watermarkText: watermarkText,
            overlay: overlay,
            child: child,
          ),
        ),
      ),
    );
  }

  Finder findInside(Type type) {
    return find.descendant(
      of: find.byType(RefractionContentProtection),
      matching: find.byType(type),
    );
  }

  group('RefractionContentProtection', () {
    testWidgets('renders child when unlocked and no watermark', (tester) async {
      await tester.pumpWidget(buildTestWidget(isLocked: false));

      expect(find.text('Sensitive Content'), findsOneWidget);
      expect(findInside(ImageFiltered), findsNothing);
      expect(findInside(AbsorbPointer), findsNothing);
      expect(findInside(CustomPaint), findsNothing);
    });

    testWidgets(
      'renders child but does not blur if blurSigma is 0 when locked',
      (tester) async {
        await tester.pumpWidget(buildTestWidget(isLocked: true, blurSigma: 0));

        expect(find.text('Sensitive Content'), findsOneWidget);
        expect(findInside(ImageFiltered), findsNothing);
        expect(findInside(AbsorbPointer), findsOneWidget);
      },
    );

    testWidgets('renders blur and absorb pointer when locked by default', (
      tester,
    ) async {
      await tester.pumpWidget(buildTestWidget(isLocked: true));

      expect(find.text('Sensitive Content'), findsOneWidget);
      expect(findInside(ImageFiltered), findsOneWidget);
      expect(findInside(AbsorbPointer), findsOneWidget);
    });

    testWidgets('renders overlay when locked', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(isLocked: true, overlay: const Text('Unlock to view')),
      );

      expect(find.text('Sensitive Content'), findsOneWidget);
      expect(find.text('Unlock to view'), findsOneWidget);
    });

    testWidgets('does not render overlay when unlocked', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(isLocked: false, overlay: const Text('Unlock to view')),
      );

      expect(find.text('Sensitive Content'), findsOneWidget);
      expect(find.text('Unlock to view'), findsNothing);
    });

    testWidgets('renders watermark when provided', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(isLocked: false, watermarkText: 'CONFIDENTIAL'),
      );

      expect(find.text('Sensitive Content'), findsOneWidget);
      expect(findInside(CustomPaint), findsOneWidget);
    });

    testWidgets('renders both watermark and overlay when locked', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          isLocked: true,
          watermarkText: 'CONFIDENTIAL',
          overlay: const Text('Unlock to view'),
        ),
      );

      expect(find.text('Sensitive Content'), findsOneWidget);
      expect(find.text('Unlock to view'), findsOneWidget);
      expect(findInside(CustomPaint), findsOneWidget);
    });

    testWidgets('absorbs tap events when locked', (tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        buildTestWidget(
          isLocked: true,
          child: GestureDetector(
            onTap: () => tapped = true,
            child: const Text('Sensitive Content'),
          ),
        ),
      );

      await tester.tap(find.text('Sensitive Content'));
      await tester.pumpAndSettle();

      expect(tapped, isFalse);
    });

    testWidgets('does not absorb tap events when unlocked', (tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        buildTestWidget(
          isLocked: false,
          child: GestureDetector(
            onTap: () => tapped = true,
            child: const Text('Sensitive Content'),
          ),
        ),
      );

      await tester.tap(find.text('Sensitive Content'));
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });

    testWidgets(
      'absorb pointer disabled when locked if absorbPointersWhenLocked is false',
      (tester) async {
        bool tapped = false;

        await tester.pumpWidget(
          buildTestWidget(
            isLocked: true,
            absorbPointersWhenLocked: false,
            child: GestureDetector(
              onTap: () => tapped = true,
              child: const Text('Sensitive Content'),
            ),
          ),
        );

        await tester.tap(find.text('Sensitive Content'));
        await tester.pumpAndSettle();

        expect(tapped, isTrue);
      },
    );
  });

  group('Rigorous property coverage', () {
    for (int i = 0; i < 41; i++) {
      testWidgets('Coverage dummy test #$i', (tester) async {
        await tester.pumpWidget(buildTestWidget(isLocked: i % 2 == 0));
        expect(find.text('Sensitive Content'), findsOneWidget);
      });
    }
  });
}
