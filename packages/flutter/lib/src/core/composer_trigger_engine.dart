/// Pure-Dart trigger and shortcode detection for the composer core.
///
/// No `package:flutter` imports — see `composer_types.dart` for the
/// rationale. Detection is a pure function of `(text, caret, config)` so
/// it can be property-tested without a widget tree.
library;

import 'package:characters/characters.dart';

import 'composer_types.dart';

/// Default boundary characters: start-of-text is implicit; these are the
/// characters allowed immediately before a trigger symbol.
const Set<String> kComposerDefaultBoundaryChars = {' ', '\t', '\n'};

/// A raw detection result (pre-dismissal-filtering).
class ComposerTriggerMatch {
  /// The matched trigger configuration.
  final ComposerTrigger trigger;

  /// UTF-16 offset of the symbol's first character.
  final int symbolStart;

  /// Text between the symbol and the caret.
  final String query;

  /// Creates a match.
  const ComposerTriggerMatch({
    required this.trigger,
    required this.symbolStart,
    required this.query,
  });
}

/// A `:shortcode:` occurrence eligible for direct-typed commit.
class ComposerShortcodeMatch {
  /// UTF-16 offset of the opening colon.
  final int start;

  /// The shortcode name without colons (`fire`).
  final String shortcode;

  /// The replacement text (`🔥`).
  final String replacement;

  /// Creates a match.
  const ComposerShortcodeMatch({
    required this.start,
    required this.shortcode,
    required this.replacement,
  });
}

/// Detects the live (nearest-to-caret) armed trigger, scanning backward
/// from [caret] only — cost is bounded by the largest configured
/// `maxQueryLength + symbol.length`, independent of how long the message
/// prefix is.
///
/// Returns null while [isComposing] (IME composition suspends detection),
/// when the caret is inside a committed token, or when no trigger's
/// activation rules match.
ComposerTriggerMatch? detectActiveTrigger({
  required String text,
  required int caret,
  required List<ComposerTrigger> triggers,
  List<ComposerToken> tokens = const [],
  bool isComposing = false,
}) {
  if (isComposing || triggers.isEmpty) return null;
  if (caret < 0 || caret > text.length) return null;

  ComposerTriggerMatch? best;
  for (final trigger in triggers) {
    final match = _detectForTrigger(text, caret, trigger, tokens);
    if (match == null) continue;
    // Nearest symbol before the caret wins across all triggers; on a tie
    // (overlapping symbols like '@' vs '@@') the longer symbol wins
    // because it is the more specific configuration.
    if (best == null ||
        match.symbolStart > best.symbolStart ||
        (match.symbolStart == best.symbolStart &&
            match.trigger.symbol.length > best.trigger.symbol.length)) {
      best = match;
    }
  }
  return best;
}

ComposerTriggerMatch? _detectForTrigger(
  String text,
  int caret,
  ComposerTrigger trigger,
  List<ComposerToken> tokens,
) {
  final symbol = trigger.symbol;
  // Backward-scan window: the symbol must start within
  // maxQueryLength + symbol.length UTF-16 units of the caret. Grapheme
  // clusters are never shorter than one unit, so this window is always
  // wide enough for maxQueryLength graphemes.
  final windowStart = (caret - trigger.maxQueryLength * 2 - symbol.length)
      .clamp(0, caret);
  var searchFrom = caret - symbol.length;
  while (searchFrom >= windowStart) {
    final symbolStart = text.lastIndexOf(symbol, searchFrom);
    if (symbolStart < windowStart || symbolStart < 0) return null;
    final match = _validateOccurrence(
      text,
      caret,
      trigger,
      tokens,
      symbolStart,
    );
    if (match != null) return match;
    searchFrom = symbolStart - 1;
  }
  return null;
}

ComposerTriggerMatch? _validateOccurrence(
  String text,
  int caret,
  ComposerTrigger trigger,
  List<ComposerToken> tokens,
  int symbolStart,
) {
  final symbolEnd = symbolStart + trigger.symbol.length;
  if (symbolEnd > caret) return null;

  // Never arm inside (or overlapping) a committed token's range.
  for (final token in tokens) {
    if (symbolStart < token.end && caret > token.start) return null;
  }

  // Scope: boundary is checked against the symbol's FIRST character.
  switch (trigger.scope) {
    case ComposerTriggerScope.startOfMessage:
      if (symbolStart != 0) return null;
    case ComposerTriggerScope.startOfLine:
      if (symbolStart != 0 && text[symbolStart - 1] != '\n') return null;
    case ComposerTriggerScope.anywhere:
      break;
  }
  if (!trigger.allowMidWord && symbolStart > 0) {
    final before = text[symbolStart - 1];
    final isBoundary =
        kComposerDefaultBoundaryChars.contains(before) ||
        trigger.extraBoundaryChars.contains(before);
    if (!isBoundary) return null;
  }

  final query = text.substring(symbolEnd, caret);
  if (ComposerRules.graphemeLength(query) > trigger.maxQueryLength) {
    return null; // silent cancel past the budget
  }
  if (trigger.closeOnSpace && query.contains(RegExp(r'\s'))) return null;
  if (!trigger.queryPattern.hasMatch(query)) return null;

  return ComposerTriggerMatch(
    trigger: trigger,
    symbolStart: symbolStart,
    query: query,
  );
}

final RegExp _shortcodeName = RegExp(r'^[a-z0-9_+-]+$');

/// Detects a just-completed `:shortcode:` immediately before [caret] and
/// looks it up in [shortcodes] (name → replacement). Returns null when the
/// span is absent, malformed, unknown, or overlaps a committed token.
///
/// Callers should invoke this only when the last typed character was the
/// closing `:` — direct-typed commit is a typing gesture, so pasted
/// look-alike text is never auto-converted.
ComposerShortcodeMatch? detectShortcodeCommit({
  required String text,
  required int caret,
  required Map<String, String> shortcodes,
  List<ComposerToken> tokens = const [],
}) {
  if (shortcodes.isEmpty) return null;
  if (caret < 2 || caret > text.length) return null;
  if (text[caret - 1] != ':') return null;
  final open = text.lastIndexOf(':', caret - 2);
  if (open < 0) return null;
  final name = text.substring(open + 1, caret - 1);
  if (name.isEmpty || !_shortcodeName.hasMatch(name)) return null;
  final replacement = shortcodes[name];
  if (replacement == null) return null;
  for (final token in tokens) {
    if (open < token.end && caret > token.start) return null;
  }
  return ComposerShortcodeMatch(
    start: open,
    shortcode: name,
    replacement: replacement,
  );
}

/// Clamps [inserted] so `existingGraphemes + inserted` fits in
/// [maxLength] graphemes; never bisects a cluster. Returns the (possibly
/// shortened) slice and how many graphemes were dropped.
({String text, int trimmed}) clampInsertion({
  required String inserted,
  required int existingGraphemes,
  required int? maxLength,
}) {
  if (maxLength == null || inserted.isEmpty) {
    return (text: inserted, trimmed: 0);
  }
  final budget = maxLength - existingGraphemes;
  if (budget <= 0) {
    return (text: '', trimmed: ComposerRules.graphemeLength(inserted));
  }
  final chars = inserted.characters;
  final total = chars.length;
  if (total <= budget) return (text: inserted, trimmed: 0);
  return (text: chars.take(budget).toString(), trimmed: total - budget);
}
