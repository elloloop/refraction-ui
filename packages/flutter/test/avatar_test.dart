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

  testWidgets('RefractionAvatar displays fallback text when imageUrl is null', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionAvatar(
          fallbackText: 'JD',
        ),
      ),
    );

    expect(find.text('JD'), findsOneWidget);
  });

  testWidgets('RefractionAvatarGroup displays max avatars and remaining count', (WidgetTester tester) async {
    await tester.pumpWidget(
      buildTestApp(
        const RefractionAvatarGroup(
          max: 2,
          avatars: [
            RefractionAvatar(fallbackText: 'A'),
            RefractionAvatar(fallbackText: 'B'),
            RefractionAvatar(fallbackText: 'C'),
          ],
        ),
      ),
    );

    expect(find.text('A'), findsOneWidget);
    expect(find.text('B'), findsOneWidget);
    expect(find.text('C'), findsNothing);
    expect(find.text('+1'), findsOneWidget);
  });
}
