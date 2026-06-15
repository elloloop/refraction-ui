import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/floating_reactions.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(
          body: SizedBox(
            width: 500,
            height: 500,
            child: child,
          ),
        ),
      ),
    );
  }

  testWidgets('RefractionFloatingReactions renders active reactions', (
    WidgetTester tester,
  ) async {
    final reactions = [
      const RefractionFloatingReaction(id: '1', emoji: '👋', lane: 0),
      const RefractionFloatingReaction(id: '2', emoji: '❤️', lane: 2),
    ];

    await tester.pumpWidget(
      buildTestApp(
        RefractionFloatingReactions(
          reactions: reactions,
          lanes: 5,
        ),
      ),
    );

    // Emojis should be found on the screen
    expect(find.text('👋'), findsOneWidget);
    expect(find.text('❤️'), findsOneWidget);

    // Let the animations run forward
    await tester.pump(const Duration(seconds: 1));

    // The widgets should still be present but their positions/opacities have updated
    expect(find.text('👋'), findsOneWidget);
    expect(find.text('❤️'), findsOneWidget);
  });
}
