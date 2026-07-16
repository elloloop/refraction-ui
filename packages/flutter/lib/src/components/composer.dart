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

/// The pill's surface treatment (issue #432 Gap 1).
enum ComposerSurface {
  /// A hairline-outlined pill on the page background. Calm focus: no
  /// saturated full-perimeter ring — focus reads through the caret.
  outlined,

  /// A filled pill on a secondary surface (`colors.muted`) with a hairline
  /// edge and no coloured focus ring. The default — matches WhatsApp /
  /// iMessage / Slack and avoids a host's saturated brand ring shouting on
  /// every focus.
  filled,
}

/// Fallback accessory-panel height when no soft-keyboard height has been
/// observed yet and none is supplied (issue #432 Gap 3).
const double defaultAccessoryPanelHeight = 300;

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

/// The default `:shortcode:` table, derived from the shared [EmojiData]
/// dataset: canonical `:aliases:` first, then the snake-cased name, then
/// keywords (first writer wins). Both this table and [RefractionEmojiPicker]
/// consume the same single-source dataset, so a `:code:` and a picker tap
/// always resolve to the same glyph.
Map<String, String> refractionDefaultShortcodes() {
  final cached = _cachedDefaultShortcodes;
  if (cached != null) return cached;
  final map = <String, String>{};
  final all = EmojiData.getAllEmojis();
  // Three global passes so canonical aliases always outrank a name, which
  // outranks a keyword tag (a per-entry loop would let an early entry's
  // keyword shadow a later entry's real shortcode, e.g. `:joy:`).
  for (final entry in all) {
    for (final shortcode in entry.shortcodes) {
      map.putIfAbsent(shortcode.replaceAll(' ', '_'), () => entry.emoji);
    }
  }
  for (final entry in all) {
    map.putIfAbsent(entry.name.replaceAll(' ', '_'), () => entry.emoji);
  }
  for (final entry in all) {
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
  bool _accessoryPanelOpen = false;

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

  /// Whether the accessory panel (emoji/sticker tray, etc.) is open
  /// (issue #432 Gap 3). Uncontrolled use; ignored when the widget's
  /// `showAccessoryPanel` prop is non-null (controlled).
  bool get isAccessoryPanelOpen => _accessoryPanelOpen;

  /// Opens the accessory panel. The widget dismisses the soft keyboard and
  /// animates the panel into the freed space, keeping the pill visible.
  void openAccessoryPanel() {
    if (_accessoryPanelOpen) return;
    _accessoryPanelOpen = true;
    notifyListeners();
  }

  /// Closes the accessory panel (the field can take focus and the keyboard
  /// returns).
  void closeAccessoryPanel() {
    if (!_accessoryPanelOpen) return;
    _accessoryPanelOpen = false;
    notifyListeners();
  }

  /// Toggles the accessory panel.
  void toggleAccessoryPanel() {
    _accessoryPanelOpen = !_accessoryPanelOpen;
    notifyListeners();
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

  /// Pill surface treatment; defaults to [ComposerSurface.filled] (calm
  /// focus, no saturated ring — issue #432 Gap 1).
  final ComposerSurface surface;

  /// External focus node (issue #432 Gap 2). When null an internal one is
  /// created and disposed with the widget; when provided, the host owns its
  /// lifecycle. Gap 3's keyboard choreography reads/controls this node.
  final FocusNode? focusNode;

  /// Builds the accessory panel rendered BELOW the pill, occupying the soft
  /// keyboard's vertical space (issue #432 Gap 3). This is the natural home
  /// for the emoji/sticker picker. Null disables the feature.
  final WidgetBuilder? accessoryPanelBuilder;

  /// Controlled open state for the accessory panel. When non-null it wins
  /// over the controller's [RefractionComposerController.isAccessoryPanelOpen];
  /// null means uncontrolled (drive via the controller).
  final bool? showAccessoryPanel;

  /// Explicit accessory-panel height. When null the composer reuses the
  /// last-observed soft-keyboard height (so the swap has no layout jump),
  /// falling back to [defaultAccessoryPanelHeight].
  final double? accessoryPanelHeight;

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
    this.surface = ComposerSurface.filled,
    this.focusNode,
    this.accessoryPanelBuilder,
    this.showAccessoryPanel,
    this.accessoryPanelHeight,
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

class _RefractionComposerState extends State<RefractionComposer>
    with TickerProviderStateMixin {
  // One easing family across every composer transition (issue #426 §7.10):
  // easeOutCubic base ~180ms; exits are faster than entries.
  static const Duration _growDuration = Duration(milliseconds: 180);
  static const Duration _overlayInDuration = Duration(milliseconds: 160);
  static const Duration _overlayOutDuration = Duration(milliseconds: 100);
  static const Duration _primarySwapDuration = Duration(milliseconds: 160);
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
  late FocusNode _focusNode;
  bool _ownsFocusNode = false;
  bool _panelWasOpen = false;
  double _lastKeyboardHeight = 0;
  UndoHistoryController _undoController = UndoHistoryController();
  final LayerLink _layerLink = LayerLink();
  final GlobalKey _pillKey = GlobalKey();
  OverlayEntry? _overlayEntry;
  late final AnimationController _overlayAnimation;
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
    _focusNode =
        widget.focusNode ?? FocusNode(debugLabel: 'RefractionComposer');
    _ownsFocusNode = widget.focusNode == null;
    _focusNode.addListener(_handleFocusChanged);
    _panelWasOpen = _resolveAccessoryPanelOpen();
    _overlayAnimation = AnimationController(
      vsync: this,
      duration: _overlayInDuration,
      reverseDuration: _overlayOutDuration,
    );
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
    if (widget.focusNode != oldWidget.focusNode) {
      // Focus-node swap: move our listener, and dispose only a node we owned.
      _focusNode.removeListener(_handleFocusChanged);
      if (_ownsFocusNode) _focusNode.dispose();
      _focusNode =
          widget.focusNode ?? FocusNode(debugLabel: 'RefractionComposer');
      _ownsFocusNode = widget.focusNode == null;
      _focusNode.addListener(_handleFocusChanged);
    }
    _syncAccessoryPanel();
  }

  @override
  void dispose() {
    _removeOverlay();
    _noticeTimer?.cancel();
    _unwire(_controller);
    _textController.dispose();
    _focusNode.removeListener(_handleFocusChanged);
    if (_ownsFocusNode) _focusNode.dispose();
    _undoController.dispose();
    _overlayAnimation.dispose();
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
    _syncAccessoryPanel();
    setState(() {});
  }

  // -- Accessory panel (issue #432 Gap 3) ---------------------------------

  bool get _hasAccessoryPanel => widget.accessoryPanelBuilder != null;

  /// The resolved open state: controlled by `showAccessoryPanel` when set,
  /// otherwise the controller's flag.
  bool _resolveAccessoryPanelOpen() {
    if (!_hasAccessoryPanel) return false;
    return widget.showAccessoryPanel ?? _controller.isAccessoryPanelOpen;
  }

  /// On an open transition, dismiss the soft keyboard so the panel animates
  /// into the freed space with no layout jump (issue #432 Gap 3).
  void _syncAccessoryPanel() {
    final open = _resolveAccessoryPanelOpen();
    if (open == _panelWasOpen) return;
    _panelWasOpen = open;
    if (open && _focusNode.hasFocus) _focusNode.unfocus();
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
      // Tapping the field to type yields the accessory panel so the keyboard
      // returns (issue #432 Gap 3). Only in uncontrolled mode — a controlled
      // host owns the open state.
      if (widget.showAccessoryPanel == null &&
          _controller.isAccessoryPanelOpen) {
        _controller.closeAccessoryPanel();
      }
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
    } else if (shouldShow && _overlayEntry != null) {
      // A re-open landed while a close animation was mid-flight — reverse
      // back to fully shown instead of tearing the panel out.
      if (_overlayAnimation.status == AnimationStatus.reverse) {
        _overlayAnimation.forward();
      }
      _overlayEntry?.markNeedsBuild();
    } else if (!shouldShow && _overlayEntry != null) {
      _startOverlayExit();
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
                  child: _animatedOverlayChild(
                    overlayContext,
                    anchorBelow,
                    _buildSuggestionPanel(theme),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
    Overlay.of(context).insert(_overlayEntry!);
    _overlayAnimation.forward(from: 0);
  }

  /// Eased entry (fade + a small settle), opacity-only under reduced motion.
  /// The controller's shorter `reverseDuration` makes the exit faster than
  /// the entry (issue #426 §7.10).
  Widget _animatedOverlayChild(
    BuildContext overlayContext,
    bool anchorBelow,
    Widget child,
  ) {
    final reduceMotion = MediaQuery.of(overlayContext).disableAnimations;
    final curved = CurvedAnimation(
      parent: _overlayAnimation,
      curve: _growCurve,
      reverseCurve: _growCurve,
    );
    final fade = FadeTransition(
      opacity: curved,
      alwaysIncludeSemantics: true,
      child: child,
    );
    if (reduceMotion) return fade;
    return AnimatedBuilder(
      animation: curved,
      child: fade,
      builder: (context, inner) {
        final t = curved.value;
        return Transform.translate(
          offset: Offset(0, (1 - t) * (anchorBelow ? -6 : 6)),
          child: Transform.scale(
            scale: 0.98 + 0.02 * t,
            alignment: anchorBelow
                ? Alignment.topCenter
                : Alignment.bottomCenter,
            child: inner,
          ),
        );
      },
    );
  }

  void _startOverlayExit() {
    final entry = _overlayEntry;
    if (entry == null) return;
    _overlayAnimation.reverse().whenCompleteOrCancel(() {
      // Only tear down if we actually finished closing (a re-open may have
      // driven the controller forward again in the meantime).
      if (_overlayAnimation.status == AnimationStatus.dismissed &&
          _overlayEntry == entry) {
        _removeOverlay();
      }
    });
  }

  void _removeOverlay() {
    _overlayAnimation.stop();
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

    // Remember the tallest soft-keyboard inset seen so the accessory panel
    // occupies exactly that space (no layout jump on the swap — #432 Gap 3).
    final keyboardInset = mediaQuery.viewInsets.bottom;
    if (keyboardInset > _lastKeyboardHeight) {
      _lastKeyboardHeight = keyboardInset;
    }
    final panelOpen = _resolveAccessoryPanelOpen();
    final panelHeight =
        widget.accessoryPanelHeight ??
        (_lastKeyboardHeight > 0
            ? _lastKeyboardHeight
            : defaultAccessoryPanelHeight);

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
    final primaryChild =
        widget.primaryBuilder?.call(context, primaryContext) ??
        _buildDefaultPrimary(tokens, colors, primaryContext);
    // Morph the primary action (send ⇄ mic ⇄ stop) with a cross-fade + tiny
    // scale so the swap never jumps (issue #426 §7.10). The default slots
    // carry distinct keys (send/stop) so those morph, while a plain
    // enable/disable (same key) updates in place with no double-render. A
    // host `primaryBuilder` gets the morph by keying its own children (e.g.
    // ValueKey('mic') vs ValueKey('send')). Instant under reduced motion.
    final primary = AnimatedSwitcher(
      duration: disableAnimations ? Duration.zero : _primarySwapDuration,
      switchInCurve: _growCurve,
      switchOutCurve: _growCurve,
      transitionBuilder: (child, animation) => disableAnimations
          ? child
          : FadeTransition(
              opacity: animation,
              alwaysIncludeSemantics: true,
              child: ScaleTransition(
                scale: Tween<double>(begin: 0.7, end: 1.0).animate(animation),
                child: child,
              ),
            ),
      child: primaryChild,
    );

    // Calm focus (issue #432 Gap 1): no saturated full-perimeter ring on
    // focus — focus reads through the caret. High contrast still strengthens
    // the hairline to the foreground token (the palette is the contrast
    // lever); `filled` sits on a secondary surface, `outlined` on the page.
    final highContrast = mediaQuery.highContrast;
    final borderColor = highContrast ? colors.foreground : colors.border;
    final Color fillColor;
    if (widget.disabled) {
      fillColor = colors.muted;
    } else if (widget.surface == ComposerSurface.filled) {
      fillColor = colors.muted;
    } else {
      fillColor = colors.background;
    }
    final pill = Container(
      key: _pillKey,
      constraints: BoxConstraints(minHeight: tokens.minHeight),
      alignment: AlignmentDirectional.center,
      decoration: BoxDecoration(
        color: fillColor,
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
        _AttachmentTray(
          attachments: state.attachments,
          colors: colors,
          theme: theme,
          strings: strings,
          reduceMotion: disableAnimations,
          bottomGap: tokens.gutter,
          duration: _growDuration,
          curve: _growCurve,
          onRemove: widget.disabled ? null : _controller.removeAttachment,
        ),
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
        if (_hasAccessoryPanel)
          _AccessoryPanel(
            open: panelOpen,
            height: panelHeight,
            reduceMotion: disableAnimations,
            duration: _growDuration,
            curve: _growCurve,
            colors: colors,
            bottomSafeInset: widget.padSafeArea
                ? mediaQuery.viewPadding.bottom
                : 0.0,
            builder: widget.accessoryPanelBuilder!,
          ),
      ],
    );

    // §2.8: never stack safe-area and keyboard insets — the keyboard (or an
    // open accessory panel that replaced it) owns the home-indicator inset.
    final keyboardOpen = mediaQuery.viewInsets.bottom > 0;
    final bottomInset = widget.padSafeArea
        ? ((keyboardOpen || panelOpen) ? 0.0 : mediaQuery.viewPadding.bottom)
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
        key: const ValueKey('composer-primary-stop'),
        tokens: tokens,
        semanticLabel: widget.strings.stopLabel,
        onPressed: widget.onStop,
        icon: Icon(Icons.stop_rounded, color: colors.destructive),
      );
    }
    return _ComposerActionSlot(
      key: const ValueKey('composer-primary-send'),
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
    super.key,
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

/// The inline attachments tray. Its height eases open/closed via
/// [AnimatedSize] and each chip springs in on mount (issue #426 §7.10);
/// under reduced motion both collapse to an opacity-only fade.
class _AttachmentTray extends StatelessWidget {
  final List<ComposerAttachment> attachments;
  final RefractionColors colors;
  final RefractionTheme theme;
  final RefractionComposerStrings strings;
  final bool reduceMotion;
  final double bottomGap;
  final Duration duration;
  final Curve curve;
  final void Function(String id)? onRemove;

  const _AttachmentTray({
    required this.attachments,
    required this.colors,
    required this.theme,
    required this.strings,
    required this.reduceMotion,
    required this.bottomGap,
    required this.duration,
    required this.curve,
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
    // Nothing to animate when empty — render no box (keeps the grow
    // AnimatedSize the only one in the tree, and adds no spacing).
    if (attachments.isEmpty) return const SizedBox.shrink();
    final content = Padding(
      padding: EdgeInsetsDirectional.only(bottom: bottomGap),
      child: Wrap(
        spacing: 4,
        runSpacing: 4,
        children: [
          for (final attachment in attachments)
            _AttachmentChip(
              // Keyed by id so an existing chip is preserved across rebuilds
              // (no false entrance) while a new id animates in.
              key: ValueKey(attachment.id),
              attachment: attachment,
              colors: colors,
              theme: theme,
              strings: strings,
              icon: _kindIcons[attachment.kind],
              reduceMotion: reduceMotion,
              onRemove: onRemove,
            ),
        ],
      ),
    );
    // A zero-duration AnimatedSize re-dirties itself during layout, so under
    // reduced motion drop the widget entirely and swap content instantly.
    if (reduceMotion) return content;
    return AnimatedSize(
      duration: duration,
      curve: curve,
      alignment: Alignment.topCenter,
      child: content,
    );
  }
}

/// One attachment chip that plays a scale+fade entrance the first time it is
/// mounted (opacity-only under reduced motion).
class _AttachmentChip extends StatefulWidget {
  final ComposerAttachment attachment;
  final RefractionColors colors;
  final RefractionTheme theme;
  final RefractionComposerStrings strings;
  final IconData? icon;
  final bool reduceMotion;
  final void Function(String id)? onRemove;

  const _AttachmentChip({
    super.key,
    required this.attachment,
    required this.colors,
    required this.theme,
    required this.strings,
    required this.icon,
    required this.reduceMotion,
    required this.onRemove,
  });

  @override
  State<_AttachmentChip> createState() => _AttachmentChipState();
}

class _AttachmentChipState extends State<_AttachmentChip>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _curved;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 160),
      value: widget.reduceMotion ? 1.0 : 0.0,
    );
    _curved = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
    if (!widget.reduceMotion) _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = widget.colors;
    final attachment = widget.attachment;
    final isError = attachment.status == ComposerAttachmentStatus.error;
    final foreground = isError ? colors.destructive : colors.foreground;
    final chip = Container(
      padding: const EdgeInsetsDirectional.fromSTEB(8, 4, 4, 4),
      decoration: BoxDecoration(
        color: colors.muted,
        borderRadius: BorderRadius.circular(widget.theme.borderRadius),
        border: Border.all(color: isError ? colors.destructive : colors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(widget.icon, size: 14, color: colors.mutedForeground),
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
          if (widget.onRemove != null) ...[
            const SizedBox(width: 2),
            Semantics(
              container: true,
              button: true,
              label: widget.strings.removeAttachmentLabel(attachment.name),
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () => widget.onRemove!(attachment.id),
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
    if (widget.reduceMotion) return chip;
    return FadeTransition(
      opacity: _curved,
      alwaysIncludeSemantics: true,
      child: ScaleTransition(
        scale: Tween<double>(begin: 0.8, end: 1.0).animate(_curved),
        child: chip,
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

/// The accessory panel rendered below the pill (issue #432 Gap 3): it eases
/// its height open/closed so the pill never jumps, and hosts the emoji /
/// sticker picker in the soft keyboard's freed space. Under reduced motion
/// the height change is instant (content still cross-fades via its own build).
class _AccessoryPanel extends StatelessWidget {
  final bool open;
  final double height;
  final bool reduceMotion;
  final Duration duration;
  final Curve curve;
  final RefractionColors colors;
  final double bottomSafeInset;
  final WidgetBuilder builder;

  const _AccessoryPanel({
    required this.open,
    required this.height,
    required this.reduceMotion,
    required this.duration,
    required this.curve,
    required this.colors,
    required this.bottomSafeInset,
    required this.builder,
  });

  @override
  Widget build(BuildContext context) {
    final targetHeight = open ? height + bottomSafeInset : 0.0;
    final content = SizedBox(
      height: targetHeight,
      width: double.infinity,
      child: open
          ? DecoratedBox(
              decoration: BoxDecoration(
                color: colors.background,
                border: Border(top: BorderSide(color: colors.border)),
              ),
              child: Padding(
                padding: EdgeInsets.only(bottom: bottomSafeInset),
                child: builder(context),
              ),
            )
          : null,
    );
    // ClipRect keeps the panel content from painting past the collapsing box.
    final clipped = ClipRect(child: content);
    if (reduceMotion) return clipped;
    return AnimatedSize(
      duration: duration,
      curve: curve,
      alignment: Alignment.topCenter,
      child: clipped,
    );
  }
}
