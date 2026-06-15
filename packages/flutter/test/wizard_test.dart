import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/wizard.dart';

void main() {
  group('RefractionWizard Tests', () {
    final List<RefractionWizardStep> testSteps = const [
      RefractionWizardStep(id: '1', label: 'Step One'),
      RefractionWizardStep(id: '2', label: 'Step Two', optional: true),
      RefractionWizardStep(id: '3', label: 'Step Three'),
    ];

    testWidgets('Renders rail steps and current step content', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: RefractionWizard(
                steps: testSteps,
                builder: (context, index) {
                  return Text('Current Step Content $index');
                },
              ),
            ),
          ),
        ),
      );

      // Verify all steps are rendered in the rail
      expect(find.text('Step One'), findsOneWidget);
      expect(find.text('Step Two'), findsOneWidget);
      expect(find.text('Step Three'), findsOneWidget);
      expect(find.text('(Optional)'), findsOneWidget);

      // Verify step 1 content is shown initially
      expect(find.text('Current Step Content 0'), findsOneWidget);
    });

    testWidgets('Next and Back buttons navigate correctly', (WidgetTester tester) async {
      int activeIndex = 0;
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: StatefulBuilder(
                builder: (context, setState) {
                  return RefractionWizard(
                    steps: testSteps,
                    step: activeIndex,
                    onStepChange: (index) {
                      setState(() {
                        activeIndex = index;
                      });
                    },
                    builder: (context, index) {
                      return Text('Current Step Content $index');
                    },
                  );
                },
              ),
            ),
          ),
        ),
      );

      // Verify at step 0, Back is disabled (RefractionButton dim/disabled, but it has no callback)
      // Tap Next to go to Step 1
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(activeIndex, equals(1));
      expect(find.text('Current Step Content 1'), findsOneWidget);

      // We are at step 1 (which is optional). Skip button should be present.
      expect(find.text('Skip'), findsOneWidget);

      // Tap Back to go back to Step 0
      await tester.tap(find.text('Back'));
      await tester.pumpAndSettle();

      expect(activeIndex, equals(0));
      expect(find.text('Current Step Content 0'), findsOneWidget);
    });

    testWidgets('Skip button skips the optional step', (WidgetTester tester) async {
      int activeIndex = 1; // Start directly at the optional step
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: StatefulBuilder(
                builder: (context, setState) {
                  return RefractionWizard(
                    steps: testSteps,
                    step: activeIndex,
                    onStepChange: (index) {
                      setState(() {
                        activeIndex = index;
                      });
                    },
                    builder: (context, index) {
                      return Text('Current Step Content $index');
                    },
                  );
                },
              ),
            ),
          ),
        ),
      );

      // Skip is present
      expect(find.text('Skip'), findsOneWidget);

      // Tap Skip -> should advance to step 2
      await tester.tap(find.text('Skip'));
      await tester.pumpAndSettle();

      expect(activeIndex, equals(2));
      expect(find.text('Current Step Content 2'), findsOneWidget);
    });

    testWidgets('Tapping Complete on last step triggers onComplete', (WidgetTester tester) async {
      bool completed = false;
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: Scaffold(
              body: RefractionWizard(
                steps: testSteps,
                defaultStep: 2, // Start at last step
                onComplete: () {
                  completed = true;
                },
                builder: (context, index) {
                  return Text('Current Step Content $index');
                },
              ),
            ),
          ),
        ),
      );

      // Verify button shows "Complete"
      expect(find.text('Complete'), findsOneWidget);

      // Tap Complete
      await tester.tap(find.text('Complete'));
      await tester.pumpAndSettle();

      expect(completed, isTrue);
    });
  });
}
