import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestWidget(Widget child) {
    return MaterialApp(
      home: Scaffold(
        body: RefractionTheme(data: RefractionThemeData.light(), child: child),
      ),
    );
  }

  group('RefractionPagination Exhaustive Tests', () {
    // Basic rendering tests
    testWidgets(
      'renders simple pagination without ellipsis when totalPages is small',
      (WidgetTester tester) async {
        await tester.pumpWidget(
          buildTestWidget(
            RefractionPagination(
              totalPages: 5,
              currentPage: 3,
              onPageChanged: (_) {},
            ),
          ),
        );

        expect(find.text('1'), findsOneWidget);
        expect(find.text('2'), findsOneWidget);
        expect(find.text('3'), findsOneWidget);
        expect(find.text('4'), findsOneWidget);
        expect(find.text('5'), findsOneWidget);
        expect(find.byIcon(Icons.more_horiz), findsNothing);
        expect(find.text('Previous'), findsOneWidget);
        expect(find.text('Next'), findsOneWidget);
      },
    );

    testWidgets('renders ellipsis at end when current page is near start', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionPagination(
            totalPages: 10,
            currentPage: 1,
            onPageChanged: (_) {},
          ),
        ),
      );

      expect(find.text('1'), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
      expect(find.text('3'), findsOneWidget);
      expect(find.byIcon(Icons.more_horiz), findsOneWidget);
      expect(find.text('10'), findsOneWidget);
    });

    testWidgets('renders ellipsis at start when current page is near end', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionPagination(
            totalPages: 10,
            currentPage: 10,
            onPageChanged: (_) {},
          ),
        ),
      );

      expect(find.text('1'), findsOneWidget);
      expect(find.byIcon(Icons.more_horiz), findsOneWidget);
      expect(find.text('8'), findsOneWidget);
      expect(find.text('9'), findsOneWidget);
      expect(find.text('10'), findsOneWidget);
    });

    testWidgets('renders two ellipses when current page is in the middle', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionPagination(
            totalPages: 20,
            currentPage: 10,
            onPageChanged: (_) {},
          ),
        ),
      );

      expect(find.text('1'), findsOneWidget);
      expect(find.byIcon(Icons.more_horiz), findsNWidgets(2));
      expect(find.text('9'), findsOneWidget);
      expect(find.text('10'), findsOneWidget);
      expect(find.text('11'), findsOneWidget);
      expect(find.text('20'), findsOneWidget);
    });

    testWidgets('respects boundaryCount', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionPagination(
            totalPages: 20,
            currentPage: 10,
            boundaryCount: 2,
            onPageChanged: (_) {},
          ),
        ),
      );

      expect(find.text('1'), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
      expect(find.byIcon(Icons.more_horiz), findsNWidgets(2));
      expect(find.text('19'), findsOneWidget);
      expect(find.text('20'), findsOneWidget);
    });

    testWidgets('respects siblingCount', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionPagination(
            totalPages: 20,
            currentPage: 10,
            siblingCount: 2,
            onPageChanged: (_) {},
          ),
        ),
      );

      expect(find.text('8'), findsOneWidget);
      expect(find.text('9'), findsOneWidget);
      expect(find.text('10'), findsOneWidget);
      expect(find.text('11'), findsOneWidget);
      expect(find.text('12'), findsOneWidget);
    });

    // Interaction Tests
    testWidgets('triggers onPageChanged when a page number is tapped', (
      WidgetTester tester,
    ) async {
      int? tappedPage;
      await tester.pumpWidget(
        buildTestWidget(
          RefractionPagination(
            totalPages: 5,
            currentPage: 1,
            onPageChanged: (page) => tappedPage = page,
          ),
        ),
      );

      await tester.tap(find.text('3'));
      expect(tappedPage, 3);
    });

    testWidgets(
      'triggers onPageChanged on Next button tap if not on last page',
      (WidgetTester tester) async {
        int? tappedPage;
        await tester.pumpWidget(
          buildTestWidget(
            RefractionPagination(
              totalPages: 5,
              currentPage: 2,
              onPageChanged: (page) => tappedPage = page,
            ),
          ),
        );

        await tester.tap(find.text('Next'));
        expect(tappedPage, 3);
      },
    );

    testWidgets(
      'does not trigger onPageChanged on Next button tap if on last page',
      (WidgetTester tester) async {
        int? tappedPage;
        await tester.pumpWidget(
          buildTestWidget(
            RefractionPagination(
              totalPages: 5,
              currentPage: 5,
              onPageChanged: (page) => tappedPage = page,
            ),
          ),
        );

        await tester.tap(find.text('Next'));
        expect(tappedPage, isNull);
      },
    );

    testWidgets(
      'triggers onPageChanged on Previous button tap if not on first page',
      (WidgetTester tester) async {
        int? tappedPage;
        await tester.pumpWidget(
          buildTestWidget(
            RefractionPagination(
              totalPages: 5,
              currentPage: 3,
              onPageChanged: (page) => tappedPage = page,
            ),
          ),
        );

        await tester.tap(find.text('Previous'));
        expect(tappedPage, 2);
      },
    );

    testWidgets(
      'does not trigger onPageChanged on Previous button tap if on first page',
      (WidgetTester tester) async {
        int? tappedPage;
        await tester.pumpWidget(
          buildTestWidget(
            RefractionPagination(
              totalPages: 5,
              currentPage: 1,
              onPageChanged: (page) => tappedPage = page,
            ),
          ),
        );

        await tester.tap(find.text('Previous'));
        expect(tappedPage, isNull);
      },
    );

    // Customization Tests
    testWidgets('hides Previous/Next controls when showControls is false', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionPagination(
            totalPages: 5,
            currentPage: 3,
            showControls: false,
            onPageChanged: (_) {},
          ),
        ),
      );

      expect(find.text('Previous'), findsNothing);
      expect(find.text('Next'), findsNothing);
      expect(find.byIcon(Icons.chevron_left), findsNothing);
      expect(find.byIcon(Icons.chevron_right), findsNothing);
    });

    testWidgets('custom labels for controls', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionPagination(
            totalPages: 5,
            currentPage: 3,
            previousLabel: 'Back',
            nextLabel: 'Forward',
            onPageChanged: (_) {},
          ),
        ),
      );

      expect(find.text('Back'), findsOneWidget);
      expect(find.text('Forward'), findsOneWidget);
    });

    testWidgets('null labels for controls show only icons', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionPagination(
            totalPages: 5,
            currentPage: 3,
            previousLabel: null,
            nextLabel: null,
            onPageChanged: (_) {},
          ),
        ),
      );

      expect(find.text('Previous'), findsNothing);
      expect(find.text('Next'), findsNothing);
      expect(find.byIcon(Icons.chevron_left), findsOneWidget);
      expect(find.byIcon(Icons.chevron_right), findsOneWidget);
    });

    testWidgets('active page button uses outline variant', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionPagination(
            totalPages: 5,
            currentPage: 3,
            onPageChanged: (_) {},
          ),
        ),
      );

      final activeFinder = find.ancestor(
        of: find.text('3'),
        matching: find.byType(RefractionButton),
      );
      final RefractionButton activeButton = tester.widget(activeFinder);
      expect(activeButton.variant, RefractionButtonVariant.outline);

      final inactiveFinder = find.ancestor(
        of: find.text('2'),
        matching: find.byType(RefractionButton),
      );
      final RefractionButton inactiveButton = tester.widget(inactiveFinder);
      expect(inactiveButton.variant, RefractionButtonVariant.ghost);
    });

    testWidgets('totalPages = 0 returns SizedBox.shrink()', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          RefractionPagination(
            totalPages: 0,
            currentPage: 1,
            onPageChanged: (_) {},
          ),
        ),
      );

      expect(find.byType(Wrap), findsNothing);
      expect(find.byType(SizedBox), findsWidgets);
    });

    // Loop to generate 36 test cases for exact boundary coverage
    for (int totalPages = 1; totalPages <= 8; totalPages++) {
      for (int current = 1; current <= totalPages; current++) {
        testWidgets(
          'exhaustive render check: total $totalPages, current $current',
          (WidgetTester tester) async {
            await tester.pumpWidget(
              buildTestWidget(
                RefractionPagination(
                  totalPages: totalPages,
                  currentPage: current,
                  onPageChanged: (_) {},
                ),
              ),
            );

            // Base logic mirror to expect items
            final totalVisible =
                1 * 2 + 3 + 1 * 2; // boundary(1)*2 + 3 + sibling(1)*2 = 7
            if (totalPages <= totalVisible) {
              for (int i = 1; i <= totalPages; i++) {
                expect(find.text('$i'), findsOneWidget);
              }
              expect(find.byIcon(Icons.more_horiz), findsNothing);
            } else {
              // Because totalPages is max 8 in this loop, it only ever has one ellipsis
              // If totalPages is 8
              expect(find.byIcon(Icons.more_horiz), findsOneWidget);
            }
          },
        );
      }
    }

    // Test large jump interactions
    testWidgets('pagination updates gracefully across large steps', (
      WidgetTester tester,
    ) async {
      int currentPage = 1;
      await tester.pumpWidget(
        StatefulBuilder(
          builder: (context, setState) {
            return buildTestWidget(
              RefractionPagination(
                totalPages: 100,
                currentPage: currentPage,
                onPageChanged: (p) => setState(() => currentPage = p),
              ),
            );
          },
        ),
      );

      expect(find.text('1'), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
      expect(find.text('3'), findsOneWidget);
      expect(find.text('100'), findsOneWidget);

      await tester.tap(find.text('3'));
      await tester.pumpAndSettle();

      expect(currentPage, 3);
      expect(find.text('1'), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
      expect(find.text('3'), findsOneWidget);
      expect(find.text('4'), findsOneWidget);

      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(currentPage, 4);
      expect(find.text('1'), findsOneWidget);
      expect(find.text('3'), findsOneWidget);
      expect(find.text('4'), findsOneWidget);
      expect(find.text('5'), findsOneWidget);
    });
  });
}
