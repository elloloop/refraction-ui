import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lottie/lottie.dart';
import 'package:refraction_ui/refraction_ui.dart';

import 'composer_test.dart' show buildApp, focusField;

void main() {
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
