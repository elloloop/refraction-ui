import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/mini_map.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionMiniMap renders dots and viewport indicator', (
    WidgetTester tester,
  ) async {
    final items = [
      const MiniMapItem(id: '1', x: 50, y: 50, width: 20, height: 20),
      const MiniMapItem(id: '2', x: 150, y: 150, width: 20, height: 20),
    ];

    const viewport = MiniMapRect(x: 40, y: 40, width: 150, height: 150);

    await tester.pumpWidget(
      buildTestApp(
        RefractionMiniMap(
          items: items,
          viewport: viewport,
          width: 200,
          height: 140,
        ),
      ),
    );

    // Verify background box exists
    expect(find.byType(RefractionMiniMap), findsOneWidget);

    // Verify dots containers are rendered (we should have 3 Container widgets inside Stack including the viewport indicator)
    // There are 2 item dots and 1 viewport indicator
    expect(find.byType(Container), findsNWidgets(4)); // 1 for outer box, 2 for dots, 1 for viewport
  });

  testWidgets('RefractionMiniMap fires onViewportChange callback on gesture', (
    WidgetTester tester,
  ) async {
    final items = [
      const MiniMapItem(id: '1', x: 0, y: 0, width: 100, height: 100),
    ];

    Offset? changedCenter;

    await tester.pumpWidget(
      buildTestApp(
        RefractionMiniMap(
          items: items,
          width: 200,
          height: 200,
          padding: 0,
          onViewportChange: (offset) => changedCenter = offset,
        ),
      ),
    );

    // Tap at local center of the minimap (100, 100)
    await tester.tapAt(tester.getCenter(find.byType(RefractionMiniMap)));
    await tester.pump();

    // Since width=200, height=200, padding=0, and content bounds is (0, 0, 100, 100),
    // scale = min(200/100, 200/100) = 2.0.
    // Local point (100, 100) translates to world coordinate:
    // x = (100 - 0)/2 + 0 = 50.0
    // y = (100 - 0)/2 + 0 = 50.0
    expect(changedCenter, isNotNull);
    expect(changedCenter!.dx, equals(50.0));
    expect(changedCenter!.dy, equals(50.0));
  });
}
