import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildApp({Widget? child}) {
    return MaterialApp(
      home: Scaffold(
        body: RefractionTheme(
          data: RefractionThemeData.light(),
          child: child ?? const SizedBox(),
        ),
      ),
    );
  }

  testWidgets('RefractionEmojiPicker renders and shows smileys by default', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(buildApp(child: const RefractionEmojiPicker()));

    expect(find.byType(TextField), findsOneWidget);
    expect(find.byType(InkWell), findsWidgets);

    // 2 instances of \u{1F600} (1 in tabs, 1 in grid)
    expect(find.text('\u{1F600}'), findsNWidgets(2));
  });

  testWidgets('RefractionEmojiPicker filters emojis on search', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(buildApp(child: const RefractionEmojiPicker()));

    await tester.enterText(find.byType(TextField), 'pizza');
    await tester.pumpAndSettle();

    expect(find.text('\u{1F355}'), findsOneWidget);
    // Only 1 instance of \u{1F600} (in tabs)
    expect(find.text('\u{1F600}'), findsOneWidget);
  });

  testWidgets('RefractionEmojiPicker switches categories', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(buildApp(child: const RefractionEmojiPicker()));

    // Tap on 'food' category (4th category tab)
    await tester.tap(find.text('\u{1F34E}').first);
    await tester.pumpAndSettle();

    // 2 instances of \u{1F34E} (1 in tabs, 1 in grid)
    expect(find.text('\u{1F34E}'), findsNWidgets(2));
    // Only 1 instance of \u{1F600} (in tabs)
    expect(find.text('\u{1F600}'), findsOneWidget);
  });

  testWidgets('RefractionEmojiPicker calls onSelect and adds to recent', (
    WidgetTester tester,
  ) async {
    EmojiEntry? selectedEmoji;

    await tester.pumpWidget(
      buildApp(
        child: RefractionEmojiPicker(
          onSelect: (emoji) {
            selectedEmoji = emoji;
          },
        ),
      ),
    );

    // Tap on grinning face in the grid (which is the last one)
    final grinningFinder = find.text('\u{1F600}');
    await tester.tap(grinningFinder.last);
    await tester.pumpAndSettle();

    expect(selectedEmoji, isNotNull);
    expect(selectedEmoji!.name, 'grinning face');

    expect(find.text('Recently Used'), findsOneWidget);
    // Now there are 3 instances of \u{1F600} (1 in tabs, 1 in recent, 1 in grid)
    expect(find.text('\u{1F600}'), findsNWidgets(3));
  });
}
