import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('RefractionCardGrid', () {
    testWidgets('renders successfully with zero children', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(body: RefractionCardGrid(children: const [])),
        ),
      );
      expect(find.byType(RefractionCardGrid), findsOneWidget);
      expect(find.byType(GridView), findsOneWidget);
    });

    testWidgets('renders successfully with single child', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: RefractionCardGrid(children: const [Text('Child 1')]),
          ),
        ),
      );
      expect(find.text('Child 1'), findsOneWidget);
    });

    testWidgets('renders successfully with multiple children', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: RefractionCardGrid(
                children: List.generate(10, (i) => Text('Child $i')),
              ),
            ),
          ),
        ),
      );
      expect(find.text('Child 0'), findsOneWidget);
      expect(find.text('Child 1'), findsOneWidget);
    });

    group('Responsive CrossAxisCount Calculation', () {
      void testCrossAxisCount({
        required double width,
        required double minCardWidth,
        required double spacing,
        required int expectedCount,
      }) {
        testWidgets(
          'width: $width, minCardWidth: $minCardWidth, spacing: $spacing expects $expectedCount columns',
          (tester) async {
            int capturedCrossAxisCount = -1;

            await tester.pumpWidget(
              MaterialApp(
                home: Scaffold(
                  body: Center(
                    child: OverflowBox(
                      maxWidth: width,
                      minWidth: width,
                      maxHeight: 1000,
                      minHeight: 1000,
                      child: RefractionCardGrid(
                        minCardWidth: minCardWidth,
                        crossAxisSpacing: spacing,
                        children: [
                          Builder(
                            builder: (context) {
                              final grid = context
                                  .findAncestorWidgetOfExactType<GridView>()!;
                              final delegate =
                                  grid.gridDelegate
                                      as SliverGridDelegateWithFixedCrossAxisCount;
                              capturedCrossAxisCount = delegate.crossAxisCount;
                              return const SizedBox();
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            );

            expect(capturedCrossAxisCount, expectedCount);
          },
        );
      }

      // Default spacing is 16. Default minCardWidth is 250.
      testCrossAxisCount(
        width: 400,
        minCardWidth: 250,
        spacing: 16,
        expectedCount: 1,
      );
      testCrossAxisCount(
        width: 600,
        minCardWidth: 250,
        spacing: 16,
        expectedCount: 2,
      );
      testCrossAxisCount(
        width: 800,
        minCardWidth: 250,
        spacing: 16,
        expectedCount: 3,
      );
      testCrossAxisCount(
        width: 1200,
        minCardWidth: 250,
        spacing: 16,
        expectedCount: 4,
      );

      // Testing with different minCardWidth
      testCrossAxisCount(
        width: 600,
        minCardWidth: 100,
        spacing: 10,
        expectedCount: 5,
      );
      testCrossAxisCount(
        width: 600,
        minCardWidth: 100,
        spacing: 0,
        expectedCount: 6,
      );
      testCrossAxisCount(
        width: 600,
        minCardWidth: 600,
        spacing: 10,
        expectedCount: 1,
      );
      testCrossAxisCount(
        width: 600,
        minCardWidth: 800,
        spacing: 10,
        expectedCount: 1,
      );

      // More tests for rigorous calculation
      for (int i = 1; i <= 20; i++) {
        double w = i * 150.0;
        int expected = ((w + 16.0) / (250.0 + 16.0)).floor();
        if (expected < 1) expected = 1;
        testCrossAxisCount(
          width: w,
          minCardWidth: 250,
          spacing: 16,
          expectedCount: expected,
        );
      }
    });

    group('GridView Delegation Properties', () {
      void testDelegation({
        double? mainAxisSpacing,
        double? crossAxisSpacing,
        double? childAspectRatio,
        bool? shrinkWrap,
        ScrollPhysics? physics,
      }) {
        testWidgets(
          'passes properties correctly $mainAxisSpacing $crossAxisSpacing $childAspectRatio $shrinkWrap $physics',
          (tester) async {
            await tester.pumpWidget(
              MaterialApp(
                home: Scaffold(
                  body: RefractionCardGrid(
                    mainAxisSpacing: mainAxisSpacing ?? 16.0,
                    crossAxisSpacing: crossAxisSpacing ?? 16.0,
                    childAspectRatio: childAspectRatio ?? 1.0,
                    shrinkWrap: shrinkWrap ?? true,
                    physics: physics ?? const NeverScrollableScrollPhysics(),
                    children: const [Text('Child')],
                  ),
                ),
              ),
            );

            final gridView = tester.widget<GridView>(find.byType(GridView));
            expect(gridView.shrinkWrap, shrinkWrap ?? true);
            expect(
              gridView.physics,
              physics ?? const NeverScrollableScrollPhysics(),
            );

            final delegate =
                gridView.gridDelegate
                    as SliverGridDelegateWithFixedCrossAxisCount;
            expect(delegate.mainAxisSpacing, mainAxisSpacing ?? 16.0);
            expect(delegate.crossAxisSpacing, crossAxisSpacing ?? 16.0);
            expect(delegate.childAspectRatio, childAspectRatio ?? 1.0);
          },
        );
      }

      // Test default values
      testDelegation();

      // Test different values (rigorous)
      for (double spacing = 5.0; spacing <= 40.0; spacing += 5.0) {
        testDelegation(mainAxisSpacing: spacing, crossAxisSpacing: spacing);
      }

      for (double ratio = 0.5; ratio <= 2.5; ratio += 0.5) {
        testDelegation(childAspectRatio: ratio);
      }

      testDelegation(shrinkWrap: false);
      testDelegation(shrinkWrap: true);
      testDelegation(physics: const BouncingScrollPhysics());
      testDelegation(physics: const ClampingScrollPhysics());
      testDelegation(physics: const AlwaysScrollableScrollPhysics());
    });
  });
}
