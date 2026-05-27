import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestWidget({
    List<Widget>? children,
    Axis direction = Axis.horizontal,
    List<double>? defaultSizes,
    List<double>? minSizes,
    List<double>? maxSizes,
    ValueChanged<List<double>>? onResize,
  }) {
    return MaterialApp(
      home: Scaffold(
        body: RefractionTheme(
          data: RefractionThemeData.light(),
          child: RefractionResizableLayout(
            direction: direction,
            defaultSizes: defaultSizes,
            minSizes: minSizes,
            maxSizes: maxSizes,
            onResize: onResize,
            children: children ??
                [
                  Container(color: Colors.red, key: const Key('pane_0')),
                  Container(color: Colors.blue, key: const Key('pane_1')),
                ],
          ),
        ),
      ),
    );
  }

  testWidgets('renders children correctly', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    expect(find.byKey(const Key('pane_0')), findsOneWidget);
    expect(find.byKey(const Key('pane_1')), findsOneWidget);
  });

  testWidgets('applies default equal sizes if no defaultSizes provided', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    final pane0 = tester.getSize(find.byKey(const Key('pane_0')));
    final pane1 = tester.getSize(find.byKey(const Key('pane_1')));
    // In an 800x600 window, horizontal layout, divider is 8px.
    // Available width = 800 - 8 = 792.
    // Each pane should be roughly 396.
    expect((pane0.width - pane1.width).abs(), lessThan(2.0));
  });

  testWidgets('respects custom defaultSizes', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget(
      defaultSizes: [30.0, 70.0],
    ));
    final pane0 = tester.getSize(find.byKey(const Key('pane_0')));
    final pane1 = tester.getSize(find.byKey(const Key('pane_1')));
    
    // total width = 800 - 8 = 792
    // pane0 should be ~237.6, pane1 should be ~554.4
    expect(pane0.width, closeTo(237.6, 2.0));
    expect(pane1.width, closeTo(554.4, 2.0));
  });

  testWidgets('renders correct number of dividers', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget(
      children: [
        Container(color: Colors.red, key: const Key('pane_0')),
        Container(color: Colors.blue, key: const Key('pane_1')),
        Container(color: Colors.green, key: const Key('pane_2')),
      ],
      defaultSizes: [30.0, 30.0, 40.0],
    ));
    
    expect(find.byType(GestureDetector), findsNWidgets(2)); // Two dividers
  });

  testWidgets('dragging divider resizes panes horizontally', (WidgetTester tester) async {
    List<double>? resizeResult;
    
    await tester.pumpWidget(buildTestWidget(
      onResize: (sizes) {
        resizeResult = sizes;
      },
    ));
    
    final divider = find.byType(GestureDetector).first;
    
    // Drag the divider to the right by 100 pixels
    await tester.drag(divider, const Offset(100.0, 0.0));
    await tester.pumpAndSettle();
    
    expect(resizeResult, isNotNull);
    // 100px of 792 is ~12.62%
    // 50 + 12.62 = 62.62%
    expect(resizeResult![0], closeTo(62.62, 1.0));
    expect(resizeResult![1], closeTo(37.37, 1.0));
  });

  testWidgets('dragging divider resizes panes vertically', (WidgetTester tester) async {
    List<double>? resizeResult;
    
    await tester.pumpWidget(buildTestWidget(
      direction: Axis.vertical,
      onResize: (sizes) {
        resizeResult = sizes;
      },
    ));
    
    final divider = find.byType(GestureDetector).first;
    
    // Drag the divider down by 60 pixels
    await tester.drag(divider, const Offset(0.0, 60.0));
    await tester.pumpAndSettle();
    
    expect(resizeResult, isNotNull);
    // 60px of 592 (600 - 8) is ~10.13%
    // 50 + 10.13 = 60.13%
    expect(resizeResult![0], closeTo(60.13, 1.0));
    expect(resizeResult![1], closeTo(39.86, 1.0));
  });

  testWidgets('respects minSizes constraints', (WidgetTester tester) async {
    List<double>? resizeResult;
    
    await tester.pumpWidget(buildTestWidget(
      minSizes: [20.0, 30.0],
      defaultSizes: [50.0, 50.0],
      onResize: (sizes) {
        resizeResult = sizes;
      },
    ));
    
    final divider = find.byType(GestureDetector).first;
    
    // Attempt to drag it far to the left, which would make pane 0 too small.
    await tester.drag(divider, const Offset(-400.0, 0.0));
    await tester.pumpAndSettle();
    
    // Pane 0's minimum size is 20%
    expect(resizeResult![0], closeTo(20.0, 0.1));
    expect(resizeResult![1], closeTo(80.0, 0.1));
    
    // Now drag it far to the right, which would make pane 1 too small.
    await tester.drag(divider, const Offset(800.0, 0.0));
    await tester.pumpAndSettle();
    
    // Pane 1's minimum size is 30%
    expect(resizeResult![1], closeTo(30.0, 0.1));
    expect(resizeResult![0], closeTo(70.0, 0.1));
  });

  testWidgets('respects maxSizes constraints', (WidgetTester tester) async {
    List<double>? resizeResult;
    
    await tester.pumpWidget(buildTestWidget(
      maxSizes: [60.0, 80.0],
      defaultSizes: [50.0, 50.0],
      onResize: (sizes) {
        resizeResult = sizes;
      },
    ));
    
    final divider = find.byType(GestureDetector).first;
    
    // Attempt to drag it far to the right to exceed pane 0's max
    await tester.drag(divider, const Offset(400.0, 0.0));
    await tester.pumpAndSettle();
    
    expect(resizeResult![0], closeTo(60.0, 0.1));
    expect(resizeResult![1], closeTo(40.0, 0.1));
  });

  group('Extensive bounds testing', () {
    for (int i = 0; i < 50; i++) {
      testWidgets('drag bounds iteration $i', (WidgetTester tester) async {
        List<double>? sizes;
        await tester.pumpWidget(buildTestWidget(
          defaultSizes: [50.0, 50.0],
          minSizes: [10.0, 10.0],
          onResize: (s) => sizes = s,
        ));
        
        final divider = find.byType(GestureDetector).first;
        final offset = (i % 2 == 0) ? -10.0 * i : 10.0 * i;
        await tester.drag(divider, Offset(offset, 0.0));
        await tester.pumpAndSettle();
        
        if (sizes != null) {
          expect(sizes![0], greaterThanOrEqualTo(10.0));
          expect(sizes![1], greaterThanOrEqualTo(10.0));
        }
      });
    }
  });
}
