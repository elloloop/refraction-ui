import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/services.dart' show Clipboard;
import 'package:super_clipboard/super_clipboard.dart';

/// One image representation per clipboard item; PNG takes precedence over JPEG.
class ComposerClipboardImage {
  const ComposerClipboardImage({
    required this.name,
    required this.contentType,
    required this.bytes,
  });

  final String name;
  final String contentType;
  final Uint8List bytes;
}

class ComposerClipboardPaste {
  const ComposerClipboardPaste({this.text, this.images = const []});
  final String? text;
  final List<ComposerClipboardImage> images;
}

/// An injected reader must only read in response to a paste gesture.
typedef ComposerClipboardReader = Future<ComposerClipboardPaste> Function();

/// Bounds materialization before the host's upload validation runs.
const int composerClipboardMaxImageBytes = 100 * 1024 * 1024;

Future<ComposerClipboardPaste> readComposerClipboard({
  ClipboardReader? reader,
  int maxImageBytes = composerClipboardMaxImageBytes,
}) async {
  reader ??= await SystemClipboard.instance?.read();
  if (reader == null) {
    final text = await _fallbackText();
    return ComposerClipboardPaste(text: text);
  }
  final text = await reader.readValue(Formats.plainText);
  final images = <ComposerClipboardImage>[];
  for (final item in reader.items) {
    final format = item.canProvide(Formats.png)
        ? Formats.png
        : item.canProvide(Formats.jpeg)
        ? Formats.jpeg
        : null;
    if (format == null) continue;
    final result = Completer<ComposerClipboardImage>();
    final progress = item.getFile(format, (file) async {
      try {
        final data = BytesBuilder(copy: false);
        await for (final chunk in file.getStream()) {
          if (data.length + chunk.length > maxImageBytes) {
            throw StateError('Clipboard image exceeds $maxImageBytes bytes.');
          }
          data.add(chunk);
        }
        final png = format == Formats.png;
        result.complete(
          ComposerClipboardImage(
            name: 'clipboard-${images.length + 1}.${png ? 'png' : 'jpg'}',
            contentType: png ? 'image/png' : 'image/jpeg',
            bytes: data.takeBytes(),
          ),
        );
      } catch (error, stack) {
        result.completeError(error, stack);
      }
    }, onError: result.completeError);
    if (progress != null) images.add(await result.future);
  }
  return ComposerClipboardPaste(text: text, images: images);
}

Future<String?> _fallbackText() async {
  return (await Clipboard.getData(Clipboard.kTextPlain))?.text;
}
