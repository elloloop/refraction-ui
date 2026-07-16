import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('dataset completeness', () {
    test('ships the full modern emoji set (>= 1800 entries)', () {
      expect(EmojiData.getAllEmojis().length, greaterThanOrEqualTo(1800));
    });

    test('every entry has a glyph, a name, and at least one shortcode', () {
      for (final e in EmojiData.getAllEmojis()) {
        expect(e.emoji, isNotEmpty, reason: e.name);
        expect(e.name, isNotEmpty);
        expect(e.shortcodes, isNotEmpty, reason: e.name);
        expect(e.shortcode, isNotEmpty);
      }
    });

    test('grouped data covers every category and sums to the flat set', () {
      var total = 0;
      for (final category in EmojiCategory.values) {
        final group = EmojiData.data[category]!;
        expect(group, isNotEmpty, reason: '$category');
        total += group.length;
      }
      expect(total, EmojiData.getAllEmojis().length);
    });
  });

  group('single source of truth', () {
    test('composer shortcodes resolve from the same dataset', () {
      final codes = refractionDefaultShortcodes();
      // Canonical aliases from the dataset.
      expect(codes['grinning'], '😀');
      expect(codes['joy'], '😂');
      expect(codes['fire'], '🔥');
      expect(codes['pizza'], '🍕');
    });

    test('ranked search finds by name/keyword/shortcode', () {
      final pizza = EmojiData.search('pizza');
      expect(pizza.any((e) => e.emoji == '🍕'), isTrue);
      // Exact shortcode ranks first.
      final joy = EmojiData.search('joy');
      expect(joy.first.emoji, '😂');
      expect(EmojiData.search('   '), isEmpty);
    });
  });

  group('twemoji seam', () {
    test('codepoint slug matches twemoji naming rules', () {
      expect(twemojiCodepoint('😀'), '1f600');
      expect(twemojiCodepoint('👍'), '1f44d');
      // VS-16 stripped when no ZWJ present.
      expect(twemojiCodepoint('❤️'), '2764');
      // ZWJ sequence keeps its selectors joined.
      expect(twemojiCodepoint('👨‍👩‍👧'), '1f468-200d-1f469-200d-1f467');
    });

    test('bundled Twemoji covers virtually the whole dataset', () {
      final covered = EmojiData.getAllEmojis().where(hasTwemoji).length;
      final total = EmojiData.getAllEmojis().length;
      expect(covered / total, greaterThan(0.99));
    });

    test('starter sticker pack is non-empty and includes an animated one', () {
      final stickers = refractionStarterStickers();
      expect(stickers.length, greaterThanOrEqualTo(8));
      expect(stickers.any((s) => s.id == 'sticker_pulse'), isTrue);
      for (final s in stickers) {
        expect(s.builder, isNotNull);
      }
    });
  });

  group('EmojiRenderer seam', () {
    testWidgets('default (native) renderer paints the glyph as text', (
      tester,
    ) async {
      await tester.pumpWidget(
        Directionality(
          textDirection: TextDirection.ltr,
          child: Builder(
            builder: (context) => defaultEmojiRenderer(
              context,
              const EmojiEntry(
                emoji: '🎉',
                name: 'party popper',
                category: EmojiCategory.activities,
                shortcodes: ['tada'],
              ),
              24,
            ),
          ),
        ),
      );
      expect(find.text('🎉'), findsOneWidget);
    });
  });
}
