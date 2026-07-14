// Sections B (state machine & submit) and F (attachments & drafts) of the
// composer test plan — pure core unit tests, no widget pump.
import 'package:fake_async/fake_async.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/src/core/composer_core.dart';
import 'package:refraction_ui/src/core/composer_types.dart';

import 'composer_test_helpers.dart';

ComposerAttachment _file({String name = 'report.pdf', int? sizeBytes}) {
  return ComposerAttachment(
    kind: ComposerAttachmentKind.file,
    name: name,
    sizeBytes: sizeBytes,
  );
}

void main() {
  group('B. State machine & submit', () {
    test('B1 initial state: idle, empty, canSend false, suggestion closed', () {
      final core = ComposerCore();
      final state = core.state;
      expect(state.phase, ComposerPhase.idle);
      expect(state.isEmpty, isTrue);
      expect(state.canSend, isFalse);
      expect(state.suggestion.isOpen, isFalse);
      expect(state.tokens, isEmpty);
      expect(state.attachments, isEmpty);
    });

    test('B2 setValue → typing; clear back → idle', () {
      final core = ComposerCore();
      typeInto(core, 'hi');
      expect(core.state.phase, ComposerPhase.typing);
      core.clear();
      expect(core.state.phase, ComposerPhase.idle);
      expect(core.state.value, '');
    });

    test('B3 submit snapshots trimmed payload and clears synchronously', () {
      final store = ComposerInMemoryDraftStore();
      final core = ComposerCore(
        draftStore: store,
        draftKey: 'c1',
        replyToMessageId: 'm_9',
      );
      typeInto(core, '  hello there  ');
      core.flushDraft();
      expect(store.read('c1'), isNotNull);

      final submission = core.submit();
      expect(submission, isNotNull);
      expect(submission!.plainText, 'hello there');
      expect(submission.replyToMessageId, 'm_9');
      expect(core.state.value, '', reason: 'cleared synchronously');
      expect(core.state.selection, const ComposerSelection.collapsed(0));
      expect(store.read('c1'), isNull, reason: 'draft cleared');
    });

    test('B4 submit when !canSend returns null and leaves value untouched', () {
      final core = ComposerCore();
      typeInto(core, '   ');
      expect(core.submit(), isNull);
      expect(core.state.value, '   ');
    });

    test('B5 submit while busy → null (no double-send)', () {
      final core = ComposerCore(initialValue: 'hello');
      core.setBusy(true);
      expect(core.submit(), isNull);
      expect(core.state.value, 'hello');
      core.setBusy(false);
      expect(core.submit(), isNotNull);
    });

    test(
      'B6 attachments-only submit: plainText empty, attachments present',
      () {
        final core = ComposerCore();
        final id = core.addAttachment(_file());
        expect(id, isNotNull);
        expect(core.state.canSend, isTrue);
        final submission = core.submit()!;
        expect(submission.plainText, '');
        expect(submission.attachments, hasLength(1));
        expect(core.state.attachments, isEmpty);
      },
    );

    test('B7 setBusy/setError transitions; error preserves draft value', () {
      final core = ComposerCore(initialValue: 'draft text');
      core.setBusy(true);
      expect(core.state.phase, ComposerPhase.sending);
      core.setBusy(false);
      core.setError('send failed');
      expect(core.state.phase, ComposerPhase.error);
      expect(core.state.error, 'send failed');
      expect(core.state.value, 'draft text', reason: 'draft preserved');
      core.setError(null);
      expect(core.state.error, isNull);
    });

    test('B8 disabled: setValue/insert/submit are all no-ops', () {
      final core = ComposerCore(initialValue: 'hi', disabled: true);
      core.setValue('changed', selection: const ComposerSelection.collapsed(7));
      expect(core.state.value, 'hi');
      core.insertTextAtCursor('x');
      expect(core.state.value, 'hi');
      expect(core.submit(), isNull);
      expect(core.state.phase, ComposerPhase.disabled);
    });

    test('B9 readOnly: value immutable via user path, selection allowed', () {
      final core = ComposerCore(initialValue: 'frozen', readOnly: true);
      core.setValue('mutated', selection: const ComposerSelection.collapsed(7));
      expect(core.state.value, 'frozen');
      core.setSelection(const ComposerSelection(start: 0, end: 6));
      expect(core.state.selection, const ComposerSelection(start: 0, end: 6));
      expect(core.state.phase, ComposerPhase.readOnly);
    });

    test('B10 subscribe fires per transition; unsubscribe stops; state is a '
        'point-in-time snapshot', () {
      final core = ComposerCore();
      final seen = <String>[];
      void listener(ComposerState s) => seen.add(s.value);
      final unsubscribe = core.subscribe(listener);
      typeInto(core, 'ab');
      expect(seen, ['a', 'ab']);

      final snapshot = core.state;
      typeInto(core, 'c');
      expect(snapshot.value, 'ab', reason: 'snapshot does not mutate');

      unsubscribe();
      typeInto(core, 'd');
      expect(seen, ['a', 'ab', 'abc']);
    });

    test('B11 reset restores initial; destroy cancels pending async', () {
      fakeAsync((async) {
        final store = ComposerInMemoryDraftStore();
        final core = ComposerCore(
          initialValue: 'seed',
          draftStore: store,
          draftKey: 'c1',
        );
        typeInto(core, '!');
        expect(core.state.value, 'seed!');
        core.reset();
        expect(core.state.value, 'seed');
        expect(core.state.selection, const ComposerSelection.collapsed(4));

        typeInto(core, '?');
        core.destroy();
        async.elapse(const Duration(seconds: 1));
        expect(
          store.read('c1'),
          isNull,
          reason: 'destroy cancels the pending draft write',
        );
      });
    });

    test('B13 edit mode: beginEdit seeds, submit emits editingMessageId, '
        'cancelEdit restores the pre-edit draft', () {
      final core = ComposerCore();
      typeInto(core, 'in progress');
      core.beginEdit(value: 'old message', messageId: 'm_1');
      expect(core.state.value, 'old message');
      expect(core.state.editingMessageId, 'm_1');

      core.cancelEdit();
      expect(core.state.value, 'in progress');
      expect(core.state.editingMessageId, isNull);

      core.beginEdit(value: 'old message', messageId: 'm_1');
      typeInto(core, '!');
      final submission = core.submit()!;
      expect(submission.plainText, 'old message!');
      expect(submission.editingMessageId, 'm_1');
      expect(core.state.editingMessageId, isNull);
      expect(
        core.state.value,
        'in progress',
        reason: 'pre-edit draft handed back after the edit submits',
      );
    });

    test('B14 typing signal throttled on the leading edge, not fired for '
        'host-programmatic writes or while disabled', () {
      var clock = DateTime(2026, 1, 1);
      var fired = 0;
      final core = ComposerCore(
        now: () => clock,
        onTypingActivity: () => fired++,
      );
      typeInto(core, 'ab');
      expect(fired, 1, reason: 'leading edge only within the interval');

      clock = clock.add(const Duration(seconds: 4));
      typeInto(core, 'c');
      expect(fired, 2);

      clock = clock.add(const Duration(seconds: 4));
      core.setValue(
        'abc programmatic',
        selection: const ComposerSelection.collapsed(16),
        userGenerated: false,
      );
      expect(fired, 2, reason: 'programmatic setValue never fires');

      core.setDisabled(true);
      clock = clock.add(const Duration(seconds: 4));
      typeInto(core, 'x');
      expect(fired, 2, reason: 'disabled composer never fires');
    });
  });

  group('F. Attachments & drafts', () {
    test('F1 add returns id; state lists it; canSend flips true', () {
      final core = ComposerCore(generateId: () => 'a1');
      expect(core.state.canSend, isFalse);
      final id = core.addAttachment(_file());
      expect(id, 'a1');
      expect(core.state.attachments.single.id, 'a1');
      expect(core.state.canSend, isTrue);
    });

    test(
      'F2 updateAttachment patches; removeAttachment recomputes canSend',
      () {
        final core = ComposerCore();
        final id = core.addAttachment(_file())!;
        core.updateAttachment(
          id,
          status: ComposerAttachmentStatus.uploading,
          progress: 0.4,
        );
        expect(
          core.state.attachments.single.status,
          ComposerAttachmentStatus.uploading,
        );
        expect(core.state.attachments.single.progress, 0.4);
        core.updateAttachment(id, status: ComposerAttachmentStatus.ready);
        expect(
          core.state.attachments.single.status,
          ComposerAttachmentStatus.ready,
        );
        core.removeAttachment(id);
        expect(core.state.attachments, isEmpty);
        expect(core.state.canSend, isFalse);
      },
    );

    test(
      'F3 maxAttachments exceeded → rejection event, not added, no throw',
      () {
        final log = EventLog();
        final core = ComposerCore(maxAttachments: 1, onEvent: log.call);
        expect(core.addAttachment(_file()), isNotNull);
        expect(core.addAttachment(_file(name: 'two.pdf')), isNull);
        expect(core.state.attachments, hasLength(1));
        final rejection = log.ofType<ComposerAttachmentRejectedEvent>().single;
        expect(rejection.reason, 'maxAttachments');
        expect(rejection.attachment.name, 'two.pdf');
      },
    );

    test('F4 accept/maxSizeBytes rejections surface reasons', () {
      final log = EventLog();
      final core = ComposerCore(
        maxAttachmentSizeBytes: 100,
        acceptAttachment: (a) => a.kind != ComposerAttachmentKind.video,
        onEvent: log.call,
      );
      expect(core.addAttachment(_file(sizeBytes: 500)), isNull);
      expect(log.ofType<ComposerAttachmentRejectedEvent>().last.reason, 'size');
      expect(
        core.addAttachment(
          const ComposerAttachment(
            kind: ComposerAttachmentKind.video,
            name: 'clip.mp4',
          ),
        ),
        isNull,
      );
      expect(
        log.ofType<ComposerAttachmentRejectedEvent>().last.reason,
        'accept',
      );
      expect(core.addAttachment(_file(sizeBytes: 50)), isNotNull);
    });

    test('F5 submit snapshots attachments then clears the tray', () {
      final core = ComposerCore();
      core.addAttachment(_file());
      typeInto(core, 'see attached');
      final submission = core.submit()!;
      expect(submission.attachments, hasLength(1));
      expect(core.state.attachments, isEmpty);
    });

    test('F6 draft autosave debounced; restore on create; clear on submit', () {
      fakeAsync((async) {
        final store = ComposerInMemoryDraftStore();
        final trigger = mentionTrigger();
        final core = ComposerCore(
          draftStore: store,
          draftKey: 'c1',
          triggers: [trigger],
          now: () => DateTime(2026, 1, 1),
        );
        typeInto(core, '@Jor');
        core.applySuggestion(0);
        typeInto(core, ' hi');
        expect(store.read('c1'), isNull, reason: 'debounce still pending');
        async.elapse(const Duration(milliseconds: 400));
        final draft = store.read('c1')!;
        expect(draft.value, '@Jordan Lee hi');
        expect(draft.tokens.single.id, 'u_jordan');
        expect(draft.updatedAt, DateTime(2026, 1, 1));

        // Restore on create with the same store+key.
        final restored = ComposerCore(
          draftStore: store,
          draftKey: 'c1',
          triggers: [trigger],
        );
        expect(restored.state.value, '@Jordan Lee hi');
        expect(restored.state.tokens.single.display, '@Jordan Lee');

        restored.submit();
        expect(store.read('c1'), isNull, reason: 'cleared on submit');
      });
    });

    test('F7 draft not written while composing (mid-IME text)', () {
      fakeAsync((async) {
        final store = ComposerInMemoryDraftStore();
        final core = ComposerCore(draftStore: store, draftKey: 'c1');
        core.setComposing(true);
        core.setValue('ㅎ', selection: const ComposerSelection.collapsed(1));
        async.elapse(const Duration(seconds: 1));
        expect(store.read('c1'), isNull);
        core.setComposing(false);
        typeInto(core, '하');
        async.elapse(const Duration(milliseconds: 400));
        expect(store.read('c1'), isNotNull);
      });
    });

    test('F8 corrupt/absent draft read → clean empty state (fail closed)', () {
      final throwing = _ThrowingDraftStore();
      final core = ComposerCore(draftStore: throwing, draftKey: 'c1');
      expect(core.state.value, '');
      expect(core.state.tokens, isEmpty);

      // A draft whose token ranges don't project the display is dropped.
      final store = ComposerInMemoryDraftStore();
      store.write(
        'c1',
        ComposerDraft(
          value: 'hello',
          tokens: const [
            ComposerToken(
              type: 'mention',
              id: 'u_x',
              display: '@Nobody',
              start: 0,
            ),
          ],
          updatedAt: DateTime(2026, 1, 1),
        ),
      );
      final restored = ComposerCore(draftStore: store, draftKey: 'c1');
      expect(restored.state.value, 'hello');
      expect(restored.state.tokens, isEmpty, reason: 'corrupt token dropped');
    });
  });
}

class _ThrowingDraftStore implements ComposerDraftStore {
  @override
  ComposerDraft? read(String key) => throw StateError('corrupt');

  @override
  void write(String key, ComposerDraft draft) => throw StateError('corrupt');

  @override
  void clear(String key) => throw StateError('corrupt');
}
