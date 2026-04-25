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

  testWidgets('RefractionCommandMenu renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestApp(
        RefractionCommandMenu(
          groups: [
            RefractionCommandGroup(
              heading: 'Settings',
              items: [
                RefractionCommandItem(
                  icon: const Icon(Icons.settings),
                  label: 'Settings Option',
                  onSelected: () {},
                ),
              ],
            ),
          ],
        ),
      ),
    );

    expect(find.text('SETTINGS'), findsOneWidget);
    expect(find.text('Settings Option'), findsOneWidget);
  });

  testWidgets('RefractionCommandMenu filters items', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestApp(
        RefractionCommandMenu(
          groups: [
            RefractionCommandGroup(
              heading: 'General',
              items: [
                RefractionCommandItem(icon: const Icon(Icons.build), label: 'Build', onSelected: () {}),
                RefractionCommandItem(icon: const Icon(Icons.run_circle), label: 'Run', onSelected: () {}),
              ],
            ),
          ],
        ),
      ),
    );

    expect(find.text('Build'), findsOneWidget);
    expect(find.text('Run'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'run');
    await tester.pumpAndSettle();

    expect(find.text('Build'), findsNothing);
    expect(find.text('Run'), findsOneWidget);
  });
}
