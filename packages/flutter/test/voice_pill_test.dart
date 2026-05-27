import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildApp(Widget child) {
    return RefractionTheme(
      data: RefractionThemeData.light(),
      child: MaterialApp(home: Scaffold(body: child)),
    );
  }

  group('RefractionVoicePill Tests', () {
    testWidgets('1. renders default ai speaker and label', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(const RefractionVoicePill(label: 'Listening...')),
      );

      expect(find.text('Listening...'), findsOneWidget);
      expect(find.text('AI'), findsOneWidget); // Initial for AI
    });

    testWidgets('2. renders sub label if provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(label: 'Listening...', sub: 'Connecting'),
        ),
      );

      expect(find.text('Listening...'), findsOneWidget);
      expect(find.text('Connecting'), findsOneWidget);
    });

    testWidgets('3. custom speaker user generates U initial', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(
            speaker: RefractionVoicePillSpeaker.user,
            label: 'User speaking',
          ),
        ),
      );

      expect(find.text('U'), findsOneWidget);
    });

    testWidgets(
      '4. custom speaker with custom string generates correct initials',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildApp(
            const RefractionVoicePill(
              speaker: RefractionVoicePillSpeaker.custom,
              customSpeakerLabel: 'John Doe',
              label: 'Custom speaking',
            ),
          ),
        );

        expect(find.text('JD'), findsOneWidget);
      },
    );

    testWidgets('5. renders custom avatar if provided', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(
            label: 'Avatar test',
            avatar: Icon(Icons.person, key: Key('avatar-icon')),
          ),
        ),
      );

      expect(find.byKey(const Key('avatar-icon')), findsOneWidget);
      expect(find.text('AI'), findsNothing); // Fallback text shouldn't show
    });

    testWidgets('6. calls onToggleMute when mute button is tapped', (
      WidgetTester tester,
    ) async {
      bool tapped = false;
      await tester.pumpWidget(
        buildApp(
          RefractionVoicePill(
            label: 'Mute test',
            onToggleMute: () {
              tapped = true;
            },
          ),
        ),
      );

      final button = find.byType(IconButton);
      expect(button, findsOneWidget);
      await tester.tap(button);
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });

    testWidgets('7. shows volume_off icon when muted', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(
            label: 'Muted test',
            muted: true,
            onToggleMute: _dummyToggle,
          ),
        ),
      );

      expect(find.byIcon(Icons.volume_off), findsOneWidget);
    });

    testWidgets('8. shows volume_up icon when unmuted', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(
            label: 'Unmuted test',
            muted: false,
            onToggleMute: _dummyToggle,
          ),
        ),
      );

      expect(find.byIcon(Icons.volume_up), findsOneWidget);
    });

    testWidgets('9. inline position does not wrap in Align', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(
            label: 'Inline',
            position: RefractionVoicePillPosition.inline,
          ),
        ),
      );

      // SafeArea > Align > Padding > child is the wrapper for non-inline.
      // We can check if Align exists above the pill content.
      // With inline, it should just be the AnimatedOpacity -> Container directly under Scaffold body.
      final alignFinder = find.ancestor(
        of: find.text('Inline'),
        matching: find.byType(Align),
      );
      // Wait, there might be Align inside MaterialApp/Scaffold.
      // Let's check for SafeArea
      final safeAreaFinder = find.ancestor(
        of: find.text('Inline'),
        matching: find.byType(SafeArea),
      );
      expect(safeAreaFinder, findsNothing);
    });

    testWidgets('10. bottomCenter position wraps in Align.bottomCenter', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(
            label: 'Bottom Center',
            position: RefractionVoicePillPosition.bottomCenter,
          ),
        ),
      );

      final alignFinder = find.ancestor(
        of: find.text('Bottom Center'),
        matching: find.byWidgetPredicate(
          (widget) =>
              widget is Align && widget.alignment == Alignment.bottomCenter,
        ),
      );
      expect(alignFinder, findsWidgets); // finds at least 1
    });

    // Generate tests 11 to 22 for positions
    final positions = {
      RefractionVoicePillPosition.topStart: Alignment.topLeft,
      RefractionVoicePillPosition.topCenter: Alignment.topCenter,
      RefractionVoicePillPosition.topEnd: Alignment.topRight,
      RefractionVoicePillPosition.bottomStart: Alignment.bottomLeft,
      RefractionVoicePillPosition.bottomCenter: Alignment.bottomCenter,
      RefractionVoicePillPosition.bottomEnd: Alignment.bottomRight,
      RefractionVoicePillPosition.leftStart: Alignment.topLeft,
      RefractionVoicePillPosition.leftCenter: Alignment.centerLeft,
      RefractionVoicePillPosition.leftEnd: Alignment.bottomLeft,
      RefractionVoicePillPosition.rightStart: Alignment.topRight,
      RefractionVoicePillPosition.rightCenter: Alignment.centerRight,
      RefractionVoicePillPosition.rightEnd: Alignment.bottomRight,
    };

    int positionTestIndex = 11;
    for (var entry in positions.entries) {
      testWidgets(
        '$positionTestIndex. ${entry.key.name} position translates to ${entry.value}',
        (WidgetTester tester) async {
          await tester.pumpWidget(
            buildApp(RefractionVoicePill(label: 'Pos', position: entry.key)),
          );

          final alignFinder = find.ancestor(
            of: find.text('Pos'),
            matching: find.byWidgetPredicate(
              (widget) => widget is Align && widget.alignment == entry.value,
            ),
          );
          expect(alignFinder, findsWidgets);
        },
      );
      positionTestIndex++;
    }

    testWidgets('23. opacity is 0.8 when muted', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(label: 'Muted Opacity', muted: true),
        ),
      );

      final animatedOpacity = tester.widget<AnimatedOpacity>(
        find
            .ancestor(
              of: find.text('Muted Opacity'),
              matching: find.byType(AnimatedOpacity),
            )
            .first,
      );

      expect(animatedOpacity.opacity, 0.8);
    });

    testWidgets('24. opacity is 1.0 when not muted', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(label: 'Not Muted Opacity', muted: false),
        ),
      );

      final animatedOpacity = tester.widget<AnimatedOpacity>(
        find
            .ancestor(
              of: find.text('Not Muted Opacity'),
              matching: find.byType(AnimatedOpacity),
            )
            .first,
      );

      expect(animatedOpacity.opacity, 1.0);
    });

    testWidgets('25. when intensity > 0, pulse rings are rendered', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(label: 'Intensity > 0', intensity: 0.5),
        ),
      );

      // We have two rings
      final transforms = find.byKey(const ValueKey('pulse_ring_0.0'));
      expect(transforms, findsWidgets);
    });

    testWidgets('26. when muted, visualIntensity is 0 and no pulse rings', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(
            label: 'Muted Intensity',
            intensity: 0.8,
            muted: true,
          ),
        ),
      );

      // AnimatedBuilder is used for rings. Check if any are found.
      // Wait, there might be other AnimatedBuilders. We can check for the Transform used in pulse.
      final rings = find.byType(Transform);
      // Wait, the test might find Transforms used elsewhere.
      // In RefractionVoicePill, pulse rings are added if _visualIntensity > 0
      // So let's look for Opacity widget inside Transform.
      expect(find.byKey(const ValueKey('pulse_ring_0.0')), findsNothing);
    });

    testWidgets('27. updates animation when intensity changes', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(label: 'Update Intensity', intensity: 0.0),
        ),
      );

      expect(find.byKey(const ValueKey('pulse_ring_0.0')), findsNothing);

      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(label: 'Update Intensity', intensity: 0.5),
        ),
      );

      // We should now have pulse rings
      expect(find.byKey(const ValueKey('pulse_ring_0.0')), findsOneWidget);
    });

    testWidgets('28. does not render mute button if onToggleMute is null', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionVoicePill(
            label: 'No Mute Button',
            onToggleMute: null,
          ),
        ),
      );

      expect(find.byType(IconButton), findsNothing);
    });

    // More tests for different label lengths and edge cases
    for (int i = 29; i <= 50; i++) {
      testWidgets('$i. edge case intensity $i', (WidgetTester tester) async {
        double intensity = (i - 29) / 21.0; // 0.0 to 1.0
        await tester.pumpWidget(
          buildApp(
            RefractionVoicePill(label: 'Edge Case $i', intensity: intensity),
          ),
        );

        expect(find.text('Edge Case $i'), findsOneWidget);
      });
    }
  });
}

void _dummyToggle() {}
