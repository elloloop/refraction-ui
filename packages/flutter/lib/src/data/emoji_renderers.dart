import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:lottie/lottie.dart';

import 'emoji_types.dart';
import 'twemoji_index.g.dart';

/// The package name assets are shipped under (for `package:`-scoped lookups).
const String _package = 'refraction_ui';

/// Computes the Twemoji asset slug for [emoji], matching twemoji.js'
/// `grabTheRightIcon`: strip `U+FE0F` unless the sequence contains a
/// zero-width joiner, then join the code points as lowercase hex with `-`.
String twemojiCodepoint(String emoji) {
  const zwj = '‍';
  const vs16 = '️';
  final source = emoji.contains(zwj) ? emoji : emoji.replaceAll(vs16, '');
  return source.runes.map((r) => r.toRadixString(16)).join('-');
}

/// Whether a bundled uniform Twemoji glyph exists for [entry].
bool hasTwemoji(EmojiEntry entry) =>
    kTwemojiAvailable.contains(twemojiCodepoint(entry.emoji));

/// The DEFAULT [EmojiRenderer]: renders the bundled, platform-uniform Twemoji
/// (CC-BY 4.0 — see the package NOTICE) so emoji look identical on every OS
/// and version. Falls back to the native glyph for any codepoint not in the
/// bundle. Swap this seam for [defaultEmojiRenderer] to force native glyphs,
/// or supply your own to use Noto/Fluent/etc.
Widget twemojiEmojiRenderer(
  BuildContext context,
  EmojiEntry entry,
  double size,
) {
  final slug = twemojiCodepoint(entry.emoji);
  if (!kTwemojiAvailable.contains(slug)) {
    return defaultEmojiRenderer(context, entry, size);
  }
  return SvgPicture.asset(
    'assets/twemoji/$slug.svg',
    package: _package,
    width: size,
    height: size,
    // While the (tiny) SVG decodes, hold the slot so the grid never jumps.
    placeholderBuilder: (_) => SizedBox.square(dimension: size),
  );
}

/// The library's bundled starter sticker pack: eight tasteful static SVG
/// stickers plus one Lottie-animated sticker, proving both render paths.
/// Hosts add their own packs via [RefractionEmojiPicker.stickers].
List<EmojiSticker> refractionStarterStickers() => [
  for (final s in _starterSvgStickers)
    EmojiSticker(
      id: 'sticker_${s.$1}',
      label: s.$2,
      keywords: [s.$1],
      builder: (context, size) => SvgPicture.asset(
        'assets/stickers/${s.$1}.svg',
        package: _package,
        width: size,
        height: size,
      ),
    ),
  EmojiSticker(
    id: 'sticker_pulse',
    label: 'Pulse',
    keywords: const ['pulse', 'heart', 'animated'],
    builder: (context, size) => Lottie.asset(
      'assets/stickers/pulse.json',
      package: _package,
      width: size,
      height: size,
      repeat: true,
    ),
  ),
];

const List<(String, String)> _starterSvgStickers = [
  ('thumbs_up', 'Thumbs up'),
  ('heart', 'Heart'),
  ('star', 'Star'),
  ('party', 'Party'),
  ('smile', 'Smile'),
  ('fire', 'Fire'),
  ('check', 'Check'),
  ('coffee', 'Coffee'),
];
