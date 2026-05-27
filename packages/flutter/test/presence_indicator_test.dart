import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/presence_indicator.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: Center(child: child)),
      ),
    );
  }

  group('RefractionPresenceIndicator - Basic Rendering', () {
    for (final status in RefractionPresenceStatus.values) {
      testWidgets('renders dot for status $status without label by default', (
        tester,
      ) async {
        await tester.pumpWidget(
          buildTestApp(RefractionPresenceIndicator(status: status)),
        );

        // Find the dot Container
        final containerFinder = find.descendant(
          of: find.byType(RefractionPresenceIndicator),
          matching: find.byType(Container),
        );
        expect(containerFinder, findsOneWidget);

        // Ensure text is not rendered
        expect(
          find.descendant(
            of: find.byType(RefractionPresenceIndicator),
            matching: find.byType(Text),
          ),
          findsNothing,
        );

        // Check the default color
        final container = tester.widget<Container>(containerFinder);
        final decoration = container.decoration as BoxDecoration;
        expect(
          decoration.color,
          RefractionPresenceIndicator.defaultColors[status],
        );
        expect(decoration.shape, BoxShape.circle);
      });

      testWidgets(
        'renders dot and text for status $status when showLabel is true',
        (tester) async {
          await tester.pumpWidget(
            buildTestApp(
              RefractionPresenceIndicator(status: status, showLabel: true),
            ),
          );

          final expectedText =
              RefractionPresenceIndicator.defaultLabels[status]!;
          expect(find.text(expectedText), findsOneWidget);

          final containerFinder = find.descendant(
            of: find.byType(RefractionPresenceIndicator),
            matching: find.byType(Container),
          );
          expect(containerFinder, findsOneWidget);
        },
      );

      testWidgets('Semantics has correct label for status $status', (
        tester,
      ) async {
        await tester.pumpWidget(
          buildTestApp(RefractionPresenceIndicator(status: status)),
        );

        final semanticsFinder = find.descendant(
          of: find.byType(RefractionPresenceIndicator),
          matching: find.byType(Semantics),
        );
        expect(semanticsFinder, findsOneWidget);

        final semantics = tester.widget<Semantics>(semanticsFinder);
        expect(
          semantics.properties.label,
          RefractionPresenceIndicator.defaultLabels[status],
        );
      });
    }
  });

  group('RefractionPresenceIndicator - Sizes', () {
    final sizeCases = [
      {'size': RefractionPresenceSize.sm, 'expected': 8.0},
      {'size': RefractionPresenceSize.md, 'expected': 10.0},
      {'size': RefractionPresenceSize.lg, 'expected': 12.0},
    ];

    for (final testCase in sizeCases) {
      final sizeEnum = testCase['size'] as RefractionPresenceSize;
      final expectedDim = testCase['expected'] as double;

      for (final status in RefractionPresenceStatus.values) {
        testWidgets(
          'renders correct dimensions for size $sizeEnum and status $status',
          (tester) async {
            await tester.pumpWidget(
              buildTestApp(
                RefractionPresenceIndicator(status: status, size: sizeEnum),
              ),
            );

            final containerFinder = find.descendant(
              of: find.byType(RefractionPresenceIndicator),
              matching: find.byType(Container),
            );
            final container = tester.widget<Container>(containerFinder);

            // Use a tolerance or exact match
            expect(container.constraints?.minWidth, expectedDim);
            expect(container.constraints?.minHeight, expectedDim);
            expect(container.constraints?.maxWidth, expectedDim);
            expect(container.constraints?.maxHeight, expectedDim);
          },
        );
      }
    }
  });

  group('RefractionPresenceIndicator - Custom Overrides', () {
    for (final status in RefractionPresenceStatus.values) {
      testWidgets('respects custom color for status $status', (tester) async {
        const customColor = Colors.purple;
        await tester.pumpWidget(
          buildTestApp(
            RefractionPresenceIndicator(
              status: status,
              customColor: customColor,
            ),
          ),
        );

        final containerFinder = find.descendant(
          of: find.byType(RefractionPresenceIndicator),
          matching: find.byType(Container),
        );
        final container = tester.widget<Container>(containerFinder);
        final decoration = container.decoration as BoxDecoration;

        expect(decoration.color, customColor);
      });

      testWidgets('respects custom label for status $status', (tester) async {
        const customLabel = 'On Vacation';
        await tester.pumpWidget(
          buildTestApp(
            RefractionPresenceIndicator(
              status: status,
              showLabel: true,
              label: customLabel,
            ),
          ),
        );

        expect(find.text(customLabel), findsOneWidget);
        // Default label should not be found unless it coincidentally matches
        if (customLabel != RefractionPresenceIndicator.defaultLabels[status]) {
          expect(
            find.text(RefractionPresenceIndicator.defaultLabels[status]!),
            findsNothing,
          );
        }
      });

      testWidgets('Semantics uses custom label for status $status', (
        tester,
      ) async {
        const customLabel = 'Sleeping';
        await tester.pumpWidget(
          buildTestApp(
            RefractionPresenceIndicator(status: status, label: customLabel),
          ),
        );

        final semanticsFinder = find.descendant(
          of: find.byType(RefractionPresenceIndicator),
          matching: find.byType(Semantics),
        );
        final semantics = tester.widget<Semantics>(semanticsFinder);
        expect(semantics.properties.label, customLabel);
      });
    }
  });

  group('RefractionPresenceIndicator - Label Styling', () {
    for (final status in RefractionPresenceStatus.values) {
      testWidgets(
        'label text style uses theme mutedForeground and size 14 for status $status',
        (tester) async {
          await tester.pumpWidget(
            buildTestApp(
              RefractionPresenceIndicator(status: status, showLabel: true),
            ),
          );

          final textFinder = find.descendant(
            of: find.byType(RefractionPresenceIndicator),
            matching: find.byType(Text),
          );
          final text = tester.widget<Text>(textFinder);

          // default minimalLight mutedForeground is used
          expect(
            text.style?.color,
            RefractionThemeData.minimalLight().colors.mutedForeground,
          );
          expect(text.style?.fontSize, 14.0);
        },
      );
    }
  });

  group('RefractionPresenceIndicator - Layout Validation', () {
    testWidgets('Uses Row when showLabel is true', (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionPresenceIndicator(
            status: RefractionPresenceStatus.online,
            showLabel: true,
          ),
        ),
      );

      expect(
        find.descendant(
          of: find.byType(RefractionPresenceIndicator),
          matching: find.byType(Row),
        ),
        findsOneWidget,
      );
    });

    testWidgets('Row uses minAxisSize min', (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionPresenceIndicator(
            status: RefractionPresenceStatus.online,
            showLabel: true,
          ),
        ),
      );

      final row = tester.widget<Row>(
        find.descendant(
          of: find.byType(RefractionPresenceIndicator),
          matching: find.byType(Row),
        ),
      );
      expect(row.mainAxisSize, MainAxisSize.min);
    });

    testWidgets('Contains gap widget of 6.0 width between dot and text', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionPresenceIndicator(
            status: RefractionPresenceStatus.online,
            showLabel: true,
          ),
        ),
      );

      final sizedBoxFinder = find.descendant(
        of: find.byType(RefractionPresenceIndicator),
        matching: find.byType(SizedBox),
      );
      bool hasGap = false;
      for (final element in sizedBoxFinder.evaluate()) {
        final box = element.widget as SizedBox;
        if (box.width == 6.0) {
          hasGap = true;
          break;
        }
      }
      expect(hasGap, isTrue);
    });
  });
}
