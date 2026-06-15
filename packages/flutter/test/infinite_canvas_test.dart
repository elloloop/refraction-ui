import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/infinite_canvas.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionInfiniteCanvas renders child and zoom controls', (
    WidgetTester tester,
  ) async {
    CanvasTransform? changedTransform;

    await tester.pumpWidget(
      buildTestApp(
        RefractionInfiniteCanvas(
          showGrid: true,
          showControls: true,
          onTransformChange: (t) => changedTransform = t,
          child: const SizedBox(
            width: 100,
            height: 100,
            key: Key('canvas-child'),
          ),
        ),
      ),
    );

    // Verify child is rendered
    expect(find.byKey(const Key('canvas-child')), findsOneWidget);

    // Verify zoom controls are rendered
    expect(find.text('+'), findsOneWidget);
    expect(find.text('−'), findsOneWidget);
    expect(find.text('⊞'), findsOneWidget);

    // Click zoom in button
    await tester.tap(find.text('+'));
    await tester.pump();

    // Verify that onTransformChange was triggered
    expect(changedTransform, isNotNull);
    expect(changedTransform!.zoom, equals(1.25));
  });
}
