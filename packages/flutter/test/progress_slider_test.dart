import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(
          body: child,
        ),
      ),
    );
  }

  testWidgets('RefractionProgress renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionProgress(
          value: 0.5,
        ),
      ),
    );

    expect(find.byType(RefractionProgress), findsOneWidget);
  });

  testWidgets('RefractionSlider renders and triggers onChanged', (WidgetTester tester) async {
    double value = 0.0;
    
    await tester.pumpWidget(
      buildTestApp(
        StatefulBuilder(
          builder: (context, setState) {
            return RefractionSlider(
              value: value,
              onChanged: (val) {
                setState(() {
                  value = val;
                });
              },
            );
          }
        ),
      ),
    );

    expect(find.byType(Slider), findsOneWidget);
    await tester.tap(find.byType(Slider));
    await tester.pumpAndSettle();
    expect(value, isNot(0.0));
  });
}
