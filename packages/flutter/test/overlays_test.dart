import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('Refraction Overlays Parity', () {
    testWidgets('Tooltip shows content safely', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            colors: RefractionColors.light,
            child: Scaffold(
              body: const RefractionTooltip(
                message: Text('Help Text'),
                child: Text('Hover Me'),
              ),
            ),
          ),
        ),
      );

      expect(find.text('Hover Me'), findsOneWidget);
    });

    testWidgets('Dialog mounts content via builder execution', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: RefractionTheme(
            colors: RefractionColors.light,
            child: Scaffold(
              body: Builder(
                builder: (context) => RefractionButton(
                  onPressed: () {
                    RefractionDialog.show(
                      context: context,
                      title: const Text('Alert'),
                      content: const Text('Danger'),
                    );
                  },
                  child: const Text('Trigger'),
                ),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Trigger'));
      await tester.pumpAndSettle();
      expect(find.text('Alert'), findsOneWidget);
      expect(find.text('Danger'), findsOneWidget);
    });
  });
}
