import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

/// A filled status paints its color; a hollow one paints it as the ring.
Color? dotColorOf(BoxDecoration decoration, RefractionPresenceStatus status) {
  if (RefractionPresenceIndicator.isHollow(status)) {
    return (decoration.border! as Border).top.color;
  }
  return decoration.color;
}

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
          dotColorOf(decoration, status),
          RefractionPresenceIndicator.colorFor(
            status,
            RefractionThemeData.minimalLight().colors,
          ),
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

        expect(dotColorOf(decoration, status), customColor);
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

  group('RefractionPresenceIndicator - tokens and shape cues', () {
    testWidgets('colors come from the theme status tokens', (tester) async {
      final colors = RefractionThemeData.minimalLight().colors;
      expect(
        RefractionPresenceIndicator.colorFor(
          RefractionPresenceStatus.online,
          colors,
        ),
        colors.positive,
      );
      expect(
        RefractionPresenceIndicator.colorFor(
          RefractionPresenceStatus.away,
          colors,
        ),
        colors.caution,
      );
      expect(
        RefractionPresenceIndicator.colorFor(
          RefractionPresenceStatus.dnd,
          colors,
        ),
        colors.destructive,
      );
      expect(
        RefractionPresenceIndicator.colorFor(
          RefractionPresenceStatus.offline,
          colors,
        ),
        colors.neutral,
      );
    });

    testWidgets('away and offline are hollow, not just a different hue', (
      tester,
    ) async {
      expect(
        RefractionPresenceIndicator.isHollow(RefractionPresenceStatus.away),
        isTrue,
      );
      expect(
        RefractionPresenceIndicator.isHollow(RefractionPresenceStatus.offline),
        isTrue,
      );
      expect(
        RefractionPresenceIndicator.isHollow(RefractionPresenceStatus.online),
        isFalse,
      );
    });

    testWidgets('dnd draws a bar through the dot; busy does not', (
      tester,
    ) async {
      Finder bar() => find.descendant(
        of: find.byType(RefractionPresenceIndicator),
        matching: find.byType(FractionallySizedBox),
      );
      await tester.pumpWidget(
        buildTestApp(
          const RefractionPresenceIndicator(
            status: RefractionPresenceStatus.dnd,
          ),
        ),
      );
      expect(bar(), findsOneWidget);
      await tester.pumpWidget(
        buildTestApp(
          const RefractionPresenceIndicator(
            status: RefractionPresenceStatus.busy,
          ),
        ),
      );
      expect(bar(), findsNothing);
    });

    testWidgets('diameter overrides size and ringColor rings the dot', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionPresenceIndicator(
            status: RefractionPresenceStatus.online,
            diameter: 14,
            ringColor: Colors.white,
          ),
        ),
      );
      final dot = tester.widget<Container>(
        find.descendant(
          of: find.byType(RefractionPresenceIndicator),
          matching: find.byType(Container),
        ),
      );
      expect(dot.constraints?.maxWidth, 14);
      final ring = tester.widget<DecoratedBox>(
        find
            .descendant(
              of: find.byType(RefractionPresenceIndicator),
              matching: find.byType(DecoratedBox),
            )
            .first,
      );
      final border = (ring.decoration as BoxDecoration).border! as Border;
      expect(border.top.color, Colors.white);
    });
  });
}
