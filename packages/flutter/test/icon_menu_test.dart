import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'composer_test.dart' show buildApp;

void main() {
  testWidgets('toolbar wraps actions without moving the primary action', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildApp(
        SizedBox(
          width: 200,
          child: RefractionComposerToolbar(
            actions: [
              for (var i = 0; i < 3; i++)
                SizedBox(key: ValueKey('action-$i'), width: 80, height: 40),
            ],
            primary: const SizedBox(
              key: ValueKey('primary'),
              width: 40,
              height: 40,
            ),
          ),
        ),
      ),
    );
    final first = tester.getRect(find.byKey(const ValueKey('action-0')));
    final last = tester.getRect(find.byKey(const ValueKey('action-2')));
    final primary = tester.getRect(find.byKey(const ValueKey('primary')));
    expect(last.top, greaterThan(first.top));
    expect(primary.left, greaterThanOrEqualTo(first.right));
    expect(
      primary.right,
      lessThanOrEqualTo(
        tester.getRect(find.byType(RefractionComposerToolbar)).right,
      ),
    );
    expect(tester.takeException(), isNull);
  });

  for (final key in [
    LogicalKeyboardKey.enter,
    LogicalKeyboardKey.numpadEnter,
  ]) {
    testWidgets('editor shortcut ignores a focused host action for $key', (
      tester,
    ) async {
      final controller = RefractionComposerController();
      final actionFocus = FocusNode();
      final sent = <ComposerSubmission>[];
      addTearDown(controller.dispose);
      addTearDown(actionFocus.dispose);
      await tester.pumpWidget(
        buildApp(
          RefractionComposer(
            controller: controller,
            submitOnEnter: true,
            onSubmit: sent.add,
            leadingBuilder: (context, controller) =>
                Focus(focusNode: actionFocus, child: const Text('Host action')),
            layoutBuilder:
                (
                  context, {
                  required editor,
                  required primary,
                  leading,
                  trailing,
                }) => RefractionComposerStackedLayout(
                  editor: editor,
                  toolbar: RefractionComposerToolbar(
                    actions: [leading!],
                    primary: primary,
                  ),
                ),
          ),
        ),
      );
      await tester.enterText(find.byType(TextField), 'Review before sending');
      actionFocus.requestFocus();
      await tester.pump();
      expect(actionFocus.hasFocus, isTrue);
      await tester.sendKeyEvent(key);
      await tester.pump();
      expect(sent, isEmpty);
      expect(controller.state.value, 'Review before sending');
    });
  }

  for (final key in [
    LogicalKeyboardKey.enter,
    LogicalKeyboardKey.numpadEnter,
  ]) {
    for (final language in [false, true]) {
      testWidgets('toolbar action keeps draft for $key language=$language', (
        tester,
      ) async {
        final controller = RefractionComposerController();
        final editorFocus = FocusNode();
        final sent = <ComposerSubmission>[];
        var starts = 0;
        addTearDown(controller.dispose);
        addTearDown(editorFocus.dispose);
        await tester.pumpWidget(
          buildApp(
            SizedBox(
              width: 320,
              child: RefractionComposer(
                controller: controller,
                focusNode: editorFocus,
                submitOnEnter: true,
                onSubmit: sent.add,
                leadingBuilder: (context, controller) => RefractionButton(
                  size: RefractionButtonSize.icon,
                  semanticLabel: 'Dictate',
                  onPressed: () => starts++,
                  child: const Icon(Icons.mic_none),
                ),
                trailingBuilder: (context, controller) =>
                    RefractionDropdownMenu(
                      triggerBuilder: (context, toggle) => RefractionButton(
                        size: RefractionButtonSize.icon,
                        semanticLabel: 'Dictation language',
                        onPressed: toggle,
                        child: const Icon(Icons.keyboard_arrow_down),
                      ),
                      items: [
                        RefractionDropdownItem(
                          label: 'English',
                          onSelected: () {},
                        ),
                      ],
                    ),
                layoutBuilder:
                    (
                      context, {
                      required editor,
                      required primary,
                      leading,
                      trailing,
                    }) => RefractionComposerStackedLayout(
                      editor: editor,
                      toolbar: RefractionComposerToolbar(
                        actions: [leading!, trailing!],
                        primary: primary,
                      ),
                    ),
              ),
            ),
          ),
        );
        await tester.enterText(find.byType(TextField), 'Review before sending');
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        if (language) await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pumpAndSettle();
        expect(editorFocus.hasFocus, isFalse);
        await tester.sendKeyEvent(key);
        await tester.pumpAndSettle();
        expect(sent, isEmpty);
        expect(controller.state.value, 'Review before sending');
        expect(starts, language ? 0 : 1);
        if (language) expect(find.text('English'), findsOneWidget);
      });
    }
  }

  testWidgets('icon actions stay square and share the toolbar row', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildApp(
        SizedBox(
          width: 320,
          child: RefractionComposerToolbar(
            actions: [
              RefractionButton(
                size: RefractionButtonSize.icon,
                semanticLabel: 'Dictate',
                onPressed: () {},
                child: const Icon(Icons.mic_none),
              ),
              RefractionDropdownMenu(
                triggerBuilder: (context, toggle) => RefractionButton(
                  size: RefractionButtonSize.icon,
                  semanticLabel: 'Dictation language',
                  onPressed: toggle,
                  child: const Icon(Icons.keyboard_arrow_down),
                ),
                items: [
                  RefractionDropdownItem(label: 'English', onSelected: () {}),
                ],
              ),
            ],
            primary: RefractionButton(
              size: RefractionButtonSize.icon,
              semanticLabel: 'Send',
              onPressed: () {},
              child: const Icon(Icons.send),
            ),
          ),
        ),
      ),
    );
    final mic = tester.getRect(find.bySemanticsLabel('Dictate'));
    final language = tester.getRect(
      find.bySemanticsLabel('Dictation language'),
    );
    expect(mic.width, mic.height);
    expect(language.width, language.height);
    expect(mic.top, language.top);
    expect(
      tester.getRect(find.bySemanticsLabel('Send')).left,
      greaterThan(language.right),
    );
    expect(tester.takeException(), isNull);
  });

  testWidgets('keyboard reaches icon menu and Enter and Space toggle it', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildApp(
        RefractionDropdownMenu(
          triggerBuilder: (context, toggle) => RefractionButton(
            size: RefractionButtonSize.icon,
            semanticLabel: 'Dictation language',
            onPressed: toggle,
            child: const Icon(Icons.keyboard_arrow_down),
          ),
          items: [RefractionDropdownItem(label: 'English', onSelected: () {})],
        ),
      ),
    );
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    expect(find.text('English'), findsOneWidget);
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.pumpAndSettle();
    expect(find.text('English'), findsNothing);
  });

  for (final loading in [false, true]) {
    testWidgets(
      'disabled or loading icon action cannot activate by keyboard ($loading)',
      (tester) async {
        var calls = 0;
        await tester.pumpWidget(
          buildApp(
            RefractionButton(
              onPressed: loading ? () => calls++ : null,
              isLoading: loading,
              semanticLabel: 'Dictate',
              size: RefractionButtonSize.icon,
              child: const Icon(Icons.mic_none),
            ),
          ),
        );
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.sendKeyEvent(LogicalKeyboardKey.enter);
        await tester.sendKeyEvent(LogicalKeyboardKey.space);
        await tester.pump();
        expect(calls, 0);
      },
    );
  }

  testWidgets(
    'icon action and adjacent language menu are separate accessible actions',
    (tester) async {
      var starts = 0;
      String? selected;
      await tester.pumpWidget(
        buildApp(
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              RefractionButton(
                size: RefractionButtonSize.icon,
                semanticLabel: 'Dictate',
                onPressed: () => starts++,
                child: const Icon(Icons.mic_none),
              ),
              RefractionDropdownMenu(
                triggerBuilder: (context, toggle) => RefractionButton(
                  size: RefractionButtonSize.icon,
                  semanticLabel: 'Dictation language',
                  onPressed: toggle,
                  child: const Icon(Icons.keyboard_arrow_down),
                ),
                items: [
                  for (final label in ['Auto', 'English', 'Telugu'])
                    RefractionDropdownItem(
                      label: label,
                      onSelected: () => selected = label,
                    ),
                ],
              ),
            ],
          ),
        ),
      );
      expect(find.text('Dictate'), findsNothing);
      expect(find.text('English'), findsNothing);
      await tester.tap(find.bySemanticsLabel('Dictate'));
      expect(starts, 1);
      expect(find.text('English'), findsNothing);
      await tester.tap(find.bySemanticsLabel('Dictation language'));
      await tester.pumpAndSettle();
      expect(find.text('English'), findsOneWidget);
      expect(starts, 1);
      await tester.tap(find.text('Telugu'));
      await tester.pumpAndSettle();
      expect(selected, 'Telugu');
      expect(find.text('English'), findsNothing);
      await tester.tap(find.bySemanticsLabel('Dictation language'));
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Dictation language'));
      await tester.pumpAndSettle();
      expect(find.text('English'), findsNothing);
    },
  );

  testWidgets('legacy dropdown trigger still opens and selects', (
    tester,
  ) async {
    var selected = false;
    await tester.pumpWidget(
      buildApp(
        RefractionDropdownMenu(
          trigger: const Text('Choose'),
          items: [
            RefractionDropdownItem(
              label: 'Option',
              onSelected: () => selected = true,
            ),
          ],
        ),
      ),
    );
    await tester.tap(find.text('Choose'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Option'));
    await tester.pumpAndSettle();
    expect(selected, isTrue);
  });

  testWidgets('disabled icon action does not fire and keeps accessible name', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildApp(
        const RefractionButton(
          size: RefractionButtonSize.icon,
          semanticLabel: 'Dictate',
          onPressed: null,
          child: Icon(Icons.mic_none),
        ),
      ),
    );
    expect(find.bySemanticsLabel('Dictate'), findsOneWidget);
    await tester.tap(find.bySemanticsLabel('Dictate'));
    expect(tester.takeException(), isNull);
  });
}
