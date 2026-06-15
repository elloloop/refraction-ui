import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/test_results.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionTestResults renders summary and rows correctly', (
    WidgetTester tester,
  ) async {
    final results = [
      const TestResultData(
        id: '1',
        name: 'Test Pass',
        status: TestStatus.pass,
        durationMs: 5,
      ),
      const TestResultData(
        id: '2',
        name: 'Test Fail',
        status: TestStatus.fail,
        durationMs: 15,
        expected: 'Expected Output',
        actual: 'Actual Output',
        message: 'Stacktrace info',
      ),
      const TestResultData(
        id: '3',
        name: 'Test Skip',
        status: TestStatus.skip,
        message: 'Skipped for now',
      ),
    ];

    await tester.pumpWidget(
      buildTestApp(
        RefractionTestResults(results: results),
      ),
    );

    // Summary text
    expect(find.text('1/3 passed · 1 failed · 1 skipped'), findsOneWidget);

    // Rows
    expect(find.text('Test Pass'), findsOneWidget);
    expect(find.text('Test Fail'), findsOneWidget);
    expect(find.text('Test Skip'), findsOneWidget);

    // Badges
    expect(find.text('PASS'), findsOneWidget);
    expect(find.text('FAIL'), findsOneWidget);
    expect(find.text('SKIP'), findsOneWidget);

    // Error details inside RichText
    expect(
      find.byWidgetPredicate((widget) =>
          widget is RichText &&
          widget.text.toPlainText().contains('Expected Output')),
      findsOneWidget,
    );
    expect(
      find.byWidgetPredicate((widget) =>
          widget is RichText &&
          widget.text.toPlainText().contains('Actual Output')),
      findsOneWidget,
    );

    expect(find.text('Stacktrace info'), findsOneWidget);
    expect(find.text('Skipped for now'), findsOneWidget);
  });
}
