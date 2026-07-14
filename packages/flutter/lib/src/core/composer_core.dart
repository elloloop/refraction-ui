/// The pure-Dart headless composer state machine.
///
/// Zero `package:flutter` imports — the core is constructible and fully
/// testable without a widget tree, and mirrors the TypeScript
/// `@refraction-ui/composer` core so React/Flutter emit identical
/// structured output. Time and id generation are injected (defaults are
/// applied only at the construction boundary) so behavior is
/// deterministic under test.
library;

import 'dart:async';

import 'composer_trigger_engine.dart';
import 'composer_types.dart';

/// Signature of a state listener registered via [ComposerCore.subscribe].
typedef ComposerStateListener = void Function(ComposerState state);

/// Headless composer core: one flat string value + selection pair,
/// committed atomic tokens, trigger/suggestion machinery, attachments,
/// drafts, and optimistic submit.
///
/// Widgets talk to the core through `RefractionComposerController`; the
/// core itself never imports Flutter.
class ComposerCore {
  /// Length/trim/enter rules shared by every decision path.
  final ComposerRules rules;

  /// Configured triggers (symbol-agnostic engine).
  final List<ComposerTrigger> triggers;

  /// Shortcode table for direct-typed `:name:` commits (name → unicode).
  final Map<String, String> shortcodes;

  /// Maximum number of staged attachments, or null for unlimited.
  final int? maxAttachments;

  /// Maximum attachment size in bytes, or null for unlimited.
  final int? maxAttachmentSizeBytes;

  /// Optional attachment acceptance predicate.
  final bool Function(ComposerAttachment draft)? acceptAttachment;

  /// Debounce for draft autosave. Defaults to 400ms.
  final Duration draftDebounce;

  /// Leading-edge throttle for [onTypingActivity]. Defaults to 3s.
  final Duration typingThrottle;

  /// How long a pending resolver may run before `loading` turns on.
  final Duration loadingDelay;

  /// Grace period for [dismissSuggestionDeferred] so a pointer tap on a
  /// suggestion row can land before blur closes the menu.
  final Duration dismissGrace;

  /// Out-of-band event sink (trimmed paste, rejected inserts/attachments).
  /// Mutable so adapters can wire it after construction.
  void Function(ComposerEvent event)? onEvent;

  /// Throttled typing-activity signal (for "X is typing…" indicators).
  /// Mutable so adapters can wire it after construction.
  void Function()? onTypingActivity;

  final ComposerDraftStore? _draftStore;
  final String? _draftKey;
  final DateTime Function() _now;
  late final String Function() _generateId;

  final String _initialValue;
  final List<ComposerToken> _initialTokens;

  String _value;
  ComposerSelection _selection;
  List<ComposerToken> _tokens;
  final List<ComposerAttachment> _attachments = [];
  bool _isComposing = false;
  bool _isBusy = false;
  bool _isDisabled;
  bool _isReadOnly;
  String? _error;
  String? _replyToMessageId;
  String? _editingMessageId;
  ComposerActiveTrigger? _activeTrigger;
  ComposerSuggestionState _suggestion = ComposerSuggestionState.closed;

  /// Escape-dismissed trigger occurrences that must not re-arm until the
  /// symbol itself is deleted and retyped (positions shift with edits).
  final List<({String triggerId, int symbolStart})> _dismissed = [];

  /// Consecutive resolver failures per trigger id (circuit breaker input).
  final Map<String, int> _errorStreaks = {};

  /// Trigger ids whose resolver is circuit-broken for this session.
  final Set<String> _tripped = {};

  /// Clip shadow: the last deleted slice that contained whole tokens, so a
  /// cut+paste within this instance restores the live tokens (E12).
  ({String text, List<ComposerToken> tokens})? _clipShadow;

  final List<ComposerStateListener> _listeners = [];

  Timer? _resolveDebounce;
  Timer? _loadingTimer;
  Timer? _draftTimer;
  Timer? _deferredDismiss;
  int _requestGeneration = 0;
  DateTime? _lastTypingAt;
  int _idCounter = 0;
  bool _destroyed = false;

  /// Creates a composer core.
  ///
  /// [now] and [generateId] are injectable for determinism; the defaults
  /// (wall clock, monotonic per-instance counter) are applied here at the
  /// construction boundary only — no other code path reads the clock.
  ComposerCore({
    String initialValue = '',
    List<ComposerToken> initialTokens = const [],
    int? maxLength,
    this.triggers = const [],
    this.shortcodes = const {},
    this.maxAttachments,
    this.maxAttachmentSizeBytes,
    this.acceptAttachment,
    ComposerDraftStore? draftStore,
    String? draftKey,
    this.draftDebounce = const Duration(milliseconds: 400),
    this.typingThrottle = const Duration(seconds: 3),
    this.loadingDelay = const Duration(milliseconds: 120),
    this.dismissGrace = const Duration(milliseconds: 120),
    bool disabled = false,
    bool readOnly = false,
    String? replyToMessageId,
    DateTime Function()? now,
    String Function()? generateId,
    this.onEvent,
    this.onTypingActivity,
  }) : rules = ComposerRules(maxLength: maxLength),
       _draftStore = draftStore,
       _draftKey = draftKey,
       _now = now ?? DateTime.now,
       _isDisabled = disabled,
       _isReadOnly = readOnly,
       _replyToMessageId = replyToMessageId,
       _initialValue = initialValue,
       _initialTokens = List.unmodifiable(initialTokens),
       _value = initialValue,
       _selection = ComposerSelection.collapsed(initialValue.length),
       _tokens = _validTokensFor(initialValue, initialTokens) {
    // Default id generator is a deterministic per-instance counter —
    // injected here at the construction boundary only.
    _generateId = generateId ?? () => 'composer-${++_idCounter}';
    _restoreDraft();
  }

  static List<ComposerToken> _validTokensFor(
    String value,
    List<ComposerToken> tokens,
  ) {
    // Fail closed: drop any token whose range doesn't project its display.
    final valid = [
      for (final t in tokens)
        if (t.start >= 0 &&
            t.end <= value.length &&
            value.substring(t.start, t.end) == t.display)
          t,
    ]..sort((a, b) => a.start.compareTo(b.start));
    return valid;
  }

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------

  /// Point-in-time snapshot of the full composer state.
  ComposerState get state => ComposerState(
    value: _value,
    selection: _selection,
    isComposing: _isComposing,
    isBusy: _isBusy,
    isDisabled: _isDisabled,
    isReadOnly: _isReadOnly,
    error: _error,
    tokens: List.unmodifiable(_tokens),
    attachments: List.unmodifiable(_attachments),
    activeTrigger: _activeTrigger,
    suggestion: _suggestion,
    editingMessageId: _editingMessageId,
    replyToMessageId: _replyToMessageId,
    canSend:
        !_isDisabled &&
        !_isReadOnly &&
        !_isBusy &&
        rules.canSend(_value, hasAttachments: _attachments.isNotEmpty),
    counter: rules.counterFor(_value),
  );

  /// Subscribes [listener] to every state transition. Returns a callback
  /// that unsubscribes.
  void Function() subscribe(ComposerStateListener listener) {
    _listeners.add(listener);
    return () => unsubscribe(listener);
  }

  /// Removes a previously subscribed [listener].
  void unsubscribe(ComposerStateListener listener) {
    _listeners.remove(listener);
  }

  void _notify() {
    if (_destroyed) return;
    final snapshot = state;
    for (final listener in List.of(_listeners)) {
      listener(snapshot);
    }
  }

  void _emit(ComposerEvent event) => onEvent?.call(event);

  // ---------------------------------------------------------------------
  // Value & selection
  // ---------------------------------------------------------------------

  /// Applies a full new [text] (typically a raw edit from the platform
  /// text pipeline) plus an optional [selection].
  ///
  /// The core diffs against the previous value, enforces token atomicity
  /// (whole-token delete, mid-token typing rejection), clamps at the
  /// insert boundary, then re-runs shortcode/trigger detection. Set
  /// [userGenerated] false for host-programmatic writes so they don't
  /// fire the typing-activity signal.
  void setValue(
    String text, {
    ComposerSelection? selection,
    bool userGenerated = true,
  }) {
    if (_destroyed || _isDisabled) return;
    if (_isReadOnly) {
      if (text == _value && selection != null) setSelection(selection);
      return;
    }
    if (text == _value) {
      if (selection != null && selection != _selection) {
        setSelection(selection);
      }
      return;
    }
    final diff = _diff(_value, text);
    _applyUserEdit(
      diff.start,
      diff.endOld,
      diff.inserted,
      requestedSelection: selection,
      userGenerated: userGenerated,
      truncateOverflow: true,
    );
  }

  /// Moves the selection/caret. Carets never rest strictly inside a
  /// committed token — they snap directionally to a boundary, which makes
  /// arrow keys skip over a token as one unit; ranges expand outward to
  /// whole-token bounds.
  void setSelection(ComposerSelection selection) {
    if (_destroyed || _isDisabled) return;
    final snapped = _snapSelection(selection, previousExtent: _selection.end);
    _selection = snapped;
    // Any caret move re-evaluates the active trigger (closes it when the
    // caret exits the [symbolStart, caret] range).
    _runDetection();
    _notify();
  }

  /// Inserts [text] at the caret (replacing any active selection); the
  /// caret lands after the inserted graphemes. No-ops with an event while
  /// composing or when the insertion would exceed [ComposerRules.maxLength].
  void insertTextAtCursor(String text) {
    if (_destroyed || _isDisabled || _isReadOnly || text.isEmpty) return;
    if (_isComposing) {
      // Splicing into an active IME composition corrupts the candidate
      // buffer — reject instead of queueing (§3.2).
      _emit(const ComposerInsertRejectedEvent('composing'));
      return;
    }
    _applyUserEdit(
      _selection.start,
      _selection.end,
      text,
      userGenerated: false,
      truncateOverflow: false,
    );
  }

  /// IME composition start/end. Detection, clamping, drafts, and
  /// submit-on-Enter are all suspended while composing; ending a
  /// composition re-runs detection on the committed text.
  void setComposing(bool isComposing) {
    if (_destroyed || _isComposing == isComposing) return;
    _isComposing = isComposing;
    if (isComposing) {
      // Suspend without dismissing: the occurrence may legitimately
      // re-arm once the composition commits.
      _cancelResolve();
      _activeTrigger = null;
      _suggestion = ComposerSuggestionState(
        requestToken: _suggestion.requestToken,
      );
    } else {
      _runDetection();
    }
    _notify();
  }

  // ---------------------------------------------------------------------
  // Edit pipeline
  // ---------------------------------------------------------------------

  static ({int start, int endOld, String inserted}) _diff(
    String oldText,
    String newText,
  ) {
    var prefix = 0;
    final minLen = oldText.length < newText.length
        ? oldText.length
        : newText.length;
    while (prefix < minLen &&
        oldText.codeUnitAt(prefix) == newText.codeUnitAt(prefix)) {
      prefix++;
    }
    var oldEnd = oldText.length;
    var newEnd = newText.length;
    while (oldEnd > prefix &&
        newEnd > prefix &&
        oldText.codeUnitAt(oldEnd - 1) == newText.codeUnitAt(newEnd - 1)) {
      oldEnd--;
      newEnd--;
    }
    return (
      start: prefix,
      endOld: oldEnd,
      inserted: newText.substring(prefix, newEnd),
    );
  }

  void _applyUserEdit(
    int editStart,
    int editEndOld,
    String inserted, {
    ComposerSelection? requestedSelection,
    required bool userGenerated,
    required bool truncateOverflow,
  }) {
    final old = _value;
    var start = editStart;
    var endOld = editEndOld;
    var ins = inserted;
    var canonicalized = false;

    if (endOld == start && ins.isNotEmpty) {
      // Pure insertion: typing strictly inside a committed token is
      // rejected — the value is restored and the caret snaps to the
      // nearest token boundary.
      for (final t in _tokens) {
        if (start > t.start && start < t.end) {
          final snap = (start - t.start) <= (t.end - start) ? t.start : t.end;
          _selection = ComposerSelection.collapsed(snap);
          _emit(const ComposerInsertRejectedEvent('token'));
          _notify();
          return;
        }
      }
    } else if (endOld > start) {
      // Deletion/replacement: an edit overlapping part of a token expands
      // to delete the whole token atomically.
      for (final t in _tokens) {
        if (t.start < endOld && t.end > start) {
          if (t.start < start) {
            start = t.start;
            canonicalized = true;
          }
          if (t.end > endOld) {
            endOld = t.end;
            canonicalized = true;
          }
        }
      }
    }

    // Grapheme-safe clamp at the insert boundary.
    if (rules.maxLength != null && ins.isNotEmpty) {
      final keptText = old.substring(0, start) + old.substring(endOld);
      final clamped = clampInsertion(
        inserted: ins,
        existingGraphemes: ComposerRules.graphemeLength(keptText),
        maxLength: rules.maxLength,
      );
      if (clamped.trimmed > 0) {
        if (!truncateOverflow) {
          _emit(const ComposerInsertRejectedEvent('maxLength'));
          _notify();
          return;
        }
        if (clamped.text.isEmpty && endOld == start) {
          // Nothing fits: reject the keystroke and push the restored
          // value back to the platform pipeline.
          _emit(const ComposerInsertRejectedEvent('maxLength'));
          _notify();
          return;
        }
        _emit(ComposerTextTrimmedEvent(clamped.trimmed));
        ins = clamped.text;
        canonicalized = true;
      }
    }

    final removed = old.substring(start, endOld);
    final newValue = old.replaceRange(start, endOld, ins);
    final delta = ins.length - (endOld - start);

    final removedTokens = <ComposerToken>[];
    var nextTokens = <ComposerToken>[];
    for (final t in _tokens) {
      if (t.end <= start) {
        nextTokens.add(t);
      } else if (t.start >= endOld) {
        nextTokens.add(t.shift(delta));
      } else {
        removedTokens.add(t);
      }
    }

    // Clip shadow: remember a deleted slice containing whole tokens so a
    // cut+paste inside this instance restores them; pasting look-alike
    // text from elsewhere never re-tokenizes.
    if (removedTokens.isNotEmpty && removed.isNotEmpty) {
      _clipShadow = (
        text: removed,
        tokens: [for (final t in removedTokens) t.shift(-start)],
      );
    }
    final shadow = _clipShadow;
    if (ins.isNotEmpty && shadow != null && ins == shadow.text) {
      nextTokens.addAll([for (final t in shadow.tokens) t.shift(start)]);
      nextTokens.sort((a, b) => a.start.compareTo(b.start));
    }

    _value = newValue;
    _tokens = nextTokens;
    _shiftDismissed(start, endOld, delta);

    var caret = start + ins.length;
    if (!canonicalized && requestedSelection != null) {
      _selection = _snapSelection(requestedSelection, previousExtent: caret);
    } else {
      _selection = ComposerSelection.collapsed(caret);
    }

    // Direct-typed `:shortcode:` commit — a typing gesture only (the
    // closing colon was the single inserted character).
    if (ins == ':' && endOld == editStart && _selection.isCollapsed) {
      final commit = detectShortcodeCommit(
        text: _value,
        caret: _selection.end,
        shortcodes: shortcodes,
        tokens: _tokens,
      );
      if (commit != null) {
        _replaceRangeWithToken(
          commit.start,
          _selection.end,
          type: 'emoji',
          id: ':${commit.shortcode}:',
          display: commit.replacement,
        );
        return; // _replaceRangeWithToken finishes the pipeline
      }
    }

    _runDetection();
    if (userGenerated) _maybeFireTyping();
    _scheduleDraftWrite();
    _notify();
  }

  ComposerSelection _snapSelection(
    ComposerSelection selection, {
    int? previousExtent,
  }) {
    int clampOffset(int o) =>
        o < 0 ? 0 : (o > _value.length ? _value.length : o);
    if (selection.isCollapsed) {
      final offset = clampOffset(selection.end);
      for (final t in _tokens) {
        if (offset > t.start && offset < t.end) {
          if (previousExtent != null && previousExtent != offset) {
            // Directional snap → arrow keys skip the token as one unit.
            return ComposerSelection.collapsed(
              previousExtent < offset ? t.end : t.start,
            );
          }
          return ComposerSelection.collapsed(
            (offset - t.start) <= (t.end - offset) ? t.start : t.end,
          );
        }
      }
      return ComposerSelection.collapsed(offset);
    }
    var start = clampOffset(selection.start);
    var end = clampOffset(selection.end);
    for (final t in _tokens) {
      if (start > t.start && start < t.end) start = t.start;
      if (end > t.start && end < t.end) end = t.end;
    }
    return ComposerSelection(start: start, end: end);
  }

  void _shiftDismissed(int start, int endOld, int delta) {
    _dismissed.removeWhere(
      (d) => d.symbolStart >= start && d.symbolStart < endOld,
    );
    for (var i = 0; i < _dismissed.length; i++) {
      final d = _dismissed[i];
      if (d.symbolStart >= endOld) {
        _dismissed[i] = (
          triggerId: d.triggerId,
          symbolStart: d.symbolStart + delta,
        );
      }
    }
  }

  // ---------------------------------------------------------------------
  // Triggers & suggestions
  // ---------------------------------------------------------------------

  void _runDetection() {
    if (!_selection.isCollapsed || _isReadOnly || _isDisabled) {
      _updateActiveTrigger(null);
      return;
    }
    var match = detectActiveTrigger(
      text: _value,
      caret: _selection.end,
      triggers: triggers,
      tokens: _tokens,
      isComposing: _isComposing,
    );
    if (match != null &&
        _dismissed.any(
          (d) =>
              d.triggerId == match!.trigger.id &&
              d.symbolStart == match.symbolStart,
        )) {
      match = null;
    }
    _updateActiveTrigger(match);
  }

  void _updateActiveTrigger(ComposerTriggerMatch? match) {
    _deferredDismiss?.cancel();
    if (match == null) {
      if (_activeTrigger != null || _suggestion.isOpen) {
        _cancelResolve();
        _activeTrigger = null;
        _suggestion = ComposerSuggestionState(
          requestToken: _suggestion.requestToken,
        );
      }
      return;
    }
    if (_tripped.contains(match.trigger.id)) {
      // Circuit breaker: fall back to no-suggestions, silently.
      _cancelResolve();
      _activeTrigger = null;
      _suggestion = ComposerSuggestionState(
        requestToken: _suggestion.requestToken,
      );
      return;
    }
    final current = _activeTrigger;
    final sameOccurrence =
        current != null &&
        current.trigger.id == match.trigger.id &&
        current.symbolStart == match.symbolStart;
    final queryChanged = !sameOccurrence || current.query != match.query;
    _activeTrigger = ComposerActiveTrigger(
      trigger: match.trigger,
      symbolStart: match.symbolStart,
      query: match.query,
    );
    if (!sameOccurrence) {
      _suggestion = ComposerSuggestionState(
        isOpen: true,
        requestToken: _suggestion.requestToken,
      );
      _scheduleResolve();
    } else if (queryChanged) {
      _suggestion = ComposerSuggestionState(
        isOpen: true,
        items: _suggestion.items,
        activeIndex: _suggestion.activeIndex,
        loading: _suggestion.loading,
        requestToken: _suggestion.requestToken,
      );
      _scheduleResolve();
    }
  }

  void _scheduleResolve() {
    _resolveDebounce?.cancel();
    final active = _activeTrigger;
    if (active == null) return;
    if (active.trigger.debounce == Duration.zero) {
      // Local resolvers fire without a timer so synchronous results are
      // available in the same transition.
      _resolveNow();
    } else {
      _resolveDebounce = Timer(active.trigger.debounce, _resolveNow);
    }
  }

  void _resolveNow() {
    final active = _activeTrigger;
    if (active == null || _destroyed) return;
    final generation = ++_requestGeneration;
    _suggestion = ComposerSuggestionState(
      isOpen: true,
      items: _suggestion.items,
      activeIndex: _suggestion.activeIndex,
      requestToken: generation,
    );
    FutureOr<List<ComposerCandidate>> pending;
    try {
      pending = active.trigger.resolve(active.query);
    } catch (error) {
      _applyResolveError(generation, active, error);
      return;
    }
    if (pending is List<ComposerCandidate>) {
      _applyResolveResults(generation, active, pending);
      return;
    }
    _loadingTimer?.cancel();
    _loadingTimer = Timer(loadingDelay, () {
      if (_destroyed || generation != _requestGeneration) return;
      if (!_isSameOccurrence(active)) return;
      _suggestion = ComposerSuggestionState(
        isOpen: true,
        items: _suggestion.items,
        activeIndex: _suggestion.activeIndex,
        loading: true,
        requestToken: generation,
      );
      _notify();
    });
    pending.then(
      (items) => _applyResolveResults(generation, active, items),
      onError: (Object error) => _applyResolveError(generation, active, error),
    );
  }

  bool _isSameOccurrence(ComposerActiveTrigger occurrence) {
    final active = _activeTrigger;
    return active != null &&
        active.trigger.id == occurrence.trigger.id &&
        active.symbolStart == occurrence.symbolStart;
  }

  void _applyResolveResults(
    int generation,
    ComposerActiveTrigger occurrence,
    List<ComposerCandidate> items,
  ) {
    if (_destroyed || generation != _requestGeneration) return; // stale
    if (!_isSameOccurrence(occurrence)) return; // trigger canceled meanwhile
    _loadingTimer?.cancel();
    _errorStreaks[occurrence.trigger.id] = 0;
    _suggestion = ComposerSuggestionState(
      isOpen: true,
      items: List.unmodifiable(items),
      requestToken: generation,
    );
    _notify();
  }

  void _applyResolveError(
    int generation,
    ComposerActiveTrigger occurrence,
    Object error,
  ) {
    if (_destroyed || generation != _requestGeneration) return;
    if (!_isSameOccurrence(occurrence)) return;
    _loadingTimer?.cancel();
    final id = occurrence.trigger.id;
    final streak = (_errorStreaks[id] ?? 0) + 1;
    _errorStreaks[id] = streak;
    if (streak >= 2) {
      // Two consecutive failures: stop resolving this trigger for the
      // rest of the session and close the menu silently.
      _tripped.add(id);
      _activeTrigger = null;
      _suggestion = ComposerSuggestionState(requestToken: generation);
      _notify();
      return;
    }
    _suggestion = ComposerSuggestionState(
      isOpen: true,
      error: '$error',
      requestToken: generation,
    );
    _notify();
  }

  /// Moves the suggestion highlight down (wrapping per the trigger's
  /// `wrapNavigation`).
  void moveSuggestionNext() => _moveSuggestion(1);

  /// Moves the suggestion highlight up (wrapping per the trigger's
  /// `wrapNavigation`).
  void moveSuggestionPrevious() => _moveSuggestion(-1);

  void _moveSuggestion(int direction) {
    final active = _activeTrigger;
    if (active == null || !_suggestion.isOpen || _suggestion.items.isEmpty) {
      return;
    }
    final count = _suggestion.items.length;
    var next = _suggestion.activeIndex + direction;
    if (active.trigger.wrapNavigation) {
      next = (next + count) % count;
    } else {
      if (next < 0) next = 0;
      if (next > count - 1) next = count - 1;
    }
    if (next == _suggestion.activeIndex) return;
    _suggestion = ComposerSuggestionState(
      isOpen: true,
      items: _suggestion.items,
      activeIndex: next,
      loading: _suggestion.loading,
      error: _suggestion.error,
      requestToken: _suggestion.requestToken,
    );
    _notify();
  }

  /// Sets the highlighted suggestion (pointer hover — last-input-wins
  /// with keyboard navigation).
  void setSuggestionActiveIndex(int index) {
    if (!_suggestion.isOpen ||
        index < 0 ||
        index >= _suggestion.items.length ||
        index == _suggestion.activeIndex) {
      return;
    }
    _suggestion = ComposerSuggestionState(
      isOpen: true,
      items: _suggestion.items,
      activeIndex: index,
      loading: _suggestion.loading,
      error: _suggestion.error,
      requestToken: _suggestion.requestToken,
    );
    _notify();
  }

  /// Commits the highlighted (or [index]-th) suggestion as an atomic
  /// token, replacing `[symbolStart, caret)` in one transaction.
  void applySuggestion([int? index]) {
    final active = _activeTrigger;
    if (active == null || !_suggestion.isOpen || _suggestion.items.isEmpty) {
      return;
    }
    var i = index ?? _suggestion.activeIndex;
    if (i < 0) i = 0;
    if (i >= _suggestion.items.length) i = _suggestion.items.length - 1;
    final candidate = _suggestion.items[i];
    final display =
        active.trigger.buildDisplay?.call(candidate) ??
        '${active.trigger.symbol}${candidate.display}';
    _replaceRangeWithToken(
      active.symbolStart,
      _selection.end,
      type: active.trigger.id,
      id: candidate.id,
      display: display,
    );
  }

  void _replaceRangeWithToken(
    int start,
    int endOld, {
    required String type,
    required String id,
    required String display,
  }) {
    // A token commit that would exceed the limit is rejected as a unit —
    // a truncated token would desync display and range.
    if (rules.maxLength != null) {
      final keptText = _value.substring(0, start) + _value.substring(endOld);
      final total =
          ComposerRules.graphemeLength(keptText) +
          ComposerRules.graphemeLength(display);
      if (total > rules.maxLength!) {
        _emit(const ComposerInsertRejectedEvent('maxLength'));
        _cancelResolve();
        _activeTrigger = null;
        _suggestion = ComposerSuggestionState(
          requestToken: _suggestion.requestToken,
        );
        _notify();
        return;
      }
    }
    final delta = display.length - (endOld - start);
    _value = _value.replaceRange(start, endOld, display);
    final next = <ComposerToken>[];
    for (final t in _tokens) {
      if (t.end <= start) {
        next.add(t);
      } else if (t.start >= endOld) {
        next.add(t.shift(delta));
      }
      // Tokens overlapping the replaced range cannot exist (detection
      // never arms inside a token) — dropped defensively if they do.
    }
    next.add(ComposerToken(type: type, id: id, display: display, start: start));
    next.sort((a, b) => a.start.compareTo(b.start));
    _tokens = next;
    _shiftDismissed(start, endOld, delta);
    _selection = ComposerSelection.collapsed(start + display.length);
    _cancelResolve();
    _activeTrigger = null;
    _suggestion = ComposerSuggestionState(
      requestToken: _suggestion.requestToken,
    );
    _scheduleDraftWrite();
    _notify();
  }

  /// Dismisses the open suggestion menu (Escape). The occurrence is
  /// remembered and will not re-arm until its symbol is deleted and
  /// retyped.
  void dismissSuggestion() {
    _deferredDismiss?.cancel();
    final active = _activeTrigger;
    if (active == null && !_suggestion.isOpen) return;
    if (active != null) {
      _dismissed.add((
        triggerId: active.trigger.id,
        symbolStart: active.symbolStart,
      ));
    }
    _cancelResolve();
    _activeTrigger = null;
    _suggestion = ComposerSuggestionState(
      requestToken: _suggestion.requestToken,
    );
    _notify();
  }

  /// Dismisses after a short grace period so a pointer tap on a
  /// suggestion row can land first (blur handling).
  void dismissSuggestionDeferred() {
    if (_activeTrigger == null && !_suggestion.isOpen) return;
    _deferredDismiss?.cancel();
    _deferredDismiss = Timer(dismissGrace, dismissSuggestion);
  }

  /// Cancels a pending deferred dismissal (refocus before the grace
  /// period elapsed).
  void cancelDeferredDismiss() => _deferredDismiss?.cancel();

  /// Re-runs the resolver after an error state.
  void retrySuggestions() {
    if (_activeTrigger == null) return;
    _resolveNow();
  }

  void _cancelResolve() {
    _resolveDebounce?.cancel();
    _loadingTimer?.cancel();
  }

  // ---------------------------------------------------------------------
  // Attachments
  // ---------------------------------------------------------------------

  /// Stages [draft]; returns its id, or null when rejected by the
  /// configured limits (rejections surface as
  /// [ComposerAttachmentRejectedEvent], never a throw).
  String? addAttachment(ComposerAttachment draft) {
    if (_destroyed || _isDisabled) return null;
    if (maxAttachments != null && _attachments.length >= maxAttachments!) {
      _emit(ComposerAttachmentRejectedEvent(draft, 'maxAttachments'));
      _notify();
      return null;
    }
    final size = draft.sizeBytes;
    if (maxAttachmentSizeBytes != null &&
        size != null &&
        size > maxAttachmentSizeBytes!) {
      _emit(ComposerAttachmentRejectedEvent(draft, 'size'));
      _notify();
      return null;
    }
    if (acceptAttachment != null && !acceptAttachment!(draft)) {
      _emit(ComposerAttachmentRejectedEvent(draft, 'accept'));
      _notify();
      return null;
    }
    final id = draft.id.isNotEmpty ? draft.id : _generateId();
    _attachments.add(draft.copyWith(id: id));
    _scheduleDraftWrite();
    _notify();
    return id;
  }

  /// Patches the attachment with [id] (upload progress, status, …).
  void updateAttachment(
    String id, {
    ComposerAttachmentStatus? status,
    double? progress,
    String? errorMessage,
    String? previewUrl,
    String? name,
  }) {
    final index = _attachments.indexWhere((a) => a.id == id);
    if (index < 0) return;
    _attachments[index] = _attachments[index].copyWith(
      status: status,
      progress: progress,
      errorMessage: errorMessage,
      previewUrl: previewUrl,
      name: name,
    );
    _notify();
  }

  /// Removes the attachment with [id].
  void removeAttachment(String id) {
    final before = _attachments.length;
    _attachments.removeWhere((a) => a.id == id);
    if (_attachments.length != before) {
      _scheduleDraftWrite();
      _notify();
    }
  }

  // ---------------------------------------------------------------------
  // Flags, edit mode, submit
  // ---------------------------------------------------------------------

  /// Marks the composer busy (in-flight send / streaming response).
  void setBusy(bool busy) {
    if (_isBusy == busy) return;
    _isBusy = busy;
    _notify();
  }

  /// Surfaces (or clears) a host error. The draft is preserved.
  void setError(String? error) {
    if (_error == error) return;
    _error = error;
    _notify();
  }

  /// Enables/disables the composer entirely.
  void setDisabled(bool disabled) {
    if (_isDisabled == disabled) return;
    _isDisabled = disabled;
    _notify();
  }

  /// Toggles read-only mode (selectable/copyable, not editable).
  void setReadOnly(bool readOnly) {
    if (_isReadOnly == readOnly) return;
    _isReadOnly = readOnly;
    _notify();
  }

  /// Sets the reply target carried into the next submission.
  void setReplyTo(String? messageId) {
    if (_replyToMessageId == messageId) return;
    _replyToMessageId = messageId;
    _notify();
  }

  ({
    String value,
    List<ComposerToken> tokens,
    List<ComposerAttachment> attachments,
    ComposerSelection selection,
  })?
  _preEditStash;

  /// Message id currently being edited, or null in compose mode.
  String? get editingMessageId => _editingMessageId;

  /// Enters edit-in-place mode: stashes the in-progress draft and seeds
  /// the field with the message being edited.
  void beginEdit({
    required String value,
    List<ComposerToken> tokens = const [],
    required String messageId,
  }) {
    if (_destroyed || _isDisabled) return;
    _preEditStash = (
      value: _value,
      tokens: _tokens,
      attachments: List.of(_attachments),
      selection: _selection,
    );
    _editingMessageId = messageId;
    _value = value;
    _tokens = _validTokensFor(value, tokens);
    _attachments.clear();
    _selection = ComposerSelection.collapsed(value.length);
    _cancelResolve();
    _activeTrigger = null;
    _suggestion = ComposerSuggestionState(
      requestToken: _suggestion.requestToken,
    );
    _notify();
  }

  /// Leaves edit mode restoring the pre-edit draft (Escape).
  void cancelEdit() {
    if (_editingMessageId == null) return;
    final stash = _preEditStash;
    _editingMessageId = null;
    _preEditStash = null;
    if (stash != null) {
      _value = stash.value;
      _tokens = stash.tokens;
      _attachments
        ..clear()
        ..addAll(stash.attachments);
      _selection = stash.selection;
    } else {
      _clearContent();
    }
    _notify();
  }

  /// Optimistic submit: validates via `canSend`, snapshots the
  /// submission, clears the field synchronously, and returns the
  /// snapshot. Returns null iff `!canSend` (value untouched) — transport
  /// and failure/restore are the host's responsibility.
  ComposerSubmission? submit() {
    if (_destroyed || !state.canSend) return null;
    final raw = _value;
    final leading = raw.length - raw.trimLeft().length;
    final submission = ComposerSubmission(
      plainText: rules.payloadFor(raw),
      tokens: List.unmodifiable([for (final t in _tokens) t.shift(-leading)]),
      attachments: List.unmodifiable(_attachments),
      replyToMessageId: _replyToMessageId,
      editingMessageId: _editingMessageId,
    );
    final wasEditing = _editingMessageId != null;
    _editingMessageId = null;
    if (wasEditing && _preEditStash != null) {
      // Editing done: hand the user back the message they were composing.
      final stash = _preEditStash!;
      _preEditStash = null;
      _value = stash.value;
      _tokens = stash.tokens;
      _attachments
        ..clear()
        ..addAll(stash.attachments);
      _selection = stash.selection;
    } else {
      _clearContent();
    }
    _clearDraft();
    _notify();
    return submission;
  }

  void _clearContent() {
    _value = '';
    _tokens = [];
    _attachments.clear();
    _selection = const ComposerSelection.collapsed(0);
    _error = null;
    _cancelResolve();
    _activeTrigger = null;
    _dismissed.clear();
    _clipShadow = null;
    _suggestion = ComposerSuggestionState(
      requestToken: _suggestion.requestToken,
    );
  }

  /// Clears text, tokens, and attachments (keeps disabled/readOnly/busy
  /// flags and the session's dismissals/breaker state semantics of a
  /// fresh message).
  void clear() {
    if (_destroyed) return;
    _clearContent();
    _notify();
  }

  /// Restores the initial (constructor) value and clears transient state.
  void reset() {
    if (_destroyed) return;
    _clearContent();
    _value = _initialValue;
    _tokens = _validTokensFor(_initialValue, _initialTokens);
    _selection = ComposerSelection.collapsed(_initialValue.length);
    _editingMessageId = null;
    _preEditStash = null;
    _isBusy = false;
    _draftTimer?.cancel();
    _notify();
  }

  /// The always-in-sync structured projection of the current value.
  ComposerDocument serialize() =>
      ComposerDocument(plainText: _value, tokens: List.unmodifiable(_tokens));

  // ---------------------------------------------------------------------
  // Drafts & typing signal
  // ---------------------------------------------------------------------

  void _restoreDraft() {
    final store = _draftStore;
    final key = _draftKey;
    if (store == null || key == null) return;
    void apply(ComposerDraft? draft) {
      if (_destroyed || draft == null || _value.isNotEmpty) return;
      _value = rules.clamp(draft.value);
      _tokens = _validTokensFor(_value, draft.tokens);
      _selection = ComposerSelection.collapsed(_value.length);
      _notify();
    }

    try {
      final result = store.read(key);
      if (result is Future<ComposerDraft?>) {
        result.then(apply).catchError((Object _) {
          // Corrupt/unreadable draft → clean empty state (fail closed).
        });
      } else {
        apply(result);
      }
    } catch (_) {
      // Fail closed.
    }
  }

  void _scheduleDraftWrite() {
    if (_draftStore == null || _draftKey == null) return;
    _draftTimer?.cancel();
    _draftTimer = Timer(draftDebounce, _writeDraft);
  }

  void _writeDraft() {
    final store = _draftStore;
    final key = _draftKey;
    if (store == null || key == null || _destroyed) return;
    // Never persist mid-IME-composition text.
    if (_isComposing) return;
    try {
      final result = store.write(
        key,
        ComposerDraft(
          value: _value,
          tokens: List.unmodifiable(_tokens),
          attachmentIds: [for (final a in _attachments) a.id],
          updatedAt: _now(),
        ),
      );
      if (result is Future<void>) {
        result.catchError((Object _) {});
      }
    } catch (_) {
      // Persistence failures never break composing.
    }
  }

  /// Forces a pending debounced draft write to run now.
  void flushDraft() {
    _draftTimer?.cancel();
    _writeDraft();
  }

  void _clearDraft() {
    _draftTimer?.cancel();
    final store = _draftStore;
    final key = _draftKey;
    if (store == null || key == null) return;
    try {
      final result = store.clear(key);
      if (result is Future<void>) {
        result.catchError((Object _) {});
      }
    } catch (_) {
      // Ignore persistence failures.
    }
  }

  void _maybeFireTyping() {
    final callback = onTypingActivity;
    if (callback == null || _isDisabled) return;
    final now = _now();
    final last = _lastTypingAt;
    if (last == null || now.difference(last) >= typingThrottle) {
      _lastTypingAt = now;
      callback();
    }
  }

  // ---------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------

  /// Cancels every pending timer/async continuation and drops listeners.
  /// The core is unusable afterwards.
  void destroy() {
    _destroyed = true;
    _resolveDebounce?.cancel();
    _loadingTimer?.cancel();
    _draftTimer?.cancel();
    _deferredDismiss?.cancel();
    _listeners.clear();
  }
}
