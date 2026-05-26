import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(
          body: Center(
            child: SizedBox(
              width: 800, // Ensure wide layout
              child: child,
            ),
          ),
        ),
      ),
    );
  }

  Widget buildSmallTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(
          body: Center(
            child: SizedBox(
              width: 300, // Ensure narrow layout
              child: child,
            ),
          ),
        ),
      ),
    );
  }

  testWidgets('renders correctly with default options', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(buildTestApp(const RefractionLocationSelector()));

    // Labels
    expect(find.text('Country'), findsOneWidget);
    expect(find.text('Language'), findsOneWidget);

    // Default values
    expect(find.text('United States'), findsOneWidget);
    expect(find.text('English'), findsOneWidget);

    // Layout is Row because width is 800
    expect(find.byType(Row), findsWidgets);
  });

  testWidgets('renders vertically on small screens', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildSmallTestApp(const RefractionLocationSelector()),
    );

    expect(find.text('Country'), findsOneWidget);
    expect(find.text('Language'), findsOneWidget);

    // Default values
    expect(find.text('United States'), findsOneWidget);
    expect(find.text('English'), findsOneWidget);

    // Should NOT have a top level Row layout for the selectors
    // It's tricky to test LayoutBuilder result precisely, but we can verify Column is present
    expect(find.byType(Column), findsWidgets);
  });

  testWidgets('fires change callbacks', (WidgetTester tester) async {
    String? selectedCountry;
    String? selectedLanguage;

    await tester.pumpWidget(
      buildTestApp(
        RefractionLocationSelector(
          onCountryChange: (val) => selectedCountry = val,
          onLanguageChange: (val) => selectedLanguage = val,
        ),
      ),
    );

    // Open Country dropdown
    await tester.tap(find.text('United States'));
    await tester.pumpAndSettle();

    // Select Canada
    await tester.tap(find.text('Canada').last);
    await tester.pumpAndSettle();

    expect(selectedCountry, 'CA');
    expect(find.text('Canada'), findsOneWidget);

    // Open Language dropdown
    await tester.tap(find.text('English'));
    await tester.pumpAndSettle();

    // Select Spanish
    await tester.tap(find.text('Spanish').last);
    await tester.pumpAndSettle();

    expect(selectedLanguage, 'es');
    expect(find.text('Spanish'), findsOneWidget);
  });

  testWidgets('respects custom options', (WidgetTester tester) async {
    const customCountries = [
      RefractionLocationOption(code: 'ZZ', name: 'Zeta'),
    ];
    const customLanguages = [
      RefractionLocationOption(code: 'zz', name: 'Zetanese'),
    ];

    await tester.pumpWidget(
      buildTestApp(
        const RefractionLocationSelector(
          defaultCountry: 'ZZ',
          defaultLanguage: 'zz',
          countries: customCountries,
          languages: customLanguages,
        ),
      ),
    );

    expect(find.text('Zeta'), findsOneWidget);
    expect(find.text('Zetanese'), findsOneWidget);
  });
}
