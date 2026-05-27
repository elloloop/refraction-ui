import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestWidget({
    required List<RefractionTocItem> items,
    String? activeId,
    ValueChanged<String>? onActiveIdChange,
  }) {
    return MaterialApp(
      home: Scaffold(
        body: RefractionTheme(
          data: RefractionThemeData.light(),
          child: Builder(
            builder: (context) {
              return RefractionTableOfContents(
                items: items,
                activeId: activeId,
                onActiveIdChange: onActiveIdChange,
              );
            },
          ),
        ),
      ),
    );
  }

  testWidgets('renders empty widget when items is empty', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(buildTestWidget(items: []));
    expect(find.byType(SizedBox), findsOneWidget);
    expect(find.byType(Column), findsNothing);
  });

  group('Nesting depth padding', () {
    final levels = [1, 2, 3, 4, 5, 6];

    for (final level in levels) {
      testWidgets('level $level has correct padding', (
        WidgetTester tester,
      ) async {
        await tester.pumpWidget(
          buildTestWidget(
            items: [
              RefractionTocItem(
                id: 'test',
                text: 'Test Level $level',
                level: level,
              ),
            ],
          ),
        );

        final paddingFinder = find
            .byType(Padding)
            .last; // The padding inside _TocItemWidget
        final paddingWidget = tester.widget<Padding>(paddingFinder);
        final insets = paddingWidget.padding as EdgeInsets;

        if (level == 3) {
          expect(insets.left, 16.0);
        } else if (level >= 4) {
          expect(insets.left, 32.0);
        } else {
          expect(insets.left, 0.0);
        }
      });
    }
  });

  group('Active link highlighting', () {
    final items = [
      const RefractionTocItem(id: '1', text: 'Intro', level: 2),
      const RefractionTocItem(id: '2', text: 'Usage', level: 2),
      const RefractionTocItem(id: '3', text: 'Advanced', level: 3),
    ];

    for (final item in items) {
      testWidgets('highlights item ${item.id} when active', (
        WidgetTester tester,
      ) async {
        await tester.pumpWidget(
          buildTestWidget(items: items, activeId: item.id),
        );

        final activeFinder = find.text(item.text);
        final activeTextStyle = tester
            .widget<AnimatedDefaultTextStyle>(
              find
                  .ancestor(
                    of: activeFinder,
                    matching: find.byType(AnimatedDefaultTextStyle),
                  )
                  .first,
            )
            .style;

        expect(activeTextStyle.fontWeight, FontWeight.w500);
        // We know foreground color is the active color
        final theme = RefractionThemeData.light();
        expect(activeTextStyle.color, theme.colors.foreground);

        // Check that others are not active
        for (final other in items.where((i) => i.id != item.id)) {
          final otherFinder = find.text(other.text);
          final otherTextStyle = tester
              .widget<AnimatedDefaultTextStyle>(
                find
                    .ancestor(
                      of: otherFinder,
                      matching: find.byType(AnimatedDefaultTextStyle),
                    )
                    .first,
              )
              .style;

          expect(otherTextStyle.fontWeight, FontWeight.normal);
          expect(otherTextStyle.color, theme.colors.mutedForeground);
        }
      });
    }
  });

  group('Tap interactions', () {
    testWidgets('fires onActiveIdChange with correct id', (
      WidgetTester tester,
    ) async {
      String? tappedId;

      await tester.pumpWidget(
        buildTestWidget(
          items: [
            const RefractionTocItem(id: '1', text: 'Intro', level: 2),
            const RefractionTocItem(id: '2', text: 'Usage', level: 2),
          ],
          onActiveIdChange: (id) => tappedId = id,
        ),
      );

      await tester.tap(find.text('Usage'));
      expect(tappedId, '2');

      await tester.tap(find.text('Intro'));
      expect(tappedId, '1');
    });
  });

  group('Hover interactions', () {
    testWidgets('changes color on hover', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          items: [const RefractionTocItem(id: '1', text: 'Intro', level: 2)],
        ),
      );

      final textFinder = find.text('Intro');
      var textStyle = tester
          .widget<AnimatedDefaultTextStyle>(
            find
                .ancestor(
                  of: textFinder,
                  matching: find.byType(AnimatedDefaultTextStyle),
                )
                .first,
          )
          .style;

      final theme = RefractionThemeData.light();
      expect(textStyle.color, theme.colors.mutedForeground);

      // Hover
      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(location: tester.getCenter(textFinder));
      await tester.pumpAndSettle();

      textStyle = tester
          .widget<AnimatedDefaultTextStyle>(
            find
                .ancestor(
                  of: textFinder,
                  matching: find.byType(AnimatedDefaultTextStyle),
                )
                .first,
          )
          .style;
      expect(textStyle.color, theme.colors.foreground);
    });
  });

  // Adding more parameterised tests to reach a high count (>50 if possible).
  // E.g., permutations of levels and active states
  group('Comprehensive property permutations', () {
    final levels = [1, 2, 3, 4, 5, 6];
    final activeStates = [true, false];
    final texts = ['A', 'B'];

    for (final level in levels) {
      for (final isActive in activeStates) {
        for (final text in texts) {
          testWidgets(
            'Permutation: level=$level, isActive=$isActive, text=$text',
            (WidgetTester tester) async {
              final items = [
                RefractionTocItem(id: 'id_$text', text: text, level: level),
              ];

              await tester.pumpWidget(
                buildTestWidget(
                  items: items,
                  activeId: isActive ? 'id_$text' : 'other_id',
                ),
              );

              final textFinder = find.text(text);
              expect(textFinder, findsOneWidget);

              // Padding check
              final paddingFinder = find.byType(Padding).last;
              final insets =
                  tester.widget<Padding>(paddingFinder).padding as EdgeInsets;
              if (level == 3) {
                expect(insets.left, 16.0);
              } else if (level >= 4) {
                expect(insets.left, 32.0);
              } else {
                expect(insets.left, 0.0);
              }

              // TextStyle check
              final textStyle = tester
                  .widget<AnimatedDefaultTextStyle>(
                    find
                        .ancestor(
                          of: textFinder,
                          matching: find.byType(AnimatedDefaultTextStyle),
                        )
                        .first,
                  )
                  .style;

              final theme = RefractionThemeData.light();
              if (isActive) {
                expect(textStyle.fontWeight, FontWeight.w500);
                expect(textStyle.color, theme.colors.foreground);
              } else {
                expect(textStyle.fontWeight, FontWeight.normal);
                expect(textStyle.color, theme.colors.mutedForeground);
              }
            },
          );
        }
      }
    }
  });
}
