import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  // Use the native renderer in widget tests so assertions can find glyphs as
  // text (the default Twemoji renderer paints SVGs, exercised separately in
  // emoji_data_test.dart) and no async asset load is involved.
  Widget buildApp({
    ValueChanged<EmojiEntry>? onSelect,
    List<EmojiSticker> stickers = const [],
    EmojiRenderer renderer = defaultEmojiRenderer,
    bool reduceMotion = false,
  }) {
    return MaterialApp(
      home: Scaffold(
        body: MediaQuery(
          data: MediaQueryData(disableAnimations: reduceMotion),
          child: RefractionTheme(
            data: RefractionThemeData.light(),
            child: RefractionEmojiPicker(
              onSelect: onSelect,
              stickers: stickers,
              emojiRenderer: renderer,
            ),
          ),
        ),
      ),
    );
  }

  testWidgets('renders search + smileys grid by default', (tester) async {
    await tester.pumpWidget(buildApp());
    expect(find.byType(TextField), findsOneWidget);
    // Grinning face appears in the smileys tab AND as the first grid cell.
    expect(find.text('😀'), findsNWidgets(2));
  });

  testWidgets('filters emoji on search', (tester) async {
    await tester.pumpWidget(buildApp());
    await tester.enterText(find.byType(TextField), 'pizza');
    await tester.pumpAndSettle();
    expect(find.text('🍕'), findsOneWidget);
    // The smileys tab glyph remains, but the grid no longer shows it.
    expect(find.text('😀'), findsOneWidget);
  });

  testWidgets('switches category shows that category header', (tester) async {
    await tester.pumpWidget(buildApp());
    // Tap the Food & Drink tab (🍎).
    await tester.tap(find.text('🍎').first);
    await tester.pumpAndSettle();
    expect(find.text('Food & Drink'), findsOneWidget);
  });

  testWidgets('selecting an emoji fires onSelect and reveals recents', (
    tester,
  ) async {
    EmojiEntry? selected;
    await tester.pumpWidget(buildApp(onSelect: (e) => selected = e));
    // Tap the grinning face in the grid (last instance; first is the tab).
    await tester.tap(find.text('😀').last);
    await tester.pumpAndSettle();
    expect(selected, isNotNull);
    expect(selected!.name, 'grinning face');
    // A recents tab (🕘) now exists.
    expect(find.text('🕘'), findsOneWidget);
  });

  testWidgets('EmojiRenderer seam is used for every glyph', (tester) async {
    const sentinelKey = Key('custom-emoji');
    await tester.pumpWidget(
      buildApp(
        renderer: (context, entry, size) =>
            SizedBox(key: sentinelKey, width: size, height: size),
      ),
    );
    // The grid renders through the injected renderer, not native text.
    expect(find.byKey(sentinelKey), findsWidgets);
  });

  testWidgets('stickers tab appears only when stickers are supplied', (
    tester,
  ) async {
    await tester.pumpWidget(buildApp());
    expect(find.text('🎟️'), findsNothing);

    await tester.pumpWidget(
      buildApp(
        stickers: const [EmojiSticker(id: 's1', label: 'Star', glyph: '⭐')],
      ),
    );
    expect(find.text('🎟️'), findsOneWidget);
  });

  testWidgets('reduced motion still switches categories in one frame', (
    tester,
  ) async {
    await tester.pumpWidget(buildApp(reduceMotion: true));
    await tester.tap(find.text('🍎').first);
    // A single pump (no long settle) reaches the new category — the switch is
    // an opacity-only cross-fade with a shortened duration.
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.text('Food & Drink'), findsOneWidget);
  });
}
