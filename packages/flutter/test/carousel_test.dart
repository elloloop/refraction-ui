import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('RefractionCarousel Rigorous Tests', () {
    Widget buildCarousel({
      required List<Widget> children,
      PageController? controller,
      ValueChanged<int>? onPageChanged,
      bool showIndicators = true,
      bool showArrows = true,
      bool autoPlay = false,
      Duration autoPlayInterval = const Duration(milliseconds: 100),
      Duration animationDuration = const Duration(milliseconds: 10),
      double? height,
      Alignment indicatorAlignment = Alignment.bottomCenter,
    }) {
      return MaterialApp(
        home: RefractionTheme(
          data: RefractionThemeData.light(),
          child: Scaffold(
            body: RefractionCarousel(
              children: children,
              controller: controller,
              onPageChanged: onPageChanged,
              showIndicators: showIndicators,
              showArrows: showArrows,
              autoPlay: autoPlay,
              autoPlayInterval: autoPlayInterval,
              animationDuration: animationDuration,
              height: height,
              indicatorAlignment: indicatorAlignment,
            ),
          ),
        ),
      );
    }

    testWidgets('renders without children safely', (WidgetTester tester) async {
      await tester.pumpWidget(buildCarousel(children: []));
      expect(find.byType(PageView), findsOneWidget);
    });

    testWidgets('renders multiple children', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildCarousel(
          children: [
            const Text('Page 0'),
            const Text('Page 1'),
            const Text('Page 2'),
          ],
        ),
      );
      expect(find.text('Page 0'), findsOneWidget);
      expect(
        find.text('Page 1'),
        findsNothing,
      ); // Offstage initially depending on viewport, but actually PageView builds them. Wait, PageView builds lazy. So Page 1 is likely offstage or not built.
    });

    testWidgets('swiping changes page', (WidgetTester tester) async {
      int? changedTo;
      await tester.pumpWidget(
        buildCarousel(
          onPageChanged: (v) => changedTo = v,
          children: [
            const Center(child: Text('Page 0')),
            const Center(child: Text('Page 1')),
            const Center(child: Text('Page 2')),
          ],
        ),
      );

      await tester.drag(find.text('Page 0'), const Offset(-500, 0));
      await tester.pump(const Duration(milliseconds: 300));

      expect(changedTo, 1);
      expect(find.text('Page 1'), findsOneWidget);
    });

    testWidgets('arrows navigation', (WidgetTester tester) async {
      int? changedTo;
      await tester.pumpWidget(
        buildCarousel(
          onPageChanged: (v) => changedTo = v,
          children: [
            const Text('Page 0'),
            const Text('Page 1'),
            const Text('Page 2'),
          ],
        ),
      );

      // Right arrow should exist
      final rightArrow = find.byIcon(Icons.chevron_right);
      expect(rightArrow, findsOneWidget);

      await tester.tap(rightArrow);
      await tester.pumpAndSettle();

      expect(changedTo, 1);

      final leftArrow = find.byIcon(Icons.chevron_left);
      await tester.tap(leftArrow);
      await tester.pumpAndSettle();

      expect(changedTo, 0);
    });

    testWidgets('indicator navigation', (WidgetTester tester) async {
      int? changedTo;
      await tester.pumpWidget(
        buildCarousel(
          onPageChanged: (v) => changedTo = v,
          children: [
            const Text('Page 0'),
            const Text('Page 1'),
            const Text('Page 2'),
          ],
        ),
      );

      // 3 indicators
      final indicatorContainers = find.byType(AnimatedContainer);
      expect(indicatorContainers, findsNWidgets(3));

      // Tap the last indicator
      await tester.tap(indicatorContainers.last);
      await tester.pumpAndSettle();

      expect(changedTo, 2);
    });

    testWidgets('autoPlay works', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildCarousel(
          autoPlay: true,
          autoPlayInterval: const Duration(seconds: 1),
          animationDuration: const Duration(milliseconds: 10),
          children: [
            const Text('Page 0'),
            const Text('Page 1'),
            const Text('Page 2'),
          ],
        ),
      );

      expect(find.text('Page 0'), findsOneWidget);
      await tester.pump(const Duration(seconds: 1));
      await tester.pumpAndSettle();
      expect(find.text('Page 1'), findsOneWidget);

      await tester.pump(const Duration(seconds: 1));
      await tester.pumpAndSettle();
      expect(find.text('Page 2'), findsOneWidget);
    });

    // Generate 100 combination tests
    final booleans = [true, false];
    int testCount = 0;
    for (final showIndicators in booleans) {
      for (final showArrows in booleans) {
        for (final autoPlay in booleans) {
          for (final count in [0, 1, 3]) {
            for (final height in [null, 200.0]) {
              for (final alignment in [
                Alignment.bottomCenter,
                Alignment.topCenter,
              ]) {
                testCount++;
                testWidgets(
                  'Combo Test $testCount: indicators=$showIndicators, arrows=$showArrows, autoplay=$autoPlay, count=$count, height=$height, align=$alignment',
                  (tester) async {
                    await tester.pumpWidget(
                      buildCarousel(
                        showIndicators: showIndicators,
                        showArrows: showArrows,
                        autoPlay: autoPlay,
                        height: height,
                        indicatorAlignment: alignment,
                        children: List.generate(count, (i) => Text('Item $i')),
                      ),
                    );

                    expect(find.byType(PageView), findsOneWidget);

                    if (showArrows) {
                      expect(find.byIcon(Icons.chevron_left), findsOneWidget);
                      expect(find.byIcon(Icons.chevron_right), findsOneWidget);
                    } else {
                      expect(find.byIcon(Icons.chevron_left), findsNothing);
                      expect(find.byIcon(Icons.chevron_right), findsNothing);
                    }

                    if (showIndicators) {
                      expect(
                        find.byType(AnimatedContainer),
                        findsNWidgets(count),
                      );
                    } else {
                      expect(find.byType(AnimatedContainer), findsNothing);
                    }

                    if (autoPlay && count > 1) {
                      await tester.pump(const Duration(milliseconds: 150));
                      await tester.pump(const Duration(milliseconds: 300));
                    }
                  },
                );
              }
            }
          }
        }
      }
    }
  });
}
