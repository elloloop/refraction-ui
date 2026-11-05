import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  setUpAll(() async {
    final bytes = await File(
      '${Platform.environment['FLUTTER_ROOT']}/bin/cache/artifacts/material_fonts/Roboto-Regular.ttf',
    ).readAsBytes();
    await (FontLoader(
      'Roboto',
    )..addFont(Future.value(ByteData.sublistView(bytes)))).load();
  });
  for (final dark in [false, true]) {
    for (final after in [false, true]) {
      testWidgets(
        'neutral focus component ${after ? "after" : "before"} ${dark ? "dark" : "light"}',
        (tester) async {
          await tester.binding.setSurfaceSize(const Size(440, 280));
          final boundary = GlobalKey();
          final theme = dark
              ? RefractionThemeData.minimalDark()
              : RefractionThemeData.minimalLight();
          var activated = 0;
          final card = RefractionCard(
            width: 300,
            height: 128,
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Review document',
                  style: TextStyle(
                    fontFamily: 'Roboto',
                    fontSize: 19,
                    fontWeight: FontWeight.w600,
                    color: theme.colors.foreground,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Keyboard focus for custom content',
                  style: TextStyle(
                    fontFamily: 'Roboto',
                    fontSize: 14,
                    color: theme.colors.mutedForeground,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Tab to focus · Enter to open',
                  style: TextStyle(
                    fontFamily: 'Roboto',
                    fontSize: 12,
                    color: theme.colors.mutedForeground,
                  ),
                ),
              ],
            ),
          );
          await tester.pumpWidget(
            MaterialApp(
              debugShowCheckedModeBanner: false,
              home: RefractionTheme(
                data: theme,
                child: RepaintBoundary(
                  key: boundary,
                  child: ColoredBox(
                    color: theme.colors.background,
                    child: Center(
                      child: after
                          ? RefractionFocusRing(
                              onActivate: () => activated++,
                              child: card,
                            )
                          : card,
                    ),
                  ),
                ),
              ),
            ),
          );
          if (after) {
            await tester.sendKeyEvent(LogicalKeyboardKey.tab);
            await tester.pump();
          }
          await tester.runAsync(() async {
            final image =
                await (boundary.currentContext!.findRenderObject()!
                        as RenderRepaintBoundary)
                    .toImage(pixelRatio: 2);
            final data = await image.toByteData(format: ui.ImageByteFormat.png);
            final file = File(
              '../../docs/pr-evidence/focus-ring/${after ? "after" : "before"}-${dark ? "dark" : "light"}.png',
            );
            await file.parent.create(recursive: true);
            await file.writeAsBytes(data!.buffer.asUint8List());
            image.dispose();
          });
          if (after) {
            await tester.sendKeyEvent(LogicalKeyboardKey.enter);
            expect(activated, 1);
          }
          await tester.binding.setSurfaceSize(null);
        },
      );
    }
  }
}
