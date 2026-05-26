import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestWidget({
    List<LanguageOption>? options,
    List<String>? value,
    ValueChanged<List<String>>? onChanged,
    bool multiple = false,
  }) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(
          body: Center(
            child: RefractionLanguageSelector(
              options:
                  options ??
                  const [
                    LanguageOption(
                      value: 'en',
                      label: 'English',
                      group: 'Popular',
                    ),
                    LanguageOption(
                      value: 'es',
                      label: 'Spanish',
                      group: 'Popular',
                    ),
                    LanguageOption(
                      value: 'fr',
                      label: 'French',
                      group: 'Other',
                    ),
                    LanguageOption(
                      value: 'zh',
                      label: 'Chinese',
                      group: 'Other',
                    ),
                  ],
              value: value,
              onChanged: onChanged,
              multiple: multiple,
            ),
          ),
        ),
      ),
    );
  }

  testWidgets('renders placeholder when no value is selected', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(buildTestWidget());

    expect(find.text('Select language...'), findsOneWidget);
  });

  testWidgets('renders selected value', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget(value: ['en']));

    expect(find.text('English'), findsOneWidget);
  });

  testWidgets('renders multiple selected values', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestWidget(value: ['en', 'es'], multiple: true),
    );

    expect(find.text('English, Spanish'), findsOneWidget);
  });

  testWidgets('opens dropdown and displays options', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(buildTestWidget());

    await tester.tap(find.byType(RefractionLanguageSelector));
    await tester.pumpAndSettle();

    expect(find.text('POPULAR'), findsOneWidget);
    expect(find.text('OTHER'), findsOneWidget);
    expect(find.text('English'), findsOneWidget);
    expect(find.text('Spanish'), findsOneWidget);
  });

  testWidgets('selects single value and closes dropdown', (
    WidgetTester tester,
  ) async {
    List<String> selectedValue = [];
    await tester.pumpWidget(
      buildTestWidget(
        onChanged: (val) {
          selectedValue = val;
        },
      ),
    );

    await tester.tap(find.byType(RefractionLanguageSelector));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Spanish'));
    await tester.pumpAndSettle();

    expect(selectedValue, ['es']);
    expect(find.text('POPULAR'), findsNothing); // Dropdown closed
  });

  testWidgets('selects multiple values without closing dropdown', (
    WidgetTester tester,
  ) async {
    List<String> selectedValues = ['en'];

    await tester.pumpWidget(
      StatefulBuilder(
        builder: (BuildContext context, StateSetter setState) {
          return buildTestWidget(
            value: selectedValues,
            multiple: true,
            onChanged: (val) {
              setState(() {
                selectedValues = val;
              });
            },
          );
        },
      ),
    );

    await tester.tap(find.byType(RefractionLanguageSelector));
    await tester.pumpAndSettle(const Duration(milliseconds: 300));

    // Ensure French is found. If it's out of viewport, tester.ensureVisible helps,
    // though SingleChildScrollView should render it.
    final frenchFinder = find.text('French');
    expect(frenchFinder, findsOneWidget);

    await tester.ensureVisible(frenchFinder);
    await tester.tap(frenchFinder);
    await tester.pumpAndSettle(const Duration(milliseconds: 300));

    expect(selectedValues, ['en', 'fr']);
    expect(find.text('POPULAR'), findsOneWidget); // Dropdown remains open
  });
}
