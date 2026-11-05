import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

Future<Uint8List> _original(int width, int height) async {
  final recorder = ui.PictureRecorder();
  final canvas = ui.Canvas(recorder);
  canvas.drawRect(
    ui.Rect.fromLTWH(2, 2, width - 4.0, height - 4.0),
    ui.Paint()..color = const ui.Color(0xff008d75),
  );
  // Distinct endpoint markers prove contain does not silently crop the original.
  canvas.drawRect(
    const ui.Rect.fromLTWH(0, 0, 4, 4),
    ui.Paint()..color = const ui.Color(0xffff1744),
  );
  canvas.drawRect(
    ui.Rect.fromLTWH(width - 4.0, height - 4.0, 4, 4),
    ui.Paint()..color = const ui.Color(0xffff1744),
  );
  final picture = recorder.endRecording();
  final image = await picture.toImage(width, height);
  final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
  picture.dispose();
  image.dispose();
  return bytes!.buffer.asUint8List();
}

Widget _theme(Widget child, Brightness brightness) => MaterialApp(
  home: RefractionTheme(
    data: brightness == Brightness.dark
        ? RefractionThemeData.minimalDark()
        : RefractionThemeData.minimalLight(),
    child: Scaffold(body: Center(child: child)),
  ),
);

void main() {
  testWidgets(
    'provider lifecycle reports exact resized instance, replacement and disposal',
    (tester) async {
      final bytes = await tester.runAsync(() => _original(20, 80));
      final seen = <ImageProvider?>[];
      final source = MemoryImage(bytes!);
      Future<void> show(double size) => tester.pumpWidget(
        _theme(
          RefractionBoundedAvatar(
            imageProvider: source,
            fallbackText: 'AV',
            size: size,
            fit: BoxFit.contain,
            onImageProviderChanged: seen.add,
          ),
          Brightness.light,
        ),
      );
      await show(32);
      final first = tester.widget<Image>(find.byType(Image)).image;
      expect(seen.single, same(first));
      expect(first, isA<ResizeImage>());
      await show(64);
      expect(seen[1], isNull);
      expect(seen[2], same(tester.widget<Image>(find.byType(Image)).image));
      await tester.pumpWidget(const SizedBox.shrink());
      expect(seen.last, isNull);
    },
  );

  testWidgets('provider ownership retires before a new observer receives it', (
    tester,
  ) async {
    final bytes = await tester.runAsync(() => _original(20, 80));
    final source = MemoryImage(bytes!);
    final first = <ImageProvider?>[];
    final next = <ImageProvider?>[];
    Future<void> show(ValueChanged<ImageProvider?> observer) =>
        tester.pumpWidget(
          _theme(
            RefractionBoundedAvatar(
              imageProvider: source,
              fallbackText: 'AV',
              onImageProviderChanged: observer,
            ),
            Brightness.light,
          ),
        );
    await show(first.add);
    await show(next.add);
    expect(first.length, 2);
    expect(first.last, isNull);
    expect(next.single, same(tester.widget<Image>(find.byType(Image)).image));
    await tester.pumpWidget(const SizedBox.shrink());
    expect(next.last, isNull);
  });

  testWidgets('failed image notifies once until the actual provider changes', (
    tester,
  ) async {
    final source = MemoryImage(Uint8List.fromList([1, 2, 3]));
    var failures = 0;
    Future<void> show(ImageProvider provider) => tester.pumpWidget(
      _theme(
        RefractionBoundedAvatar(
          imageProvider: provider,
          fallbackText: 'AV',
          onImageError: () => failures++,
        ),
        Brightness.light,
      ),
    );
    await show(source);
    await tester.runAsync(
      () => Future<void>.delayed(const Duration(milliseconds: 30)),
    );
    await tester.pumpAndSettle();
    expect(failures, 1);
    expect(find.text('AV'), findsOneWidget);
    await show(source);
    await tester.pumpAndSettle();
    expect(failures, 1);
    await show(MemoryImage(Uint8List.fromList([4, 5, 6])));
    await tester.runAsync(
      () => Future<void>.delayed(const Duration(milliseconds: 30)),
    );
    await tester.pumpAndSettle();
    expect(failures, 2);
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox.shrink());
  });

  for (final brightness in Brightness.values) {
    testWidgets(
      'full portrait/landscape endpoints32/64 with semantic ${brightness.name} tokens',
      (tester) async {
        final portrait = await tester.runAsync(() => _original(20, 80));
        final landscape = await tester.runAsync(() => _original(80, 20));
        final key = GlobalKey();
        await tester.pumpWidget(
          _theme(
            RepaintBoundary(
              key: key,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  for (final size in [32.0, 64.0])
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        for (final bytes in [portrait!, landscape!])
                          RefractionBoundedAvatar(
                            imageProvider: MemoryImage(bytes),
                            fallbackText: 'AV',
                            size: size,
                            fit: BoxFit.contain,
                          ),
                      ],
                    ),
                ],
              ),
            ),
            brightness,
          ),
        );
        await tester.runAsync(
          () => Future.wait([
            for (final element in find.byType(Image).evaluate())
              precacheImage((element.widget as Image).image, element),
          ]).timeout(const Duration(seconds: 5)),
        );
        await tester.pump();
        expect(
          find.text('AV'),
          findsNothing,
          reason:
              'transparent loaded originals must not reveal placeholder initials',
        );
        expect(
          find.byType(RefractionAvatar),
          findsNothing,
          reason: 'no default glyph behind transparent loaded art',
        );
        final boundary =
            key.currentContext!.findRenderObject() as RenderRepaintBoundary;
        final image = (await tester.runAsync(
          () => boundary.toImage(pixelRatio: 2),
        ))!;
        final rgba = await tester.runAsync(
          () => image.toByteData(format: ui.ImageByteFormat.rawRgba),
        );
        var red = 0;
        for (var i = 0; i < rgba!.lengthInBytes; i += 4) {
          if (rgba.getUint8(i) > 220 &&
              rgba.getUint8(i + 1) < 60 &&
              rgba.getUint8(i + 2) < 100) {
            red++;
          }
        }
        expect(
          red,
          greaterThan(12),
          reason: 'endpoint markers must survive fitting',
        );
        expect(
          tester
              .widgetList<Image>(find.byType(Image))
              .every((v) => v.fit == BoxFit.contain),
          isTrue,
        );
        final output = Platform.environment['AVATAR_REVIEW_DIR'];
        if (output != null) {
          final png = await tester.runAsync(
            () => image.toByteData(format: ui.ImageByteFormat.png),
          );
          await tester.runAsync(
            () => File(
              '$output/contained-${brightness.name}.png',
            ).writeAsBytes(png!.buffer.asUint8List()),
          );
        }
        image.dispose();
        await tester.pumpWidget(const SizedBox.shrink());
      },
    );
  }
}
