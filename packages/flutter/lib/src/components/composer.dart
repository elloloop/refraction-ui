import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';

import '../core/composer_core.dart';
import '../core/composer_types.dart';
import '../theme/refraction_colors.dart';
import '../theme/refraction_theme.dart';
import 'emoji_picker.dart' show EmojiData;

export '../core/composer_core.dart';
export '../core/composer_trigger_engine.dart';
export '../core/composer_types.dart';

/// Density variant for [RefractionComposer] (issue #426 §2.9).
enum ComposerDensity {
  /// Dense secondary surfaces (embedded/toolbar composers). Its 40dp hit
  /// target is an intentional, reviewed exception below the 44dp floor —
  /// never use compact for a primary, kids-facing conversation composer.
  compact,

  /// The default.
  comfortable,

  /// Accessibility-first spacing (kids-safe surfaces, large type).
  spacious,
}

/// The resolved sizing rhythm for one [ComposerDensity].
///
/// Every geometric decision in the composer reads from this table — no
/// magic numbers inline — so a density swap restyles the whole component.
class ComposerDensityTokens {
  /// Minimum pill height.
  final double minHeight;

  /// The single vertical-padding owner (the pill's padding).
  final double paddingVertical;

  /// Horizontal pill padding.
  final double paddingHorizontal;

  /// Visual/layout size of an action slot.
  final double iconSlotSize;

  /// Tap-target size (decoupled from [iconSlotSize] — bleeds beyond it).
  final double hitTargetSize;

  /// Horizontal spacing between slots and the text area.
  final double gutter;

  /// Text line height in logical pixels (pre text-scaling).
  final double lineHeight;

  /// Font size paired with [lineHeight].
  final double fontSize;

  const ComposerDensityTokens._({
    required this.minHeight,
    required this.paddingVertical,
    required this.paddingHorizontal,
    required this.iconSlotSize,
    required this.hitTargetSize,
    required this.gutter,
    required this.lineHeight,
    required this.fontSize,
  });

  /// Compact table — 40dp hit target is a documented sub-44 exception.
  static const ComposerDensityTokens compact = ComposerDensityTokens._(
    minHeight: 40,
    paddingVertical: 6,
    paddingHorizontal: 8,
    iconSlotSize: 24,
    hitTargetSize: 40,
    gutter: 4,
    lineHeight: 20,
    fontSize: 14,
  );

  /// Comfortable (default) table.
  static const ComposerDensityTokens comfortable = ComposerDensityTokens._(
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    iconSlotSize: 28,
    hitTargetSize: 44,
    gutter: 4,
    lineHeight: 22,
    fontSize: 16,
  );

  /// Spacious table.
  static const ComposerDensityTokens spacious = ComposerDensityTokens._(
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 16,
    iconSlotSize: 36,
    hitTargetSize: 48,
    gutter: 8,
    lineHeight: 26,
    fontSize: 18,
  );

  /// Resolves the token table for [density].
  static ComposerDensityTokens resolve(ComposerDensity density) {
    switch (density) {
      case ComposerDensity.compact:
        return compact;
      case ComposerDensity.comfortable:
        return comfortable;
      case ComposerDensity.spacious:
        return spacious;
    }
  }
}

/// Resolves the platform-default Enter behavior: physical Enter submits on
/// hardware-keyboard modalities (desktop, web) and inserts a newline on
/// touch platforms. Pure function so the matrix is unit-testable.
bool resolveSubmitOnEnter({
  required TargetPlatform platform,
  required bool isWeb,
  bool? override,
}) {
  if (override != null) return override;
  if (isWeb) return true;
  switch (platform) {
    case TargetPlatform.macOS:
    case TargetPlatform.windows:
    case TargetPlatform.linux:
      return true;
    case TargetPlatform.android:
    case TargetPlatform.iOS:
    case TargetPlatform.fuchsia:
      return false;
  }
}

Map<String, String>? _cachedDefaultShortcodes;

/// The default `:shortcode:` table, derived from [EmojiData] (emoji names
/// snake_cased, then keywords, first entry wins). Used by
/// [RefractionComposerController] unless a custom table is injected.
Map<String, String> refractionDefaultShortcodes() {
  final cached = _cachedDefaultShortcodes;
  if (cached != null) return cached;
  final map = <String, String>{};
  for (final entry in EmojiData.getAllEmojis()) {
    map.putIfAbsent(entry.name.replaceAll(' ', '_'), () => entry.emoji);
    for (final keyword in entry.keywords) {
      map.putIfAbsent(keyword.replaceAll(' ', '_'), () => entry.emoji);
    }
  }
  return _cachedDefaultShortcodes = Map.unmodifiable(map);
}

/// Every user-visible or assistive string in [RefractionComposer], with
/// English defaults. Override fields via the constructor; override the
/// format methods by subclassing for locales that need different shapes.
class RefractionComposerStrings {
  /// Accessible name of the input (deliberately distinct from the
  /// presentational placeholder — placeholder-as-label fails WCAG).
  final String fieldLabel;

  /// Send button label.
  final String sendLabel;

  /// Stop button label (busy state).
  final String stopLabel;

  /// Attach button label.
  final String attachLabel;

  /// Suggestion listbox label.
  final String suggestionsLabel;

  /// Empty suggestion state.
  final String suggestionsEmpty;

  /// Failed suggestion state.
  final String suggestionsError;

  /// Retry button in the failed suggestion state.
  final String retryLabel;

  /// Transient banner after a clamped paste.
  final String trimmedNotice;

  /// Creates the strings bundle.
  const RefractionComposerStrings({
    this.fieldLabel = 'Message input',
    this.sendLabel = 'Send message',
    this.stopLabel = 'Stop',
    this.attachLabel = 'Add attachment',
    this.suggestionsLabel = 'Suggestions',
    this.suggestionsEmpty = 'No matches',
    this.suggestionsError = "Couldn't load suggestions",
    this.retryLabel = 'Retry',
    this.trimmedNotice = 'Pasted text was trimmed to fit',
  });

  /// Accessible label for an attachment chip's remove button.
  String removeAttachmentLabel(String name) => 'Remove $name';

  /// Accessible character counter.
  String counterSemantics(int remaining) => '$remaining characters remaining';

  /// Live-region announcement of the suggestion result count.
  String suggestionCount(int count) =>
      count == 1 ? '1 suggestion' : '$count suggestions';
}

/// What the primary-action slot receives so a send ⇄ stop (or send ⇄ mic)
/// swap is a one-prop concern.
class ComposerPrimaryContext {
  /// Whether the trimmed text is non-empty.
  final bool hasText;

  /// Whether submit is currently allowed.
  final bool canSend;

  /// Whether the host marked the composer busy.
  final bool isBusy;

  /// Creates the context.
  const ComposerPrimaryContext({
    required this.hasText,
    required this.canSend,
    required this.isBusy,
  });
}

/// Builds a leading/trailing action slot.
typedef ComposerSlotBuilder =
    Widget Function(
      BuildContext context,
      RefractionComposerController controller,
    );

/// Builds the primary action (send ⇄ stop ⇄ mic …).
typedef ComposerPrimaryBuilder =
    Widget Function(BuildContext context, ComposerPrimaryContext primary);

/// Builds one suggestion overlay row.
typedef ComposerOverlayItemBuilder =
    Widget Function(
      BuildContext context,
      ComposerCandidate candidate, {
      required bool active,
    });

/// Builds the empty overlay state for the current query.
typedef ComposerOverlayEmptyBuilder =
    Widget Function(BuildContext context, String query);

/// Builds the error overlay state with a retry callback.
typedef ComposerOverlayErrorBuilder =
    Widget Function(BuildContext context, String error, VoidCallback retry);

/// [ChangeNotifier] facade over the pure [ComposerCore] — the public
/// imperative API of [RefractionComposer].
///
/// Create one to drive the composer from outside (programmatic inserts,
/// busy/error flags, edit-in-place), or let the widget create an internal
/// one from its props. When you pass a controller, the widget's
/// `maxLength`/`triggers` props are ignored — the controller's
/// configuration wins.
class RefractionComposerController extends ChangeNotifier {
  /// The underlying pure-Dart core (advanced use; prefer the controller
  /// methods).
  final ComposerCore core;

  late final void Function() _unsubscribe;
  bool _disposed = false;

  /// Creates a controller and its core.
  RefractionComposerController({
    String initialValue = '',
    List<ComposerToken> initialTokens = const [],
    int? maxLength,
    List<ComposerTrigger> triggers = const [],
    Map<String, String>? shortcodes,
    int? maxAttachments,
    int? maxAttachmentSizeBytes,
    bool Function(ComposerAttachment draft)? acceptAttachment,
    ComposerDraftStore? draftStore,
    String? draftKey,
    String? replyToMessageId,
    DateTime Function()? now,
    String Function()? generateId,
  }) : core = ComposerCore(
         initialValue: initialValue,
         initialTokens: initialTokens,
         maxLength: maxLength,
         triggers: triggers,
         shortcodes: shortcodes ?? refractionDefaultShortcodes(),
         maxAttachments: maxAttachments,
         maxAttachmentSizeBytes: maxAttachmentSizeBytes,
         acceptAttachment: acceptAttachment,
         draftStore: draftStore,
         draftKey: draftKey,
         replyToMessageId: replyToMessageId,
         now: now,
         generateId: generateId,
       ) {
    _unsubscribe = core.subscribe((_) => notifyListeners());
  }

  /// Point-in-time snapshot of the composer state.
  ComposerState get state => core.state;

  /// Whether the trimmed text is non-empty.
  bool get hasText => state.value.trim().isNotEmpty;

  /// Committed tokens.
  List<ComposerToken> get tokens => state.tokens;

  /// Staged attachments.
  List<ComposerAttachment> get attachments => state.attachments;

  /// The armed trigger occurrence, if any.
  ComposerActiveTrigger? get activeTrigger => state.activeTrigger;

  /// Inserts [text] at the caret (see [ComposerCore.insertTextAtCursor]).
  void insertTextAtCursor(String text) => core.insertTextAtCursor(text);

  /// Moves the suggestion highlight down.
  void moveSuggestionNext() => core.moveSuggestionNext();

  /// Moves the suggestion highlight up.
  void moveSuggestionPrevious() => core.moveSuggestionPrevious();

  /// Sets the suggestion highlight (pointer hover).
  void setSuggestionActiveIndex(int index) =>
      core.setSuggestionActiveIndex(index);

  /// Commits the highlighted (or [index]-th) suggestion as a token.
  void applySuggestion([int? index]) => core.applySuggestion(index);

  /// Dismisses the suggestion menu (Escape semantics).
  void dismissSuggestion() => core.dismissSuggestion();

  /// Re-runs the resolver after an error.
  void retrySuggestions() => core.retrySuggestions();

  /// Stages an attachment; null when rejected (limits surface as
  /// `ComposerAttachmentRejectedEvent`).
  String? addAttachment(ComposerAttachment draft) => core.addAttachment(draft);

  /// Patches a staged attachment.
  void updateAttachment(
    String id, {
    ComposerAttachmentStatus? status,
    double? progress,
    String? errorMessage,
    String? previewUrl,
    String? name,
  }) => core.updateAttachment(
    id,
    status: status,
    progress: progress,
    errorMessage: errorMessage,
    previewUrl: previewUrl,
    name: name,
  );

  /// Removes a staged attachment.
  void removeAttachment(String id) => core.removeAttachment(id);

  /// Marks the composer busy (send ⇄ stop swap).
  void setBusy(bool busy) => core.setBusy(busy);

  /// Surfaces (or clears) a host error.
  void setError(String? error) => core.setError(error);

  /// Sets the reply target carried into the next submission.
  void setReplyTo(String? messageId) => core.setReplyTo(messageId);

  /// Enters edit-in-place mode.
  void beginEdit({
    required String value,
    List<ComposerToken> tokens = const [],
    required String messageId,
  }) => core.beginEdit(value: value, tokens: tokens, messageId: messageId);

  /// Leaves edit mode, restoring the pre-edit draft.
  void cancelEdit() => core.cancelEdit();

  /// Validates (optionally via [validator]) and submits optimistically.
  /// Returns the submission, or null when blocked — a validator failure
  /// surfaces its reason via the state's `error`.
  ComposerSubmission? trySubmit([ComposerValidator? validator]) {
    final snapshot = state;
    if (!snapshot.canSend) return null;
    if (validator != null) {
      final result = validator(
        core.rules.payloadFor(snapshot.value),
        snapshot.tokens,
      );
      if (!result.isValid) {
        core.setError(result.reason);
        return null;
      }
    }
    return core.submit();
  }

  /// Clears text, tokens, and attachments.
  void clear() => core.clear();

  /// Forces a pending debounced draft write.
  void flushDraft() => core.flushDraft();

  @override
  void dispose() {
    if (_disposed) return;
    _disposed = true;
    _unsubscribe();
    core.destroy();
    super.dispose();
  }
}

/// Bridges Flutter's native text pipeline to the [ComposerCore] without a
/// feedback loop: the core stays authoritative — a core-originated update
/// writes into [value] guarded by `_applyingCoreValue`; a user/IME write
/// forwards to the core, which recomputes and pushes back. While an IME
/// composition is in flight the IME owns the text (issue #426 §6.9).
class _RefractionComposerTextEditingController extends TextEditingController {
  final ComposerCore _core;
  late final void Function() _unsubscribeCore;
  bool _applyingCoreValue = false;

  _RefractionComposerTextEditingController(this._core)
    : super(text: _core.state.value) {
    _unsubscribeCore = _core.subscribe(_syncFromCore);
    _syncFromCore(_core.state);
  }

  @override
  set value(TextEditingValue newValue) {
    if (_applyingCoreValue) {
      super.value = newValue;
      return;
    }
    if (newValue.composing.isValid) {
      // The IME owns mid-composition text: hold it locally and only tell
      // the core that composition is active (suspends triggers/clamp).
      _core.setComposing(true);
      super.value = newValue;
      return;
    }
    final wasComposing = value.composing.isValid;
    super.value = newValue;
    if (wasComposing) _core.setComposing(false);
    _core.setValue(
      newValue.text,
      selection: ComposerSelection(
        start: newValue.selection.isValid ? newValue.selection.start : 0,
        end: newValue.selection.isValid
            ? newValue.selection.end
            : newValue.text.length,
      ),
    );
    // The core may have canonicalized (atomic token delete, clamp,
    // shortcode commit) — _syncFromCore already pushed the authoritative
    // value back through the guard.
  }

  void _syncFromCore(ComposerState state) {
    if (value.composing.isValid) return; // IME owns the buffer right now
    _applyingCoreValue = true;
    final length = state.value.length;
    value = TextEditingValue(
      text: state.value,
      selection: TextSelection(
        baseOffset: state.selection.start.clamp(0, length),
        extentOffset: state.selection.end.clamp(0, length),
      ),
    );
    _applyingCoreValue = false;
  }

  @override
  TextSpan buildTextSpan({
    required BuildContext context,
    TextStyle? style,
    required bool withComposing,
  }) {
    final tokens = _core.state.tokens;
    final colors = RefractionTheme.maybeOf(context)?.colors;
    // While composing (or on any transient desync) fall back to the
    // default projection, which honors the composing underline.
    if (tokens.isEmpty ||
        colors == null ||
        value.composing.isValid ||
        _core.state.value != text) {
      return super.buildTextSpan(
        context: context,
        style: style,
        withComposing: withComposing,
      );
    }
    // Chip-like token runs using only what TextSpan supports — no
    // WidgetSpan inside an editable surface (issue #426 §4.4).
    final tokenStyle = (style ?? const TextStyle()).copyWith(
      color: colors.accentForeground,
      background: Paint()..color = colors.accent.withValues(alpha: 0.16),
    );
    final children = <TextSpan>[];
    var cursor = 0;
    for (final token in tokens) {
      if (token.start > cursor) {
        children.add(TextSpan(text: text.substring(cursor, token.start)));
      }
      children.add(
        TextSpan(
          text: text.substring(token.start, token.end),
          style: tokenStyle,
        ),
      );
      cursor = token.end;
    }
    if (cursor < text.length) {
      children.add(TextSpan(text: text.substring(cursor)));
    }
    return TextSpan(style: style, children: children);
  }

  @override
  void dispose() {
    _unsubscribeCore();
    super.dispose();
  }
}

/// A chat composer: auto-growing pill input with action slots, IME-safe
/// Enter-to-send, trigger suggestions (`@`/`/`/`:`/`#`/custom) committing
/// atomic tokens, an attachments tray, drafts, edit-in-place, busy/stop,
/// density variants, RTL mirroring, and full `Semantics`.
///
/// Logic lives in the pure-Dart [ComposerCore]; this widget is a thin
/// binding reading design tokens from [RefractionTheme].
///
/// ```dart
/// RefractionComposer(
///   placeholder: 'Message #general',
///   triggers: [
///     ComposerTrigger(
///       id: 'mention',
///       symbol: '@',
///       resolve: (q) => searchMembers(q),
///     ),
///   ],
///   onSubmit: (submission) => send(submission),
/// )
/// ```
class RefractionComposer extends StatefulWidget {
  /// External controller; when null an internal one is created from the
  /// widget's props and disposed with the widget.
  final RefractionComposerController? controller;

  /// Presentational hint (never the accessible name — see
  /// [RefractionComposerStrings.fieldLabel]).
  final String placeholder;

  /// Distinct hint while [disabled] (e.g. "You can't reply here").
  final String? disabledPlaceholder;

  /// Resting line count. Defaults to 1.
  final int minLines;

  /// Soft line cap: the field stops growing at
  /// `min(lineHeight × maxLines × textScale, 0.4 × viewport)` and scrolls
  /// internally. Defaults to 5.
  final int maxLines;

  /// Maximum length in grapheme clusters (internal controller only).
  final int? maxLength;

  /// Fully non-interactive when true.
  final bool disabled;

  /// Selectable/copyable but not editable when true.
  final bool readOnly;

  /// Autofocus the field on mount.
  final bool autofocus;

  /// Capitalization behavior; defaults to sentences.
  final TextCapitalization textCapitalization;

  /// Sizing rhythm; defaults to [ComposerDensity.comfortable].
  final ComposerDensity density;

  /// Trigger configurations (internal controller only).
  final List<ComposerTrigger> triggers;

  /// Whether a physical Enter submits. Null resolves the platform
  /// default via [resolveSubmitOnEnter] (true on desktop/web, false on
  /// touch). A visible tappable send affordance always exists regardless.
  final bool? submitOnEnter;

  /// Self-contained safe-area handling: keyboard open → inset 0, keyboard
  /// closed → `viewPadding.bottom` (never both). Set false when the host
  /// already wraps the composer in a `SafeArea`.
  final bool padSafeArea;

  /// Custom leading slot. When null, a default attach slot renders iff
  /// [onAttachRequested] is provided.
  final ComposerSlotBuilder? leadingBuilder;

  /// Optional trailing slot (emoji toggle, "+", …).
  final ComposerSlotBuilder? trailingBuilder;

  /// Custom primary action; the default renders send ⇄ stop from the
  /// [ComposerPrimaryContext].
  final ComposerPrimaryBuilder? primaryBuilder;

  /// Custom suggestion row.
  final ComposerOverlayItemBuilder? overlayItemBuilder;

  /// Custom empty state for the suggestion overlay.
  final ComposerOverlayEmptyBuilder? overlayEmptyBuilder;

  /// Custom loading state for the suggestion overlay.
  final WidgetBuilder? overlayLoadingBuilder;

  /// Custom error state for the suggestion overlay.
  final ComposerOverlayErrorBuilder? overlayErrorBuilder;

  /// Submit validator; a failure blocks submission and surfaces its
  /// reason through the error banner.
  final ComposerValidator? validator;

  /// UI/semantics strings (English defaults).
  final RefractionComposerStrings strings;

  /// Fired on every committed value change.
  final ValueChanged<String>? onChanged;

  /// Fired with the optimistic snapshot when a submission passes.
  final ValueChanged<ComposerSubmission>? onSubmit;

  /// Fired when the primary slot's stop affordance is tapped while busy.
  final VoidCallback? onStop;

  /// Fired by ArrowUp on an empty field (desktop/web modality) — wire to
  /// "edit my last message".
  final VoidCallback? onEditLastRequested;

  /// Throttled typing signal (default: leading edge, max once per 3s).
  final VoidCallback? onTypingActivity;

  /// Fired when an attachment draft is rejected by the configured limits.
  final void Function(ComposerAttachmentRejectedEvent event)?
  onAttachmentRejected;

  /// Fired by the default attach slot; when null (and no
  /// [leadingBuilder]) the attach slot is omitted entirely.
  final VoidCallback? onAttachRequested;

  /// Creates a [RefractionComposer].
  const RefractionComposer({
    super.key,
    this.controller,
    this.placeholder = 'Message',
    this.disabledPlaceholder,
    this.minLines = 1,
    this.maxLines = 5,
    this.maxLength,
    this.disabled = false,
    this.readOnly = false,
    this.autofocus = false,
    this.textCapitalization = TextCapitalization.sentences,
    this.density = ComposerDensity.comfortable,
    this.triggers = const [],
    this.submitOnEnter,
    this.padSafeArea = true,
    this.leadingBuilder,
    this.trailingBuilder,
    this.primaryBuilder,
    this.overlayItemBuilder,
    this.overlayEmptyBuilder,
    this.overlayLoadingBuilder,
    this.overlayErrorBuilder,
    this.validator,
    this.strings = const RefractionComposerStrings(),
    this.onChanged,
    this.onSubmit,
    this.onStop,
    this.onEditLastRequested,
    this.onTypingActivity,
    this.onAttachmentRejected,
    this.onAttachRequested,
  });

  @override
  State<RefractionComposer> createState() => _RefractionComposerState();
}

class _RefractionComposerState extends State<RefractionComposer> {
  static const Duration _growDuration = Duration(milliseconds: 180);
  static const Curve _growCurve = Curves.easeOutCubic;

  /// Deltas larger than this per change are non-incremental
  /// (paste/dictation) and snap without animation (issue #426 §3.1).
  static const int _snapDeltaThreshold = 2;
  static const Duration _noticeDuration = Duration(seconds: 4);

  /// Estimated overlay height used for the above/below flip decision.
  static const double _overlayFlipThreshold = 280;

  late RefractionComposerController _controller;
  bool _ownsController = false;
  late _RefractionComposerTextEditingController _textController;
  late final FocusNode _focusNode;
  UndoHistoryController _undoController = UndoHistoryController();
  final LayerLink _layerLink = LayerLink();
  final GlobalKey _pillKey = GlobalKey();
  OverlayEntry? _overlayEntry;
  String _lastValue = '';
  Duration _resizeDuration = _growDuration;
  bool _noticeVisible = false;
  Timer? _noticeTimer;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? _createController();
    _ownsController = widget.controller == null;
    // Flags are synced before wiring listeners so the initial transitions
    // never call setState during initState.
    _controller.core.setDisabled(widget.disabled);
    _controller.core.setReadOnly(widget.readOnly);
    _wire(_controller);
    _textController = _RefractionComposerTextEditingController(
      _controller.core,
    );
    _focusNode = FocusNode(debugLabel: 'RefractionComposer');
    _focusNode.addListener(_handleFocusChanged);
    _lastValue = _controller.state.value;
  }

  RefractionComposerController _createController() {
    return RefractionComposerController(
      maxLength: widget.maxLength,
      triggers: widget.triggers,
    );
  }

  void _wire(RefractionComposerController controller) {
    controller.addListener(_handleControllerChanged);
    controller.core.onEvent = _handleCoreEvent;
    controller.core.onTypingActivity = _handleTypingActivity;
  }

  void _unwire(RefractionComposerController controller) {
    controller.removeListener(_handleControllerChanged);
    controller.core.onEvent = null;
    controller.core.onTypingActivity = null;
  }

  @override
  void didUpdateWidget(RefractionComposer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller != oldWidget.controller) {
      // Controller swap: close overlays, transfer disposal ownership, and
      // rebuild the text bridge against the new core (leak-safe).
      _removeOverlay();
      _unwire(_controller);
      final previousController = _controller;
      final previousText = _textController;
      _controller = widget.controller ?? _createController();
      _ownsController = widget.controller == null;
      _wire(_controller);
      _textController = _RefractionComposerTextEditingController(
        _controller.core,
      );
      previousText.dispose();
      if (oldWidget.controller == null) previousController.dispose();
      _lastValue = _controller.state.value;
    }
    if (widget.disabled != oldWidget.disabled) {
      _controller.core.setDisabled(widget.disabled);
      if (widget.disabled) _removeOverlay();
    }
    if (widget.readOnly != oldWidget.readOnly) {
      _controller.core.setReadOnly(widget.readOnly);
    }
  }

  @override
  void dispose() {
    _removeOverlay();
    _noticeTimer?.cancel();
    _unwire(_controller);
    _textController.dispose();
    _focusNode.dispose();
    _undoController.dispose();
    if (_ownsController) _controller.dispose();
    super.dispose();
  }

  // -- Controller plumbing ------------------------------------------------

  void _handleControllerChanged() {
    if (!mounted) return;
    if (SchedulerBinding.instance.schedulerPhase ==
        SchedulerPhase.persistentCallbacks) {
      // A core transition landed mid-build (e.g. a flag sync in
      // didUpdateWidget) — re-enter after the frame instead of calling
      // setState / mutating the overlay during build.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _handleControllerChanged();
      });
      return;
    }
    final state = _controller.state;
    if (state.value != _lastValue) {
      final delta = (state.value.length - _lastValue.length).abs();
      _resizeDuration = delta > _snapDeltaThreshold
          ? Duration.zero
          : _growDuration;
      _lastValue = state.value;
      widget.onChanged?.call(state.value);
    }
    _syncOverlay();
    setState(() {});
  }

  void _handleCoreEvent(ComposerEvent event) {
    if (event is ComposerTextTrimmedEvent) {
      _showTrimmedNotice();
    } else if (event is ComposerAttachmentRejectedEvent) {
      widget.onAttachmentRejected?.call(event);
    }
  }

  void _handleTypingActivity() => widget.onTypingActivity?.call();

  void _handleFocusChanged() {
    if (_focusNode.hasFocus) {
      _controller.core.cancelDeferredDismiss();
    } else {
      // Grace period so a pointer tap on a suggestion row lands first.
      _controller.core.dismissSuggestionDeferred();
    }
    if (mounted) setState(() {});
  }

  void _showTrimmedNotice() {
    _noticeTimer?.cancel();
    setState(() => _noticeVisible = true);
    _noticeTimer = Timer(_noticeDuration, () {
      if (mounted) setState(() => _noticeVisible = false);
    });
  }

  bool get _submitOnEnterResolved => resolveSubmitOnEnter(
    platform: defaultTargetPlatform,
    isWeb: kIsWeb,
    override: widget.submitOnEnter,
  );

  bool get _desktopModality => resolveSubmitOnEnter(
    platform: defaultTargetPlatform,
    isWeb: kIsWeb,
    override: null,
  );

  // -- Submit & keys ------------------------------------------------------

  void _handleSubmit() {
    final submission = _controller.trySubmit(widget.validator);
    if (submission == null) return;
    // A fresh undo stack: undo must never resurrect sent text.
    final previousUndo = _undoController;
    _undoController = UndoHistoryController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      previousUndo.dispose();
    });
    if (mounted) setState(() {});
    widget.onSubmit?.call(submission);
  }

  KeyEventResult _handleKeyEvent(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent) return KeyEventResult.ignored;
    final key = event.logicalKey;
    final state = _controller.state;

    if (state.suggestion.isOpen) {
      if (key == LogicalKeyboardKey.arrowDown) {
        _controller.moveSuggestionNext();
        return KeyEventResult.handled;
      }
      if (key == LogicalKeyboardKey.arrowUp) {
        _controller.moveSuggestionPrevious();
        return KeyEventResult.handled;
      }
      if (key == LogicalKeyboardKey.enter ||
          key == LogicalKeyboardKey.numpadEnter ||
          key == LogicalKeyboardKey.tab) {
        // While the menu is open Enter/Tab ALWAYS commit, never submit.
        _controller.applySuggestion();
        return KeyEventResult.handled;
      }
      if (key == LogicalKeyboardKey.escape) {
        _controller.dismissSuggestion();
        return KeyEventResult.handled;
      }
      // Left/Right (and everything else) pass through as caret moves.
    }

    if (key == LogicalKeyboardKey.enter ||
        key == LogicalKeyboardKey.numpadEnter) {
      final hardware = HardwareKeyboard.instance;
      if (hardware.isControlPressed || hardware.isMetaPressed) {
        // Reserved no-op (issue #426 §3.3).
        return KeyEventResult.handled;
      }
      final composing = _textController.value.composing.isValid;
      final shouldSubmit = _controller.core.rules.shouldSubmitOnEnter(
        shiftPressed: hardware.isShiftPressed,
        isComposing: composing,
      );
      if (_submitOnEnterResolved && shouldSubmit) {
        // Whitespace-only content makes this a silent no-op (field is
        // not cleared) — still handled so no newline is inserted.
        _handleSubmit();
        return KeyEventResult.handled;
      }
      return KeyEventResult.ignored; // newline
    }

    if (key == LogicalKeyboardKey.escape && state.editingMessageId != null) {
      _controller.cancelEdit();
      return KeyEventResult.handled;
    }

    if (key == LogicalKeyboardKey.arrowUp &&
        state.value.isEmpty &&
        _desktopModality &&
        widget.onEditLastRequested != null) {
      widget.onEditLastRequested!();
      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  // -- Suggestion overlay ---------------------------------------------------

  void _syncOverlay() {
    final shouldShow = _controller.state.suggestion.isOpen && !widget.disabled;
    if (shouldShow && _overlayEntry == null) {
      _showOverlay();
    } else if (!shouldShow && _overlayEntry != null) {
      _removeOverlay();
    } else {
      _overlayEntry?.markNeedsBuild();
    }
  }

  void _showOverlay() {
    if (!mounted) return;
    final theme = RefractionTheme.of(context);
    _overlayEntry = OverlayEntry(
      builder: (overlayContext) {
        final pillBox =
            _pillKey.currentContext?.findRenderObject() as RenderBox?;
        final width = (pillBox != null && pillBox.hasSize)
            ? pillBox.size.width
            : 280.0;
        var anchorBelow = false;
        if (pillBox != null && pillBox.attached && pillBox.hasSize) {
          final origin = pillBox.localToGlobal(Offset.zero);
          anchorBelow = origin.dy < _overlayFlipThreshold;
        }
        return Stack(
          children: [
            Positioned.fill(
              child: GestureDetector(
                behavior: HitTestBehavior.translucent,
                onTap: _controller.dismissSuggestion,
                child: const SizedBox.expand(),
              ),
            ),
            Positioned(
              width: width,
              child: CompositedTransformFollower(
                link: _layerLink,
                showWhenUnlinked: false,
                targetAnchor: anchorBelow
                    ? Alignment.bottomLeft
                    : Alignment.topLeft,
                followerAnchor: anchorBelow
                    ? Alignment.topLeft
                    : Alignment.bottomLeft,
                offset: Offset(0, anchorBelow ? 4 : -4),
                child: Material(
                  color: Colors.transparent,
                  child: _buildSuggestionPanel(theme),
                ),
              ),
            ),
          ],
        );
      },
    );
    Overlay.of(context).insert(_overlayEntry!);
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  Widget _buildSuggestionPanel(RefractionTheme theme) {
    final colors = theme.colors;
    final state = _controller.state;
    final suggestion = state.suggestion;
    final trigger = state.activeTrigger;
    final strings = widget.strings;

    Widget body;
    if (suggestion.error != null) {
      body =
          widget.overlayErrorBuilder?.call(
            context,
            suggestion.error!,
            _controller.retrySuggestions,
          ) ??
          Padding(
            padding: const EdgeInsetsDirectional.all(12),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    strings.suggestionsError,
                    style: TextStyle(color: colors.destructive, fontSize: 13),
                  ),
                ),
                GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: _controller.retrySuggestions,
                  child: Semantics(
                    button: true,
                    label: strings.retryLabel,
                    child: Text(
                      strings.retryLabel,
                      style: TextStyle(
                        color: colors.primary,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
    } else if (suggestion.loading && suggestion.items.isEmpty) {
      body =
          widget.overlayLoadingBuilder?.call(context) ??
          Padding(
            padding: const EdgeInsetsDirectional.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (var i = 0; i < 2; i++)
                  Padding(
                    padding: const EdgeInsetsDirectional.only(bottom: 8),
                    child: Container(
                      height: 12,
                      decoration: BoxDecoration(
                        color: colors.muted,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
              ],
            ),
          );
    } else if (suggestion.items.isEmpty) {
      body =
          widget.overlayEmptyBuilder?.call(context, trigger?.query ?? '') ??
          Padding(
            padding: const EdgeInsetsDirectional.all(12),
            child: Text(
              strings.suggestionsEmpty,
              style: TextStyle(color: colors.mutedForeground, fontSize: 13),
            ),
          );
    } else {
      final maxVisible = trigger?.trigger.maxVisibleResults ?? 6;
      const rowExtent = 40.0;
      body = ConstrainedBox(
        constraints: BoxConstraints(
          maxHeight: rowExtent * math.min(maxVisible, suggestion.items.length),
        ),
        child: ListView.builder(
          shrinkWrap: true,
          padding: const EdgeInsets.symmetric(vertical: 4),
          itemCount: suggestion.items.length,
          itemBuilder: (rowContext, index) => _buildSuggestionRow(
            theme,
            suggestion.items[index],
            index,
            index == suggestion.activeIndex,
            trigger?.trigger.id ?? '',
          ),
        ),
      );
    }

    return Semantics(
      container: true,
      liveRegion: true,
      label:
          '${strings.suggestionsLabel}, ${strings.suggestionCount(suggestion.items.length)}',
      child: Container(
        decoration: BoxDecoration(
          color: colors.popover,
          borderRadius: BorderRadius.circular(theme.borderRadius),
          border: Border.all(color: colors.border),
          boxShadow: theme.data.heavyShadow,
        ),
        child: body,
      ),
    );
  }

  Widget _buildSuggestionRow(
    RefractionTheme theme,
    ComposerCandidate candidate,
    int index,
    bool active,
    String triggerId,
  ) {
    final colors = theme.colors;
    final content =
        widget.overlayItemBuilder?.call(context, candidate, active: active) ??
        Row(
          children: [
            Expanded(
              child: Text(
                candidate.display,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: active
                      ? colors.accentForeground
                      : colors.popoverForeground,
                  fontSize: 14,
                ),
              ),
            ),
            if (candidate.subtitle != null)
              Text(
                candidate.subtitle!,
                style: TextStyle(color: colors.mutedForeground, fontSize: 12),
              ),
          ],
        );
    void commit() {
      _controller.core.cancelDeferredDismiss();
      _controller.applySuggestion(index);
    }

    return Semantics(
      container: true,
      button: true,
      selected: active,
      label: '${candidate.display}, $triggerId',
      // The row's accessible surface is exactly its option label; the
      // visual content underneath is presentation-only.
      excludeSemantics: true,
      onTap: commit,
      child: MouseRegion(
        onEnter: (_) => _controller.setSuggestionActiveIndex(index),
        // Rows never steal focus: a bare GestureDetector performs the
        // commit without requesting focus from the field.
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: commit,
          child: Container(
            height: 40,
            padding: const EdgeInsetsDirectional.symmetric(horizontal: 12),
            alignment: AlignmentDirectional.centerStart,
            color: active ? colors.accent : Colors.transparent,
            child: content,
          ),
        ),
      ),
    );
  }

  // -- Build ----------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final tokens = ComposerDensityTokens.resolve(widget.density);
    final state = _controller.state;
    final mediaQuery = MediaQuery.of(context);
    final disableAnimations = mediaQuery.disableAnimations;
    final strings = widget.strings;

    final scaledLineHeight = MediaQuery.textScalerOf(
      context,
    ).scale(tokens.lineHeight);
    final growCeiling = math.max(
      scaledLineHeight,
      math.min(
        scaledLineHeight * widget.maxLines,
        mediaQuery.size.height * 0.4,
      ),
    );

    final textStyle = theme.data.textStyle.copyWith(
      fontSize: tokens.fontSize,
      height: tokens.lineHeight / tokens.fontSize,
      color: widget.disabled ? colors.mutedForeground : colors.foreground,
    );

    final textField = TextField(
      controller: _textController,
      focusNode: _focusNode,
      undoController: _undoController,
      enabled: !widget.disabled,
      readOnly: widget.readOnly,
      autofocus: widget.autofocus,
      minLines: widget.minLines,
      maxLines: null,
      keyboardType: TextInputType.multiline,
      // Unconditional: soft-keyboard return always inserts a newline;
      // send is the tappable affordance plus the physical-Enter handler.
      textInputAction: TextInputAction.newline,
      textCapitalization: widget.textCapitalization,
      cursorColor: colors.primary,
      style: textStyle,
      decoration: InputDecoration(
        hintText: widget.disabled
            ? (widget.disabledPlaceholder ?? widget.placeholder)
            : widget.placeholder,
        hintStyle: textStyle.copyWith(color: colors.mutedForeground),
        isDense: true,
        border: InputBorder.none,
        enabledBorder: InputBorder.none,
        focusedBorder: InputBorder.none,
        disabledBorder: InputBorder.none,
        // The pill's paddingVertical is the ONLY vertical padding in the
        // component (issue #426 §2.4 ownership rule).
        contentPadding: EdgeInsets.zero,
      ),
    );

    // Reduced motion and non-incremental changes (paste/dictation) snap by
    // dropping AnimatedSize entirely — a zero-duration AnimatedSize is not
    // legal (it re-dirties itself during its own layout).
    final resizeDuration = disableAnimations ? Duration.zero : _resizeDuration;
    Widget sizedField = ConstrainedBox(
      constraints: BoxConstraints(maxHeight: growCeiling),
      child: textField,
    );
    if (resizeDuration > Duration.zero) {
      sizedField = AnimatedSize(
        duration: resizeDuration,
        curve: _growCurve,
        alignment: Alignment.bottomCenter,
        child: sizedField,
      );
    }
    final textArea = MergeSemantics(
      child: Semantics(label: strings.fieldLabel, child: sizedField),
    );

    final leading =
        widget.leadingBuilder?.call(context, _controller) ??
        (widget.onAttachRequested != null
            ? _ComposerActionSlot(
                tokens: tokens,
                semanticLabel: strings.attachLabel,
                onPressed: widget.disabled ? null : widget.onAttachRequested,
                icon: Icon(Icons.attach_file, color: colors.mutedForeground),
              )
            : null);
    final trailing = widget.trailingBuilder?.call(context, _controller);
    final primaryContext = ComposerPrimaryContext(
      hasText: _controller.hasText,
      canSend: state.canSend,
      isBusy: state.isBusy,
    );
    final primary =
        widget.primaryBuilder?.call(context, primaryContext) ??
        _buildDefaultPrimary(tokens, colors, primaryContext);

    // High contrast strengthens the pill hairline to the foreground token
    // (the palette itself is the host's contrast lever).
    final highContrast = mediaQuery.highContrast;
    final borderColor = _focusNode.hasFocus && !widget.disabled
        ? colors.ring
        : (highContrast ? colors.foreground : colors.border);
    final pill = Container(
      key: _pillKey,
      constraints: BoxConstraints(minHeight: tokens.minHeight),
      alignment: AlignmentDirectional.center,
      decoration: BoxDecoration(
        color: widget.disabled ? colors.muted : colors.background,
        border: Border.all(color: borderColor),
        borderRadius: BorderRadius.circular(tokens.minHeight / 2),
      ),
      child: Padding(
        padding: EdgeInsetsDirectional.fromSTEB(
          tokens.paddingHorizontal,
          tokens.paddingVertical,
          tokens.paddingHorizontal,
          tokens.paddingVertical,
        ),
        child: Row(
          // §2.3 invariant: slots bottom-anchor against the text area and
          // never grow with it — no layout branching on line count.
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            if (leading != null) ...[leading, SizedBox(width: tokens.gutter)],
            Expanded(child: textArea),
            if (trailing != null) ...[SizedBox(width: tokens.gutter), trailing],
            SizedBox(width: tokens.gutter),
            primary,
          ],
        ),
      ),
    );

    final counter = state.counter;
    final dock = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (state.attachments.isNotEmpty) ...[
          _AttachmentTray(
            attachments: state.attachments,
            colors: colors,
            theme: theme,
            strings: strings,
            onRemove: widget.disabled ? null : _controller.removeAttachment,
          ),
          SizedBox(height: tokens.gutter),
        ],
        if (state.error != null) ...[
          _ComposerBanner(
            text: state.error!,
            foreground: colors.destructive,
            background: colors.destructive.withValues(alpha: 0.1),
            theme: theme,
          ),
          SizedBox(height: tokens.gutter),
        ],
        if (_noticeVisible) ...[
          _ComposerBanner(
            text: strings.trimmedNotice,
            foreground: colors.mutedForeground,
            background: colors.muted,
            theme: theme,
          ),
          SizedBox(height: tokens.gutter),
        ],
        CompositedTransformTarget(
          link: _layerLink,
          child: Focus(onKeyEvent: _handleKeyEvent, child: pill),
        ),
        if (counter != null && counter.isVisible)
          Padding(
            padding: EdgeInsetsDirectional.only(
              top: tokens.gutter,
              end: tokens.paddingHorizontal,
            ),
            child: Align(
              alignment: AlignmentDirectional.centerEnd,
              child: Semantics(
                liveRegion: counter.isAtLimit,
                label: strings.counterSemantics(counter.remaining),
                child: Text(
                  '${counter.remaining}',
                  style: TextStyle(
                    fontSize: 12,
                    color: counter.isAtLimit
                        ? colors.destructive
                        : colors.mutedForeground,
                  ),
                ),
              ),
            ),
          ),
      ],
    );

    // §2.8: never stack safe-area and keyboard insets — the keyboard
    // replaces the home-indicator inset.
    final keyboardOpen = mediaQuery.viewInsets.bottom > 0;
    final bottomInset = widget.padSafeArea
        ? (keyboardOpen ? 0.0 : mediaQuery.viewPadding.bottom)
        : 0.0;

    return AnimatedPadding(
      duration: disableAnimations ? Duration.zero : _growDuration,
      curve: _growCurve,
      padding: EdgeInsets.only(bottom: bottomInset),
      child: dock,
    );
  }

  Widget _buildDefaultPrimary(
    ComposerDensityTokens tokens,
    RefractionColors colors,
    ComposerPrimaryContext primary,
  ) {
    if (primary.isBusy) {
      return _ComposerActionSlot(
        tokens: tokens,
        semanticLabel: widget.strings.stopLabel,
        onPressed: widget.onStop,
        icon: Icon(Icons.stop_rounded, color: colors.destructive),
      );
    }
    return _ComposerActionSlot(
      tokens: tokens,
      semanticLabel: widget.strings.sendLabel,
      onPressed: primary.canSend ? _handleSubmit : null,
      // Directional glyph: mirrors under RTL (attach/emoji glyphs do not).
      icon: Icon(
        Icons.send_rounded,
        color: primary.canSend ? colors.primary : colors.mutedForeground,
      ),
    );
  }
}

/// The action-slot primitive (issue #426 §2.5): contributes exactly
/// `iconSlotSize` to layout while its tap target is the larger
/// `hitTargetSize`, bled beyond the slot bounds without inflating the
/// pill.
///
/// Note: Flutter's hit testing is gated by every ancestor's bounds, so
/// the bleed is effective within the pill's content row (guaranteed
/// horizontally; vertically it clips to the row height on a single-line
/// pill).
class _ComposerActionSlot extends StatelessWidget {
  final ComposerDensityTokens tokens;
  final Widget icon;
  final VoidCallback? onPressed;
  final String? semanticLabel;

  const _ComposerActionSlot({
    required this.tokens,
    required this.icon,
    required this.onPressed,
    this.semanticLabel,
  });

  @override
  Widget build(BuildContext context) {
    return _OversizedHitBox(
      slotSize: tokens.iconSlotSize,
      hitSize: tokens.hitTargetSize,
      child: Semantics(
        container: true,
        button: true,
        enabled: onPressed != null,
        label: semanticLabel,
        child: IconButton(
          padding: EdgeInsets.zero,
          constraints: BoxConstraints.tightFor(
            width: tokens.hitTargetSize,
            height: tokens.hitTargetSize,
          ),
          iconSize: tokens.iconSlotSize * 0.72,
          onPressed: onPressed,
          icon: icon,
        ),
      ),
    );
  }
}

/// Lays out as a tight [slotSize] square while its child (the tap target)
/// is laid out at [hitSize], centered, painting and hit-testing beyond
/// the slot bounds.
class _OversizedHitBox extends SingleChildRenderObjectWidget {
  final double slotSize;
  final double hitSize;

  const _OversizedHitBox({
    required this.slotSize,
    required this.hitSize,
    super.child,
  });

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _RenderOversizedHitBox(slotSize: slotSize, hitSize: hitSize);

  @override
  void updateRenderObject(
    BuildContext context,
    _RenderOversizedHitBox renderObject,
  ) {
    renderObject
      ..slotSize = slotSize
      ..hitSize = hitSize;
  }
}

class _RenderOversizedHitBox extends RenderShiftedBox {
  _RenderOversizedHitBox({
    required double slotSize,
    required double hitSize,
    RenderBox? child,
  }) : _slotSize = slotSize,
       _hitSize = hitSize,
       super(child);

  double _slotSize;
  set slotSize(double value) {
    if (_slotSize == value) return;
    _slotSize = value;
    markNeedsLayout();
  }

  double _hitSize;
  set hitSize(double value) {
    if (_hitSize == value) return;
    _hitSize = value;
    markNeedsLayout();
  }

  @override
  void performLayout() {
    size = constraints.constrain(Size.square(_slotSize));
    final child = this.child;
    if (child != null) {
      child.layout(BoxConstraints.tight(Size.square(_hitSize)));
      (child.parentData! as BoxParentData).offset = Offset(
        (size.width - _hitSize) / 2,
        (size.height - _hitSize) / 2,
      );
    }
  }

  @override
  bool hitTest(BoxHitTestResult result, {required Offset position}) {
    // Deliberately skip the own-size gate so the oversized child receives
    // taps beyond the slot's layout bounds.
    if (hitTestChildren(result, position: position)) {
      result.add(BoxHitTestEntry(this, position));
      return true;
    }
    return false;
  }
}

class _AttachmentTray extends StatelessWidget {
  final List<ComposerAttachment> attachments;
  final RefractionColors colors;
  final RefractionTheme theme;
  final RefractionComposerStrings strings;
  final void Function(String id)? onRemove;

  const _AttachmentTray({
    required this.attachments,
    required this.colors,
    required this.theme,
    required this.strings,
    required this.onRemove,
  });

  static const Map<ComposerAttachmentKind, IconData> _kindIcons = {
    ComposerAttachmentKind.text: Icons.notes,
    ComposerAttachmentKind.image: Icons.image_outlined,
    ComposerAttachmentKind.video: Icons.videocam_outlined,
    ComposerAttachmentKind.audio: Icons.audiotrack,
    ComposerAttachmentKind.file: Icons.insert_drive_file_outlined,
  };

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 4,
      runSpacing: 4,
      children: [for (final attachment in attachments) _buildChip(attachment)],
    );
  }

  Widget _buildChip(ComposerAttachment attachment) {
    final isError = attachment.status == ComposerAttachmentStatus.error;
    final foreground = isError ? colors.destructive : colors.foreground;
    return Container(
      padding: const EdgeInsetsDirectional.fromSTEB(8, 4, 4, 4),
      decoration: BoxDecoration(
        color: colors.muted,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: isError ? colors.destructive : colors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _kindIcons[attachment.kind],
            size: 14,
            color: colors.mutedForeground,
          ),
          const SizedBox(width: 4),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 160),
            child: Text(
              attachment.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 12, color: foreground),
            ),
          ),
          if (attachment.status == ComposerAttachmentStatus.uploading) ...[
            const SizedBox(width: 4),
            SizedBox(
              width: 10,
              height: 10,
              child: CircularProgressIndicator(
                strokeWidth: 1.5,
                value: attachment.progress,
                color: colors.mutedForeground,
              ),
            ),
          ],
          if (onRemove != null) ...[
            const SizedBox(width: 2),
            Semantics(
              container: true,
              button: true,
              label: strings.removeAttachmentLabel(attachment.name),
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () => onRemove!(attachment.id),
                child: Padding(
                  padding: const EdgeInsetsDirectional.all(2),
                  child: Icon(
                    Icons.close,
                    size: 14,
                    color: colors.mutedForeground,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ComposerBanner extends StatelessWidget {
  final String text;
  final Color foreground;
  final Color background;
  final RefractionTheme theme;

  const _ComposerBanner({
    required this.text,
    required this.foreground,
    required this.background,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsetsDirectional.fromSTEB(12, 6, 12, 6),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(theme.borderRadius),
      ),
      child: Text(text, style: TextStyle(fontSize: 12, color: foreground)),
    );
  }
}
