/// Pure-Dart value types for the Refraction composer headless core.
///
/// This library MUST NOT import `package:flutter` — the core is
/// framework-agnostic so it can be unit tested with plain `dart test`
/// semantics and mirrored 1:1 by the TypeScript `@refraction-ui/composer`
/// core. Anything that needs a `BuildContext`, colors, or widgets lives in
/// `lib/src/components/composer.dart`.
library;

import 'dart:async' show FutureOr;

import 'package:characters/characters.dart';

/// Where a [ComposerTrigger] symbol is allowed to arm.
enum ComposerTriggerScope {
  /// The symbol may arm anywhere in the message (mentions, tags, emoji).
  anywhere,

  /// The symbol arms only at the start of a line (offset 0 or right after
  /// a newline).
  startOfLine,

  /// The symbol arms only at offset 0 of the whole message (slash
  /// commands).
  startOfMessage,
}

/// Resolves suggestion candidates for a trigger query.
///
/// May return synchronously (local rosters, static command lists) or
/// asynchronously (remote search). Async resolvers are debounced, guarded
/// against stale responses, and circuit-broken by the core.
typedef ComposerSuggestionResolver =
    FutureOr<List<ComposerCandidate>> Function(String query);

/// Builds the frozen display text a committed token contributes to the
/// plain-text value (e.g. `@Jordan Lee` for a mention, `🔥` for an emoji).
typedef ComposerDisplayBuilder = String Function(ComposerCandidate candidate);

/// Configuration for one trigger symbol (`@`, `/`, `:`, `#`, `!!`, …).
///
/// A trigger is *configuration, not code* — the detection engine is
/// symbol-agnostic and never special-cases any particular character.
class ComposerTrigger {
  /// Stable identifier, becomes the committed token's `type`
  /// (`'mention'`, `'slash-command'`, `'emoji'`, `'tag'`, …).
  final String id;

  /// The symbol that arms the trigger. Any length (`'@'`, `'!!'`).
  final String symbol;

  /// Where the symbol is allowed to arm. Defaults to
  /// [ComposerTriggerScope.anywhere].
  final ComposerTriggerScope scope;

  /// Pattern the query (text between symbol and caret) must match to keep
  /// the trigger armed. Defaults to `^\S*$` (no whitespace).
  final RegExp queryPattern;

  /// Queries longer than this (in grapheme clusters) silently cancel the
  /// trigger. Defaults to 40.
  final int maxQueryLength;

  /// Whether typing a space cancels the trigger. Defaults to `true`;
  /// `#`-style tags set `false` so `#weekend trip` stays armed.
  final bool closeOnSpace;

  /// When `true` the symbol may arm mid-word, trading away the
  /// `alice@example.com` protection. Defaults to `false`.
  final bool allowMidWord;

  /// Extra characters (besides start-of-text, space, tab, newline) that
  /// count as a boundary before the symbol, e.g. `{'(', '"'}`.
  final Set<String> extraBoundaryChars;

  /// Debounce applied before calling [resolve]. Use [Duration.zero] for
  /// local synchronous resolvers.
  final Duration debounce;

  /// How many results the adapter should show before scrolling.
  final int maxVisibleResults;

  /// Whether Up/Down navigation wraps around the ends of the list.
  final bool wrapNavigation;

  /// Produces suggestion candidates for the current query.
  final ComposerSuggestionResolver resolve;

  /// Builds the committed token's display text. Defaults to
  /// `symbol + candidate.display` (mentions/tags); emoji triggers override
  /// it to return the bare unicode.
  final ComposerDisplayBuilder? buildDisplay;

  /// Creates a trigger configuration.
  ComposerTrigger({
    required this.id,
    required this.symbol,
    required this.resolve,
    this.scope = ComposerTriggerScope.anywhere,
    RegExp? queryPattern,
    this.maxQueryLength = 40,
    this.closeOnSpace = true,
    this.allowMidWord = false,
    this.extraBoundaryChars = const {},
    this.debounce = Duration.zero,
    this.maxVisibleResults = 6,
    this.wrapNavigation = true,
    this.buildDisplay,
  }) : assert(symbol.isNotEmpty, 'trigger symbol must not be empty'),
       queryPattern = queryPattern ?? _defaultQueryPattern;

  static final RegExp _defaultQueryPattern = RegExp(r'^\S*$');
}

/// One selectable row in the suggestion overlay.
class ComposerCandidate {
  /// Stable identity of the referenced entity (user id, command name,
  /// shortcode, …). Becomes the committed token's `id`.
  final String id;

  /// Human-readable label shown in the menu and used to build the token's
  /// display text.
  final String display;

  /// Optional secondary line (handle, command description, …).
  final String? subtitle;

  /// Host-defined extras carried through untouched.
  final Map<String, Object?>? metadata;

  /// Creates a suggestion candidate.
  const ComposerCandidate({
    required this.id,
    required this.display,
    this.subtitle,
    this.metadata,
  });
}

/// A committed, atomic token embedded in the plain-text value.
///
/// [start]/[end] are UTF-16 offsets into the current plain text and always
/// satisfy `plainText.substring(start, end) == display`. The [display] is
/// frozen at insert time — later renames of the referenced entity never
/// mutate an already-committed token.
class ComposerToken {
  /// The trigger id that produced the token (`'mention'`, `'emoji'`, …).
  final String type;

  /// Stable identity of the referenced entity.
  final String id;

  /// The literal text this token contributes to the plain-text value.
  final String display;

  /// Inclusive UTF-16 start offset into the plain text.
  final int start;

  /// Exclusive UTF-16 end offset (`start + display.length`).
  final int end;

  /// Creates a committed token.
  const ComposerToken({
    required this.type,
    required this.id,
    required this.display,
    required this.start,
  }) : end = start + display.length;

  /// Returns a copy shifted by [delta] UTF-16 units (edits before the
  /// token move it without changing its identity).
  ComposerToken shift(int delta) =>
      ComposerToken(type: type, id: id, display: display, start: start + delta);

  /// JSON wire shape — identical to the React/Astro adapters' output.
  Map<String, Object?> toJson() => {
    'type': type,
    'id': id,
    'display': display,
    'start': start,
    'end': end,
  };

  @override
  String toString() => 'ComposerToken($type:$id "$display" [$start,$end))';
}

/// Media category of a [ComposerAttachment].
enum ComposerAttachmentKind { text, image, video, audio, file }

/// Upload lifecycle of a [ComposerAttachment].
enum ComposerAttachmentStatus { pending, uploading, ready, error }

/// A typed attachment staged in the composer tray.
class ComposerAttachment {
  /// Unique id (assigned via the core's injected `generateId` when added).
  final String id;

  /// Media category.
  final ComposerAttachmentKind kind;

  /// File/display name shown on the chip.
  final String name;

  /// Optional MIME type (`image/png`, …).
  final String? mimeType;

  /// Optional size used for `maxAttachmentSizeBytes` validation.
  final int? sizeBytes;

  /// Optional preview URL/path for thumbnail rendering.
  final String? previewUrl;

  /// Upload lifecycle state.
  final ComposerAttachmentStatus status;

  /// Optional upload progress in `[0, 1]`.
  final double? progress;

  /// Human-readable error when [status] is
  /// [ComposerAttachmentStatus.error].
  final String? errorMessage;

  /// Host-defined extras carried through untouched.
  final Map<String, Object?>? metadata;

  /// Creates an attachment. When staging a new one, leave [id] empty and
  /// let `ComposerCore.addAttachment` assign it.
  const ComposerAttachment({
    this.id = '',
    required this.kind,
    required this.name,
    this.mimeType,
    this.sizeBytes,
    this.previewUrl,
    this.status = ComposerAttachmentStatus.pending,
    this.progress,
    this.errorMessage,
    this.metadata,
  });

  /// Returns a copy with the given fields replaced.
  ComposerAttachment copyWith({
    String? id,
    ComposerAttachmentKind? kind,
    String? name,
    String? mimeType,
    int? sizeBytes,
    String? previewUrl,
    ComposerAttachmentStatus? status,
    double? progress,
    String? errorMessage,
    Map<String, Object?>? metadata,
  }) {
    return ComposerAttachment(
      id: id ?? this.id,
      kind: kind ?? this.kind,
      name: name ?? this.name,
      mimeType: mimeType ?? this.mimeType,
      sizeBytes: sizeBytes ?? this.sizeBytes,
      previewUrl: previewUrl ?? this.previewUrl,
      status: status ?? this.status,
      progress: progress ?? this.progress,
      errorMessage: errorMessage ?? this.errorMessage,
      metadata: metadata ?? this.metadata,
    );
  }
}

/// The optimistic snapshot `ComposerCore.submit()` hands to the host.
class ComposerSubmission {
  /// Trimmed plain text (leading/trailing whitespace removed; internal
  /// whitespace preserved verbatim).
  final String plainText;

  /// Committed tokens with UTF-16 ranges into [plainText].
  final List<ComposerToken> tokens;

  /// Attachments staged at submit time.
  final List<ComposerAttachment> attachments;

  /// Message being replied to, when set on the core.
  final String? replyToMessageId;

  /// Message being edited when submitted from edit mode.
  final String? editingMessageId;

  /// Creates a submission snapshot.
  const ComposerSubmission({
    required this.plainText,
    required this.tokens,
    this.attachments = const [],
    this.replyToMessageId,
    this.editingMessageId,
  });
}

/// The always-in-sync structured projection of the current value —
/// `plainText` with derived token ranges (`ComposerCore.serialize()`).
class ComposerDocument {
  /// The current plain-text value (token displays inlined).
  final String plainText;

  /// Committed tokens; `plainText.substring(t.start, t.end) == t.display`
  /// holds for every entry.
  final List<ComposerToken> tokens;

  /// Creates a document snapshot.
  const ComposerDocument({required this.plainText, required this.tokens});

  /// JSON wire shape — identical to the React/Astro adapters' output.
  Map<String, Object?> toJson() => {
    'plainText': plainText,
    'tokens': [for (final t in tokens) t.toJson()],
  };
}

/// A UTF-16 selection pair (collapsed when `start == end`).
class ComposerSelection {
  /// Inclusive start offset.
  final int start;

  /// Exclusive end offset (caret position when collapsed).
  final int end;

  /// Creates a selection.
  const ComposerSelection({required this.start, required this.end});

  /// A collapsed selection (caret) at [offset].
  const ComposerSelection.collapsed(int offset) : start = offset, end = offset;

  /// Whether this selection is a caret (no extent).
  bool get isCollapsed => start == end;

  @override
  bool operator ==(Object other) =>
      other is ComposerSelection && other.start == start && other.end == end;

  @override
  int get hashCode => Object.hash(start, end);

  @override
  String toString() => 'ComposerSelection($start, $end)';
}

/// The currently armed (pre-commit) trigger occurrence.
class ComposerActiveTrigger {
  /// The trigger configuration that armed.
  final ComposerTrigger trigger;

  /// UTF-16 offset of the symbol's first character.
  final int symbolStart;

  /// Text between the symbol and the caret.
  final String query;

  /// Creates an active-trigger descriptor.
  const ComposerActiveTrigger({
    required this.trigger,
    required this.symbolStart,
    required this.query,
  });
}

/// Async suggestion menu state.
class ComposerSuggestionState {
  /// Whether the menu is open (an armed, non-dismissed trigger exists).
  final bool isOpen;

  /// Resolved candidates for the current query.
  final List<ComposerCandidate> items;

  /// Index of the highlighted candidate.
  final int activeIndex;

  /// True only when the resolver has been pending longer than the
  /// loading-delay threshold (~120ms) — prevents skeleton flicker.
  final bool loading;

  /// Non-null when the last resolution threw (retryable).
  final String? error;

  /// Monotonic generation counter used as the staleness guard.
  final int requestToken;

  /// Creates a suggestion-state snapshot.
  const ComposerSuggestionState({
    this.isOpen = false,
    this.items = const [],
    this.activeIndex = 0,
    this.loading = false,
    this.error,
    this.requestToken = 0,
  });

  /// The closed/empty state.
  static const ComposerSuggestionState closed = ComposerSuggestionState();
}

/// Coarse phase of the composer state machine.
enum ComposerPhase {
  idle,
  typing,
  triggerActive,
  sending,
  error,
  disabled,
  readOnly,
}

/// Counter visibility derived from the remaining grapheme budget.
class ComposerCounter {
  /// Graphemes still available (negative when over the limit).
  final int remaining;

  /// Counter shows only when ≤20% of the budget remains.
  final bool isVisible;

  /// Styling flag — the budget is exhausted (`remaining <= 0`).
  final bool isAtLimit;

  /// Whether the text exceeds the limit (send must be disabled). Cannot
  /// normally happen because clamping runs at the insert boundary; kept as
  /// a defensive signal.
  final bool overLimit;

  /// Creates a counter snapshot.
  const ComposerCounter({
    required this.remaining,
    required this.isVisible,
    required this.isAtLimit,
    required this.overLimit,
  });
}

/// Immutable snapshot of the whole composer state.
class ComposerState {
  /// The plain-text value (token displays inlined).
  final String value;

  /// Current selection/caret.
  final ComposerSelection selection;

  /// Whether an IME composition is in flight.
  final bool isComposing;

  /// Whether the host marked the composer busy (AI response streaming,
  /// message in flight, …). Blocks submit.
  final bool isBusy;

  /// Whether the composer is disabled (fully non-interactive).
  final bool isDisabled;

  /// Whether the composer is read-only (selectable/copyable, not
  /// editable).
  final bool isReadOnly;

  /// Host-surfaced error message (draft preserved).
  final String? error;

  /// Committed tokens, ordered by [ComposerToken.start].
  final List<ComposerToken> tokens;

  /// Staged attachments.
  final List<ComposerAttachment> attachments;

  /// The armed trigger, if any.
  final ComposerActiveTrigger? activeTrigger;

  /// Suggestion menu state.
  final ComposerSuggestionState suggestion;

  /// Message id being edited (edit-in-place mode), else null.
  final String? editingMessageId;

  /// Message id being replied to, else null.
  final String? replyToMessageId;

  /// Whether the trimmed text and attachments allow submitting.
  final bool canSend;

  /// Counter snapshot, or null when no maxLength is configured.
  final ComposerCounter? counter;

  /// Creates a state snapshot.
  const ComposerState({
    required this.value,
    required this.selection,
    required this.isComposing,
    required this.isBusy,
    required this.isDisabled,
    required this.isReadOnly,
    required this.error,
    required this.tokens,
    required this.attachments,
    required this.activeTrigger,
    required this.suggestion,
    required this.editingMessageId,
    required this.replyToMessageId,
    required this.canSend,
    required this.counter,
  });

  /// True when the value is empty (whitespace counts as content here;
  /// see [canSend] for the trimmed check).
  bool get isEmpty => value.isEmpty;

  /// Coarse phase derived from the flags.
  ComposerPhase get phase {
    if (isDisabled) return ComposerPhase.disabled;
    if (isReadOnly) return ComposerPhase.readOnly;
    if (isBusy) return ComposerPhase.sending;
    if (error != null) return ComposerPhase.error;
    if (suggestion.isOpen) return ComposerPhase.triggerActive;
    if (value.isNotEmpty) return ComposerPhase.typing;
    return ComposerPhase.idle;
  }
}

/// Pure composer rules — shared by the enable-check, the paste clamp, and
/// the Enter handler so they can never disagree.
class ComposerRules {
  /// Maximum length in grapheme clusters, or null for unlimited.
  final int? maxLength;

  /// Fraction of the budget below which the counter becomes visible.
  static const double counterVisibleFraction = 0.2;

  /// Creates the rules bundle.
  const ComposerRules({this.maxLength});

  /// Length of [input] in grapheme clusters (a 👨‍👩‍👧‍👦 ZWJ family counts as 1).
  static int graphemeLength(String input) => input.characters.length;

  /// Truncates [input] to [maxLength] grapheme clusters — never bisects a
  /// surrogate pair, ZWJ sequence, or combining mark. Returns [input]
  /// unchanged when no limit is set or it already fits.
  String clamp(String input) {
    final limit = maxLength;
    if (limit == null) return input;
    final chars = input.characters;
    if (chars.length <= limit) return input;
    return chars.take(limit).toString();
  }

  /// One shared payload derivation: trims leading/trailing whitespace and
  /// preserves internal whitespace verbatim.
  String payloadFor(String rawText) => rawText.trim();

  /// Whether the trimmed text and/or attachments constitute a sendable
  /// message. Whitespace-only text is never sendable on its own.
  bool canSend(String rawText, {bool hasAttachments = false}) {
    if (payloadFor(rawText).isNotEmpty) {
      final limit = maxLength;
      if (limit != null && graphemeLength(rawText) > limit) return false;
      return true;
    }
    return hasAttachments;
  }

  /// The Enter matrix: a physical Enter submits only when neither Shift
  /// is held nor an IME composition is in flight — composing always wins.
  bool shouldSubmitOnEnter({
    required bool shiftPressed,
    required bool isComposing,
  }) => !shiftPressed && !isComposing;

  /// Derives the counter snapshot for [rawText], or null when no limit is
  /// configured.
  ComposerCounter? counterFor(String rawText) {
    final limit = maxLength;
    if (limit == null) return null;
    final remaining = limit - graphemeLength(rawText);
    return ComposerCounter(
      remaining: remaining,
      isVisible: remaining <= limit * counterVisibleFraction,
      isAtLimit: remaining <= 0,
      overLimit: remaining < 0,
    );
  }
}

/// A persisted draft: value, tokens, attachment ids, and freshness stamp.
class ComposerDraft {
  /// The plain-text value.
  final String value;

  /// Committed tokens at save time.
  final List<ComposerToken> tokens;

  /// Ids of staged attachments (payloads are host-owned; only identity is
  /// persisted).
  final List<String> attachmentIds;

  /// When the draft was written (from the core's injected `now`).
  final DateTime updatedAt;

  /// Creates a draft snapshot.
  const ComposerDraft({
    required this.value,
    required this.tokens,
    this.attachmentIds = const [],
    required this.updatedAt,
  });
}

/// Host-injected draft persistence seam.
///
/// The Flutter package persists nothing by default — hosts inject a store
/// (Drift, shared_preferences, …). Reads that throw are treated as
/// "no draft" (fail closed).
abstract class ComposerDraftStore {
  /// Reads the draft for [key], or null when absent.
  FutureOr<ComposerDraft?> read(String key);

  /// Writes [draft] for [key].
  FutureOr<void> write(String key, ComposerDraft draft);

  /// Deletes the draft for [key].
  FutureOr<void> clear(String key);
}

/// Simple synchronous in-memory [ComposerDraftStore] (default for tests
/// and single-session drafts).
class ComposerInMemoryDraftStore implements ComposerDraftStore {
  final Map<String, ComposerDraft> _drafts = {};

  @override
  ComposerDraft? read(String key) => _drafts[key];

  @override
  void write(String key, ComposerDraft draft) => _drafts[key] = draft;

  @override
  void clear(String key) => _drafts.remove(key);
}

/// Out-of-band core notifications (paste trimmed, rejected inserts, …).
sealed class ComposerEvent {
  const ComposerEvent();
}

/// Pasted/inserted text was truncated by the grapheme-safe clamp.
class ComposerTextTrimmedEvent extends ComposerEvent {
  /// How many grapheme clusters were dropped.
  final int trimmedGraphemes;

  /// Creates the event.
  const ComposerTextTrimmedEvent(this.trimmedGraphemes);
}

/// A programmatic insertion was rejected (over limit, mid-composition, or
/// mid-token).
class ComposerInsertRejectedEvent extends ComposerEvent {
  /// Machine-readable reason (`'maxLength'`, `'composing'`, `'token'`).
  final String reason;

  /// Creates the event.
  const ComposerInsertRejectedEvent(this.reason);
}

/// An attachment draft was rejected by the configured limits.
class ComposerAttachmentRejectedEvent extends ComposerEvent {
  /// The rejected draft.
  final ComposerAttachment attachment;

  /// Machine-readable reason (`'maxAttachments'`, `'size'`, `'accept'`).
  final String reason;

  /// Creates the event.
  const ComposerAttachmentRejectedEvent(this.attachment, this.reason);
}

/// Result of a host-supplied submit validator.
class ComposerValidationResult {
  /// Whether submission may proceed.
  final bool isValid;

  /// Human-readable reason when invalid.
  final String? reason;

  /// A passing result.
  const ComposerValidationResult.valid() : isValid = true, reason = null;

  /// A failing result with a [reason].
  const ComposerValidationResult.invalid(this.reason) : isValid = false;
}

/// Host-supplied submit validator run by `trySubmit`.
typedef ComposerValidator =
    ComposerValidationResult Function(
      String plainText,
      List<ComposerToken> tokens,
    );
