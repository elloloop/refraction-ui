import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/rating_scale.dart';

void main() {
  group('RefractionRatingScale Tests', () {
    testWidgets('Renders the correct number of points', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionRatingScale(count: 5),
            ),
          ),
        ),
      );

      expect(find.text('1'), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
      expect(find.text('3'), findsOneWidget);
      expect(find.text('4'), findsOneWidget);
      expect(find.text('5'), findsOneWidget);
      expect(find.text('6'), findsNothing);
    });

    testWidgets('Tapping updates value and triggers callback', (WidgetTester tester) async {
      int? selectedVal;
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: StatefulBuilder(
                builder: (context, setState) {
                  return RefractionRatingScale(
                    value: selectedVal,
                    count: 5,
                    onValueChange: (val) {
                      setState(() {
                        selectedVal = val;
                      });
                    },
                  );
                },
              ),
            ),
          ),
        ),
      );

      // Tap the point '3'
      await tester.tap(find.text('3'));
      await tester.pumpAndSettle();

      expect(selectedVal, equals(3));
    });

    testWidgets('Renders min and max labels', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionRatingScale(
                count: 3,
                minLabel: Text('MinLabel'),
                maxLabel: Text('MaxLabel'),
              ),
            ),
          ),
        ),
      );

      expect(find.text('MinLabel'), findsOneWidget);
      expect(find.text('MaxLabel'), findsOneWidget);
    });

    testWidgets('Keyboard navigation moves selection', (WidgetTester tester) async {
      int? selectedVal = 1;
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: StatefulBuilder(
                builder: (context, setState) {
                  return RefractionRatingScale(
                    value: selectedVal,
                    count: 3,
                    onValueChange: (val) {
                      setState(() {
                        selectedVal = val;
                      });
                    },
                  );
                },
              ),
            ),
          ),
        ),
      );

      // Focus the first item
      final focusNode = Focus.of(tester.element(find.text('1')));
      focusNode.requestFocus();
      await tester.pump();

      // Press ArrowRight to select '2'
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pumpAndSettle();
      expect(selectedVal, equals(2));

      // Press End to select '3'
      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pumpAndSettle();
      expect(selectedVal, equals(3));

      // Press ArrowLeft to select '2'
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowLeft);
      await tester.pumpAndSettle();
      expect(selectedVal, equals(2));

      // Press Home to select '1'
      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pumpAndSettle();
      expect(selectedVal, equals(1));
    });
  });
}
