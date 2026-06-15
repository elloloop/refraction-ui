import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/editor_status_bar.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(bottomNavigationBar: child),
      ),
    );
  }

  testWidgets('RefractionEditorStatusBar renders convenience segments correctly', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionEditorStatusBar(
          line: 12,
          col: 34,
          indentation: 'Tab Size: 4',
          language: 'Flutter',
          encoding: 'UTF-16',
          eol: 'CRLF',
          status: 'Modified',
        ),
      ),
    );

    expect(find.text('Ln 12, Col 34'), findsOneWidget);
    expect(find.text('Tab Size: 4'), findsOneWidget);
    expect(find.text('Flutter'), findsOneWidget);
    expect(find.text('UTF-16'), findsOneWidget);
    expect(find.text('CRLF'), findsOneWidget);
    expect(find.text('Modified'), findsOneWidget);
  });

  testWidgets('RefractionEditorStatusBar renders custom segments list correctly', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionEditorStatusBar(
          segments: [
            StatusSegment(
              id: 's1',
              label: 'Custom Left',
              align: StatusSegmentAlign.left,
            ),
            StatusSegment(
              id: 's2',
              label: 'Custom Right',
              align: StatusSegmentAlign.right,
            ),
          ],
        ),
      ),
    );

    expect(find.text('Custom Left'), findsOneWidget);
    expect(find.text('Custom Right'), findsOneWidget);
  });
}
