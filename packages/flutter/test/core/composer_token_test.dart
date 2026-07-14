// Section E of the composer test plan: committed atomic tokens —
// insertion, bookkeeping under edits, atomic delete, caret snapping,
// copy/paste semantics, shortcode commits, serialization invariant.
import 'dart:math';

import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/src/core/composer_core.dart';
import 'package:refraction_ui/src/core/composer_types.dart';

import 'composer_test_helpers.dart';

ComposerCore _mentionCore({int? maxLength}) =>
    ComposerCore(triggers: [mentionTrigger()], maxLength: maxLength);

/// Types '@Jor' and commits Jordan Lee at the current caret.
void _commitJordan(ComposerCore core) {
  typeInto(core, '@Jor');
  core.applySuggestion(0);
}

void main() {
  group('E. Tokens', () {
    test('E1 commit replaces [symbolStart, caret) atomically; plainText '
        'projection correct', () {
      final core = _mentionCore();
      typeInto(core, 'hey ');
      _commitJordan(core);
      expect(core.state.value, 'hey @Jordan Lee');
      final token = core.state.tokens.single;
      expect(token.type, 'mention');
      expect(token.id, 'u_jordan');
      expect(token.display, '@Jordan Lee');
      expect(token.start, 4);
      expect(token.end, 15);
      expect(core.state.selection, const ComposerSelection.collapsed(15));
    });

    test('E2 offsets at start/mid/EOF, adjacent tokens, and edits before '
        'tokens shift ranges', () {
      final core = _mentionCore();
      _commitJordan(core);
      typeInto(core, ' and ');
      typeInto(core, '@Al');
      core.applySuggestion(0);
      expect(core.state.value, '@Jordan Lee and @Alex Kim');
      expect(core.state.tokens, hasLength(2));
      expect(core.state.tokens[0].start, 0);
      expect(core.state.tokens[1].start, 16);

      // Insert text before both tokens: ranges shift.
      core.setSelection(const ComposerSelection.collapsed(0));
      core.insertTextAtCursor('so ');
      expect(core.state.value, 'so @Jordan Lee and @Alex Kim');
      expect(core.state.tokens[0].start, 3);
      expect(core.state.tokens[1].start, 19);
      for (final token in core.state.tokens) {
        expect(
          core.state.value.substring(token.start, token.end),
          token.display,
        );
      }
    });

    test('E3 backspace immediately after a token deletes it whole', () {
      final core = _mentionCore();
      _commitJordan(core);
      expect(core.state.value, '@Jordan Lee');
      backspaceInto(core);
      expect(core.state.value, '');
      expect(core.state.tokens, isEmpty);
    });

    test('E4 forward-delete immediately before a token deletes it whole', () {
      final core = _mentionCore();
      _commitJordan(core);
      // Forward-delete at offset 0 removes the first character — the
      // core canonicalizes to a whole-token delete.
      core.setValue(
        core.state.value.substring(1),
        selection: const ComposerSelection.collapsed(0),
      );
      expect(core.state.value, '');
      expect(core.state.tokens, isEmpty);
    });

    test('E5 selection overlapping half a token + delete removes it whole', () {
      final core = _mentionCore();
      typeInto(core, 'hi ');
      _commitJordan(core);
      typeInto(core, ' yo');
      expect(core.state.value, 'hi @Jordan Lee yo');
      // Delete 'i @Jor' — overlaps the token's first half.
      core.setValue(
        'h${core.state.value.substring(9)}',
        selection: const ComposerSelection.collapsed(1),
      );
      expect(core.state.value, 'h yo');
      expect(core.state.tokens, isEmpty);
    });

    test('E6 typing at a token boundary creates adjacent plain text', () {
      final core = _mentionCore();
      _commitJordan(core);
      typeInto(core, '!');
      expect(core.state.value, '@Jordan Lee!');
      expect(core.state.tokens.single.end, 11);

      core.setSelection(const ComposerSelection.collapsed(0));
      typeInto(core, '>');
      expect(core.state.value, '>@Jordan Lee!');
      expect(core.state.tokens.single.start, 1);
    });

    test('E7 typing strictly inside a token is rejected; caret snaps to a '
        'boundary', () {
      final core = _mentionCore();
      _commitJordan(core);
      final before = core.state.value;
      // Simulate the platform inserting 'x' at offset 3 (inside the token).
      core.setValue(
        '${before.substring(0, 3)}x${before.substring(3)}',
        selection: const ComposerSelection.collapsed(4),
      );
      expect(core.state.value, before, reason: 'value restored');
      expect(core.state.tokens.single.display, '@Jordan Lee');
      expect(core.state.selection.isCollapsed, isTrue);
      expect(
        core.state.selection.end,
        anyOf(0, 11),
        reason: 'caret snapped to a token boundary',
      );
    });

    test('E8 selection landing strictly inside a token snaps outward', () {
      final core = _mentionCore();
      typeInto(core, 'hi ');
      _commitJordan(core);
      core.setSelection(const ComposerSelection(start: 5, end: 9));
      expect(core.state.selection, const ComposerSelection(start: 3, end: 14));
    });

    test('E9 caret skips over a token as one unit (both directions)', () {
      final core = _mentionCore();
      _commitJordan(core);
      typeInto(core, '!');
      // Arrow-left from just after the token's end.
      core.setSelection(const ComposerSelection.collapsed(11));
      core.setSelection(const ComposerSelection.collapsed(10));
      expect(
        core.state.selection.end,
        0,
        reason: 'moving left from the end lands at the start',
      );
      // Arrow-right from the start.
      core.setSelection(const ComposerSelection.collapsed(1));
      expect(
        core.state.selection.end,
        11,
        reason: 'moving right from the start lands at the end',
      );
    });

    test(
      'E10 the value is the display projection (copy yields plain text)',
      () {
        final core = _mentionCore();
        typeInto(core, 'ping ');
        _commitJordan(core);
        final token = core.state.tokens.single;
        expect(
          core.state.value.substring(token.start, token.end),
          '@Jordan Lee',
        );
      },
    );

    test('E11 pasting look-alike text never creates a token', () {
      final core = _mentionCore();
      core.setValue(
        '@Jordan Lee',
        selection: const ComposerSelection.collapsed(11),
      );
      expect(core.state.tokens, isEmpty);
      expect(core.state.value, '@Jordan Lee');
    });

    test('E12 cut then paste in the same instance restores the live token', () {
      final core = _mentionCore();
      typeInto(core, 'hi ');
      _commitJordan(core);
      final original = core.state.tokens.single;

      // Cut the token (selection exactly covering it).
      core.setValue('hi ', selection: const ComposerSelection.collapsed(3));
      expect(core.state.tokens, isEmpty);

      // Paste the identical slice back.
      core.setValue(
        'hi @Jordan Lee',
        selection: const ComposerSelection.collapsed(14),
      );
      final restored = core.state.tokens.single;
      expect(restored.id, original.id);
      expect(restored.display, original.display);
      expect(restored.start, 3);
    });

    test('E13 direct-typed :fire: commits without the menu; unknown '
        ':nope: stays literal', () {
      final core = ComposerCore(shortcodes: const {'fire': '🔥'});
      typeInto(core, 'lit :fire:');
      expect(core.state.value, 'lit 🔥');
      final token = core.state.tokens.single;
      expect(token.type, 'emoji');
      expect(token.id, ':fire:');
      expect(token.display, '🔥');

      final unknown = ComposerCore(shortcodes: const {'fire': '🔥'});
      typeInto(unknown, ':nope:');
      expect(unknown.state.value, ':nope:');
      expect(unknown.state.tokens, isEmpty);
    });

    test('E14 token display frozen at insert time', () {
      var display = 'Jordan Lee';
      final core = ComposerCore(
        triggers: [
          ComposerTrigger(
            id: 'mention',
            symbol: '@',
            resolve: (q) => [
              ComposerCandidate(id: 'u_jordan', display: display),
            ],
          ),
        ],
      );
      typeInto(core, '@Jor');
      core.applySuggestion(0);
      display = 'Jordan Renamed';
      typeInto(core, ' @Jor');
      core.applySuggestion(0);
      expect(
        core.state.tokens[0].display,
        '@Jordan Lee',
        reason: 'earlier commit unaffected by the rename',
      );
      expect(core.state.tokens[1].display, '@Jordan Renamed');
    });

    test('E15 serialize invariant: substring(start, end) == display under '
        'randomized edits (property test, fixed seed)', () {
      final random = Random(42);
      final core = _mentionCore();
      _commitJordan(core);
      typeInto(core, ' mid ');
      typeInto(core, '@Al');
      core.applySuggestion(0);

      for (var step = 0; step < 200; step++) {
        final value = core.state.value;
        final offset = random.nextInt(value.length + 1);
        core.setSelection(ComposerSelection.collapsed(offset));
        if (random.nextBool()) {
          core.insertTextAtCursor(String.fromCharCode(97 + random.nextInt(26)));
        } else {
          backspaceInto(core);
        }
        final document = core.serialize();
        expect(document.plainText, core.state.value);
        for (final token in document.tokens) {
          expect(
            document.plainText.substring(token.start, token.end),
            token.display,
            reason: 'step $step desynced token $token',
          );
        }
      }
    });

    test('E16 a token commit that would exceed maxLength is rejected as a '
        'unit', () {
      final log = EventLog();
      final core = ComposerCore(
        triggers: [mentionTrigger()],
        maxLength: 12,
        onEvent: log.call,
      );
      typeInto(core, 'yo ');
      typeInto(core, '@Jor');
      expect(core.state.suggestion.items, isNotEmpty);
      core.applySuggestion(0);
      expect(core.state.value, 'yo @Jor', reason: 'commit rejected whole');
      expect(core.state.tokens, isEmpty);
      expect(
        log.ofType<ComposerInsertRejectedEvent>().last.reason,
        'maxLength',
      );
    });
  });
}
