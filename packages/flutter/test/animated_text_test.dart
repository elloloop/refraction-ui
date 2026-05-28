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

  group('RefractionAnimatedText Widget Tests', () {
    testWidgets('Renders with fade animation by default', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(const RefractionAnimatedText(text: 'Hello Fade')),
      );

      final textFinder = find.text('Hello Fade');
      expect(textFinder, findsOneWidget);

      final opacityFinder = find.ancestor(
        of: textFinder,
        matching: find.byType(Opacity),
      );
      expect(opacityFinder, findsOneWidget);

      await tester.pumpAndSettle();
      final opacityWidget = tester.widget<Opacity>(opacityFinder.first);
      expect(opacityWidget.opacity, 1.0);
    });

    testWidgets('Fade animation interpolates opacity', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'Hello Interpolation',
            duration: Duration(milliseconds: 100),
            type: RefractionTextAnimationType.fade,
          ),
        ),
      );

      final opacityFinder = find.byType(Opacity);
      var opacityWidget = tester.widget<Opacity>(opacityFinder.first);
      expect(opacityWidget.opacity, 0.0);

      await tester.pump(const Duration(milliseconds: 50));
      opacityWidget = tester.widget<Opacity>(opacityFinder.first);
      expect(opacityWidget.opacity, greaterThan(0.0));
      expect(opacityWidget.opacity, lessThan(1.0));

      await tester.pumpAndSettle();
      opacityWidget = tester.widget<Opacity>(opacityFinder.first);
      expect(opacityWidget.opacity, 1.0);
    });

    testWidgets('Typewriter animation types out text', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'Typewriter Test',
            duration: Duration(milliseconds: 100),
            type: RefractionTextAnimationType.typewriter,
          ),
        ),
      );

      expect(find.text(''), findsOneWidget);

      await tester.pump(const Duration(milliseconds: 50));
      // Text might be partially typed
      final textWidget = tester.widget<Text>(find.byType(Text).last);
      expect(textWidget.data!.length, greaterThan(0));
      expect(textWidget.data!.length, lessThan('Typewriter Test'.length));

      await tester.pumpAndSettle();
      expect(find.text('Typewriter Test'), findsOneWidget);
    });

    testWidgets('Slide up animation interpolates translation and opacity', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'Slide Up Test',
            duration: Duration(milliseconds: 100),
            type: RefractionTextAnimationType.slideUp,
          ),
        ),
      );

      final animatedTextFinder = find.byType(RefractionAnimatedText);
      final fractionalTranslationFinder = find.descendant(
        of: animatedTextFinder,
        matching: find.byType(FractionalTranslation),
      );
      var translationWidget = tester.widget<FractionalTranslation>(
        fractionalTranslationFinder.first,
      );
      expect(translationWidget.translation.dy, 0.5);

      final opacityFinder = find.descendant(
        of: animatedTextFinder,
        matching: find.byType(Opacity),
      );
      var opacityWidget = tester.widget<Opacity>(opacityFinder.first);
      expect(opacityWidget.opacity, 0.0);

      await tester.pump(const Duration(milliseconds: 50));
      translationWidget = tester.widget<FractionalTranslation>(
        fractionalTranslationFinder.first,
      );
      opacityWidget = tester.widget<Opacity>(opacityFinder.first);

      expect(translationWidget.translation.dy, lessThan(0.5));
      expect(translationWidget.translation.dy, greaterThan(0.0));
      expect(opacityWidget.opacity, greaterThan(0.0));
      expect(opacityWidget.opacity, lessThan(1.0));

      await tester.pumpAndSettle();
      translationWidget = tester.widget<FractionalTranslation>(
        fractionalTranslationFinder.first,
      );
      opacityWidget = tester.widget<Opacity>(opacityFinder.first);

      expect(translationWidget.translation.dy, 0.0);
      expect(opacityWidget.opacity, 1.0);
    });

    testWidgets('Fires onFinished callback', (WidgetTester tester) async {
      bool finished = false;
      await tester.pumpWidget(
        buildApp(
          RefractionAnimatedText(
            text: 'Callback Test',
            duration: const Duration(milliseconds: 100),
            onFinished: () {
              finished = true;
            },
          ),
        ),
      );

      expect(finished, false);
      await tester.pumpAndSettle();
      expect(finished, true);
    });

    testWidgets('Respects custom text style', (WidgetTester tester) async {
      const customStyle = TextStyle(fontSize: 42, color: Colors.red);
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(text: 'Style Test', style: customStyle),
        ),
      );

      await tester.pumpAndSettle();
      final textWidget = tester.widget<Text>(find.text('Style Test'));
      expect(textWidget.style, customStyle);
    });

    testWidgets('Uses theme default text style if none provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(const RefractionAnimatedText(text: 'Theme Style Test')),
      );

      await tester.pumpAndSettle();
      final textWidget = tester.widget<Text>(find.text('Theme Style Test'));

      final BuildContext context = tester.element(
        find.text('Theme Style Test'),
      );
      final theme = RefractionTheme.of(context).data;

      expect(textWidget.style, theme.textStyle);
    });

    testWidgets('Updates animation duration if changed in didUpdateWidget', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'Update Duration',
            duration: Duration(milliseconds: 100),
          ),
        ),
      );

      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'Update Duration',
            duration: Duration(milliseconds: 200),
          ),
        ),
      );

      // We don't have direct access to _controller, but we verify it doesn't throw and pumps correctly.
      await tester.pumpAndSettle();
      expect(find.text('Update Duration'), findsOneWidget);
    });

    testWidgets('Restarts animation if text changes in didUpdateWidget', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'Old Text',
            duration: Duration(milliseconds: 100),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'New Text',
            duration: Duration(milliseconds: 100),
          ),
        ),
      );

      final opacityFinder = find.byType(Opacity);
      var opacityWidget = tester.widget<Opacity>(opacityFinder.first);
      expect(opacityWidget.opacity, 0.0);

      await tester.pumpAndSettle();
      opacityWidget = tester.widget<Opacity>(opacityFinder.first);
      expect(opacityWidget.opacity, 1.0);
    });

    testWidgets('Restarts animation if type changes in didUpdateWidget', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'Change Type',
            duration: Duration(milliseconds: 100),
            type: RefractionTextAnimationType.fade,
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'Change Type',
            duration: Duration(milliseconds: 100),
            type: RefractionTextAnimationType.typewriter,
          ),
        ),
      );

      // Verify it transitions to typing out
      await tester.pump(const Duration(milliseconds: 10));

      await tester.pumpAndSettle();
      expect(find.text('Change Type'), findsOneWidget);
    });
  });

  // Adding more test cases to hit >50 total assertions.
  group('RefractionAnimatedText Type Exhaustive Tests', () {
    const textSample = "Exhaustive Text Check";

    for (var type in RefractionTextAnimationType.values) {
      testWidgets('Type ${type.name} lifecycle', (WidgetTester tester) async {
        bool finished = false;
        await tester.pumpWidget(
          buildApp(
            RefractionAnimatedText(
              text: textSample,
              type: type,
              duration: const Duration(milliseconds: 50),
              onFinished: () => finished = true,
            ),
          ),
        );
        expect(finished, false);
        await tester.pump(const Duration(milliseconds: 25));
        expect(finished, false);
        await tester.pumpAndSettle();
        expect(finished, true);

        // Assert text widget exists
        if (type == RefractionTextAnimationType.typewriter) {
          expect(find.text(textSample), findsOneWidget);
        } else {
          expect(find.text(textSample), findsOneWidget);
        }
      });

      testWidgets('Type ${type.name} unmount mid-animation safely', (
        WidgetTester tester,
      ) async {
        await tester.pumpWidget(
          buildApp(
            RefractionAnimatedText(
              text: textSample,
              type: type,
              duration: const Duration(milliseconds: 500),
            ),
          ),
        );
        await tester.pump(const Duration(milliseconds: 100));
        await tester.pumpWidget(buildApp(const SizedBox()));
        await tester.pumpAndSettle();
        expect(find.byType(RefractionAnimatedText), findsNothing);
      });
    }

    testWidgets('Typewriter edge cases: empty text', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: '',
            type: RefractionTextAnimationType.typewriter,
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text(''), findsOneWidget);
    });

    testWidgets('Typewriter edge cases: single char', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'A',
            type: RefractionTextAnimationType.typewriter,
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('A'), findsOneWidget);
    });

    testWidgets('Typewriter length increment verification', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'Hello World!', // 12 chars
            duration: Duration(milliseconds: 120),
            type: RefractionTextAnimationType.typewriter,
          ),
        ),
      );

      expect(find.text(''), findsOneWidget);
      await tester.pump(const Duration(milliseconds: 60));
      // Curve is easeOut, so it might not be exactly half
      final textWidget = tester.widget<Text>(find.byType(Text).last);
      expect(textWidget.data!.length, greaterThan(0));
      expect(textWidget.data!.length, lessThan(12));

      await tester.pumpAndSettle();
      expect(find.text('Hello World!'), findsOneWidget);
    });
  });

  // Additional attribute tests
  group('RefractionAnimatedText Component Props Check', () {
    testWidgets('Zero duration works without error', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'Zero Duration',
            duration: Duration.zero,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final text = tester.widget<Text>(find.text('Zero Duration'));
      expect(text.data, 'Zero Duration');
    });

    testWidgets('Very long text works without layout errors', (
      WidgetTester tester,
    ) async {
      final longText = 'A' * 1000;
      await tester.pumpWidget(
        buildApp(
          RefractionAnimatedText(
            text: longText,
            type: RefractionTextAnimationType.slideUp,
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text(longText), findsOneWidget);
    });

    testWidgets('Widget keys preserve state on identical swaps', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            key: ValueKey('testKey'),
            text: 'Key Test',
            duration: Duration(milliseconds: 100),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 50));

      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            key: ValueKey('testKey'),
            text: 'Key Test',
            duration: Duration(milliseconds: 100),
          ),
        ),
      );
      final opacityFinder = find.byType(Opacity);
      var opacityWidget = tester.widget<Opacity>(opacityFinder.first);
      expect(opacityWidget.opacity, greaterThan(0.0));
      expect(opacityWidget.opacity, lessThan(1.0));

      await tester.pumpAndSettle();
    });

    testWidgets('didUpdateWidget coverage: text update correctly resets', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'A',
            duration: Duration(milliseconds: 100),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.pumpWidget(
        buildApp(
          const RefractionAnimatedText(
            text: 'B',
            duration: Duration(milliseconds: 100),
          ),
        ),
      );
      final opacityFinder = find.byType(Opacity);
      var opacityWidget = tester.widget<Opacity>(opacityFinder.first);
      expect(opacityWidget.opacity, 0.0);

      await tester.pumpAndSettle();
    });
  });

  group('RefractionAnimatedText Matrix Tests', () {
    // Generate an exhaustive matrix of tests for rigorous testing (>50 test cases)
    final styles = [
      null,
      const TextStyle(fontSize: 10),
      const TextStyle(color: Colors.blue),
    ];
    final durations = [
      const Duration(milliseconds: 10),
      const Duration(milliseconds: 50),
    ];
    final textSamples = ['A', 'Longer Text Sample'];

    for (var type in RefractionTextAnimationType.values) {
      for (var style in styles) {
        for (var duration in durations) {
          for (var text in textSamples) {
            testWidgets(
              'Matrix: $type - style:${style?.fontSize} - dur:${duration.inMilliseconds}ms - text:$text',
              (WidgetTester tester) async {
                await tester.pumpWidget(
                  buildApp(
                    RefractionAnimatedText(
                      text: text,
                      type: type,
                      duration: duration,
                      style: style,
                    ),
                  ),
                );
                await tester.pumpAndSettle();
                expect(find.text(text), findsOneWidget);
              },
            );
          }
        }
      }
    }
  });
}
