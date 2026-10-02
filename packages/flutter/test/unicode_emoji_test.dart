import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lottie/lottie.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/editable_emoji_artwork.dart';

import 'composer_test.dart' show buildApp, focusField;

void main() {
  testWidgets('composer and display renderers receive picker metadata', (
    tester,
  ) async {
    final entries = <EmojiEntry>[];
    Widget renderer(BuildContext context, EmojiEntry entry, double size) {
      entries.add(entry);
      return SizedBox.square(dimension: size);
    }

    await tester.pumpWidget(
      buildApp(
        Column(
          children: [
            RefractionComposer(emojiRenderer: renderer, onSubmit: (_) {}),
            Text.rich(
              TextSpan(
                children: refractionEmojiTextSpans(
                  '🔥',
                  size: 18,
                  renderer: renderer,
                ),
              ),
            ),
          ],
        ),
      ),
    );
    await tester.enterText(find.byType(TextField), '🔥');
    await tester.pumpAndSettle();
    final pickerEntry = EmojiData.all.firstWhere(
      (entry) => entry.emoji == '🔥',
    );
    expect(entries.length, greaterThanOrEqualTo(2));
    expect(entries.every((entry) => identical(entry, pickerEntry)), isTrue);
    expect(tester.takeException(), isNull);
  });

  for (final direction in TextDirection.values) {
    testWidgets('emoji artwork paints at the native glyph box ($direction)', (
      tester,
    ) async {
      const artworkColor = Color(0xff13a7c5);
      final boundaryKey = GlobalKey();
      await tester.pumpWidget(
        buildApp(
          RepaintBoundary(
            key: boundaryKey,
            child: RefractionComposer(
              emojiRenderer: (_, __, ___) =>
                  const ColoredBox(color: artworkColor),
              onSubmit: (_) {},
            ),
          ),
          textDirection: direction,
        ),
      );
      await tester.enterText(find.byType(TextField), 'A🔥B');
      await tester.pumpAndSettle();
      final boundary =
          boundaryKey.currentContext!.findRenderObject()!
              as RenderRepaintBoundary;
      final editable = tester
          .state<EditableTextState>(find.byType(EditableText))
          .renderEditable;
      final glyphBox = editable
          .getBoxesForSelection(
            const TextSelection(baseOffset: 1, extentOffset: 3),
          )
          .single
          .toRect();
      final expectedCenter = editable.localToGlobal(
        glyphBox.center,
        ancestor: boundary,
      );
      var pixels = 0;
      var totalX = 0;
      var totalY = 0;
      await tester.runAsync(() async {
        final image = await boundary.toImage();
        final bytes = (await image.toByteData(
          format: ui.ImageByteFormat.rawRgba,
        ))!.buffer.asUint8List();
        for (var i = 0; i < bytes.length; i += 4) {
          if (bytes[i] == 0x13 &&
              bytes[i + 1] == 0xa7 &&
              bytes[i + 2] == 0xc5 &&
              bytes[i + 3] == 0xff) {
            pixels++;
            totalX += (i ~/ 4) % image.width;
            totalY += (i ~/ 4) ~/ image.width;
          }
        }
        image.dispose();
      });
      expect(pixels, greaterThan(50));
      expect(totalX / pixels, closeTo(expectedCenter.dx, 1));
      expect(totalY / pixels, closeTo(expectedCenter.dy, 1));
      expect(tester.takeException(), isNull);
    });
  }

  for (final scale in [2.0, 3.0]) {
    for (final native in [true, false]) {
      testWidgets('emoji artwork scales once at ${scale}x (native=$native)', (
        tester,
      ) async {
        await tester.pumpWidget(
          buildApp(
            RefractionComposer(
              emojiRenderer: native
                  ? defaultEmojiRenderer
                  : twemojiEmojiRenderer,
              onSubmit: (_) {},
            ),
            mediaQuery: (base) =>
                base.copyWith(textScaler: TextScaler.linear(scale)),
          ),
        );
        await tester.enterText(find.byType(TextField), '🔥');
        await tester.pumpAndSettle();
        final field = tester.widget<EditableText>(find.byType(EditableText));
        final editable = tester
            .state<EditableTextState>(find.byType(EditableText))
            .renderEditable;
        final physicalFontSize = editable.textScaler.scale(
          field.style.fontSize!,
        );
        expect(editable.textScaler.scale(10), scale * 10);
        if (native) {
          final paragraph = tester.renderObject<RenderParagraph>(
            find.descendant(
              of: find.byType(EditableEmojiArtwork),
              matching: find.byWidgetPredicate(
                (widget) => widget is Text && widget.data == '🔥',
              ),
            ),
          );
          expect(
            paragraph.textScaler.scale(paragraph.text.style!.fontSize!),
            physicalFontSize,
          );
          expect(paragraph.size.width, physicalFontSize);
        } else {
          expect(
            tester.getSize(find.byType(SvgPicture)).width,
            physicalFontSize,
          );
        }
        expect(field.controller.text, '🔥');
        expect(tester.takeException(), isNull);
      });
    }
  }

  test('matches only complete supported graphemes at original offsets', () {
    const text = 'A🔥❤️👍🏽👨‍👩‍👧‍👦🇬🇧1️⃣ ©︎ plain';
    final runs = refractionUnicodeEmojiRuns(text);
    expect(runs.map((r) => r.emoji), [
      '🔥',
      '❤️',
      '👨‍👩‍👧‍👦',
      '🇬🇧',
      '1️⃣',
    ]);
    for (final run in runs) {
      expect(text.substring(run.start, run.end), run.emoji);
    }
    expect(refractionUnicodeEmojiRuns('🔥‍🦄 👍🏽 ✈︎ 123 abc 🔥́'), isEmpty);
    expect(
      refractionUnicodeEmojiRuns('❤️‍🔥 👩‍💻 🏳️‍🌈').map((run) => run.emoji),
      ['❤️‍🔥', '👩‍💻', '🏳️‍🌈'],
    );
  });

  testWidgets(
    'shared animation respects reduced motion and whole-sequence fallback',
    (tester) async {
      await tester.pumpWidget(
        buildApp(
          MediaQuery(
            data: const MediaQueryData(disableAnimations: true),
            child: Builder(
              builder: (context) => Column(
                children: [
                  for (final emoji in ['🔥', '🇬🇧', '👍🏽'])
                    refractionAnimatedEmojiRenderer(
                      context,
                      EmojiEntry(
                        emoji: emoji,
                        name: emoji,
                        category: EmojiCategory.symbols,
                      ),
                      24,
                    ),
                ],
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(tester.widget<Lottie>(find.byType(Lottie)).animate, isFalse);
      expect(find.byType(SvgPicture), findsOneWidget);
      expect(find.text('👍🏽'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'typed and pasted Unicode uses art with original editing offsets',
    (tester) async {
      String? clipboard;
      tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
        SystemChannels.platform,
        (call) async {
          if (call.method == 'Clipboard.setData') {
            clipboard = (call.arguments as Map)['text'] as String;
          }
          if (call.method == 'Clipboard.getData') return {'text': clipboard};
          return null;
        },
      );
      addTearDown(
        () => tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
          SystemChannels.platform,
          null,
        ),
      );
      final controller = RefractionComposerController();
      addTearDown(controller.dispose);
      await tester.pumpWidget(
        buildApp(RefractionComposer(controller: controller, onSubmit: (_) {})),
      );
      await focusField(tester);
      const draft = 'Hi 🔥 🇬🇧 👨‍👩‍👧‍👦 👍🏽';
      await tester.enterText(find.byType(TextField), draft);
      await tester.pumpAndSettle();
      expect(find.byType(SvgPicture), findsNWidgets(3));
      final field = tester.widget<EditableText>(find.byType(EditableText));
      final editable = tester
          .state<EditableTextState>(find.byType(EditableText))
          .renderEditable;
      expect(field.controller.text, draft);
      expect(editable.text!.toPlainText(), draft);
      final selection = TextSelection(
        baseOffset: 3,
        extentOffset: draft.length,
      );
      field.controller.selection = selection;
      await tester.pump();
      expect(field.controller.selection, selection);
      await tester.sendKeyDownEvent(LogicalKeyboardKey.controlLeft);
      await tester.sendKeyEvent(LogicalKeyboardKey.keyC);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.controlLeft);
      await tester.pump();
      expect(controller.state.value, draft);
      expect(
        (await Clipboard.getData(Clipboard.kTextPlain))?.text,
        draft.substring(3),
      );
      // A soft-keyboard composing range keeps native text and its underline.
      tester.testTextInput.updateEditingValue(
        const TextEditingValue(
          text: '🔥',
          selection: TextSelection.collapsed(offset: 2),
          composing: TextRange(start: 0, end: 2),
        ),
      );
      await tester.pump();
      expect(find.byType(SvgPicture), findsNothing);
      expect(field.controller.text, '🔥');
      expect(tester.takeException(), isNull);
    },
  );
}
