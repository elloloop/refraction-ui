import 'package:flutter/widgets.dart';

import '../data/emoji_renderers.dart';
import '../data/emoji_entry_lookup.dart';
import '../data/emoji_types.dart';
import '../data/unicode_emoji.dart';

/// Display-only spans using the same complete-grapheme matching and renderer
/// as the composer and picker. Hosts keep canonical text for copying; never
/// use these WidgetSpans in an editable paragraph.
List<InlineSpan> refractionEmojiTextSpans(
  String text, {
  required double size,
  EmojiRenderer renderer = twemojiEmojiRenderer,
}) {
  final spans = <InlineSpan>[];
  var cursor = 0;
  for (final run in refractionUnicodeEmojiRuns(text)) {
    if (cursor < run.start) {
      spans.add(TextSpan(text: text.substring(cursor, run.start)));
    }
    spans.add(
      WidgetSpan(
        alignment: PlaceholderAlignment.middle,
        child: Semantics(
          label: run.emoji,
          child: ExcludeSemantics(
            child: Builder(
              builder: (context) =>
                  renderer(context, emojiEntryForGrapheme(run.emoji), size),
            ),
          ),
        ),
      ),
    );
    cursor = run.end;
  }
  if (cursor < text.length) spans.add(TextSpan(text: text.substring(cursor)));
  return spans;
}
