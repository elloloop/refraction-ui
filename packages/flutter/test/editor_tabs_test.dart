import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/editor_tabs.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionEditorTabs renders tabs correctly', (
    WidgetTester tester,
  ) async {
    final tabs = [
      const EditorTabData(id: 't1', label: 'File 1', dirty: true),
      const EditorTabData(id: 't2', label: 'File 2', closable: true),
    ];

    String? selectedTab;
    String? closedTab;

    await tester.pumpWidget(
      buildTestApp(
        RefractionEditorTabs(
          tabs: tabs,
          activeId: 't1',
          onSelect: (id) {
            selectedTab = id;
          },
          onClose: (id) {
            closedTab = id;
          },
        ),
      ),
    );

    // Labels render
    expect(find.text('File 1'), findsOneWidget);
    expect(find.text('File 2'), findsOneWidget);

    // Click on File 2
    await tester.tap(find.text('File 2'));
    await tester.pumpAndSettle();

    expect(selectedTab, equals('t2'));

    // Trigger close on t2
    // Since close button is Text('×'), we can tap it
    await tester.tap(find.text('×'));
    await tester.pumpAndSettle();

    expect(closedTab, equals('t2'));
  });
}
