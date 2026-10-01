import 'package:characters/characters.dart';

import 'animated_emoji_manifest.dart';
import 'emoji_renderers.dart';
import 'twemoji_index.g.dart';

/// A complete supported grapheme and its unchanged UTF-16 range.
typedef UnicodeEmojiRun = ({String emoji, int start, int end});

/// Matches whole graphemes only. Text presentation stays text; modifiers,
/// joiners and flags are never discarded to find a less specific asset.
List<UnicodeEmojiRun> refractionUnicodeEmojiRuns(String text) {
  final result = <UnicodeEmojiRun>[];
  var offset = 0;
  for (final grapheme in text.characters) {
    final end = offset + grapheme.length;
    final key = twemojiCodepoint(grapheme);
    final textPresentation = grapheme.contains('\uFE0E');
    // Bare ASCII has no emoji presentation (keycaps include U+20E3).
    final ascii = grapheme.runes.every((rune) => rune < 128);
    if (!textPresentation &&
        !ascii &&
        (kTwemojiAvailable.contains(key) ||
            kAnimatedEmojiAssets.contains(animatedEmojiCodepoint(grapheme)))) {
      result.add((emoji: grapheme, start: offset, end: end));
    }
    offset = end;
  }
  return result;
}
