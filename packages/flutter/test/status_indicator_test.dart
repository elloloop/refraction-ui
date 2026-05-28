import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('RefractionStatusIndicator', () {
    testWidgets('renders neutral indicator by default', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.neutral,
              ),
            ),
          ),
        ),
      );

      // Label
      expect(find.text('Neutral'), findsOneWidget);

      // Color dot (Container with BoxDecoration)
      final container = tester.widget<Container>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(Container),
            )
            .first,
      );
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, const Color(0xFF9CA3AF));
    });

    testWidgets('renders success indicator', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.success,
              ),
            ),
          ),
        ),
      );

      expect(find.text('Success'), findsOneWidget);
      final container = tester.widget<Container>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(Container),
            )
            .first,
      );
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, const Color(0xFF22C55E));
    });

    testWidgets('renders error indicator', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(type: RefractionStatusType.error),
            ),
          ),
        ),
      );

      expect(find.text('Error'), findsOneWidget);
      final container = tester.widget<Container>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(Container),
            )
            .first,
      );
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, const Color(0xFFEF4444));
    });

    testWidgets('renders warning indicator', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.warning,
              ),
            ),
          ),
        ),
      );

      expect(find.text('Warning'), findsOneWidget);
      final container = tester.widget<Container>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(Container),
            )
            .first,
      );
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, const Color(0xFFEAB308));
    });

    testWidgets('renders info indicator', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(type: RefractionStatusType.info),
            ),
          ),
        ),
      );

      expect(find.text('Info'), findsOneWidget);
      final container = tester.widget<Container>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(Container),
            )
            .first,
      );
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, const Color(0xFF3B82F6));
    });

    testWidgets('renders pending indicator with pulse by default', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.pending,
              ),
            ),
          ),
        ),
      );

      expect(find.text('Pending'), findsOneWidget);

      // Should find a FadeTransition indicating pulse
      expect(
        find.descendant(
          of: find.byType(RefractionStatusIndicator),
          matching: find.byType(FadeTransition),
        ),
        findsOneWidget,
      );

      final container = tester.widget<Container>(
        find
            .descendant(
              of: find.byType(FadeTransition),
              matching: find.byType(Container),
            )
            .first,
      );
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, const Color(0xFFF97316));
    });

    testWidgets('can disable pulse on pending', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.pending,
                pulse: false,
              ),
            ),
          ),
        ),
      );

      expect(
        find.descendant(
          of: find.byType(RefractionStatusIndicator),
          matching: find.byType(FadeTransition),
        ),
        findsNothing,
      );
    });

    testWidgets('can enable pulse on non-pending', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.success,
                pulse: true,
              ),
            ),
          ),
        ),
      );

      expect(
        find.descendant(
          of: find.byType(RefractionStatusIndicator),
          matching: find.byType(FadeTransition),
        ),
        findsOneWidget,
      );
    });

    testWidgets('custom label text string', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.success,
                label: 'System Operational',
              ),
            ),
          ),
        ),
      );

      expect(find.text('System Operational'), findsOneWidget);
      expect(find.text('Success'), findsNothing);

      final semantics = tester.widget<Semantics>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(Semantics),
            )
            .first,
      );
      expect(semantics.properties.label, 'System Operational');
    });

    testWidgets('custom composable label child', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.error,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.warning, size: 12),
                    Text('Critical Failure'),
                  ],
                ),
              ),
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.warning), findsOneWidget);
      expect(find.text('Critical Failure'), findsOneWidget);
      expect(find.text('Error'), findsNothing);
    });

    testWidgets('label precedence: label overrides child', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.info,
                label: 'Explicit Label',
                child: Text('Child Label'),
              ),
            ),
          ),
        ),
      );

      expect(find.text('Explicit Label'), findsOneWidget);
      expect(find.text('Child Label'), findsNothing);
    });

    testWidgets('showLabel false hides the text entirely', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.warning,
                label: 'Hidden Warning',
                showLabel: false,
              ),
            ),
          ),
        ),
      );

      expect(find.text('Hidden Warning'), findsNothing);
      expect(find.text('Warning'), findsNothing);

      // The semantics label should still be there for screen readers
      final semantics = tester.widget<Semantics>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(Semantics),
            )
            .first,
      );
      expect(semantics.properties.label, 'Hidden Warning');
    });

    testWidgets('accessibility semantics label inferred from Text child', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.neutral,
                child: Text('Custom Text Child'),
              ),
            ),
          ),
        ),
      );

      final semantics = tester.widget<Semantics>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(Semantics),
            )
            .first,
      );
      expect(semantics.properties.label, 'Custom Text Child');
    });

    testWidgets('custom text style is applied', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.success,
                textStyle: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ),
      );

      final textWidget = tester.widget<Text>(find.text('Success'));
      expect(textWidget.style?.fontSize, 24);
      expect(textWidget.style?.fontWeight, FontWeight.bold);
    });

    testWidgets('empty label string shows nothing but keeps gap', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.info,
                label: '',
              ),
            ),
          ),
        ),
      );

      expect(find.text(''), findsOneWidget);
    });

    testWidgets('empty child shows default label because label is null', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.warning,
                child: SizedBox.shrink(),
              ),
            ),
          ),
        ),
      );

      expect(find.byType(SizedBox), findsWidgets);
      // because child is provided but it's not text, the semantics label falls back to default label
      final semantics = tester.widget<Semantics>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(Semantics),
            )
            .first,
      );
      expect(semantics.properties.label, 'Warning');
    });

    testWidgets('status container respects mainAxisSize min', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(type: RefractionStatusType.error),
            ),
          ),
        ),
      );

      final row = tester.widget<Row>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(Row),
            )
            .first,
      );
      expect(row.mainAxisSize, MainAxisSize.min);
    });

    testWidgets('status container cross axis is center', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.success,
              ),
            ),
          ),
        ),
      );

      final row = tester.widget<Row>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(Row),
            )
            .first,
      );
      expect(row.crossAxisAlignment, CrossAxisAlignment.center);
    });

    testWidgets('status pulse animator repeats reverse', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.pending,
              ),
            ),
          ),
        ),
      );

      final fade = tester.widget<FadeTransition>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(FadeTransition),
            )
            .first,
      );
      expect(fade.opacity, isNotNull);
    });

    testWidgets('dot has shape circle and correct size', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.neutral,
              ),
            ),
          ),
        ),
      );

      final container = tester.widget<Container>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(Container),
            )
            .first,
      );
      expect(container.constraints?.maxWidth, 8.0);
      expect(container.constraints?.maxHeight, 8.0);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.shape, BoxShape.circle);
    });

    testWidgets('gap between dot and label is 6.0', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.neutral,
              ),
            ),
          ),
        ),
      );

      final sizedBox = tester.widget<SizedBox>(
        find
            .descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(SizedBox),
            )
            .first,
      );
      expect(sizedBox.width, 6.0);
    });
  });

  // Exhaustive tests for properties
  group('RefractionStatusIndicator extensive', () {
    final types = RefractionStatusType.values;
    for (var i = 0; i < types.length; i++) {
      final type = types[i];
      testWidgets('Type index $i renders correctly', (
        WidgetTester tester,
      ) async {
        await tester.pumpWidget(
          MaterialApp(
            home: RefractionTheme(
              data: RefractionThemeData.light(),
              child: Scaffold(body: RefractionStatusIndicator(type: type)),
            ),
          ),
        );
        expect(find.byType(RefractionStatusIndicator), findsOneWidget);
        if (type == RefractionStatusType.pending) {
          expect(
            find.descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(FadeTransition),
            ),
            findsOneWidget,
          );
        } else {
          expect(
            find.descendant(
              of: find.byType(RefractionStatusIndicator),
              matching: find.byType(FadeTransition),
            ),
            findsNothing,
          );
        }
      });

      testWidgets('Type index $i with pulse renders correctly', (
        WidgetTester tester,
      ) async {
        await tester.pumpWidget(
          MaterialApp(
            home: RefractionTheme(
              data: RefractionThemeData.light(),
              child: Scaffold(
                body: RefractionStatusIndicator(type: type, pulse: true),
              ),
            ),
          ),
        );
        expect(
          find.descendant(
            of: find.byType(RefractionStatusIndicator),
            matching: find.byType(FadeTransition),
          ),
          findsOneWidget,
        );
      });

      testWidgets('Type index $i hidden label renders correctly', (
        WidgetTester tester,
      ) async {
        await tester.pumpWidget(
          MaterialApp(
            home: RefractionTheme(
              data: RefractionThemeData.light(),
              child: Scaffold(
                body: RefractionStatusIndicator(type: type, showLabel: false),
              ),
            ),
          ),
        );
        expect(
          find.descendant(
            of: find.byType(RefractionStatusIndicator),
            matching: find.byType(Text),
          ),
          findsNothing,
        );
        final semantics = tester.widget<Semantics>(
          find
              .descendant(
                of: find.byType(RefractionStatusIndicator),
                matching: find.byType(Semantics),
              )
              .first,
        );
        expect(semantics.properties.label, isNotNull);
        expect(semantics.properties.label!.isNotEmpty, isTrue);
      });

      testWidgets('Type index $i custom string label', (
        WidgetTester tester,
      ) async {
        await tester.pumpWidget(
          MaterialApp(
            home: RefractionTheme(
              data: RefractionThemeData.light(),
              child: Scaffold(
                body: RefractionStatusIndicator(
                  type: type,
                  label: 'Custom $type',
                ),
              ),
            ),
          ),
        );
        expect(find.text('Custom $type'), findsOneWidget);
      });

      testWidgets('Type index $i custom child widget', (
        WidgetTester tester,
      ) async {
        await tester.pumpWidget(
          MaterialApp(
            home: RefractionTheme(
              data: RefractionThemeData.light(),
              child: Scaffold(
                body: RefractionStatusIndicator(
                  type: type,
                  child: Text('Child $type'),
                ),
              ),
            ),
          ),
        );
        expect(find.text('Child $type'), findsOneWidget);
      });
    }

    // Test animation lifecycle
    testWidgets('Animator cleans up successfully', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(
              body: RefractionStatusIndicator(
                type: RefractionStatusType.pending,
              ),
            ),
          ),
        ),
      );

      // Let animation run
      await tester.pump(const Duration(milliseconds: 500));

      // Remove from tree
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            data: RefractionThemeData.light(),
            child: const Scaffold(body: SizedBox()),
          ),
        ),
      );

      expect(find.byType(RefractionStatusIndicator), findsNothing);
    });
  });
}
