import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:super_clipboard/super_clipboard.dart';

class FileData implements DataReaderFile {
  FileData(this.chunks);
  final List<Uint8List> chunks;
  @override
  Stream<Uint8List> getStream() => Stream.fromIterable(chunks);
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class Progress implements ReadProgress {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class Item implements ClipboardDataReader {
  Item(this.formats, {this.text, this.fail = false});
  final Map<DataFormat, List<Uint8List>> formats;
  final String? text;
  final bool fail;
  FileFormat? requested;
  @override
  bool canProvide(DataFormat format) =>
      format == Formats.plainText ? text != null : formats.containsKey(format);
  @override
  Future<T?> readValue<T extends Object>(ValueFormat<T> format) async =>
      text as T?;
  @override
  ReadProgress? getFile(
    FileFormat? format,
    AsyncValueChanged<DataReaderFile> onFile, {
    ValueChanged<Object>? onError,
    bool allowVirtualFiles = true,
    bool synthesizeFilesFromURIs = true,
  }) {
    requested = format;
    scheduleMicrotask(() {
      if (fail) {
        onError!(StateError('read failed'));
      } else {
        onFile(FileData(formats[format]!));
      }
    });
    return Progress();
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  Uint8List data(List<int> value) => Uint8List.fromList(value);
  test(
    'PNG and JPEG representations of one item stage only one image',
    () async {
      final item = Item({
        Formats.png: [
          data([1]),
        ],
        Formats.jpeg: [
          data([2]),
        ],
      });
      final result = await readComposerClipboard(
        reader: ClipboardReader([item]),
      );
      expect(item.requested, Formats.png);
      expect(result.images.single.contentType, 'image/png');
      expect(result.images.single.bytes, [1]);
    },
  );
  test('multiple items preserve image order and mixed text', () async {
    final result = await readComposerClipboard(
      reader: ClipboardReader([
        Item({}, text: '🙂 @Sam'),
        Item({
          Formats.jpeg: [
            data([2]),
            data([3]),
          ],
        }),
        Item({
          Formats.png: [
            data([4]),
          ],
        }),
      ]),
    );
    expect(result.text, '🙂 @Sam');
    expect(result.images.map((image) => image.name), [
      'clipboard-1.jpg',
      'clipboard-2.png',
    ]);
    expect(result.images.first.bytes, [2, 3]);
  });
  test('unsupported items leave ordinary text available', () async {
    final result = await readComposerClipboard(
      reader: ClipboardReader([Item({}, text: 'text')]),
    );
    expect(result.text, 'text');
    expect(result.images, isEmpty);
  });
  test('stream is bounded before materializing oversized image', () async {
    final item = Item({
      Formats.png: [
        data([1, 2]),
        data([3]),
      ],
    });
    await expectLater(
      readComposerClipboard(reader: ClipboardReader([item]), maxImageBytes: 2),
      throwsStateError,
    );
  });
  test('platform file failure is observable', () async {
    final item = Item({
      Formats.png: [
        data([1]),
      ],
    }, fail: true);
    await expectLater(
      readComposerClipboard(reader: ClipboardReader([item])),
      throwsStateError,
    );
  });
}
