import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(body: child),
      ),
    );
  }

  const cityItems = [
    DropdownMenuItem(value: 'sf', child: Text('San Francisco')),
    DropdownMenuItem(value: 'nyc', child: Text('New York')),
    DropdownMenuItem(value: 'tk', child: Text('Tokyo')),
  ];

  group('RefractionSelect', () {
    testWidgets('shows the placeholder when no value is selected', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionSelect<String>(
            items: cityItems,
            placeholder: 'Choose a city',
          ),
        ),
      );

      expect(find.text('Choose a city'), findsOneWidget);
    });

    testWidgets('opening the dropdown and picking an item emits onChanged', (
      WidgetTester tester,
    ) async {
      String? selected = 'sf';
      await tester.pumpWidget(
        buildApp(
          RefractionSelect<String>(
            items: cityItems,
            value: selected,
            onChanged: (value) => selected = value,
          ),
        ),
      );

      expect(find.text('San Francisco'), findsOneWidget);

      await tester.tap(find.byType(DropdownButton<String>));
      await tester.pumpAndSettle();
      await tester.tap(find.text('New York').last);
      await tester.pumpAndSettle();

      expect(selected, 'nyc');
    });

    testWidgets('disabled select does not open the dropdown', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionSelect<String>(
            items: cityItems,
            placeholder: 'Choose a city',
            disabled: true,
          ),
        ),
      );

      await tester.tap(find.byType(DropdownButton<String>));
      await tester.pumpAndSettle();

      expect(find.text('New York'), findsNothing);
    });
  });
}
