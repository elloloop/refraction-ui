// Safe native fixture: writes a generated PNG to the clipboard; no network/send.
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:super_clipboard/super_clipboard.dart';
import 'package:example/composer_input_harness.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('native clipboard PNG stages through keyboard or context Paste', (
    tester,
  ) async {
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);
    canvas.drawRect(
      const Rect.fromLTWH(0, 0, 8, 8),
      Paint()..color = Colors.teal,
    );
    final picture = recorder.endRecording();
    final image = await picture.toImage(8, 8);
    final png = (await image.toByteData(
      format: ui.ImageByteFormat.png,
    ))!.buffer.asUint8List();
    image.dispose();
    picture.dispose();
    final item = DataWriterItem()..add(Formats.png(png));
    await SystemClipboard.instance!.write([item]);
    await tester.pumpWidget(const ComposerInputHarness());
    await tester.pumpAndSettle();
    await tester.tap(find.byType(TextField));
    await tester.enterText(find.byType(TextField), 'Native fixture draft');
    if (defaultTargetPlatform == TargetPlatform.iOS ||
        defaultTargetPlatform == TargetPlatform.android) {
      final editor = tester.state<EditableTextState>(find.byType(EditableText));
      editor.showToolbar();
      await tester.pumpAndSettle();
      await tester.tap(find.text('Paste'));
    } else {
      final modifier = defaultTargetPlatform == TargetPlatform.macOS
          ? LogicalKeyboardKey.metaLeft
          : LogicalKeyboardKey.controlLeft;
      await tester.sendKeyDownEvent(modifier);
      await tester.sendKeyEvent(LogicalKeyboardKey.keyV);
      await tester.sendKeyUpEvent(modifier);
    }
    await tester.pumpAndSettle();
    expect(find.text('clipboard-1.png'), findsOneWidget);
    expect(
      tester.widget<TextField>(find.byType(TextField)).controller!.text,
      'Native fixture draft',
    );
    expect(
      tester.widget<TextField>(find.byType(TextField)).focusNode!.hasFocus,
      isTrue,
    );
  });
}
