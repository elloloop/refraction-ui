// Section A of the composer test plan: rules (grapheme, trim, canSend,
// enter) — pure core unit tests, no widget pump.
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/src/core/composer_core.dart';
import 'package:refraction_ui/src/core/composer_types.dart';

import 'composer_test_helpers.dart';

void main() {
  group('A. ComposerRules', () {
    test('A1 payloadFor trims edges, preserves internal newlines', () {
      const rules = ComposerRules();
      expect(rules.payloadFor('  hi  '), 'hi');
      expect(rules.payloadFor('\n a\n\nb \n'), 'a\n\nb');
      expect(rules.payloadFor('a  b'), 'a  b');
    });

    test('A2 canSend: whitespace-only never sendable; attachments count', () {
      const rules = ComposerRules();
      expect(rules.canSend(''), isFalse);
      expect(rules.canSend('   '), isFalse);
      expect(rules.canSend('\n'), isFalse);
      expect(rules.canSend('x'), isTrue);
      expect(rules.canSend('', hasAttachments: true), isTrue);
    });

    test('A3 canSend false while disabled/readOnly/busy even with text', () {
      final disabled = ComposerCore(initialValue: 'hi', disabled: true);
      expect(disabled.state.canSend, isFalse);

      final readOnly = ComposerCore(initialValue: 'hi', readOnly: true);
      expect(readOnly.state.canSend, isFalse);

      final busy = ComposerCore(initialValue: 'hi')..setBusy(true);
      expect(busy.state.canSend, isFalse);
      busy.setBusy(false);
      expect(busy.state.canSend, isTrue);
    });

    test('A4 shouldSubmitOnEnter matrix — composing always wins', () {
      const rules = ComposerRules();
      expect(
        rules.shouldSubmitOnEnter(shiftPressed: false, isComposing: false),
        isTrue,
      );
      expect(
        rules.shouldSubmitOnEnter(shiftPressed: true, isComposing: false),
        isFalse,
      );
      expect(
        rules.shouldSubmitOnEnter(shiftPressed: false, isComposing: true),
        isFalse,
      );
      expect(
        rules.shouldSubmitOnEnter(shiftPressed: true, isComposing: true),
        isFalse,
      );
    });

    test('A5 clamp: under limit unchanged; over limit truncated', () {
      const rules = ComposerRules(maxLength: 5);
      expect(rules.clamp('abc'), 'abc');
      expect(rules.clamp('abcde'), 'abcde');
      expect(rules.clamp('abcdefgh'), 'abcde');
      const unlimited = ComposerRules();
      expect(unlimited.clamp('abcdefgh'), 'abcdefgh');
    });

    test('A6 clamp never splits grapheme clusters', () {
      const family = '👨‍👩‍👧‍👦';
      const thumbs = '👍🏽';
      const flag = '🇮🇳';
      const eAcute = 'é';
      const devanagari = 'क्षि';
      for (final cluster in [family, thumbs, flag, eAcute, devanagari]) {
        final input = 'abcd$cluster';
        const rules = ComposerRules(maxLength: 4);
        // The cluster is the 5th grapheme: rejected whole, never bisected.
        expect(rules.clamp(input), 'abcd', reason: 'cluster $cluster');
        final keepRules = const ComposerRules(maxLength: 5);
        expect(keepRules.clamp(input), input, reason: 'cluster $cluster');
      }
    });

    test('A7 length counted in graphemes not UTF-16 units', () {
      expect(ComposerRules.graphemeLength('👨‍👩‍👧‍👦'), 1);
      expect('👨‍👩‍👧‍👦'.length, greaterThan(1));
      expect(ComposerRules.graphemeLength('a👍🏽b'), 3);
    });

    test('A8 counter: hidden >20% remaining; visible ≤20%; at-limit at 0', () {
      const rules = ComposerRules(maxLength: 100);
      final roomy = rules.counterFor('a' * 70)!;
      expect(roomy.isVisible, isFalse);
      expect(roomy.remaining, 30);

      final close = rules.counterFor('a' * 80)!;
      expect(close.isVisible, isTrue);
      expect(close.isAtLimit, isFalse);

      final atLimit = rules.counterFor('a' * 100)!;
      expect(atLimit.remaining, 0);
      expect(atLimit.isAtLimit, isTrue);
      expect(atLimit.overLimit, isFalse);

      expect(const ComposerRules().counterFor('abc'), isNull);
    });

    test(
      'A9 insertTextAtCursor targets caret/selection, caret lands after',
      () {
        final core = ComposerCore(initialValue: 'hello world');
        core.setSelection(const ComposerSelection.collapsed(5));
        core.insertTextAtCursor(' brave');
        expect(core.state.value, 'hello brave world');
        expect(core.state.selection, const ComposerSelection.collapsed(11));

        // Replaces an active selection.
        core.setSelection(const ComposerSelection(start: 6, end: 11));
        core.insertTextAtCursor('bold');
        expect(core.state.value, 'hello bold world');
        expect(core.state.selection, const ComposerSelection.collapsed(10));

        // Emoji insertion: caret lands after the whole cluster.
        final emojiCore = ComposerCore(initialValue: 'ab');
        emojiCore.setSelection(const ComposerSelection.collapsed(1));
        emojiCore.insertTextAtCursor('👍🏽');
        expect(emojiCore.state.value, 'a👍🏽b');
        expect(
          emojiCore.state.selection,
          ComposerSelection.collapsed(1 + '👍🏽'.length),
        );
      },
    );

    test('A10 insertTextAtCursor rejects over-limit and while composing', () {
      final log = EventLog();
      final core = ComposerCore(maxLength: 5, onEvent: log.call);
      typeInto(core, 'abcd');
      core.insertTextAtCursor('xyz');
      expect(core.state.value, 'abcd', reason: 'over-limit insert is a no-op');
      expect(log.ofType<ComposerInsertRejectedEvent>(), isNotEmpty);
      expect(
        log.ofType<ComposerInsertRejectedEvent>().last.reason,
        'maxLength',
      );

      core.setComposing(true);
      core.insertTextAtCursor('x');
      expect(core.state.value, 'abcd');
      expect(
        log.ofType<ComposerInsertRejectedEvent>().last.reason,
        'composing',
      );
    });
  });
}
