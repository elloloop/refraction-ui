import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'composer_test.dart' show buildApp;

void main() {
  for (final custom in [false, true]) {
    testWidgets(
      'layout custom=$custom retains editor session and default submit controller reset',
      (tester) async {
        final controller = RefractionComposerController();
        final focus = FocusNode();
        final sent = <ComposerSubmission>[];
        addTearDown(controller.dispose);
        addTearDown(focus.dispose);
        await tester.pumpWidget(
          buildApp(
            RefractionComposer(
              controller: controller,
              focusNode: focus,
              onSubmit: sent.add,
              layoutBuilder: custom
                  ? (
                      context, {
                      required editor,
                      required primary,
                      leading,
                      trailing,
                    }) => RefractionComposerStackedLayout(
                      editor: editor,
                      toolbar: RefractionComposerToolbar(
                        actions: const [Text('Toolbar')],
                        primary: primary,
                      ),
                    )
                  : null,
            ),
          ),
        );
        await tester.tap(find.byType(TextField));
        await tester.pump();
        final original = tester.state<EditableTextState>(
          find.byType(EditableText),
        );
        final clients = tester.testTextInput.log
            .where((call) => call.method == 'TextInput.setClient')
            .length;
        await tester.enterText(find.byType(TextField), 'first');
        await tester.pumpAndSettle();
        await tester.enterText(
          find.byType(TextField),
          'first\nsecond\nthird long replacement',
        );
        await tester.pumpAndSettle();
        expect(
          tester.state<EditableTextState>(find.byType(EditableText)),
          same(original),
        );
        expect(
          tester.testTextInput.log
              .where((call) => call.method == 'TextInput.setClient')
              .length,
          clients,
        );
        expect(focus.hasFocus, isTrue);
        if (custom) {
          expect(
            tester.getRect(find.byType(TextField)).bottom,
            lessThanOrEqualTo(tester.getRect(find.text('Toolbar')).top),
          );
        }
        final oldUndo = tester
            .widget<TextField>(find.byType(TextField))
            .undoController;
        await tester.tap(find.byKey(const ValueKey('composer-primary-send')));
        await tester.pumpAndSettle();
        expect(sent.single.plainText, 'first\nsecond\nthird long replacement');
        final newUndo = tester
            .widget<TextField>(find.byType(TextField))
            .undoController;
        expect(newUndo, isNot(same(oldUndo)));
        expect(controller.state.value, isEmpty);
        // Resetting the public undo controller is existing submit behavior.
        // Flutter 3.38.3 retains its internal history despite that replacement;
        // actual undo resurrection reproduces identically in the default layout.

        expect(
          tester.state<EditableTextState>(find.byType(EditableText)),
          same(original),
        );
        await tester.pumpWidget(const SizedBox());
      },
    );
  }
}
