import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(
          body: child,
        ),
      ),
    );
  }

  testWidgets('RefractionRadioGroup renders correctly and handles selection', (WidgetTester tester) async {
    String? selectedValue = 'item1';

    await tester.pumpWidget(
      buildTestApp(
        StatefulBuilder(
          builder: (context, setState) {
            return RefractionRadioGroup<String>(
              groupValue: selectedValue,
              onChanged: (val) {
                setState(() {
                  selectedValue = val;
                });
              },
              items: const [
                RefractionRadioItem(value: 'item1', label: 'Item 1'),
                RefractionRadioItem(value: 'item2', label: 'Item 2', description: 'Desc 2'),
              ],
            );
          }
        ),
      ),
    );

    expect(find.text('Item 1'), findsOneWidget);
    expect(find.text('Item 2'), findsOneWidget);
    expect(find.text('Desc 2'), findsOneWidget);

    await tester.tap(find.text('Item 2'));
    await tester.pumpAndSettle();

    expect(selectedValue, 'item2');
  });
}
