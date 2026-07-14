// Section D of the composer test plan: async suggestion menu — debounce,
// staleness, loading delay, errors, circuit breaker, navigation.
import 'dart:async';

import 'package:fake_async/fake_async.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/src/core/composer_core.dart';
import 'package:refraction_ui/src/core/composer_types.dart';

import 'composer_test_helpers.dart';

/// An async resolver whose pending requests are completed manually.
class ManualResolver {
  final List<({String query, Completer<List<ComposerCandidate>> completer})>
  requests = [];

  Future<List<ComposerCandidate>> call(String query) {
    final completer = Completer<List<ComposerCandidate>>();
    requests.add((query: query, completer: completer));
    return completer.future;
  }
}

ComposerTrigger asyncMention(
  ManualResolver resolver, {
  Duration debounce = Duration.zero,
}) {
  return ComposerTrigger(
    id: 'mention',
    symbol: '@',
    debounce: debounce,
    resolve: resolver.call,
  );
}

void main() {
  group('D. Suggestion menu', () {
    test(
      'D1 zero debounce resolves per keystroke; 150ms debounce coalesces',
      () {
        final syncCalls = <String>[];
        final syncTrigger = ComposerTrigger(
          id: 'mention',
          symbol: '@',
          resolve: (q) {
            syncCalls.add(q);
            return kTestRoster;
          },
        );
        final syncCore = ComposerCore(triggers: [syncTrigger]);
        typeInto(syncCore, '@Jo');
        expect(syncCalls, ['', 'J', 'Jo']);
        expect(syncCore.state.suggestion.items, hasLength(3));

        fakeAsync((async) {
          final resolver = ManualResolver();
          final core = ComposerCore(
            triggers: [
              asyncMention(
                resolver,
                debounce: const Duration(milliseconds: 150),
              ),
            ],
          );
          typeInto(core, '@Jor');
          expect(resolver.requests, isEmpty, reason: 'debounce pending');
          async.elapse(const Duration(milliseconds: 150));
          expect(
            resolver.requests,
            hasLength(1),
            reason: 'keystrokes coalesced into one call',
          );
          expect(resolver.requests.single.query, 'Jor');
        });
      },
    );

    test(
      'D2 staleness: an older slow response is discarded (requestToken)',
      () {
        fakeAsync((async) {
          final resolver = ManualResolver();
          final core = ComposerCore(triggers: [asyncMention(resolver)]);
          typeInto(core, '@');
          typeInto(core, 'a');
          expect(resolver.requests, hasLength(2));

          resolver.requests[1].completer.complete(const [
            ComposerCandidate(id: 'new', display: 'New'),
          ]);
          async.flushMicrotasks();
          expect(core.state.suggestion.items.single.id, 'new');

          resolver.requests[0].completer.complete(const [
            ComposerCandidate(id: 'old', display: 'Old'),
          ]);
          async.flushMicrotasks();
          expect(
            core.state.suggestion.items.single.id,
            'new',
            reason: 'stale response discarded',
          );
        });
      },
    );

    test('D3 loading only when the resolver is pending >120ms', () {
      fakeAsync((async) {
        final resolver = ManualResolver();
        final core = ComposerCore(triggers: [asyncMention(resolver)]);
        typeInto(core, '@a');
        async.elapse(const Duration(milliseconds: 100));
        expect(core.state.suggestion.loading, isFalse);
        async.elapse(const Duration(milliseconds: 30));
        expect(core.state.suggestion.loading, isTrue);

        resolver.requests.last.completer.complete(kTestRoster);
        async.flushMicrotasks();
        expect(core.state.suggestion.loading, isFalse);
        expect(core.state.suggestion.items, hasLength(3));
      });
    });

    test('D4 empty result → empty state distinct from closed and error', () {
      final core = ComposerCore(
        triggers: [
          ComposerTrigger(
            id: 'mention',
            symbol: '@',
            resolve: (q) => const <ComposerCandidate>[],
          ),
        ],
      );
      typeInto(core, '@zzz');
      final suggestion = core.state.suggestion;
      expect(suggestion.isOpen, isTrue);
      expect(suggestion.items, isEmpty);
      expect(suggestion.error, isNull);
      expect(suggestion.loading, isFalse);
    });

    test('D5 resolver throw → error state with retry; retry re-resolves', () {
      var attempts = 0;
      final core = ComposerCore(
        triggers: [
          ComposerTrigger(
            id: 'mention',
            symbol: '@',
            resolve: (q) {
              attempts++;
              if (attempts == 1) throw StateError('network down');
              return kTestRoster;
            },
          ),
        ],
      );
      typeInto(core, '@');
      expect(core.state.suggestion.error, isNotNull);
      expect(core.state.suggestion.isOpen, isTrue);

      core.retrySuggestions();
      expect(core.state.suggestion.error, isNull);
      expect(core.state.suggestion.items, hasLength(3));
    });

    test('D6 two consecutive throws → circuit breaker: menu closes silently '
        'and no further remote calls this session', () {
      var attempts = 0;
      final core = ComposerCore(
        triggers: [
          ComposerTrigger(
            id: 'mention',
            symbol: '@',
            resolve: (q) {
              attempts++;
              throw StateError('down');
            },
          ),
        ],
      );
      typeInto(core, '@');
      expect(core.state.suggestion.error, isNotNull, reason: 'first throw');
      typeInto(core, 'a');
      expect(
        core.state.suggestion.isOpen,
        isFalse,
        reason: 'second consecutive throw closes the menu silently',
      );
      expect(attempts, 2);

      typeInto(core, ' @b');
      expect(core.state.suggestion.isOpen, isFalse);
      expect(attempts, 2, reason: 'no further remote calls this session');
    });

    test(
      'D7 moveNext/movePrevious wrap per wrapNavigation; clamp otherwise',
      () {
        final wrapping = ComposerCore(triggers: [mentionTrigger()]);
        typeInto(wrapping, '@');
        expect(wrapping.state.suggestion.items, hasLength(3));
        wrapping.moveSuggestionPrevious();
        expect(wrapping.state.suggestion.activeIndex, 2, reason: 'wraps up');
        wrapping.moveSuggestionNext();
        expect(wrapping.state.suggestion.activeIndex, 0, reason: 'wraps down');

        final clamped = ComposerCore(
          triggers: [mentionTrigger(wrapNavigation: false)],
        );
        typeInto(clamped, '@');
        clamped.moveSuggestionPrevious();
        expect(clamped.state.suggestion.activeIndex, 0, reason: 'clamped');
        clamped.moveSuggestionNext();
        clamped.moveSuggestionNext();
        clamped.moveSuggestionNext();
        expect(clamped.state.suggestion.activeIndex, 2);
      },
    );

    test('D8 applySuggestion commits the active/indexed item and closes', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(core, '@');
      core.moveSuggestionNext();
      core.applySuggestion();
      expect(core.state.value, '@Alex Kim');
      expect(core.state.suggestion.isOpen, isFalse);
      expect(core.state.activeTrigger, isNull);

      final indexed = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(indexed, '@');
      indexed.applySuggestion(2);
      expect(indexed.state.value, '@Sam Field');
    });

    test('D9 pointer hover sets active; keyboard continues from hovered', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(core, '@');
      core.setSuggestionActiveIndex(1);
      expect(core.state.suggestion.activeIndex, 1);
      core.moveSuggestionNext();
      expect(
        core.state.suggestion.activeIndex,
        2,
        reason: 'last-input-wins handoff',
      );
    });

    test('D10 maxVisibleResults is adapter guidance; overflow list intact', () {
      final many = [
        for (var i = 0; i < 12; i++)
          ComposerCandidate(id: 'u$i', display: 'User $i'),
      ];
      final core = ComposerCore(
        triggers: [
          ComposerTrigger(
            id: 'mention',
            symbol: '@',
            maxVisibleResults: 6,
            resolve: (q) => many,
          ),
        ],
      );
      typeInto(core, '@');
      expect(
        core.state.suggestion.items,
        hasLength(12),
        reason: 'full list kept in state; adapters slice the viewport',
      );
      expect(core.state.activeTrigger!.trigger.maxVisibleResults, 6);
    });

    test('D11 while open, apply commits and never submits (precedence at '
        'the core seam)', () {
      final core = ComposerCore(triggers: [mentionTrigger()]);
      typeInto(core, 'hey @Jor');
      expect(core.state.suggestion.isOpen, isTrue);
      core.applySuggestion();
      expect(
        core.state.value,
        'hey @Jordan Lee',
        reason: 'commit happened in place — no submit/clear occurred',
      );
      expect(core.state.canSend, isTrue);
    });

    test('D12 dismissSuggestionDeferred waits the grace period so a click '
        'can land', () {
      fakeAsync((async) {
        final core = ComposerCore(triggers: [mentionTrigger()]);
        typeInto(core, '@Jor');
        core.dismissSuggestionDeferred();
        async.elapse(const Duration(milliseconds: 60));
        expect(core.state.suggestion.isOpen, isTrue);
        core.cancelDeferredDismiss();
        core.applySuggestion(0);
        expect(core.state.value, '@Jordan Lee', reason: 'the click landed');
        async.elapse(const Duration(seconds: 1));
        expect(core.state.value, '@Jordan Lee');
      });
    });

    test('D13 results arriving after the trigger was canceled are ignored', () {
      fakeAsync((async) {
        final resolver = ManualResolver();
        final core = ComposerCore(triggers: [asyncMention(resolver)]);
        typeInto(core, '@a');
        expect(resolver.requests, isNotEmpty);

        // Delete through the symbol: the trigger closes.
        backspaceInto(core);
        backspaceInto(core);
        expect(core.state.suggestion.isOpen, isFalse);

        resolver.requests.last.completer.complete(kTestRoster);
        async.flushMicrotasks();
        expect(core.state.suggestion.isOpen, isFalse);
        expect(core.state.suggestion.items, isEmpty);
      });
    });
  });
}
