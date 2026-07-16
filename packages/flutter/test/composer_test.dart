// Widget tests for RefractionComposer — section J of the composer test
// plan (J1–J23) plus the validator seam (B12).
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget buildApp(
  Widget child, {
  TextDirection textDirection = TextDirection.ltr,
  MediaQueryData Function(MediaQueryData base)? mediaQuery,
}) {
  return MaterialApp(
    home: RefractionTheme(
      data: RefractionThemeData.light(),
      child: Scaffold(
        body: Builder(
          builder: (context) {
            Widget wrapped = Directionality(
              textDirection: textDirection,
              child: Align(alignment: Alignment.topCenter, child: child),
            );
            if (mediaQuery != null) {
              wrapped = MediaQuery(
                data: mediaQuery(MediaQuery.of(context)),
                child: wrapped,
              );
            }
            return wrapped;
          },
        ),
      ),
    ),
  );
}

RefractionComposerController mentionController({
  ComposerDraftStore? draftStore,
  String? draftKey,
  int? maxLength,
}) {
  return RefractionComposerController(
    draftStore: draftStore,
    draftKey: draftKey,
    maxLength: maxLength,
    triggers: [
      ComposerTrigger(
        id: 'mention',
        symbol: '@',
        resolve: (query) => [
          for (final c in const [
            ComposerCandidate(id: 'u_jordan', display: 'Jordan Lee'),
            ComposerCandidate(id: 'u_alex', display: 'Alex Kim'),
            ComposerCandidate(id: 'u_sam', display: 'Sam Field'),
          ])
            if (c.display.toLowerCase().startsWith(query.toLowerCase())) c,
        ],
      ),
    ],
  );
}

Future<void> focusField(WidgetTester tester) async {
  await tester.tap(find.byType(TextField));
  await tester.pump();
}

void main() {
  testWidgets('J1 field exposes textField semantics with a label distinct '
      'from the placeholder', (tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(buildApp(RefractionComposer(onSubmit: (_) {})));
    final node = tester.getSemantics(find.byType(TextField));
    expect(node, containsSemantics(isTextField: true));
    expect(node.label, contains('Message input'));
    expect(node.label, isNot(equals('Message')));
    expect(find.text('Message'), findsOneWidget, reason: 'placeholder shown');
    handle.dispose();
  });

  testWidgets('J2 hardware Enter sends when not composing; Shift+Enter and '
      'composing never submit', (tester) async {
    final submissions = <ComposerSubmission>[];
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(submitOnEnter: true, onSubmit: submissions.add),
      ),
    );
    await focusField(tester);
    await tester.enterText(find.byType(TextField), 'hello');
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(submissions, hasLength(1));
    expect(submissions.single.plainText, 'hello');
    expect(
      tester.widget<TextField>(find.byType(TextField)).controller!.text,
      '',
    );

    // Shift+Enter: never submits.
    await tester.enterText(find.byType(TextField), 'draft');
    await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
    await tester.pump();
    expect(submissions, hasLength(1));
    final controller = tester
        .widget<TextField>(find.byType(TextField))
        .controller!;
    expect(controller.text, contains('draft'));

    // IME composing guard: Enter confirms the candidate, never submits.
    controller.value = const TextEditingValue(
      text: 'draft你好',
      selection: TextSelection.collapsed(offset: 7),
      composing: TextRange(start: 5, end: 7),
    );
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(submissions, hasLength(1), reason: 'composing always wins');
  });

  testWidgets('J3 textInputAction is newline; tapping send submits, clears, '
      'and keeps focus', (tester) async {
    final submissions = <ComposerSubmission>[];
    await tester.pumpWidget(
      buildApp(RefractionComposer(onSubmit: submissions.add)),
    );
    expect(
      tester.widget<TextField>(find.byType(TextField)).textInputAction,
      TextInputAction.newline,
    );
    await focusField(tester);
    await tester.enterText(find.byType(TextField), 'tap send');
    await tester.pump();
    await tester.tap(find.byIcon(Icons.send_rounded));
    await tester.pump();
    expect(submissions.single.plainText, 'tap send');
    final field = tester.widget<TextField>(find.byType(TextField));
    expect(field.controller!.text, '');
    expect(field.focusNode!.hasFocus, isTrue, reason: 'focus stays in field');
  });

  testWidgets('J4 @ opens the overlay; arrows move the highlight; Enter '
      'commits without submitting', (tester) async {
    final submissions = <ComposerSubmission>[];
    final controller = mentionController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(
          controller: controller,
          submitOnEnter: true,
          onSubmit: submissions.add,
        ),
      ),
    );
    await focusField(tester);
    await tester.enterText(find.byType(TextField), '@');
    await tester.pump();
    expect(find.byType(CompositedTransformFollower), findsWidgets);
    expect(find.text('Jordan Lee'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pump();
    expect(controller.state.suggestion.activeIndex, 1);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(controller.state.value, '@Alex Kim');
    expect(controller.state.tokens.single.id, 'u_alex');
    expect(controller.state.suggestion.isOpen, isFalse);
    expect(find.text('Jordan Lee'), findsNothing, reason: 'overlay closed');
    expect(submissions, isEmpty, reason: 'Enter committed, never submitted');
  });

  testWidgets('J5 committed token renders a styled span; backspace removes '
      'the whole display', (tester) async {
    final controller = mentionController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      buildApp(RefractionComposer(controller: controller, onSubmit: (_) {})),
    );
    await focusField(tester);
    await tester.enterText(find.byType(TextField), '@Jor');
    await tester.pump();
    controller.applySuggestion(0);
    await tester.pump();
    expect(controller.state.value, '@Jordan Lee');

    final editable = tester.widget<EditableText>(find.byType(EditableText));
    final span = editable.controller.buildTextSpan(
      context: tester.element(find.byType(EditableText)),
      style: const TextStyle(),
      withComposing: false,
    );
    final styledRuns = <String>[];
    span.visitChildren((child) {
      final text = (child as TextSpan).text;
      if (text != null && child.style?.background != null) {
        styledRuns.add(text);
      }
      return true;
    });
    expect(styledRuns, [
      '@Jordan Lee',
    ], reason: 'the token run carries the background paint');

    await tester.sendKeyEvent(LogicalKeyboardKey.backspace);
    await tester.pump();
    expect(controller.state.value, '', reason: 'atomic whole-token delete');
  });

  testWidgets('J6 auto-grow is monotonic, freezes at the ceiling, and a '
      'large paste snaps without animation', (tester) async {
    await tester.pumpWidget(buildApp(RefractionComposer(onSubmit: (_) {})));
    await focusField(tester);

    Future<double> heightAfter(String text, {bool settle = true}) async {
      await tester.enterText(find.byType(TextField), text);
      if (settle) {
        await tester.pumpAndSettle();
      } else {
        await tester.pump();
      }
      return tester.getSize(find.byType(TextField)).height;
    }

    final h1 = await heightAfter('one');
    final h2 = await heightAfter('one\ntwo');
    final h5 = await heightAfter('one\ntwo\nthree\nfour\nfive');
    final h7 = await heightAfter('1\n2\n3\n4\n5\n6\n7');
    expect(h2, greaterThan(h1));
    expect(h5, greaterThan(h2));
    expect(h7, h5, reason: 'frozen at the maxLines ceiling');

    // Large paste snaps: a single pump already shows the final height.
    await tester.enterText(find.byType(TextField), '');
    await tester.pumpAndSettle();
    final snapped = await heightAfter('a\nb\nc\nd\ne', settle: false);
    expect(snapped, h5, reason: 'non-incremental change bypasses animation');
  });

  testWidgets('J7 pixel ceiling respects the 40% viewport cap at '
      'textScaleFactor 3.0', (tester) async {
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(onSubmit: (_) {}),
        mediaQuery: (base) =>
            base.copyWith(textScaler: const TextScaler.linear(3.0)),
      ),
    );
    await focusField(tester);
    await tester.enterText(
      find.byType(TextField),
      List.generate(12, (i) => 'line $i').join('\n'),
    );
    await tester.pumpAndSettle();
    final viewportHeight = tester.getSize(find.byType(Scaffold)).height;
    expect(
      tester.getSize(find.byType(TextField)).height,
      lessThanOrEqualTo(viewportHeight * 0.4),
    );
  });

  testWidgets('J8 alignment invariant: slot centers keep a constant offset '
      'from the field bottom at 1/2/5 lines', (tester) async {
    await tester.pumpWidget(
      buildApp(RefractionComposer(onSubmit: (_) {}, onAttachRequested: () {})),
    );
    await focusField(tester);

    Future<List<double>> offsetsFor(String text) async {
      await tester.enterText(find.byType(TextField), text);
      await tester.pumpAndSettle();
      final fieldBottom = tester.getBottomLeft(find.byType(TextField)).dy;
      return [
        fieldBottom - tester.getCenter(find.byIcon(Icons.send_rounded)).dy,
        fieldBottom - tester.getCenter(find.byIcon(Icons.attach_file)).dy,
      ];
    }

    final at1 = await offsetsFor('one');
    final at2 = await offsetsFor('one\ntwo');
    final at5 = await offsetsFor('1\n2\n3\n4\n5');
    for (var slot = 0; slot < 2; slot++) {
      expect((at2[slot] - at1[slot]).abs(), lessThanOrEqualTo(1.0));
      expect((at5[slot] - at1[slot]).abs(), lessThanOrEqualTo(1.0));
    }
  });

  testWidgets('J9 action slots register taps beyond their visual bounds '
      '(hit target > icon slot)', (tester) async {
    final handle = tester.ensureSemantics();
    var attaches = 0;
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(
          onSubmit: (_) {},
          onAttachRequested: () => attaches++,
        ),
      ),
    );
    final slotCenter = tester.getCenter(find.byIcon(Icons.attach_file));
    // 16dp from center is outside the 28dp visual slot (radius 14) but
    // inside the 44dp hit target (radius 22), in the gutter gap where no
    // sibling overlaps.
    await tester.tapAt(slotCenter + const Offset(16, 0));
    await tester.pump();
    expect(attaches, 1);

    final button = tester.widget<IconButton>(
      find.ancestor(
        of: find.byIcon(Icons.attach_file),
        matching: find.byType(IconButton),
      ),
    );
    expect(button.constraints, BoxConstraints.tightFor(width: 44, height: 44));

    // The accessibility tap target (semantics rect) is the full 44dp
    // despite the 28dp layout slot.
    final node = tester.getSemantics(find.bySemanticsLabel('Add attachment'));
    expect(node.rect.width, greaterThanOrEqualTo(44));
    expect(node.rect.height, greaterThanOrEqualTo(44));
    handle.dispose();
  });

  testWidgets('J10 single vertical-padding owner: TextField contentPadding '
      'is zero and only the pill pads vertically', (tester) async {
    await tester.pumpWidget(buildApp(RefractionComposer(onSubmit: (_) {})));
    final field = tester.widget<TextField>(find.byType(TextField));
    expect(field.decoration!.contentPadding, EdgeInsets.zero);
    expect(field.decoration!.isDense, isTrue);

    final paddings = tester.widgetList<Padding>(
      find.ancestor(
        of: find.byType(EditableText),
        matching: find.byType(Padding),
      ),
    );
    // Ignore sub-2dp framework-internal insets (the editable's own 1dp
    // gesture padding); the rhythm rule is about design-token padding.
    final verticalOwners = [
      for (final p in paddings)
        if (p.padding.vertical > 2) p,
    ];
    expect(
      verticalOwners,
      hasLength(1),
      reason: 'exactly one vertical-rhythm source',
    );
    expect(
      verticalOwners.single.padding.vertical,
      16,
      reason: '2 × paddingVertical(8) — the comfortable table',
    );
  });

  testWidgets('J11 disabled shows distinct placeholder and takes no focus; '
      'readOnly stays selectable, not editable', (tester) async {
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(
          disabled: true,
          placeholder: 'Message',
          disabledPlaceholder: 'Replies are off',
          onSubmit: (_) {},
        ),
      ),
    );
    expect(find.text('Replies are off'), findsOneWidget);
    expect(find.text('Message'), findsNothing);
    await tester.tap(find.byType(TextField), warnIfMissed: false);
    await tester.pump();
    expect(
      tester.widget<TextField>(find.byType(TextField)).focusNode!.hasFocus,
      isFalse,
    );

    final controller = mentionController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(
          controller: controller,
          readOnly: true,
          onSubmit: (_) {},
        ),
      ),
    );
    expect(tester.widget<TextField>(find.byType(TextField)).readOnly, isTrue);
    controller.core.setValue(
      'nope',
      selection: const ComposerSelection.collapsed(4),
    );
    expect(controller.state.value, '', reason: 'user path immutable');
    controller.core.setSelection(const ComposerSelection.collapsed(0));
    expect(controller.state.selection.end, 0, reason: 'selection allowed');
  });

  testWidgets('J12 busy: primary slot receives isBusy, stop is tappable, '
      'and double-submit is prevented', (tester) async {
    final contexts = <ComposerPrimaryContext>[];
    final submissions = <ComposerSubmission>[];
    var stops = 0;
    final controller = mentionController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(
          controller: controller,
          submitOnEnter: true,
          onSubmit: submissions.add,
          onStop: () => stops++,
          primaryBuilder: (context, primary) {
            contexts.add(primary);
            return const SizedBox(width: 28, height: 28);
          },
        ),
      ),
    );
    controller.setBusy(true);
    await tester.pump();
    expect(contexts.last.isBusy, isTrue);
    expect(contexts.last.canSend, isFalse);

    await focusField(tester);
    await tester.enterText(find.byType(TextField), 'while busy');
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(submissions, isEmpty, reason: 'no double-submit while busy');

    // Default primary swaps to a stop affordance.
    controller.clear();
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(
          controller: controller,
          onSubmit: submissions.add,
          onStop: () => stops++,
        ),
      ),
    );
    await tester.pump();
    expect(find.byIcon(Icons.stop_rounded), findsOneWidget);
    await tester.tap(find.byIcon(Icons.stop_rounded));
    expect(stops, 1);
  });

  testWidgets('J13 whitespace-only: send disabled; Enter is a silent no-op '
      'leaving the text', (tester) async {
    final submissions = <ComposerSubmission>[];
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(submitOnEnter: true, onSubmit: submissions.add),
      ),
    );
    await focusField(tester);
    await tester.enterText(find.byType(TextField), '   ');
    await tester.pump();
    final sendButton = tester.widget<IconButton>(
      find.ancestor(
        of: find.byIcon(Icons.send_rounded),
        matching: find.byType(IconButton),
      ),
    );
    expect(sendButton.onPressed, isNull, reason: 'send disabled');

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(submissions, isEmpty);
    expect(
      tester.widget<TextField>(find.byType(TextField)).controller!.text,
      '   ',
      reason: 'field not cleared',
    );
  });

  testWidgets('J14 attachment tray chips render with remove buttons; '
      'attachments-only send is enabled', (tester) async {
    final submissions = <ComposerSubmission>[];
    final controller = mentionController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(controller: controller, onSubmit: submissions.add),
      ),
    );
    final id = controller.addAttachment(
      const ComposerAttachment(
        kind: ComposerAttachmentKind.image,
        name: 'photo.png',
      ),
    )!;
    controller.addAttachment(
      const ComposerAttachment(
        kind: ComposerAttachmentKind.file,
        name: 'notes.txt',
      ),
    );
    await tester.pump();
    expect(find.text('photo.png'), findsOneWidget);
    expect(find.text('notes.txt'), findsOneWidget);

    await tester.tap(find.bySemanticsLabel('Remove photo.png'));
    await tester.pump();
    expect(find.text('photo.png'), findsNothing);
    expect(controller.attachments.single.name, 'notes.txt');
    expect(id, isNotEmpty);

    // Attachments-only send.
    expect(controller.state.canSend, isTrue);
    await tester.tap(find.byIcon(Icons.send_rounded));
    await tester.pump();
    expect(submissions.single.plainText, '');
    expect(submissions.single.attachments.single.name, 'notes.txt');
  });

  testWidgets('J15 RTL: leading slot mirrors to the visual right; the send '
      'glyph mirrors, the paperclip does not', (tester) async {
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(onSubmit: (_) {}, onAttachRequested: () {}),
        textDirection: TextDirection.rtl,
      ),
    );
    final attachX = tester.getCenter(find.byIcon(Icons.attach_file)).dx;
    final sendX = tester.getCenter(find.byIcon(Icons.send_rounded)).dx;
    expect(
      attachX,
      greaterThan(sendX),
      reason: 'leading slot relocates to the visual right under RTL',
    );

    expect(Icons.send_rounded.matchTextDirection, isTrue);
    expect(Icons.attach_file.matchTextDirection, isFalse);
    expect(
      find.descendant(
        of: find.byIcon(Icons.send_rounded),
        matching: find.byType(Transform),
      ),
      findsOneWidget,
      reason: 'send glyph flipped via matchTextDirection',
    );
    expect(
      find.descendant(
        of: find.byIcon(Icons.attach_file),
        matching: find.byType(Transform),
      ),
      findsNothing,
    );
  });

  testWidgets('J16 reduced motion: the grow animation is dropped entirely '
      'and the inset padding runs at zero duration', (tester) async {
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(onSubmit: (_) {}),
        mediaQuery: (base) => base.copyWith(disableAnimations: true),
      ),
    );
    expect(
      find.byType(AnimatedSize),
      findsNothing,
      reason: 'reduced motion snaps size changes (no animation at all)',
    );
    expect(
      tester.widget<AnimatedPadding>(find.byType(AnimatedPadding)).duration,
      Duration.zero,
    );

    await tester.pumpWidget(buildApp(RefractionComposer(onSubmit: (_) {})));
    expect(
      find.byType(AnimatedSize),
      findsOneWidget,
      reason: 'normal motion animates growth',
    );
  });

  testWidgets('J17 controller and field state survive a parent rebuild', (
    tester,
  ) async {
    final controller = mentionController();
    addTearDown(controller.dispose);
    Widget wrap(Color color) => buildApp(
      ColoredBox(
        color: color,
        child: RefractionComposer(controller: controller, onSubmit: (_) {}),
      ),
    );
    await tester.pumpWidget(wrap(const Color(0xFFFFFFFF)));
    await focusField(tester);
    await tester.enterText(find.byType(TextField), 'mid-sentence');
    await tester.pump();
    final editableBefore = tester
        .widget<EditableText>(find.byType(EditableText))
        .controller;

    await tester.pumpWidget(wrap(const Color(0xFFEEEEEE)));
    await tester.pump();
    final editableAfter = tester
        .widget<EditableText>(find.byType(EditableText))
        .controller;
    expect(
      identical(editableBefore, editableAfter),
      isTrue,
      reason: 'TextEditingController identity preserved',
    );
    expect(controller.state.value, 'mid-sentence');
    expect(
      tester.widget<TextField>(find.byType(TextField)).focusNode!.hasFocus,
      isTrue,
    );
  });

  testWidgets('J18 controller swap closes an open overlay and leaks nothing', (
    tester,
  ) async {
    final first = mentionController();
    final second = mentionController();
    addTearDown(first.dispose);
    addTearDown(second.dispose);
    await tester.pumpWidget(
      buildApp(RefractionComposer(controller: first, onSubmit: (_) {})),
    );
    await focusField(tester);
    await tester.enterText(find.byType(TextField), '@Jor');
    await tester.pump();
    expect(find.byType(CompositedTransformFollower), findsWidgets);

    await tester.pumpWidget(
      buildApp(RefractionComposer(controller: second, onSubmit: (_) {})),
    );
    await tester.pump();
    expect(
      find.text('Jordan Lee'),
      findsNothing,
      reason: 'swap closed the previous overlay',
    );
    expect(second.state.value, '');

    // Open with the new controller, then unmount: overlay entry removed.
    await tester.enterText(find.byType(TextField), '@Al');
    await tester.pump();
    expect(find.text('Alex Kim'), findsOneWidget);
    await tester.pumpWidget(buildApp(const SizedBox()));
    // OverlayEntry.remove during teardown defers to the next frame.
    await tester.pump();
    expect(find.text('Alex Kim'), findsNothing);
    expect(find.byType(CompositedTransformFollower), findsNothing);
  });

  testWidgets('J19 suggestion options expose selected semantics and the '
      'panel is a live region announcing the count', (tester) async {
    final handle = tester.ensureSemantics();
    final controller = mentionController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      buildApp(RefractionComposer(controller: controller, onSubmit: (_) {})),
    );
    await focusField(tester);
    await tester.enterText(find.byType(TextField), '@');
    await tester.pump();

    expect(find.bySemanticsLabel('Jordan Lee, mention'), findsOneWidget);
    final active = tester.getSemantics(
      find.bySemanticsLabel('Jordan Lee, mention'),
    );
    expect(active, containsSemantics(isSelected: true, isButton: true));
    final other = tester.getSemantics(
      find.bySemanticsLabel('Alex Kim, mention'),
    );
    expect(other, containsSemantics(isSelected: false));

    final panel = tester.getSemantics(
      find.bySemanticsLabel('Suggestions, 3 suggestions'),
    );
    expect(panel, containsSemantics(isLiveRegion: true));
    handle.dispose();
  });

  testWidgets('J20 keyboard-only: Tab commits while the menu is open (no '
      'trap) and moves focus when closed', (tester) async {
    final controller = mentionController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      buildApp(RefractionComposer(controller: controller, onSubmit: (_) {})),
    );
    await focusField(tester);
    await tester.enterText(find.byType(TextField), '@Jor');
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    expect(
      controller.state.value,
      '@Jordan Lee',
      reason: 'Tab commits while open — the menu never traps focus',
    );
    expect(
      tester.widget<TextField>(find.byType(TextField)).focusNode!.hasFocus,
      isTrue,
    );

    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pump();
    expect(
      tester.widget<TextField>(find.byType(TextField)).focusNode!.hasFocus,
      isFalse,
      reason: 'with the menu closed Tab traverses focus normally',
    );
  });

  testWidgets('J21 draft restores on init with an injected store and clears '
      'after send', (tester) async {
    final store = ComposerInMemoryDraftStore();
    store.write(
      'c1',
      ComposerDraft(
        value: 'restored draft',
        tokens: const [],
        updatedAt: DateTime(2026, 1, 1),
      ),
    );
    final controller = mentionController(draftStore: store, draftKey: 'c1');
    addTearDown(controller.dispose);
    final submissions = <ComposerSubmission>[];
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(controller: controller, onSubmit: submissions.add),
      ),
    );
    expect(find.text('restored draft'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.send_rounded));
    await tester.pump();
    expect(submissions.single.plainText, 'restored draft');
    expect(store.read('c1'), isNull, reason: 'draft cleared after send');
  });

  testWidgets('J22 direct-typed :fire: commits the emoji in the field', (
    tester,
  ) async {
    final controller = mentionController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      buildApp(RefractionComposer(controller: controller, onSubmit: (_) {})),
    );
    await focusField(tester);
    await tester.enterText(find.byType(TextField), 'lit :fire');
    await tester.pump();
    await tester.enterText(find.byType(TextField), 'lit :fire:');
    await tester.pump();
    expect(controller.state.value, 'lit 🔥');
    expect(controller.state.tokens.single.type, 'emoji');
    expect(
      tester.widget<TextField>(find.byType(TextField)).controller!.text,
      'lit 🔥',
    );
  });

  testWidgets('J23 ArrowUp on empty fires onEditLastRequested (desktop '
      'modality); beginEdit/Escape-cancel flows work', (tester) async {
    debugDefaultTargetPlatformOverride = TargetPlatform.macOS;
    var editRequests = 0;
    final controller = mentionController();
    addTearDown(controller.dispose);
    final submissions = <ComposerSubmission>[];
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(
          controller: controller,
          onSubmit: submissions.add,
          onEditLastRequested: () => editRequests++,
        ),
      ),
    );
    await focusField(tester);
    await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
    await tester.pump();
    expect(editRequests, 1);

    controller.beginEdit(value: 'old text', messageId: 'm_7');
    await tester.pump();
    expect(find.text('old text'), findsOneWidget);
    expect(controller.state.editingMessageId, 'm_7');

    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pump();
    expect(controller.state.editingMessageId, isNull);
    expect(controller.state.value, '');

    controller.beginEdit(value: 'old text', messageId: 'm_7');
    await tester.pump();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(submissions.single.editingMessageId, 'm_7');

    // Must be restored before the binding's debug-variable check runs
    // (which happens before tearDowns).
    debugDefaultTargetPlatformOverride = null;
  });

  testWidgets('B12 validator: an invalid result blocks submit and surfaces '
      'its reason; valid passes', (tester) async {
    final submissions = <ComposerSubmission>[];
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(
          submitOnEnter: true,
          onSubmit: submissions.add,
          validator: (text, tokens) => text.contains('forbidden')
              ? const ComposerValidationResult.invalid('Contains a bad word')
              : const ComposerValidationResult.valid(),
        ),
      ),
    );
    await focusField(tester);
    await tester.enterText(find.byType(TextField), 'very forbidden');
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(submissions, isEmpty);
    expect(
      find.text('Contains a bad word'),
      findsOneWidget,
      reason: 'reason surfaced in the error banner',
    );

    await tester.enterText(find.byType(TextField), 'all good');
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pump();
    expect(submissions.single.plainText, 'all good');
  });

  testWidgets('paste over the limit clamps grapheme-safely and shows the '
      'trimmed notice, which auto-hides', (tester) async {
    final controller = mentionController(maxLength: 10);
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      buildApp(RefractionComposer(controller: controller, onSubmit: (_) {})),
    );
    await focusField(tester);
    await tester.enterText(
      find.byType(TextField),
      'abcdefgh👨‍👩‍👧‍👦xxxxxxxx',
    );
    await tester.pump();
    expect(
      controller.state.value,
      'abcdefgh👨‍👩‍👧‍👦x',
      reason: '10 graphemes, ZWJ family kept whole',
    );
    expect(find.text('Pasted text was trimmed to fit'), findsOneWidget);
    await tester.pump(const Duration(seconds: 5));
    expect(find.text('Pasted text was trimmed to fit'), findsNothing);
  });

  // -- #432 Gap 2: external FocusNode -------------------------------------

  testWidgets('external FocusNode drives the field and is not disposed by the '
      'composer', (tester) async {
    final external = FocusNode();
    addTearDown(external.dispose);
    await tester.pumpWidget(
      buildApp(RefractionComposer(focusNode: external, onSubmit: (_) {})),
    );
    final field = tester.widget<TextField>(find.byType(TextField));
    expect(field.focusNode, same(external), reason: 'field uses the host node');

    expect(external.hasFocus, isFalse);
    external.requestFocus();
    await tester.pump();
    expect(external.hasFocus, isTrue);
    external.unfocus();
    await tester.pump();
    expect(external.hasFocus, isFalse);
    // If the composer had disposed `external`, the teardown dispose would
    // throw — its absence proves the host retains ownership.
  });

  // -- #432 Gap 3: accessory panel ----------------------------------------

  testWidgets('accessory panel opens below the pill, dismisses the keyboard, '
      'keeps the field visible, and closes on field focus', (tester) async {
    final controller = mentionController();
    addTearDown(controller.dispose);
    final focus = FocusNode();
    addTearDown(focus.dispose);
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(
          controller: controller,
          focusNode: focus,
          onSubmit: (_) {},
          accessoryPanelBuilder: (_) => const Text('PANEL-CONTENT'),
        ),
      ),
    );
    expect(find.text('PANEL-CONTENT'), findsNothing);

    focus.requestFocus();
    await tester.pump();
    expect(focus.hasFocus, isTrue);

    controller.openAccessoryPanel();
    await tester.pumpAndSettle();
    expect(controller.isAccessoryPanelOpen, isTrue);
    expect(find.text('PANEL-CONTENT'), findsOneWidget);
    expect(
      focus.hasFocus,
      isFalse,
      reason: 'opening the panel dismisses the soft keyboard',
    );

    // The pill/field stays visible ABOVE the panel.
    expect(find.byType(TextField), findsOneWidget);
    final fieldTop = tester.getTopLeft(find.byType(TextField)).dy;
    final panelTop = tester.getTopLeft(find.text('PANEL-CONTENT')).dy;
    expect(panelTop, greaterThan(fieldTop));

    // Tapping the field to type yields the panel and returns the keyboard.
    focus.requestFocus();
    await tester.pumpAndSettle();
    expect(controller.isAccessoryPanelOpen, isFalse);
    expect(find.text('PANEL-CONTENT'), findsNothing);
  });

  testWidgets('accessory panel height collapses instantly under reduced '
      'motion', (tester) async {
    final controller = mentionController();
    addTearDown(controller.dispose);
    await tester.pumpWidget(
      buildApp(
        RefractionComposer(
          controller: controller,
          onSubmit: (_) {},
          accessoryPanelBuilder: (_) => const Text('PANEL-CONTENT'),
        ),
        mediaQuery: (base) => base.copyWith(disableAnimations: true),
      ),
    );
    controller.openAccessoryPanel();
    // A single frame reaches full interactivity — no AnimatedSize interpolation.
    await tester.pump();
    expect(find.text('PANEL-CONTENT'), findsOneWidget);
  });

  // -- #432 Gap 1: filled surface, calm focus -----------------------------

  testWidgets('filled surface draws no saturated focus ring', (tester) async {
    final colors = RefractionThemeData.light().colors;
    final focus = FocusNode();
    addTearDown(focus.dispose);
    await tester.pumpWidget(
      buildApp(RefractionComposer(focusNode: focus, onSubmit: (_) {})),
    );

    Color pillBorderColor() {
      for (final c in tester.widgetList<Container>(find.byType(Container))) {
        final d = c.decoration;
        if (d is BoxDecoration &&
            d.border is Border &&
            d.borderRadius != null) {
          return (d.border as Border).top.color;
        }
      }
      fail('pill container not found');
    }

    final resting = pillBorderColor();
    expect(resting, colors.border);
    expect(resting, isNot(colors.ring));

    focus.requestFocus();
    await tester.pump();
    final focused = pillBorderColor();
    expect(focused, colors.border, reason: 'focus stays calm — no ring');
    expect(focused, isNot(colors.ring));
  });
}
