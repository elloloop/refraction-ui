// Fetches Google's animated Noto emoji (Lottie JSON) into
// `assets/emoji_animated/` and regenerates
// `lib/src/data/animated_emoji_manifest.dart` from what is on disk.
//
//   dart run tool/fetch_animated_emoji.dart
//
// The set to bundle is `tool/animated_emoji.txt`: one asset key per line —
// the emoji's codepoints in lowercase hex, joined by `_`, with any U+FE0F
// variation selector dropped (🚀 → `1f680`, ❤️ → `2764`). That is the key
// `RefractionChatBubble` derives from a glyph at runtime. Lines starting
// with `#` are comments. To add an emoji, add its key and re-run.
//
// Source: the official Noto animated emoji catalogue
// (https://googlefonts.github.io/noto-emoji-animation/, index at
// data/api.json) served from fonts.gstatic.com/s/e/notoemoji/latest/. The
// animations are licensed CC BY 4.0 — see NOTICE for the attribution this
// package carries. A key with no Noto animation is reported and skipped:
// that glyph stays static (Twemoji); never substitute another art style.
//
// The package NEVER fetches these at runtime — this tool bakes them into
// committed assets. Only `dart:io`/`dart:convert`, so it runs with a bare
// `dart run`.
import 'dart:convert';
import 'dart:io';

const String _catalogueUrl =
    'https://googlefonts.github.io/noto-emoji-animation/data/api.json';
const String _lottieUrlPattern =
    'https://fonts.gstatic.com/s/e/notoemoji/latest/{codepoint}/lottie.json';
const String _keysPath = 'tool/animated_emoji.txt';
const String _assetDir = 'assets/emoji_animated';
const String _manifestPath = 'lib/src/data/animated_emoji_manifest.dart';
const String _variationSelector = 'fe0f';

Future<void> main() async {
  final keys = File(_keysPath)
      .readAsLinesSync()
      .map((line) => line.trim())
      .where((line) => line.isNotEmpty && !line.startsWith('#'))
      .toSet();

  final client = HttpClient();
  try {
    final catalogue = await _codepointsByKey(client);
    final missing = <String>[];
    for (final key in keys) {
      final asset = File('$_assetDir/$key.json');
      if (asset.existsSync()) continue;
      final codepoint = catalogue[key];
      if (codepoint == null) {
        missing.add(key);
        continue;
      }
      final url = _lottieUrlPattern.replaceFirst('{codepoint}', codepoint);
      final body = await _get(client, url);
      // Fail loudly on anything that is not a Lottie document.
      final decoded = jsonDecode(body);
      if (decoded is! Map || !decoded.containsKey('layers')) {
        throw StateError('$url did not return a Lottie document');
      }
      asset.writeAsStringSync(body);
      stdout.writeln('fetched $key (${body.length} bytes)');
    }
    if (missing.isNotEmpty) {
      stderr.writeln(
        'No Noto animation for: ${missing.join(', ')} — left static.',
      );
    }
  } finally {
    client.close();
  }

  _writeManifest();
}

/// Maps each catalogue entry's asset key (FE0F dropped) to the codepoint
/// string the CDN path uses (FE0F kept, e.g. `2764_fe0f`).
Future<Map<String, String>> _codepointsByKey(HttpClient client) async {
  final json = jsonDecode(await _get(client, _catalogueUrl)) as Map;
  final icons = (json['icons'] as List).cast<Map>();
  return {
    for (final icon in icons)
      _keyOf(icon['codepoint'] as String): icon['codepoint'] as String,
  };
}

String _keyOf(String codepoint) =>
    codepoint.split('_').where((part) => part != _variationSelector).join('_');

Future<String> _get(HttpClient client, String url) async {
  final request = await client.getUrl(Uri.parse(url));
  final response = await request.close();
  final body = await response.transform(utf8.decoder).join();
  if (response.statusCode != HttpStatus.ok) {
    throw HttpException('GET $url → ${response.statusCode}');
  }
  return body;
}

void _writeManifest() {
  final keys =
      Directory(_assetDir)
          .listSync()
          .whereType<File>()
          .map((file) => file.uri.pathSegments.last)
          .where((name) => name.endsWith('.json'))
          .map((name) => name.substring(0, name.length - '.json'.length))
          .toList()
        ..sort();
  final buffer = StringBuffer()
    ..writeln(
      '/// Generated: codepoint keys of the bundled animated Noto emoji (Lottie),',
    )
    ..writeln('/// one per file in assets/emoji_animated/. Regenerate with')
    ..writeln('/// `dart run tool/fetch_animated_emoji.dart`.')
    ..writeln('const Set<String> kAnimatedEmojiAssets = {');
  for (final key in keys) {
    buffer.writeln("  '$key',");
  }
  buffer.writeln('};');
  File(_manifestPath).writeAsStringSync(buffer.toString());
  stdout.writeln('wrote $_manifestPath (${keys.length} keys)');
}
