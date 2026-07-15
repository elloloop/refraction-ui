// Unit + widget tests for the composer's built-in expression panel and its
// pure emoji helpers (issue #432 scope expansion).
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget buildPanel(Widget child) {
  return MaterialApp(
    home: RefractionTheme(
      data: RefractionThemeData.light(),
      child: Scaffold(
        // A bounded box so the panel's internal Expanded/GridView lay out.
        body: SizedBox(height: 320, child: child),
      ),
    ),
  );
}

void main() {
  group('applyComposerSkinTone', () {
    test('leaves a non-modifiable base (and none tone) unchanged', () {
      expect(applyComposerSkinTone('👍', ComposerSkinTone.none), '👍');
      expect(applyComposerSkinTone('🍕', ComposerSkinTone.dark), '🍕');
    });

    test('appends the Fitzpatrick modifier to a modifiable base', () {
      expect(
        applyComposerSkinTone('👍', ComposerSkinTone.medium),
        '👍\u{1F3FD}',
      );
      expect(applyComposerSkinTone('✋', ComposerSkinTone.dark), '✋\u{1F3FF}');
    });
  });

  group('composerEmojiOnlyClusterCount / composerIsJumboEmoji', () {
    test('counts emoji-only clusters, ignoring whitespace', () {
      expect(composerEmojiOnlyClusterCount('😀'), 1);
      expect(composerEmojiOnlyClusterCount('🎉🎉🎉'), 3);
      expect(composerEmojiOnlyClusterCount('😀 😀'), 2);
      expect(composerEmojiOnlyClusterCount('👍🏽'), 1, reason: 'skin tone');
      expect(
        composerEmojiOnlyClusterCount('👨‍👩‍👧‍👦'),
        1,
        reason: 'ZWJ family is one cluster',
      );
      expect(composerEmojiOnlyClusterCount('❤️'), 1);
    });

    test('returns -1 when any non-emoji is present, 0 when empty', () {
      expect(composerEmojiOnlyClusterCount('hi 👍'), -1);
      expect(composerEmojiOnlyClusterCount('a'), -1);
      expect(composerEmojiOnlyClusterCount('   '), 0);
      expect(composerEmojiOnlyClusterCount(''), 0);
    });

    test('jumbo is 1..maxClusters of emoji only', () {
      expect(composerIsJumboEmoji('🔥'), isTrue);
      expect(composerIsJumboEmoji('🔥🔥🔥'), isTrue);
      expect(composerIsJumboEmoji('🔥🔥🔥🔥'), isFalse);
      expect(composerIsJumboEmoji('hey'), isFalse);
      expect(composerIsJumboEmoji('🔥🔥🔥🔥', maxClusters: 4), isTrue);
    });
  });

  testWidgets('default panel renders the emoji picker and selects a glyph', (
    tester,
  ) async {
    String? picked;
    await tester.pumpWidget(
      buildPanel(
        ComposerExpressionPanel(onEmojiSelected: (glyph) => picked = glyph),
      ),
    );
    // Category tabs + first-category grid render; search narrows to one.
    await tester.enterText(find.byType(TextField), 'pizza');
    await tester.pump();
    await tester.tap(find.text('\u{1F355}'));
    expect(picked, '\u{1F355}');
  });

  testWidgets('emojiTextStyle is applied to the default emoji cell '
      '(bundled-font hook)', (tester) async {
    await tester.pumpWidget(
      buildPanel(
        ComposerExpressionPanel(
          onEmojiSelected: (_) {},
          config: const ComposerExpressionPanelConfig(
            emojiTextStyle: TextStyle(fontFamily: 'NotoColorEmoji'),
          ),
        ),
      ),
    );
    await tester.enterText(find.byType(TextField), 'pizza');
    await tester.pump();
    final glyph = tester.widget<Text>(find.text('\u{1F355}'));
    expect(glyph.style?.fontFamily, 'NotoColorEmoji');
    expect(glyph.style?.fontSize, 24, reason: 'size default preserved');
  });

  testWidgets('emojiCellBuilder fully overrides the cell visual', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildPanel(
        ComposerExpressionPanel(
          onEmojiSelected: (_) {},
          config: ComposerExpressionPanelConfig(
            emojiCellBuilder: (context, emoji) =>
                Text(emoji, key: ValueKey('cell-$emoji')),
          ),
        ),
      ),
    );
    await tester.enterText(find.byType(TextField), 'pizza');
    await tester.pump();
    expect(find.byKey(const ValueKey('cell-\u{1F355}')), findsOneWidget);
  });

  testWidgets('sticker view is hidden by default and shown with host packs', (
    tester,
  ) async {
    ComposerSticker? picked;
    await tester.pumpWidget(
      buildPanel(
        ComposerExpressionPanel(
          onEmojiSelected: (_) {},
          onStickerSelected: (sticker) => picked = sticker,
          config: const ComposerExpressionPanelConfig(
            stickerPacks: [
              ComposerStickerPack(
                id: 'mascots',
                name: 'Mascots',
                stickers: [ComposerSticker(id: 's1', label: 'Waving mascot')],
              ),
            ],
          ),
        ),
      ),
    );
    // The Emoji/Stickers toggle appears; switch to stickers and pick one.
    await tester.tap(find.text('Stickers'));
    await tester.pump();
    await tester.tap(find.text('Waving mascot'));
    expect(picked?.id, 's1');
  });

  testWidgets('empty sticker packs render only the emoji view (no toggle)', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildPanel(ComposerExpressionPanel(onEmojiSelected: (_) {})),
    );
    expect(find.text('Stickers'), findsNothing);
  });
}
