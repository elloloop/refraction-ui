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

  group('RefractionSearchBar', () {
    testWidgets('renders the placeholder', (WidgetTester tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionSearchBar(placeholder: 'Search docs...')),
      );

      expect(find.text('Search docs...'), findsOneWidget);
      expect(find.byIcon(Icons.search), findsOneWidget);
    });

    testWidgets('onChanged fires immediately per keystroke', (
      WidgetTester tester,
    ) async {
      final changes = <String>[];
      await tester.pumpWidget(
        buildApp(RefractionSearchBar(onChanged: changes.add)),
      );

      await tester.enterText(find.byType(TextField), 'ref');
      expect(changes, ['ref']);
    });

    testWidgets('onSearch fires once after the debounce elapses', (
      WidgetTester tester,
    ) async {
      final searches = <String>[];
      await tester.pumpWidget(
        buildApp(
          RefractionSearchBar(
            debounceDuration: const Duration(milliseconds: 300),
            onSearch: searches.add,
          ),
        ),
      );

      await tester.enterText(find.byType(TextField), 'r');
      // A second keystroke inside the window resets the pending timer.
      await tester.pump(const Duration(milliseconds: 150));
      await tester.enterText(find.byType(TextField), 'ref');
      await tester.pump(const Duration(milliseconds: 299));
      expect(searches, isEmpty);

      await tester.pump(const Duration(milliseconds: 2));
      expect(searches, ['ref']);
    });

    testWidgets('isLoading shows a progress indicator suffix', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        buildApp(const RefractionSearchBar(isLoading: true)),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
  });
}
