// Generates `lib/src/data/emoji_dataset.g.dart` from `tool/emoji_source.json`.
//
// The source is the Unicode-derived `gemoji` dataset (emoji, description,
// category, aliases, tags, unicode_version). Run offline whenever the source
// changes:
//
//   dart run tool/generate_emoji_data.dart
//
// The app NEVER fetches emoji data at runtime — this tool bakes the full set
// into a committed `.dart` file that is the single source of truth for both
// `RefractionEmojiPicker` and the composer's `refractionDefaultShortcodes()`.
//
// This script uses only `dart:io`/`dart:convert` (no pub deps) so it runs
// with a bare `dart run`.
import 'dart:convert';
import 'dart:io';

/// Maps a gemoji `category` string to the `EmojiCategory` enum member name.
const Map<String, String> _categoryMap = {
  'Smileys & Emotion': 'smileys',
  'People & Body': 'people',
  'Animals & Nature': 'nature',
  'Food & Drink': 'food',
  'Travel & Places': 'travel',
  'Activities': 'activities',
  'Objects': 'objects',
  'Symbols': 'symbols',
  'Flags': 'flags',
};

/// Escapes a string for a single-quoted Dart literal.
String _lit(String value) {
  final escaped = value
      .replaceAll(r'\', r'\\')
      .replaceAll(r'$', r'\$')
      .replaceAll("'", r"\'")
      .replaceAll('\n', r'\n')
      .replaceAll('\r', r'\r');
  return "'$escaped'";
}

String _listLit(List<String> values) {
  if (values.isEmpty) return 'const []';
  return '[${values.map(_lit).join(', ')}]';
}

void main() {
  final scriptDir = File(Platform.script.toFilePath()).parent;
  final packageDir = scriptDir.parent;
  final sourceFile = File('${scriptDir.path}/emoji_source.json');
  final outFile = File('${packageDir.path}/lib/src/data/emoji_dataset.g.dart');

  final raw = jsonDecode(sourceFile.readAsStringSync()) as List<dynamic>;

  final buffer = StringBuffer();
  buffer.writeln('// GENERATED CODE - DO NOT MODIFY BY HAND.');
  buffer.writeln('//');
  buffer.writeln('// Regenerate with: dart run tool/generate_emoji_data.dart');
  buffer.writeln('// Source: tool/emoji_source.json (Unicode-derived gemoji).');
  buffer.writeln('// ignore_for_file: lines_longer_than_80_chars');
  buffer.writeln();
  buffer.writeln("import 'emoji_types.dart';");
  buffer.writeln();
  buffer.writeln('/// The complete emoji dataset, in canonical Unicode order.');
  buffer.writeln('///');
  buffer.writeln(
    '/// The single source of truth consumed by [EmojiData] and the composer',
  );
  buffer.writeln('/// shortcode resolver. Do not hand-edit.');
  buffer.writeln('const List<EmojiEntry> kRefractionEmojiDataset = [');

  var count = 0;
  final seenShortcodes = <String>{};
  final skipped = <String>[];
  for (final dynamic item in raw) {
    final map = item as Map<String, dynamic>;
    final categoryName = map['category'] as String?;
    final enumName = _categoryMap[categoryName];
    if (enumName == null) {
      skipped.add('$categoryName');
      continue;
    }
    final emoji = map['emoji'] as String;
    final name = map['description'] as String? ?? '';
    final aliases = ((map['aliases'] as List<dynamic>?) ?? const [])
        .cast<String>();
    final tags = ((map['tags'] as List<dynamic>?) ?? const []).cast<String>();
    final unicodeVersion = map['unicode_version'] as String?;
    for (final a in aliases) {
      seenShortcodes.add(a);
    }

    buffer.writeln('  EmojiEntry(');
    buffer.writeln('    emoji: ${_lit(emoji)},');
    buffer.writeln('    name: ${_lit(name)},');
    buffer.writeln('    category: EmojiCategory.$enumName,');
    if (tags.isNotEmpty) {
      buffer.writeln('    keywords: ${_listLit(tags)},');
    }
    if (aliases.isNotEmpty) {
      buffer.writeln('    shortcodes: ${_listLit(aliases)},');
    }
    if (unicodeVersion != null && unicodeVersion.isNotEmpty) {
      buffer.writeln('    unicodeVersion: ${_lit(unicodeVersion)},');
    }
    buffer.writeln('  ),');
    count++;
  }

  buffer.writeln('];');

  outFile.writeAsStringSync(buffer.toString());
  stdout.writeln('Wrote ${outFile.path}');
  stdout.writeln('  entries: $count');
  stdout.writeln('  unique shortcodes: ${seenShortcodes.length}');
  if (skipped.isNotEmpty) {
    stdout.writeln('  skipped categories: ${skipped.toSet()}');
  }

  _writeTwemojiIndex(packageDir);
}

/// Emits `twemoji_index.g.dart`, a const set of the twemoji codepoint slugs
/// actually bundled under `assets/twemoji/` — so the renderer can decide
/// SVG-vs-native without a per-glyph asset-load try/catch.
void _writeTwemojiIndex(Directory packageDir) {
  final assetsDir = Directory('${packageDir.path}/assets/twemoji');
  final outFile = File('${packageDir.path}/lib/src/data/twemoji_index.g.dart');
  final slugs = <String>[];
  if (assetsDir.existsSync()) {
    for (final entity in assetsDir.listSync()) {
      if (entity is File && entity.path.endsWith('.svg')) {
        slugs.add(entity.uri.pathSegments.last.replaceAll('.svg', ''));
      }
    }
  }
  slugs.sort();

  final buffer = StringBuffer();
  buffer.writeln('// GENERATED CODE - DO NOT MODIFY BY HAND.');
  buffer.writeln('//');
  buffer.writeln('// Regenerate with: dart run tool/generate_emoji_data.dart');
  buffer.writeln('// Source: the SVG files under assets/twemoji/.');
  buffer.writeln('// ignore_for_file: lines_longer_than_80_chars');
  buffer.writeln();
  buffer.writeln('/// Twemoji codepoint slugs bundled under assets/twemoji/.');
  buffer.writeln('const Set<String> kTwemojiAvailable = {');
  for (final slug in slugs) {
    buffer.writeln("  '$slug',");
  }
  buffer.writeln('};');
  outFile.writeAsStringSync(buffer.toString());
  stdout.writeln('Wrote ${outFile.path}');
  stdout.writeln('  bundled twemoji svgs: ${slugs.length}');
}
