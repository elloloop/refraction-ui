import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/live_cursors.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(
          body: SizedBox(
            width: 500,
            height: 500,
            child: Stack(
              children: [child],
            ),
          ),
        ),
      ),
    );
  }

  testWidgets('RefractionLiveCursors renders cursor labels and colors', (
    WidgetTester tester,
  ) async {
    final cursors = [
      const CursorData(id: 'c1', name: 'Alice', x: 50, y: 100, color: Colors.purple),
      const CursorData(id: 'c2', name: 'Bob', x: 150, y: 200),
    ];

    await tester.pumpWidget(
      buildTestApp(
        RefractionLiveCursors(cursors: cursors),
      ),
    );

    // Verify name labels are rendered
    expect(find.text('Alice'), findsOneWidget);
    expect(find.text('Bob'), findsOneWidget);

    // Verify correct positioning coordinates
    final Positioned alicePositioned = tester.widget(
      find.ancestor(
        of: find.text('Alice'),
        matching: find.byType(Positioned),
      ).first,
    );
    expect(alicePositioned.left, equals(50));
    expect(alicePositioned.top, equals(100));
  });
}
