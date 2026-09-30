import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'composer_interaction_test.dart'
    show app, mount, text, edit, expectSession;

void main() {
  final image = ComposerClipboardImage(
    name: 'clipboard-1.png',
    contentType: 'image/png',
    bytes: Uint8List.fromList([1, 2, 3]),
  );
  Future<void> paste(WidgetTester tester) async {
    final editor = tester.state<EditableTextState>(find.byType(EditableText));
    Actions.invoke(
      editor.context,
      const PasteTextIntent(SelectionChangedCause.keyboard),
    );
    await tester.pump();
  }

  testWidgets(
    'image paste stages once, preserves selected draft and input client',
    (tester) async {
      final staged = <ComposerClipboardImage>[];
      var sends = 0;
      final controller = RefractionComposerController();
      await mount(
        tester,
        RefractionComposer(
          controller: controller,
          onSubmit: (_) => sends++,
          onImagesPasted: staged.addAll,
          clipboardReader: () async => ComposerClipboardPaste(images: [image]),
        ),
      );
      await edit(
        tester,
        'before 🙂 after',
        selection: const TextSelection(baseOffset: 7, extentOffset: 9),
      );
      final value = text(tester).value;
      await paste(tester);
      expect(staged, [image]);
      expect(text(tester).value, value);
      expect(sends, 0);
      expectSession(tester);
    },
  );

  testWidgets(
    'mixed paste replaces selection through editor and supports undo',
    (tester) async {
      final staged = <ComposerClipboardImage>[];
      await mount(
        tester,
        RefractionComposer(
          onImagesPasted: staged.addAll,
          clipboardReader: () async =>
              ComposerClipboardPaste(text: '👨‍👩‍👧‍👦', images: [image]),
        ),
      );
      await edit(
        tester,
        'before word after',
        selection: const TextSelection(baseOffset: 11, extentOffset: 7),
      );
      await paste(tester);
      expect(text(tester).text, 'before 👨‍👩‍👧‍👦 after');
      expect(staged, [image]);
      expectSession(tester);
    },
  );

  testWidgets('late clipboard read cannot overwrite further typing', (
    tester,
  ) async {
    final pending = Completer<ComposerClipboardPaste>();
    final staged = <ComposerClipboardImage>[];
    await mount(
      tester,
      RefractionComposer(
        onImagesPasted: staged.addAll,
        clipboardReader: () => pending.future,
      ),
    );
    await edit(tester, 'draft');
    await paste(tester);
    await edit(tester, 'draft continued');
    pending.complete(ComposerClipboardPaste(text: 'old', images: [image]));
    await tester.pump();
    expect(text(tester).text, 'draft continued');
    expect(staged, isEmpty);
  });

  testWidgets('read failure reports error while retaining draft', (
    tester,
  ) async {
    final errors = <Object>[];
    await mount(
      tester,
      RefractionComposer(
        onImagesPasted: (_) {},
        onPasteError: errors.add,
        clipboardReader: () async => throw StateError('permission denied'),
      ),
    );
    await edit(tester, 'draft');
    await paste(tester);
    expect(errors, hasLength(1));
    expect(text(tester).text, 'draft');
    expectSession(tester);
  });

  testWidgets('unmount drops a pending read without callback', (tester) async {
    final pending = Completer<ComposerClipboardPaste>();
    final staged = <ComposerClipboardImage>[];
    await mount(
      tester,
      RefractionComposer(
        onImagesPasted: staged.addAll,
        clipboardReader: () => pending.future,
      ),
    );
    await paste(tester);
    await tester.pumpWidget(app(const SizedBox()));
    pending.complete(ComposerClipboardPaste(images: [image]));
    await tester.pump();
    expect(staged, isEmpty);
    expect(tester.takeException(), isNull);
  });
  testWidgets('controller replacement drops read from previous conversation', (
    tester,
  ) async {
    final old = RefractionComposerController();
    final next = RefractionComposerController();
    final pending = Completer<ComposerClipboardPaste>();
    final staged = <ComposerClipboardImage>[];
    await mount(
      tester,
      RefractionComposer(
        controller: old,
        onImagesPasted: staged.addAll,
        clipboardReader: () => pending.future,
      ),
    );
    await paste(tester);
    await tester.pumpWidget(
      app(RefractionComposer(controller: next, onImagesPasted: staged.addAll)),
    );
    pending.complete(
      ComposerClipboardPaste(text: 'old draft', images: [image]),
    );
    await tester.pump();
    expect(next.state.value, isEmpty);
    expect(staged, isEmpty);
    expect(tester.takeException(), isNull);
  });

  testWidgets('native context Paste is offered for image-only clipboard', (
    tester,
  ) async {
    final staged = <ComposerClipboardImage>[];
    await mount(
      tester,
      RefractionComposer(
        onImagesPasted: staged.addAll,
        clipboardReader: () async => ComposerClipboardPaste(images: [image]),
      ),
    );
    await edit(tester, 'draft');
    final editor = tester.state<EditableTextState>(find.byType(EditableText));
    editor.showToolbar();
    await tester.pumpAndSettle();
    expect(find.text('Paste'), findsOneWidget);
    await tester.tap(find.text('Paste'));
    await tester.pumpAndSettle();
    expect(staged, [image]);
    expect(text(tester).text, 'draft');
    expectSession(tester);
  });
}
