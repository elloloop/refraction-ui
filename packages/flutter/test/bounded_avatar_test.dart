import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

Future<Uint8List> picture(int width, int height) async {
  final recorder = ui.PictureRecorder();
  Canvas(recorder).drawColor(Colors.green, BlendMode.src);
  final drawing = recorder.endRecording();
  final image = await drawing.toImage(width, height);
  drawing.dispose();
  final data = await image.toByteData(format: ui.ImageByteFormat.png);
  image.dispose();
  return data!.buffer.asUint8List();
}

Future<ui.Image> decode(WidgetTester tester, ImageProvider provider) async {
  final stream = provider.resolve(const ImageConfiguration());
  final completer = <ui.Image>[];
  final listener = ImageStreamListener(
    (image, _) => completer.add(image.image.clone()),
  );
  stream.addListener(listener);
  await tester.runAsync(() async {
    while (completer.isEmpty) {
      await Future<void>.delayed(const Duration(milliseconds: 10));
    }
  });
  stream.removeListener(listener);
  return completer.single;
}

Widget testApp({required Widget home}) => MaterialApp(
  home: RefractionTheme(data: RefractionThemeData.minimalLight(), child: home),
);

void main() {
  tearDown(() {
    PaintingBinding.instance.imageCache.clear();
    PaintingBinding.instance.imageCache.clearLiveImages();
  });

  testWidgets(
    'large photo decodes to size times device scale instead of original',
    (tester) async {
      final bytes = await tester.runAsync(() => picture(6000, 3000));
      await tester.pumpWidget(
        testApp(
          home: MediaQuery(
            data: const MediaQueryData(devicePixelRatio: 3),
            child: RefractionBoundedAvatar(
              imageProvider: MemoryImage(bytes!),
              fallbackText: 'AL',
              size: 48,
            ),
          ),
        ),
      );
      final provider = tester.widget<Image>(find.byType(Image)).image;
      final image = await decode(tester, provider);
      expect(image.width, 144);
      expect(image.height, 72);
      expect(image.width * image.height * 4, lessThan(50 * 1024));
      image.dispose();
    },
  );

  testWidgets(
    'small originals are not upscaled and the decode ceiling is enforced',
    (tester) async {
      final bytes = await tester.runAsync(() => picture(40, 80));
      await tester.pumpWidget(
        testApp(
          home: MediaQuery(
            data: const MediaQueryData(devicePixelRatio: 4),
            child: RefractionBoundedAvatar(
              imageProvider: MemoryImage(bytes!),
              fallbackText: 'AL',
              size: 1000,
            ),
          ),
        ),
      );
      final provider =
          tester.widget<Image>(find.byType(Image)).image as ResizeImage;
      expect(provider.width, RefractionBoundedAvatar.maxDecodeExtent);
      final image = await decode(tester, provider);
      expect(image.width, 40);
      expect(image.height, 80);
      image.dispose();
    },
  );

  testWidgets('failed photos retain the shared initials fallback', (
    tester,
  ) async {
    await tester.pumpWidget(
      testApp(
        home: RefractionBoundedAvatar(
          imageProvider: MemoryImage(Uint8List.fromList([1, 2, 3])),
          fallbackText: 'AL',
        ),
      ),
    );
    await tester.runAsync(
      () async => Future<void>.delayed(const Duration(milliseconds: 30)),
    );
    await tester.pumpAndSettle();
    expect(find.text('AL'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
