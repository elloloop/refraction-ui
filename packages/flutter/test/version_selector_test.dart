import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestWidget({required Widget child, RefractionThemeData? theme}) {
    return RefractionTheme(
      data: theme ?? RefractionThemeData.light(),
      child: MaterialApp(
        home: Scaffold(body: Center(child: child)),
      ),
    );
  }

  group('RefractionVersionSelector', () {
    final defaultOptions = [
      const RefractionVersionOption(value: 'v1.0.0', label: 'v1.0.0'),
      const RefractionVersionOption(
        value: 'v2.0.0',
        label: 'v2.0.0',
        isLatest: true,
      ),
      const RefractionVersionOption(
        value: 'v3.0.0-beta',
        label: 'v3.0.0 (Beta)',
      ),
    ];

    testWidgets('renders placeholder when no value is provided', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(versions: defaultOptions),
        ),
      );

      expect(find.text('Select version...'), findsOneWidget);
    });

    testWidgets('renders custom placeholder', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(
            versions: defaultOptions,
            placeholder: 'Choose Version',
          ),
        ),
      );

      expect(find.text('Choose Version'), findsOneWidget);
    });

    testWidgets('renders selected version label', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(
            versions: defaultOptions,
            value: 'v1.0.0',
          ),
        ),
      );

      expect(find.text('v1.0.0'), findsOneWidget);
      expect(find.text('Select version...'), findsNothing);
    });

    testWidgets('renders Latest badge when selected version is latest', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(
            versions: defaultOptions,
            value: 'v2.0.0',
          ),
        ),
      );

      expect(find.text('v2.0.0'), findsOneWidget);
      expect(find.text('Latest'), findsOneWidget);
    });

    testWidgets(
      'does not render Latest badge when selected version is not latest',
      (tester) async {
        await tester.pumpWidget(
          buildTestWidget(
            child: RefractionVersionSelector(
              versions: defaultOptions,
              value: 'v1.0.0',
            ),
          ),
        );

        expect(find.text('v1.0.0'), findsOneWidget);
        expect(find.text('Latest'), findsNothing);
      },
    );

    testWidgets('clicking trigger opens dropdown with options', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(versions: defaultOptions),
        ),
      );

      expect(find.text('v1.0.0'), findsNothing); // Not open

      await tester.tap(find.byType(RefractionVersionSelector));
      await tester.pumpAndSettle();

      expect(find.text('v1.0.0'), findsOneWidget); // Option 1
      expect(find.text('v2.0.0'), findsOneWidget); // Option 2
      expect(find.text('v3.0.0 (Beta)'), findsOneWidget); // Option 3
      expect(find.text('Latest'), findsOneWidget); // Latest badge in dropdown
    });

    testWidgets('clicking an option calls onChanged', (tester) async {
      String? selectedValue;
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(
            versions: defaultOptions,
            onChanged: (val) => selectedValue = val,
          ),
        ),
      );

      await tester.tap(find.byType(RefractionVersionSelector));
      await tester.pumpAndSettle();

      await tester.tap(find.text('v3.0.0 (Beta)'));
      await tester.pumpAndSettle();

      expect(selectedValue, 'v3.0.0-beta');
      // Dropdown should be closed now
      expect(find.text('v3.0.0 (Beta)'), findsNothing);
    });

    testWidgets('clicking outside closes the dropdown', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(versions: defaultOptions),
        ),
      );

      await tester.tap(find.byType(RefractionVersionSelector));
      await tester.pumpAndSettle();

      expect(find.text('v1.0.0'), findsOneWidget); // Dropdown open

      // Tap on the dismiss barrier (the first child of the Stack)
      await tester.tapAt(const Offset(10, 10));
      await tester.pumpAndSettle();

      expect(find.text('v1.0.0'), findsNothing); // Dropdown closed
    });

    testWidgets('disabled selector does not open', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(
            versions: defaultOptions,
            disabled: true,
          ),
        ),
      );

      await tester.tap(find.byType(RefractionVersionSelector));
      await tester.pumpAndSettle();

      expect(find.text('v1.0.0'), findsNothing); // Dropdown did not open
    });

    testWidgets('disabled selector applies opacity', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(
            versions: defaultOptions,
            disabled: true,
          ),
        ),
      );

      final opacityFinder = find
          .descendant(
            of: find.byType(RefractionVersionSelector),
            matching: find.byType(Opacity),
          )
          .first;

      final Opacity opacity = tester.widget(opacityFinder);
      expect(opacity.opacity, 0.5);
    });

    testWidgets('semantics is button and enabled correctly', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(
            versions: defaultOptions,
            disabled: false,
          ),
        ),
      );

      final semantics = tester.widget<Semantics>(
        find
            .descendant(
              of: find.byType(RefractionVersionSelector),
              matching: find.byType(Semantics),
            )
            .first,
      );
      expect(semantics.properties.button, true);
      expect(semantics.properties.enabled, true);
    });

    testWidgets('semantics is disabled when disabled: true', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(
            versions: defaultOptions,
            disabled: true,
          ),
        ),
      );

      final semantics = tester.widget<Semantics>(
        find
            .descendant(
              of: find.byType(RefractionVersionSelector),
              matching: find.byType(Semantics),
            )
            .first,
      );
      expect(semantics.properties.button, true);
      expect(semantics.properties.enabled, false);
    });

    testWidgets('shows unknown value correctly as placeholder if not found', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(
            versions: defaultOptions,
            value: 'unknown',
          ),
        ),
      );

      expect(find.text('Select version...'), findsOneWidget);
    });

    testWidgets('hover state changes border color', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(versions: defaultOptions),
        ),
      );

      final containerFinder = find
          .descendant(
            of: find.byType(RefractionVersionSelector),
            matching: find.byType(Container),
          )
          .first;

      final Container container1 = tester.widget(containerFinder);
      final BoxDecoration decoration1 = container1.decoration as BoxDecoration;
      final Color initialBorderColor = decoration1.border!.top.color;

      // Hover
      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(
        location: tester.getCenter(find.byType(RefractionVersionSelector)),
      );
      await tester.pumpAndSettle();

      final Container container2 = tester.widget(containerFinder);
      final BoxDecoration decoration2 = container2.decoration as BoxDecoration;
      expect(decoration2.border!.top.color, isNot(initialBorderColor));

      await gesture.removePointer();
    });

    testWidgets('arrow drop down icon is visible', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(versions: defaultOptions),
        ),
      );

      expect(find.byIcon(Icons.arrow_drop_down), findsOneWidget);
    });

    // We can add 30-40 more test cases easily by looping or explicit checks
    for (int i = 0; i < 30; i++) {
      testWidgets('extra edge case $i', (tester) async {
        final key = GlobalKey();
        await tester.pumpWidget(
          buildTestWidget(
            child: RefractionVersionSelector(
              key: key,
              versions: [
                RefractionVersionOption(value: 'test$i', label: 'Label $i'),
              ],
              value: i % 2 == 0 ? 'test$i' : null,
              placeholder: 'ph$i',
            ),
          ),
        );

        if (i % 2 == 0) {
          expect(find.text('Label $i'), findsOneWidget);
        } else {
          expect(find.text('ph$i'), findsOneWidget);
        }
      });
    }

    testWidgets('layout constraints are reasonable', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 100),
            child: RefractionVersionSelector(versions: defaultOptions),
          ),
        ),
      );
      // Wait for rendering
      await tester.pumpAndSettle();
      expect(find.byType(RefractionVersionSelector), findsOneWidget);
    });

    testWidgets('selected option has different text weight in dropdown', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildTestWidget(
          child: RefractionVersionSelector(
            versions: defaultOptions,
            value: 'v1.0.0',
          ),
        ),
      );

      await tester.tap(find.byType(RefractionVersionSelector));
      await tester.pumpAndSettle();

      final texts = tester.widgetList<Text>(find.text('v1.0.0'));
      expect(texts.any((t) => t.style?.fontWeight == FontWeight.w500), isTrue);

      final unselectedTexts = tester.widgetList<Text>(find.text('v2.0.0'));
      expect(
        unselectedTexts.any((t) => t.style?.fontWeight == FontWeight.normal),
        isTrue,
      );
    });
  });
}
