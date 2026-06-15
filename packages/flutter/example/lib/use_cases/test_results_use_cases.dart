import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

// Exporting types directly needed for cases
import 'package:refraction_ui/src/components/test_results.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionTestResults)
Widget defaultTestResultsUseCase(BuildContext context) {
  return const _TestResultsDemo();
}

class _TestResultsDemo extends StatelessWidget {
  const _TestResultsDemo();

  @override
  Widget build(BuildContext context) {
    final results = [
      const TestResultData(
        id: '1',
        name: 'Math utils - adds numbers correctly',
        status: TestStatus.pass,
        durationMs: 4,
      ),
      const TestResultData(
        id: '2',
        name: 'Auth helper - validates email format',
        status: TestStatus.fail,
        durationMs: 12,
        expected: 'true',
        actual: 'false',
        message: 'Failed asserting that invalid email fails validation',
      ),
      const TestResultData(
        id: '3',
        name: 'DB connector - connects to database',
        status: TestStatus.skip,
        message: 'Database credentials not provided (skipped)',
      ),
    ];

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: RefractionTestResults(results: results),
    );
  }
}
