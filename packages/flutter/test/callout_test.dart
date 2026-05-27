import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestApp(Widget child, {bool dark = false}) {
    return MaterialApp(
      home: Scaffold(
        body: RefractionTheme(
          data: dark ? RefractionThemeData.dark() : RefractionThemeData.light(),
          child: child,
        ),
      ),
    );
  }
  group('Combinatorial Tests', () {
    testWidgets('Test #1: var=standard, title=true, icon=true, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.standard,
          description: 'Desc 1',
          title: 'Test Title 1',
          icon: const Icon(Icons.star, key: Key('icon_1')),
        ),
        dark: false,
      ));
      expect(find.text('Desc 1'), findsOneWidget);
      expect(find.text('Test Title 1'), findsOneWidget);
      expect(find.byKey(const Key('icon_1')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #2: var=standard, title=true, icon=false, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.standard,
          description: 'Desc 2',
          title: 'Test Title 2',
        ),
        dark: false,
      ));
      expect(find.text('Desc 2'), findsOneWidget);
      expect(find.text('Test Title 2'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #3: var=standard, title=false, icon=true, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.standard,
          description: 'Desc 3',
          icon: const Icon(Icons.star, key: Key('icon_3')),
        ),
        dark: false,
      ));
      expect(find.text('Desc 3'), findsOneWidget);
      expect(find.byKey(const Key('icon_3')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #4: var=standard, title=false, icon=false, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.standard,
          description: 'Desc 4',
        ),
        dark: false,
      ));
      expect(find.text('Desc 4'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #5: var=success, title=true, icon=true, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.success,
          description: 'Desc 5',
          title: 'Test Title 5',
          icon: const Icon(Icons.star, key: Key('icon_5')),
        ),
        dark: false,
      ));
      expect(find.text('Desc 5'), findsOneWidget);
      expect(find.text('Test Title 5'), findsOneWidget);
      expect(find.byKey(const Key('icon_5')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #6: var=success, title=true, icon=false, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.success,
          description: 'Desc 6',
          title: 'Test Title 6',
        ),
        dark: false,
      ));
      expect(find.text('Desc 6'), findsOneWidget);
      expect(find.text('Test Title 6'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #7: var=success, title=false, icon=true, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.success,
          description: 'Desc 7',
          icon: const Icon(Icons.star, key: Key('icon_7')),
        ),
        dark: false,
      ));
      expect(find.text('Desc 7'), findsOneWidget);
      expect(find.byKey(const Key('icon_7')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #8: var=success, title=false, icon=false, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.success,
          description: 'Desc 8',
        ),
        dark: false,
      ));
      expect(find.text('Desc 8'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #9: var=warning, title=true, icon=true, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.warning,
          description: 'Desc 9',
          title: 'Test Title 9',
          icon: const Icon(Icons.star, key: Key('icon_9')),
        ),
        dark: false,
      ));
      expect(find.text('Desc 9'), findsOneWidget);
      expect(find.text('Test Title 9'), findsOneWidget);
      expect(find.byKey(const Key('icon_9')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #10: var=warning, title=true, icon=false, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.warning,
          description: 'Desc 10',
          title: 'Test Title 10',
        ),
        dark: false,
      ));
      expect(find.text('Desc 10'), findsOneWidget);
      expect(find.text('Test Title 10'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #11: var=warning, title=false, icon=true, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.warning,
          description: 'Desc 11',
          icon: const Icon(Icons.star, key: Key('icon_11')),
        ),
        dark: false,
      ));
      expect(find.text('Desc 11'), findsOneWidget);
      expect(find.byKey(const Key('icon_11')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #12: var=warning, title=false, icon=false, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.warning,
          description: 'Desc 12',
        ),
        dark: false,
      ));
      expect(find.text('Desc 12'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #13: var=error, title=true, icon=true, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.error,
          description: 'Desc 13',
          title: 'Test Title 13',
          icon: const Icon(Icons.star, key: Key('icon_13')),
        ),
        dark: false,
      ));
      expect(find.text('Desc 13'), findsOneWidget);
      expect(find.text('Test Title 13'), findsOneWidget);
      expect(find.byKey(const Key('icon_13')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #14: var=error, title=true, icon=false, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.error,
          description: 'Desc 14',
          title: 'Test Title 14',
        ),
        dark: false,
      ));
      expect(find.text('Desc 14'), findsOneWidget);
      expect(find.text('Test Title 14'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #15: var=error, title=false, icon=true, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.error,
          description: 'Desc 15',
          icon: const Icon(Icons.star, key: Key('icon_15')),
        ),
        dark: false,
      ));
      expect(find.text('Desc 15'), findsOneWidget);
      expect(find.byKey(const Key('icon_15')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #16: var=error, title=false, icon=false, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.error,
          description: 'Desc 16',
        ),
        dark: false,
      ));
      expect(find.text('Desc 16'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #17: var=info, title=true, icon=true, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.info,
          description: 'Desc 17',
          title: 'Test Title 17',
          icon: const Icon(Icons.star, key: Key('icon_17')),
        ),
        dark: false,
      ));
      expect(find.text('Desc 17'), findsOneWidget);
      expect(find.text('Test Title 17'), findsOneWidget);
      expect(find.byKey(const Key('icon_17')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #18: var=info, title=true, icon=false, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.info,
          description: 'Desc 18',
          title: 'Test Title 18',
        ),
        dark: false,
      ));
      expect(find.text('Desc 18'), findsOneWidget);
      expect(find.text('Test Title 18'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #19: var=info, title=false, icon=true, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.info,
          description: 'Desc 19',
          icon: const Icon(Icons.star, key: Key('icon_19')),
        ),
        dark: false,
      ));
      expect(find.text('Desc 19'), findsOneWidget);
      expect(find.byKey(const Key('icon_19')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #20: var=info, title=false, icon=false, dark=false', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.info,
          description: 'Desc 20',
        ),
        dark: false,
      ));
      expect(find.text('Desc 20'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #21: var=standard, title=true, icon=true, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.standard,
          description: 'Desc 21',
          title: 'Test Title 21',
          icon: const Icon(Icons.star, key: Key('icon_21')),
        ),
        dark: true,
      ));
      expect(find.text('Desc 21'), findsOneWidget);
      expect(find.text('Test Title 21'), findsOneWidget);
      expect(find.byKey(const Key('icon_21')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #22: var=standard, title=true, icon=false, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.standard,
          description: 'Desc 22',
          title: 'Test Title 22',
        ),
        dark: true,
      ));
      expect(find.text('Desc 22'), findsOneWidget);
      expect(find.text('Test Title 22'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #23: var=standard, title=false, icon=true, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.standard,
          description: 'Desc 23',
          icon: const Icon(Icons.star, key: Key('icon_23')),
        ),
        dark: true,
      ));
      expect(find.text('Desc 23'), findsOneWidget);
      expect(find.byKey(const Key('icon_23')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #24: var=standard, title=false, icon=false, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.standard,
          description: 'Desc 24',
        ),
        dark: true,
      ));
      expect(find.text('Desc 24'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #25: var=success, title=true, icon=true, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.success,
          description: 'Desc 25',
          title: 'Test Title 25',
          icon: const Icon(Icons.star, key: Key('icon_25')),
        ),
        dark: true,
      ));
      expect(find.text('Desc 25'), findsOneWidget);
      expect(find.text('Test Title 25'), findsOneWidget);
      expect(find.byKey(const Key('icon_25')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #26: var=success, title=true, icon=false, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.success,
          description: 'Desc 26',
          title: 'Test Title 26',
        ),
        dark: true,
      ));
      expect(find.text('Desc 26'), findsOneWidget);
      expect(find.text('Test Title 26'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #27: var=success, title=false, icon=true, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.success,
          description: 'Desc 27',
          icon: const Icon(Icons.star, key: Key('icon_27')),
        ),
        dark: true,
      ));
      expect(find.text('Desc 27'), findsOneWidget);
      expect(find.byKey(const Key('icon_27')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #28: var=success, title=false, icon=false, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.success,
          description: 'Desc 28',
        ),
        dark: true,
      ));
      expect(find.text('Desc 28'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #29: var=warning, title=true, icon=true, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.warning,
          description: 'Desc 29',
          title: 'Test Title 29',
          icon: const Icon(Icons.star, key: Key('icon_29')),
        ),
        dark: true,
      ));
      expect(find.text('Desc 29'), findsOneWidget);
      expect(find.text('Test Title 29'), findsOneWidget);
      expect(find.byKey(const Key('icon_29')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #30: var=warning, title=true, icon=false, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.warning,
          description: 'Desc 30',
          title: 'Test Title 30',
        ),
        dark: true,
      ));
      expect(find.text('Desc 30'), findsOneWidget);
      expect(find.text('Test Title 30'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #31: var=warning, title=false, icon=true, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.warning,
          description: 'Desc 31',
          icon: const Icon(Icons.star, key: Key('icon_31')),
        ),
        dark: true,
      ));
      expect(find.text('Desc 31'), findsOneWidget);
      expect(find.byKey(const Key('icon_31')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #32: var=warning, title=false, icon=false, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.warning,
          description: 'Desc 32',
        ),
        dark: true,
      ));
      expect(find.text('Desc 32'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #33: var=error, title=true, icon=true, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.error,
          description: 'Desc 33',
          title: 'Test Title 33',
          icon: const Icon(Icons.star, key: Key('icon_33')),
        ),
        dark: true,
      ));
      expect(find.text('Desc 33'), findsOneWidget);
      expect(find.text('Test Title 33'), findsOneWidget);
      expect(find.byKey(const Key('icon_33')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #34: var=error, title=true, icon=false, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.error,
          description: 'Desc 34',
          title: 'Test Title 34',
        ),
        dark: true,
      ));
      expect(find.text('Desc 34'), findsOneWidget);
      expect(find.text('Test Title 34'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #35: var=error, title=false, icon=true, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.error,
          description: 'Desc 35',
          icon: const Icon(Icons.star, key: Key('icon_35')),
        ),
        dark: true,
      ));
      expect(find.text('Desc 35'), findsOneWidget);
      expect(find.byKey(const Key('icon_35')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #36: var=error, title=false, icon=false, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.error,
          description: 'Desc 36',
        ),
        dark: true,
      ));
      expect(find.text('Desc 36'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #37: var=info, title=true, icon=true, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.info,
          description: 'Desc 37',
          title: 'Test Title 37',
          icon: const Icon(Icons.star, key: Key('icon_37')),
        ),
        dark: true,
      ));
      expect(find.text('Desc 37'), findsOneWidget);
      expect(find.text('Test Title 37'), findsOneWidget);
      expect(find.byKey(const Key('icon_37')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #38: var=info, title=true, icon=false, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.info,
          description: 'Desc 38',
          title: 'Test Title 38',
        ),
        dark: true,
      ));
      expect(find.text('Desc 38'), findsOneWidget);
      expect(find.text('Test Title 38'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #39: var=info, title=false, icon=true, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.info,
          description: 'Desc 39',
          icon: const Icon(Icons.star, key: Key('icon_39')),
        ),
        dark: true,
      ));
      expect(find.text('Desc 39'), findsOneWidget);
      expect(find.byKey(const Key('icon_39')), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
    testWidgets('Test #40: var=info, title=false, icon=false, dark=true', (tester) async {
      await tester.pumpWidget(buildTestApp(
        RefractionCallout(
          variant: RefractionCalloutVariant.info,
          description: 'Desc 40',
        ),
        dark: true,
      ));
      expect(find.text('Desc 40'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
      expect(decoration.border, isNotNull);
      expect(decoration.borderRadius, isNotNull);
    });
  });
  group('Default Icon Mappings', () {
    testWidgets('standard uses lightbulb_outline', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(variant: RefractionCalloutVariant.standard, description: 'Desc')));
      expect(find.byIcon(Icons.lightbulb_outline), findsOneWidget);
    });
    testWidgets('success uses check_circle_outline', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(variant: RefractionCalloutVariant.success, description: 'Desc')));
      expect(find.byIcon(Icons.check_circle_outline), findsOneWidget);
    });
    testWidgets('warning uses warning_amber_rounded', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(variant: RefractionCalloutVariant.warning, description: 'Desc')));
      expect(find.byIcon(Icons.warning_amber_rounded), findsOneWidget);
    });
    testWidgets('error uses error_outline', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(variant: RefractionCalloutVariant.error, description: 'Desc')));
      expect(find.byIcon(Icons.error_outline), findsOneWidget);
    });
    testWidgets('info uses info_outline', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(variant: RefractionCalloutVariant.info, description: 'Desc')));
      expect(find.byIcon(Icons.info_outline), findsOneWidget);
    });
  });
  group('Foreground/Background Colors', () {
    testWidgets('success colors', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(variant: RefractionCalloutVariant.success, title: 'T', description: 'D')));
      final c = tester.widget<Container>(find.byType(Container).first);
      expect((c.decoration as BoxDecoration).color, Colors.green.withValues(alpha: 0.1));
      final t = tester.widget<Text>(find.text('T'));
      expect(t.style?.color, Colors.green);
    });
    testWidgets('warning colors', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(variant: RefractionCalloutVariant.warning, title: 'T', description: 'D')));
      final c = tester.widget<Container>(find.byType(Container).first);
      expect((c.decoration as BoxDecoration).color, Colors.orange.withValues(alpha: 0.1));
      final t = tester.widget<Text>(find.text('T'));
      expect(t.style?.color, Colors.orange);
    });
    testWidgets('info colors', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(variant: RefractionCalloutVariant.info, title: 'T', description: 'D')));
      final c = tester.widget<Container>(find.byType(Container).first);
      expect((c.decoration as BoxDecoration).color, Colors.blue.withValues(alpha: 0.1));
      final t = tester.widget<Text>(find.text('T'));
      expect(t.style?.color, Colors.blue);
    });
  });
  group('Structural / Edge Cases', () {
    testWidgets('Row alignment is start', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(description: 'Desc')));
      final row = tester.widget<Row>(find.byType(Row).first);
      expect(row.crossAxisAlignment, CrossAxisAlignment.start);
    });
    testWidgets('Padding is 16', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(description: 'Desc')));
      final container = tester.widget<Container>(find.byType(Container).first);
      expect(container.padding, const EdgeInsets.all(16.0));
    });
    testWidgets('SizedBox between icon and content is 12', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(description: 'Desc')));
      final row = tester.widget<Row>(find.byType(Row).first);
      final sizedBox = row.children[1] as SizedBox;
      expect(sizedBox.width, 12.0);
    });
    testWidgets('Expanded wraps column', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(description: 'Desc')));
      final row = tester.widget<Row>(find.byType(Row).first);
      expect(row.children.last, isA<Expanded>());
    });
    testWidgets('Title size is 14 and bold', (tester) async {
      await tester.pumpWidget(buildTestApp(RefractionCallout(title: 'T', description: 'Desc')));
      final t = tester.widget<Text>(find.text('T'));
      expect(t.style?.fontSize, 14.0);
      expect(t.style?.fontWeight, FontWeight.w600);
    });
  });
}
