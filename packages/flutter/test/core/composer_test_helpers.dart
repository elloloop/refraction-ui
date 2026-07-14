import 'package:characters/characters.dart';
import 'package:refraction_ui/src/core/composer_core.dart';
import 'package:refraction_ui/src/core/composer_types.dart';

/// Simulates the platform text pipeline typing [text] one grapheme at a
/// time at the current caret.
void typeInto(ComposerCore core, String text) {
  for (final grapheme in text.characters) {
    final value = core.state.value;
    final caret = core.state.selection.end;
    core.setValue(
      value.replaceRange(caret, caret, grapheme),
      selection: ComposerSelection.collapsed(caret + grapheme.length),
    );
  }
}

/// Simulates a single backspace at the current caret.
void backspaceInto(ComposerCore core) {
  final value = core.state.value;
  final caret = core.state.selection.end;
  if (caret == 0) return;
  core.setValue(
    value.replaceRange(caret - 1, caret, ''),
    selection: ComposerSelection.collapsed(caret - 1),
  );
}

/// The default roster used by mention-trigger tests.
const List<ComposerCandidate> kTestRoster = [
  ComposerCandidate(id: 'u_jordan', display: 'Jordan Lee'),
  ComposerCandidate(id: 'u_alex', display: 'Alex Kim'),
  ComposerCandidate(id: 'u_sam', display: 'Sam Field'),
];

/// A synchronous local mention trigger over [kTestRoster].
ComposerTrigger mentionTrigger({
  List<ComposerCandidate> roster = kTestRoster,
  Set<String> extraBoundaryChars = const {},
  bool wrapNavigation = true,
  int maxQueryLength = 40,
}) {
  return ComposerTrigger(
    id: 'mention',
    symbol: '@',
    extraBoundaryChars: extraBoundaryChars,
    wrapNavigation: wrapNavigation,
    maxQueryLength: maxQueryLength,
    resolve: (query) => [
      for (final c in roster)
        if (c.display.toLowerCase().startsWith(query.toLowerCase())) c,
    ],
  );
}

/// A synchronous slash-command trigger scoped to the message start.
ComposerTrigger slashTrigger() {
  return ComposerTrigger(
    id: 'slash-command',
    symbol: '/',
    scope: ComposerTriggerScope.startOfMessage,
    queryPattern: RegExp(r'^[a-z0-9-]*$'),
    resolve: (query) => [
      for (final name in const ['help', 'poll', 'remind'])
        if (name.startsWith(query))
          ComposerCandidate(id: name, display: '/$name'),
    ],
  );
}

/// A `#` tag trigger: closeOnSpace false, query pattern allowing spaces.
ComposerTrigger tagTrigger({int maxQueryLength = 40}) {
  return ComposerTrigger(
    id: 'tag',
    symbol: '#',
    closeOnSpace: false,
    maxQueryLength: maxQueryLength,
    queryPattern: RegExp(r"^[\w' -]*$"),
    resolve: (query) => [
      for (final name in const ['groceries', 'weekend trip'])
        if (name.startsWith(query.toLowerCase()))
          ComposerCandidate(id: 't_$name', display: name),
    ],
  );
}

/// A multi-character `!!` quick-reply trigger.
ComposerTrigger bangBangTrigger() {
  return ComposerTrigger(
    id: 'quick-reply',
    symbol: '!!',
    resolve: (query) => const [
      ComposerCandidate(id: 'omw', display: 'On my way!'),
    ],
    buildDisplay: (candidate) => candidate.display,
  );
}

/// Collects core events for assertions.
class EventLog {
  final List<ComposerEvent> events = [];
  void call(ComposerEvent event) => events.add(event);

  Iterable<T> ofType<T extends ComposerEvent>() => events.whereType<T>();
}
