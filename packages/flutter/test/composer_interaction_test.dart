// Input-channel contracts: enterText/showKeyboard between edits would hide a
// disconnected client. These tests deliberately focus once, then keep editing.
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget app(Widget child, {TextDirection direction = TextDirection.ltr}) =>
    MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(
          body: Directionality(
            textDirection: direction,
            child: Align(alignment: Alignment.bottomCenter, child: child),
          ),
        ),
      ),
    );
TextEditingController text(WidgetTester tester) =>
    tester.widget<TextField>(find.byType(TextField)).controller!;
Future<void> edit(
  WidgetTester tester,
  String value, {
  TextSelection? selection,
  TextRange composing = TextRange.empty,
}) async {
  expect(tester.testTextInput.hasAnyClients, isTrue);
  tester.testTextInput.updateEditingValue(
    TextEditingValue(
      text: value,
      selection: selection ?? TextSelection.collapsed(offset: value.length),
      composing: composing,
    ),
  );
  await tester.pump();
}

void expectSession(WidgetTester tester) {
  expect(tester.testTextInput.hasAnyClients, isTrue);
  expect(tester.testTextInput.isVisible, isTrue);
  expect(
    tester.widget<TextField>(find.byType(TextField)).focusNode!.hasFocus,
    isTrue,
  );
  expect(tester.takeException(), isNull);
}

Future<void> mount(WidgetTester tester, RefractionComposer composer) async {
  await tester.pumpWidget(app(composer));
  await tester.tap(find.byType(TextField));
  await tester.pump();
}

void main() {
  for (final flag in ['disabled', 'readOnly']) {
    testWidgets(
      'external controller listeners can rebuild while $flag changes',
      (tester) async {
        final controller = RefractionComposerController(
          initialValue: 'keep draft',
        );
        addTearDown(controller.dispose);
        var restricted = false;
        Widget build() => app(
          ListenableBuilder(
            listenable: controller,
            builder: (_, _) => RefractionComposer(
              controller: controller,
              disabled: flag == 'disabled' && restricted,
              readOnly: flag == 'readOnly' && restricted,
              onSubmit: (_) {},
            ),
          ),
        );
        await tester.pumpWidget(build());
        expect(controller.state.canSend, isTrue);
        restricted = true;
        await tester.pumpWidget(build());
        await tester.pump();
        expect(tester.takeException(), isNull);
        expect(controller.state.canSend, isFalse);
        expect(text(tester).text, 'keep draft');
        restricted = false;
        await tester.pumpWidget(build());
        await tester.pump();
        expect(tester.takeException(), isNull);
        expect(controller.state.canSend, isTrue);
        expect(text(tester).text, 'keep draft');
      },
    );
  }

  testWidgets(
    'continuous Unicode typing wraps, scrolls at ceiling and remains editable',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(390, 640));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await mount(tester, RefractionComposer(onSubmit: (_) {}));
      final initialHeight = tester.getSize(find.byType(TextField)).height;
      var message = '';
      const units = ['word ', '🙂', 'e\u0301', '👍🏽', '👨‍👩‍👧‍👦', '\n'];
      for (var index = 0; index < 90; index++) {
        message += units[index % units.length];
        await edit(tester, message);
        expectSession(tester);
        expect(text(tester).text, message);
        expect(text(tester).selection.extentOffset, message.length);
      }
      await tester.pumpAndSettle();
      final ceiling = tester.getSize(find.byType(TextField)).height;
      expect(ceiling, greaterThan(initialHeight));
      final scroll = tester.state<ScrollableState>(
        find.descendant(
          of: find.byType(EditableText),
          matching: find.byType(Scrollable),
        ),
      );
      expect(scroll.position.maxScrollExtent, greaterThan(0));
      expect(
        scroll.position.pixels,
        greaterThan(0),
        reason: 'caret scrolled into view',
      );
      await edit(tester, '$message\nlast line');
      await tester.pumpAndSettle();
      expect(tester.getSize(find.byType(TextField)).height, ceiling);
      expectSession(tester);
    },
  );
  testWidgets(
    'prediction replaces a selected middle word without losing suffix or caret',
    (tester) async {
      await mount(tester, RefractionComposer(onSubmit: (_) {}));
      await edit(tester, 'Send congr to Alex');
      await edit(
        tester,
        'Send congr to Alex',
        selection: const TextSelection(baseOffset: 5, extentOffset: 10),
      );
      await edit(
        tester,
        'Send congratulations to Alex',
        selection: const TextSelection.collapsed(offset: 20),
      );
      expectSession(tester);
      await edit(
        tester,
        'Send congratulations! to Alex',
        selection: const TextSelection.collapsed(offset: 21),
      );
      expect(text(tester).text, 'Send congratulations! to Alex');
      expect(text(tester).selection.extentOffset, 21);
      expectSession(tester);
    },
  );
  testWidgets(
    'backward selection keeps its anchor through core synchronization',
    (tester) async {
      await mount(tester, RefractionComposer(onSubmit: (_) {}));
      await edit(tester, 'Send congr');
      for (var extent = 9; extent >= 5; extent--) {
        final selection = TextSelection(baseOffset: 10, extentOffset: extent);
        await edit(tester, 'Send congr', selection: selection);
        expect(text(tester).selection, selection);
      }
      await edit(tester, 'Send congratulations');
      expect(text(tester).text, 'Send congratulations');
      expectSession(tester);
    },
  );
  testWidgets('same-length autocorrect preserves a following selection', (
    tester,
  ) async {
    await mount(tester, RefractionComposer(onSubmit: (_) {}));
    await edit(tester, 'teh next');
    await edit(
      tester,
      'the next',
      selection: const TextSelection(baseOffset: 4, extentOffset: 8),
    );
    expect(
      text(tester).selection,
      const TextSelection(baseOffset: 4, extentOffset: 8),
    );
    await edit(tester, 'the replacement');
    expect(text(tester).text, 'the replacement');
    expectSession(tester);
  });
  testWidgets(
    'IME owns preedit beyond limit; commit clamps graphemes and can continue',
    (tester) async {
      final controller = RefractionComposerController(maxLength: 3);
      addTearDown(controller.dispose);
      final sent = <ComposerSubmission>[];
      await mount(
        tester,
        RefractionComposer(
          controller: controller,
          submitOnEnter: true,
          onSubmit: sent.add,
        ),
      );
      await edit(tester, '你好世界', composing: const TextRange(start: 0, end: 4));
      expect(
        text(tester).text,
        '你好世界',
        reason: 'active preedit must not be truncated',
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(sent, isEmpty);
      await edit(tester, '你好世界');
      expect(text(tester).text, '你好世');
      expect(text(tester).value.composing, TextRange.empty);
      expectSession(tester);
      await edit(tester, '你好');
      await edit(tester, '你好🙂');
      expect(controller.state.value, '你好🙂');
      expectSession(tester);
    },
  );
  testWidgets(
    'bulk paste and selection deletion leave a connected empty editor',
    (tester) async {
      await mount(tester, RefractionComposer(onSubmit: (_) {}));
      final pasted = List.filled(12, 'pasted 👨‍👩‍👧‍👦 line').join('\n');
      await edit(tester, pasted);
      await edit(
        tester,
        pasted,
        selection: TextSelection(baseOffset: 0, extentOffset: pasted.length),
      );
      await edit(tester, '');
      await tester.pumpAndSettle();
      expectSession(tester);
      await edit(tester, 'new draft');
      expect(text(tester).text, 'new draft');
      expectSession(tester);
    },
  );
  testWidgets(
    'accessibility text scaling preserves selected draft and session',
    (tester) async {
      final controller = RefractionComposerController();
      addTearDown(controller.dispose);
      Widget build(double scale) => app(
        MediaQuery(
          data: MediaQueryData(
            size: const Size(390, 640),
            textScaler: TextScaler.linear(scale),
          ),
          child: RefractionComposer(controller: controller, onSubmit: (_) {}),
        ),
      );
      await tester.pumpWidget(build(1));
      await tester.tap(find.byType(TextField));
      await tester.pump();
      await edit(
        tester,
        'a selected draft',
        selection: const TextSelection(baseOffset: 2, extentOffset: 10),
      );
      for (final scale in [2.0, 3.0, 1.0]) {
        await tester.pumpWidget(build(scale));
        await tester.pumpAndSettle();
        expect(text(tester).text, 'a selected draft');
        expect(
          text(tester).selection,
          const TextSelection(baseOffset: 2, extentOffset: 10),
        );
        expectSession(tester);
      }
    },
  );
  testWidgets(
    'emoji accessory replaces selection and typing resumes on one tap',
    (tester) async {
      final controller = RefractionComposerController();
      addTearDown(controller.dispose);
      await mount(
        tester,
        RefractionComposer(
          controller: controller,
          onSubmit: (_) {},
          accessoryPanelHeight: 120,
          accessoryPanelBuilder: (_) => Center(
            child: TextButton(
              onPressed: () => controller.insertTextAtCursor('👨‍👩‍👧‍👦'),
              child: const Text('Insert family'),
            ),
          ),
        ),
      );
      await edit(
        tester,
        'hello old friend',
        selection: const TextSelection(baseOffset: 6, extentOffset: 9),
      );
      controller.openAccessoryPanel();
      await tester.pumpAndSettle();
      expect(
        tester.widget<TextField>(find.byType(TextField)).focusNode!.hasFocus,
        isFalse,
      );
      await tester.tap(find.text('Insert family'));
      await tester.pump();
      expect(text(tester).text, 'hello 👨‍👩‍👧‍👦 friend');
      await tester.tap(find.byType(TextField));
      await tester.pumpAndSettle();
      expect(controller.isAccessoryPanelOpen, isFalse);
      expectSession(tester);
    },
  );
  testWidgets('IME mention preedit opens suggestions only after commit', (
    tester,
  ) async {
    final controller = RefractionComposerController(
      triggers: [
        ComposerTrigger(
          id: 'mention',
          symbol: '@',
          resolve: (_) => const [ComposerCandidate(id: 'one', display: '李雷')],
        ),
      ],
    );
    addTearDown(controller.dispose);
    final sent = <ComposerSubmission>[];
    await mount(
      tester,
      RefractionComposer(
        controller: controller,
        submitOnEnter: true,
        onSubmit: sent.add,
      ),
    );
    await edit(tester, '@李', composing: const TextRange(start: 1, end: 2));
    expect(controller.state.suggestion.isOpen, isFalse);
    await edit(tester, '@李');
    await tester.pumpAndSettle();
    expect(find.text('李雷'), findsOneWidget);
    await tester.tap(find.text('李雷'));
    await tester.pumpAndSettle();
    expect(controller.tokens.single.id, 'one');
    expect(text(tester).text, '@李雷');
    expect(sent, isEmpty);
    expectSession(tester);
  });
  testWidgets('late suggestion after unmount cannot resurrect overlay', (
    tester,
  ) async {
    final pending = Completer<List<ComposerCandidate>>();
    final controller = RefractionComposerController(
      triggers: [
        ComposerTrigger(
          id: 'mention',
          symbol: '@',
          debounce: Duration.zero,
          resolve: (_) => pending.future,
        ),
      ],
    );
    addTearDown(controller.dispose);
    await mount(
      tester,
      RefractionComposer(controller: controller, onSubmit: (_) {}),
    );
    await edit(tester, '@a');
    await tester.pump(const Duration(milliseconds: 150));
    await tester.pumpWidget(app(const SizedBox()));
    pending.complete(const [ComposerCandidate(id: 'a', display: 'Alex')]);
    await tester.pumpAndSettle();
    expect(find.text('Alex'), findsNothing);
    expect(tester.testTextInput.hasAnyClients, isFalse);
    expect(tester.takeException(), isNull);
  });
  testWidgets(
    'conversation controller swap routes edits and isolates saved drafts',
    (tester) async {
      final store = ComposerInMemoryDraftStore();
      final first = RefractionComposerController(
        draftStore: store,
        draftKey: 'one',
      );
      final second = RefractionComposerController(
        initialValue: 'second draft',
        draftStore: store,
        draftKey: 'two',
      );
      addTearDown(first.dispose);
      addTearDown(second.dispose);
      await mount(
        tester,
        RefractionComposer(controller: first, onSubmit: (_) {}),
      );
      await edit(tester, 'first draft');
      first.flushDraft();
      await tester.pumpWidget(
        app(RefractionComposer(controller: second, onSubmit: (_) {})),
      );
      await tester.pumpAndSettle();
      expect(text(tester).text, 'second draft');
      await edit(tester, 'second draft updated');
      second.flushDraft();
      expect(first.state.value, 'first draft');
      expect(store.read('one')!.value, 'first draft');
      expect(store.read('two')!.value, 'second draft updated');
      expectSession(tester);
    },
  );
  testWidgets('edit cancel and submit restore the existing unsent draft', (
    tester,
  ) async {
    final controller = RefractionComposerController();
    addTearDown(controller.dispose);
    final sent = <ComposerSubmission>[];
    await mount(
      tester,
      RefractionComposer(
        controller: controller,
        submitOnEnter: true,
        onSubmit: sent.add,
      ),
    );
    await edit(tester, 'unsent 🙂 draft');
    controller.beginEdit(value: 'old message', messageId: 'message-one');
    await tester.pumpAndSettle();
    await edit(tester, 'canceled change');
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pumpAndSettle();
    expect(text(tester).text, 'unsent 🙂 draft');
    expect(sent, isEmpty);
    controller.beginEdit(value: 'old message', messageId: 'message-one');
    await tester.pumpAndSettle();
    await edit(tester, 'updated message');
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    expect(sent.single.editingMessageId, 'message-one');
    expect(sent.single.plainText, 'updated message');
    expect(text(tester).text, 'unsent 🙂 draft');
    expectSession(tester);
  });
  testWidgets(
    'busy and validation failure retain draft before successful send',
    (tester) async {
      final controller = RefractionComposerController();
      addTearDown(controller.dispose);
      var valid = false;
      final sent = <ComposerSubmission>[];
      await mount(
        tester,
        RefractionComposer(
          controller: controller,
          submitOnEnter: true,
          onSubmit: sent.add,
          validator: (_, _) => valid
              ? const ComposerValidationResult.valid()
              : const ComposerValidationResult.invalid('Fix this draft'),
        ),
      );
      await edit(tester, 'keep this draft');
      controller.setBusy(true);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(sent, isEmpty);
      expect(text(tester).text, 'keep this draft');
      controller.setBusy(false);
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(find.text('Fix this draft'), findsOneWidget);
      expect(text(tester).text, 'keep this draft');
      valid = true;
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(sent.single.plainText, 'keep this draft');
      expect(text(tester).text, '');
      expectSession(tester);
    },
  );
  for (final direction in TextDirection.values) {
    for (final customLeading in [false, true]) {
      testWidgets(
        'accessibility order across wrap: $direction custom=$customLeading',
        (tester) async {
          final semantics = tester.ensureSemantics();

          await tester.binding.setSurfaceSize(const Size(390, 640));
          addTearDown(() => tester.binding.setSurfaceSize(null));
          await tester.pumpWidget(
            app(
              RefractionComposer(
                onSubmit: (_) {},
                onAttachRequested: () {},
                leadingBuilder: customLeading
                    ? (_, _) => IconButton(
                        tooltip: 'Add attachment',
                        onPressed: () {},
                        icon: const Icon(Icons.add),
                      )
                    : null,
                trailingBuilder: (_, _) => IconButton(
                  tooltip: 'Emoji',
                  onPressed: () {},
                  icon: const Icon(Icons.mood),
                ),
              ),
              direction: direction,
            ),
          );
          await tester.tap(find.byType(TextField));
          await tester.pump();
          List<String> labels() {
            final result = <String>[];
            void visit(SemanticsNode node) {
              final name = node.label.isEmpty
                  ? node.getSemanticsData().tooltip
                  : node.label;

              if ([
                'Add attachment',
                'Message input',
                'Emoji',
                'Send message',
              ].contains(name)) {
                result.add(name);
              }
              for (final child in node.debugListChildrenInOrder(
                DebugSemanticsDumpOrder.traversalOrder,
              )) {
                visit(child);
              }
            }

            visit(tester.getSemantics(find.byType(RefractionComposer)));
            return result;
          }

          for (final value in [
            'one',
            List.filled(8, 'wrapping line').join('\n'),
            'x',
          ]) {
            await edit(tester, value);
            await tester.pumpAndSettle();
            expect(labels(), [
              'Add attachment',
              'Message input',
              'Emoji',
              'Send message',
            ]);
            expectSession(tester);
          }
          semantics.dispose();
        },
      );
    }
  }
}
