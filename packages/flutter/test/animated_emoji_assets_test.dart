import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lottie/lottie.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/data/animated_emoji_manifest.dart';

const String _assetDir = 'assets/emoji_animated';

/// Common work-chat reaction emoji that must animate. 👍 ❤️ 😂 🎉 🔥 🙏 👏 💯
/// shipped already; ✅ 👀 ➕ 💡 ❓ 🚀 ⏳ were static until the animated set grew.
const Map<String, String> _reactionEmoji = {
  '👍': '1f44d',
  '❤️': '2764',
  '😂': '1f602',
  '🎉': '1f389',
  '🔥': '1f525',
  '🙏': '1f64f',
  '👏': '1f44f',
  '💯': '1f4af',
  '✅': '2705',
  '👀': '1f440',
  '➕': '2795',
  '💡': '1f4a1',
  '❓': '2753',
  '🚀': '1f680',
  '⏳': '23f3',
};

Set<String> _assetKeys() => Directory(_assetDir)
    .listSync()
    .whereType<File>()
    .map((file) => file.uri.pathSegments.last)
    .where((name) => name.endsWith('.json'))
    .map((name) => name.substring(0, name.length - '.json'.length))
    .toSet();

void main() {
  group('animated emoji assets', () {
    test('manifest and assets directory agree exactly', () {
      expect(kAnimatedEmojiAssets, _assetKeys());
    });

    test('manifest matches the fetch tool key list', () {
      final listed = File('tool/animated_emoji.txt')
          .readAsLinesSync()
          .map((line) => line.trim())
          .where((line) => line.isNotEmpty && !line.startsWith('#'))
          .toSet();
      expect(kAnimatedEmojiAssets, listed);
    });

    test('every asset is a Lottie document', () {
      for (final key in kAnimatedEmojiAssets) {
        final json = jsonDecode(
          File('$_assetDir/$key.json').readAsStringSync(),
        );
        expect(json, isA<Map>(), reason: key);
        expect((json as Map).containsKey('layers'), isTrue, reason: key);
      }
    });

    test('common reaction emoji are all animated', () {
      for (final entry in _reactionEmoji.entries) {
        expect(
          kAnimatedEmojiAssets,
          contains(entry.value),
          reason: '${entry.key} (${entry.value})',
        );
      }
    });
  });

  group('chat bubble animates the new reaction emoji', () {
    Widget app(Widget child) => MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(body: child),
      ),
    );

    for (final glyph in ['✅', '👀', '➕', '💡', '❓', '🚀', '⏳']) {
      testWidgets('$glyph renders as Lottie', (tester) async {
        await tester.pumpWidget(app(RefractionChatBubble(text: glyph)));
        expect(find.byType(Lottie), findsOneWidget);
      });
    }
  });

  group('registerRefractionUiLicenses', () {
    test('adds the CC BY 4.0 credits to the LicenseRegistry', () async {
      registerRefractionUiLicenses();
      registerRefractionUiLicenses(); // idempotent
      final entries = await LicenseRegistry.licenses
          .where((entry) => entry.packages.contains('refraction_ui'))
          .toList();
      final text = entries
          .expand((entry) => entry.paragraphs)
          .map((paragraph) => paragraph.text)
          .join('\n');
      expect(text, contains('Noto Animated Emoji'));
      expect(text, contains('CC BY 4.0'));
      expect(text, contains('Twemoji'));
      expect(entries, hasLength(2));
    });
  });
}
