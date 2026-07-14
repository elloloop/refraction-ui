// Section C of the composer test plan: trigger detection — pure core unit
// tests parameterized across '@', '/', ':', '#', and '!!'.
import 'package:fake_async/fake_async.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/src/core/composer_core.dart';
import 'package:refraction_ui/src/core/composer_trigger_engine.dart';
import 'package:refraction_ui/src/core/composer_types.dart';

import 'composer_test_helpers.dart';

void main() {
  group('C. Trigger detection', () {
    test('C1 @ at message start arms with empty query', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(core, '@');
      final active = core.state.activeTrigger;
      expect(active, isNotNull);
      expect(active!.trigger.id, 'mention');
      expect(active.symbolStart, 0);
      expect(active.query, '');
      expect(core.state.suggestion.isOpen, isTrue);
    });

    test('C2 @ after space arms; alice@example.com does NOT', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(core, 'hi @');
      expect(core.state.activeTrigger, isNotNull);
      expect(core.state.activeTrigger!.symbolStart, 3);

      final email = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(email, 'alice@example.com');
      expect(email.state.activeTrigger, isNull);
      expect(email.state.suggestion.isOpen, isFalse);
    });

    test('C3 / scope startOfMessage: offset 0 only; and/or never; '
        '/help mid-sentence never', () {
      final atStart = ComposerCore(triggers: [slashTrigger()]);
      typeInto(atStart, '/help');
      expect(atStart.state.activeTrigger, isNotNull);
      expect(atStart.state.activeTrigger!.query, 'help');

      final midWord = ComposerCore(triggers: [slashTrigger()]);
      typeInto(midWord, 'and/or');
      expect(midWord.state.activeTrigger, isNull);

      final midSentence = ComposerCore(triggers: [slashTrigger()]);
      typeInto(midSentence, 'try /help');
      expect(midSentence.state.activeTrigger, isNull);

      // startOfLine variant arms right after a newline.
      final lineTrigger = ComposerTrigger(
        id: 'line-slash',
        symbol: '/',
        scope: ComposerTriggerScope.startOfLine,
        queryPattern: RegExp(r'^[a-z0-9-]*$'),
        resolve: (q) => const [],
      );
      final startOfLine = ComposerCore(triggers: [lineTrigger]);
      typeInto(startOfLine, 'hi\n/help');
      expect(startOfLine.state.activeTrigger, isNotNull);
    });

    test('C4 boundary extras: "(" arms only via extraBoundaryChars', () {
      final plain = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(plain, '(@');
      expect(plain.state.activeTrigger, isNull);

      final extended = ComposerCore(
        triggers: [
          mentionTrigger(extraBoundaryChars: {'('}),
        ],
      );
      typeInto(extended, '(@');
      expect(extended.state.activeTrigger, isNotNull);
    });

    test('C5 query is text[symbol+1..caret]; typing and caret moves '
        're-evaluate', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(core, '@Jor');
      expect(core.state.activeTrigger!.query, 'Jor');
      expect(core.state.suggestion.items.single.id, 'u_jordan');

      core.setSelection(const ComposerSelection.collapsed(2));
      expect(
        core.state.activeTrigger!.query,
        'J',
        reason: 'caret move re-slices the query',
      );
    });

    test('C6 queryPattern violation closes (space with closeOnSpace)', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(core, '@Jordan ');
      expect(core.state.activeTrigger, isNull);
      expect(core.state.suggestion.isOpen, isFalse);
    });

    test('C7 closeOnSpace=false (#): "#weekend trip" stays armed; a second '
        '# re-arms as a new occurrence; maxQueryLength closes', () {
      final core = ComposerCore(triggers: [tagTrigger()]);
      typeInto(core, '#weekend trip');
      expect(core.state.activeTrigger, isNotNull);
      expect(core.state.activeTrigger!.query, 'weekend trip');

      typeInto(core, ' #');
      expect(
        core.state.activeTrigger!.symbolStart,
        14,
        reason: 'nearest # wins',
      );
      expect(core.state.activeTrigger!.query, '');

      final capped = ComposerCore(triggers: [tagTrigger(maxQueryLength: 5)]);
      typeInto(capped, '#abcdef');
      expect(capped.state.activeTrigger, isNull);
    });

    test('C8 maxQueryLength exceeded → silent cancel', () {
      final core = ComposerCore(triggers: [mentionTrigger(maxQueryLength: 3)]);
      typeInto(core, '@abc');
      expect(core.state.activeTrigger, isNotNull);
      typeInto(core, 'd');
      expect(core.state.activeTrigger, isNull);
      expect(core.state.suggestion.isOpen, isFalse);
    });

    test('C9 Escape dismisses; occurrence does not re-arm; deleting the '
        'symbol and retyping re-arms', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(core, '@Jo');
      core.dismissSuggestion();
      expect(core.state.suggestion.isOpen, isFalse);

      typeInto(core, 'r');
      expect(
        core.state.activeTrigger,
        isNull,
        reason: 'dismissed occurrence stays closed while typing',
      );

      // Delete back through the symbol, retype → re-arms.
      backspaceInto(core); // r
      backspaceInto(core); // o
      backspaceInto(core); // J
      backspaceInto(core); // @
      expect(core.state.value, '');
      typeInto(core, '@J');
      expect(core.state.activeTrigger, isNotNull);
    });

    test('C10 delete-through re-filters each step; deleting symbol closes', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(core, '@Jor');
      backspaceInto(core);
      expect(core.state.activeTrigger!.query, 'Jo');
      backspaceInto(core);
      expect(core.state.activeTrigger!.query, 'J');
      backspaceInto(core);
      expect(core.state.activeTrigger!.query, '');
      backspaceInto(core);
      expect(core.state.value, '');
      expect(core.state.activeTrigger, isNull);
    });

    test('C11 caret leaving [symbolStart, caret] closes the trigger', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(core, 'hello @Jo');
      expect(core.state.activeTrigger, isNotNull);
      core.setSelection(const ComposerSelection.collapsed(3));
      expect(core.state.activeTrigger, isNull);
    });

    test('C12 composing suspends detection; composing end re-runs it', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      core.setComposing(true);
      core.setValue('你@', selection: const ComposerSelection.collapsed(2));
      expect(core.state.activeTrigger, isNull, reason: 'no mid-IME misfire');

      core.setComposing(false);
      expect(
        core.state.activeTrigger,
        isNull,
        reason: '@ preceded by a letter is still mid-word',
      );

      final boundary = ComposerCore(triggers: [mentionTrigger()]);
      boundary.setComposing(true);
      boundary.setValue('你 @', selection: const ComposerSelection.collapsed(3));
      expect(boundary.state.activeTrigger, isNull);
      boundary.setComposing(false);
      expect(
        boundary.state.activeTrigger,
        isNotNull,
        reason: 'detection re-runs on the committed text',
      );
    });

    test('C13 multi-char symbol !! arms only when both chars typed; '
        'boundary checked against the first char', () {
      final core = ComposerCore(triggers: [bangBangTrigger()]);
      typeInto(core, '!');
      expect(core.state.activeTrigger, isNull);
      typeInto(core, '!');
      expect(core.state.activeTrigger, isNotNull);
      expect(core.state.activeTrigger!.symbolStart, 0);

      final midWord = ComposerCore(triggers: [bangBangTrigger()]);
      typeInto(midWord, 'wow!!');
      expect(
        midWord.state.activeTrigger,
        isNull,
        reason: 'first ! is preceded by a letter',
      );
    });

    test('C14 never arms inside a committed token range', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(core, '@Jor');
      core.applySuggestion(0);
      expect(core.state.value, '@Jordan Lee');
      expect(
        core.state.activeTrigger,
        isNull,
        reason: 'commit clears the trigger',
      );

      // A caret placed right after the committed token's symbol region
      // must not re-arm on the token's own '@'.
      core.setSelection(const ComposerSelection.collapsed(11));
      expect(core.state.activeTrigger, isNull);
    });

    test('C15 nearest unescaped trigger before the caret wins', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(core, '@a @b');
      expect(core.state.activeTrigger!.symbolStart, 3);
      expect(core.state.activeTrigger!.query, 'b');
    });

    test('C16 backward scan is bounded by the query budget', () {
      final trigger = mentionTrigger(maxQueryLength: 10);
      // Symbol farther behind the caret than the budget can never arm, no
      // matter how long the prefix is (the scan window is caret-local).
      final match = detectActiveTrigger(
        text: '@${'a' * 50}',
        caret: 51,
        triggers: [trigger],
      );
      expect(match, isNull);

      final longPrefix = '${'x' * 10000} @Jo';
      final nearCaret = detectActiveTrigger(
        text: longPrefix,
        caret: longPrefix.length,
        triggers: [trigger],
      );
      expect(nearCaret, isNotNull);
      expect(nearCaret!.symbolStart, 10001);
    });

    test('C17 blur closes after grace; refocus does not reopen', () {
      fakeAsync((async) {
        final core = ComposerCore(triggers: [mentionTrigger()]);
        typeInto(core, '@Jo');
        core.dismissSuggestionDeferred();
        expect(
          core.state.suggestion.isOpen,
          isTrue,
          reason: 'still open during the grace period',
        );
        async.elapse(const Duration(milliseconds: 120));
        expect(core.state.suggestion.isOpen, isFalse);

        // Refocus: nothing re-opens; the occurrence is dismissed.
        typeInto(core, 'r');
        expect(core.state.suggestion.isOpen, isFalse);
      });
    });

    test('C18 RTL text: logical offsets are correct for an Arabic query', () {
      final roster = [const ComposerCandidate(id: 'u_omar', display: 'عمر')];
      final core = ComposerCore(triggers: [mentionTrigger(roster: roster)]);
      typeInto(core, 'مرحبا @عم');
      final active = core.state.activeTrigger!;
      expect(active.symbolStart, 6);
      expect(active.query, 'عم');
      expect(core.state.suggestion.items.single.id, 'u_omar');
    });
  });
}
