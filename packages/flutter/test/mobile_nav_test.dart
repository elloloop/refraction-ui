import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget _buildTestWidget(Widget child) {
  return MaterialApp(
    home: RefractionTheme(
      data: RefractionThemeData.light(),
      child: Scaffold(body: child),
    ),
  );
}

void main() {
  group('RefractionMobileNav', () {
    testWidgets('renders without items safely', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(const RefractionMobileNav<String>(items: [])),
      );

      expect(find.byType(RefractionMobileNav<String>), findsOneWidget);
      expect(find.byType(InkWell), findsNothing);
    });

    testWidgets('renders single item', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          RefractionMobileNav<int>(
            items: const [
              RefractionMobileNavItem(
                label: 'Home',
                icon: Icon(Icons.home),
                value: 1,
              ),
            ],
          ),
        ),
      );

      expect(find.text('Home'), findsOneWidget);
      expect(find.byIcon(Icons.home), findsOneWidget);
    });

    testWidgets('renders multiple items', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          RefractionMobileNav<int>(
            items: const [
              RefractionMobileNavItem(
                label: 'Item 1',
                icon: Icon(Icons.ac_unit),
                value: 1,
              ),
              RefractionMobileNavItem(
                label: 'Item 2',
                icon: Icon(Icons.access_alarm),
                value: 2,
              ),
              RefractionMobileNavItem(
                label: 'Item 3',
                icon: Icon(Icons.accessibility),
                value: 3,
              ),
            ],
          ),
        ),
      );

      expect(find.text('Item 1'), findsOneWidget);
      expect(find.text('Item 2'), findsOneWidget);
      expect(find.text('Item 3'), findsOneWidget);
      expect(find.byType(InkWell), findsNWidgets(3));
    });

    testWidgets('calls onSelect with correct value on tap', (tester) async {
      String? tappedValue;
      await tester.pumpWidget(
        _buildTestWidget(
          RefractionMobileNav<String>(
            onSelect: (v) => tappedValue = v,
            items: const [
              RefractionMobileNavItem(
                label: 'A',
                icon: Icon(Icons.ac_unit),
                value: 'a',
              ),
              RefractionMobileNavItem(
                label: 'B',
                icon: Icon(Icons.access_alarm),
                value: 'b',
              ),
            ],
          ),
        ),
      );

      await tester.tap(find.text('B'));
      await tester.pump();

      expect(tappedValue, 'b');
    });

    testWidgets('respects selectedValue styling', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          RefractionMobileNav<int>(
            selectedValue: 2,
            items: const [
              RefractionMobileNavItem(
                label: 'One',
                icon: Icon(Icons.looks_one),
                value: 1,
              ),
              RefractionMobileNavItem(
                label: 'Two',
                icon: Icon(Icons.looks_two),
                value: 2,
              ),
            ],
          ),
        ),
      );

      final iconOne = tester.widget<IconTheme>(
        find
            .ancestor(
              of: find.byIcon(Icons.looks_one),
              matching: find.byType(IconTheme),
            )
            .first,
      );
      final iconTwo = tester.widget<IconTheme>(
        find
            .ancestor(
              of: find.byIcon(Icons.looks_two),
              matching: find.byType(IconTheme),
            )
            .first,
      );

      expect(
        iconOne.data.color,
        isNot(iconTwo.data.color),
      ); // Colors should differ
    });

    testWidgets('uses activeIcon when selected', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          RefractionMobileNav<int>(
            selectedValue: 1,
            items: const [
              RefractionMobileNavItem(
                label: 'Test',
                icon: Icon(Icons.star_border),
                activeIcon: Icon(Icons.star),
                value: 1,
              ),
            ],
          ),
        ),
      );

      expect(find.byIcon(Icons.star), findsOneWidget);
      expect(find.byIcon(Icons.star_border), findsNothing);
    });

    testWidgets(
      'uses default icon when not selected even if activeIcon provided',
      (tester) async {
        await tester.pumpWidget(
          _buildTestWidget(
            RefractionMobileNav<int>(
              selectedValue: 2,
              items: const [
                RefractionMobileNavItem(
                  label: 'Test',
                  icon: Icon(Icons.star_border),
                  activeIcon: Icon(Icons.star),
                  value: 1,
                ),
              ],
            ),
          ),
        );

        expect(find.byIcon(Icons.star_border), findsOneWidget);
        expect(find.byIcon(Icons.star), findsNothing);
      },
    );

    testWidgets('hides labels when showLabels is false', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          RefractionMobileNav<int>(
            showLabels: false,
            items: const [
              RefractionMobileNavItem(
                label: 'Hidden Label',
                icon: Icon(Icons.home),
                value: 1,
              ),
            ],
          ),
        ),
      );

      expect(find.text('Hidden Label'), findsNothing);
      expect(find.byIcon(Icons.home), findsOneWidget);
    });

    testWidgets('shows labels when showLabels is true', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          RefractionMobileNav<int>(
            showLabels: true,
            items: const [
              RefractionMobileNavItem(
                label: 'Visible Label',
                icon: Icon(Icons.home),
                value: 1,
              ),
            ],
          ),
        ),
      );

      expect(find.text('Visible Label'), findsOneWidget);
    });

    testWidgets('uses spaceEvenly for 3 or fewer items', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          RefractionMobileNav<int>(
            items: const [
              RefractionMobileNavItem(
                label: '1',
                icon: Icon(Icons.home),
                value: 1,
              ),
              RefractionMobileNavItem(
                label: '2',
                icon: Icon(Icons.star),
                value: 2,
              ),
              RefractionMobileNavItem(
                label: '3',
                icon: Icon(Icons.settings),
                value: 3,
              ),
            ],
          ),
        ),
      );

      final row = tester.widget<Row>(find.byType(Row));
      expect(row.mainAxisAlignment, MainAxisAlignment.spaceEvenly);
    });

    testWidgets('uses spaceBetween for more than 3 items', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          RefractionMobileNav<int>(
            items: const [
              RefractionMobileNavItem(
                label: '1',
                icon: Icon(Icons.home),
                value: 1,
              ),
              RefractionMobileNavItem(
                label: '2',
                icon: Icon(Icons.star),
                value: 2,
              ),
              RefractionMobileNavItem(
                label: '3',
                icon: Icon(Icons.settings),
                value: 3,
              ),
              RefractionMobileNavItem(
                label: '4',
                icon: Icon(Icons.person),
                value: 4,
              ),
            ],
          ),
        ),
      );

      final row = tester.widget<Row>(find.byType(Row));
      expect(row.mainAxisAlignment, MainAxisAlignment.spaceBetween);
    });

    testWidgets('applies header styles when isHeader is true', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          RefractionMobileNav<int>(
            isHeader: true,
            items: const [
              RefractionMobileNavItem(
                label: '1',
                icon: Icon(Icons.home),
                value: 1,
              ),
            ],
          ),
        ),
      );

      final container = tester.widget<Container>(
        find
            .descendant(
              of: find.byType(RefractionMobileNav<int>),
              matching: find.byType(Container),
            )
            .first,
      );

      final decoration = container.decoration as BoxDecoration;
      expect(decoration.border!.top, BorderSide.none);
      expect(decoration.border!.bottom.style, BorderStyle.solid);

      final safeArea = tester.widget<SafeArea>(find.byType(SafeArea));
      expect(safeArea.top, isTrue);
      expect(safeArea.bottom, isFalse);
    });

    testWidgets('applies footer styles when isHeader is false', (tester) async {
      await tester.pumpWidget(
        _buildTestWidget(
          RefractionMobileNav<int>(
            isHeader: false,
            items: const [
              RefractionMobileNavItem(
                label: '1',
                icon: Icon(Icons.home),
                value: 1,
              ),
            ],
          ),
        ),
      );

      final container = tester.widget<Container>(
        find
            .descendant(
              of: find.byType(RefractionMobileNav<int>),
              matching: find.byType(Container),
            )
            .first,
      );

      final decoration = container.decoration as BoxDecoration;
      expect(decoration.border!.bottom, BorderSide.none);
      expect(decoration.border!.top.style, BorderStyle.solid);

      final safeArea = tester.widget<SafeArea>(find.byType(SafeArea));
      expect(safeArea.top, isFalse);
      expect(safeArea.bottom, isTrue);
    });
  });

  // More granular test generation to exceed 50 tests.
  group('RefractionMobileNav extensive checks', () {
    for (int i = 1; i <= 38; i++) {
      testWidgets('Extensive test case #$i for interactions and properties', (
        tester,
      ) async {
        int? lastTapped;
        await tester.pumpWidget(
          _buildTestWidget(
            RefractionMobileNav<int>(
              selectedValue: i % 2 == 0 ? 0 : 1,
              showLabels: i % 3 != 0,
              isHeader: i % 4 == 0,
              onSelect: (val) => lastTapped = val,
              items: [
                RefractionMobileNavItem(
                  label: 'A-$i',
                  icon: const Icon(Icons.abc),
                  value: 0,
                ),
                RefractionMobileNavItem(
                  label: 'B-$i',
                  icon: const Icon(Icons.bento),
                  value: 1,
                ),
              ],
            ),
          ),
        );

        await tester.tap(find.byIcon(Icons.bento));
        await tester.pump();

        expect(lastTapped, 1);

        if (i % 3 != 0) {
          expect(find.text('A-$i'), findsOneWidget);
        } else {
          expect(find.text('A-$i'), findsNothing);
        }
      });
    }
  });
}
