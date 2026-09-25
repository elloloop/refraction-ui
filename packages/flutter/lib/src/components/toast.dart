import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/motion.dart';
import '../theme/refraction_colors.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';
import 'button.dart';

/// Tone of a toast: picks the leading icon and its tint.
enum RefractionToastVariant {
  /// Plain notice ("Link copied").
  neutral,

  /// Something completed ("Message sent", "Saved").
  success,

  /// Informational ("You're offline — messages will send when you reconnect").
  info,

  /// Needs attention but nothing failed ("Upload is taking longer than usual").
  warning,

  /// Something failed ("Couldn't send message").
  destructive,
}

/// A single action button on a toast — "Undo", "Retry", "View".
@immutable
class RefractionToastAction {
  /// Button text. Keep it to one short verb.
  final String label;

  /// Runs when the action is pressed. The toast dismisses itself afterwards.
  final VoidCallback onPressed;

  /// Creates a toast action.
  const RefractionToastAction({required this.label, required this.onPressed});
}

/// Everything a toast shows. Immutable; build one per toast.
@immutable
class RefractionToastData {
  /// Headline, e.g. "Message deleted".
  final String title;

  /// Optional second line.
  final String? description;

  /// Tone. Defaults to [RefractionToastVariant.neutral].
  final RefractionToastVariant variant;

  /// Optional action ("Undo", "Retry").
  final RefractionToastAction? action;

  /// How long the toast stays up **while not hovered or focused**. `null`
  /// picks [RefractionToaster.defaultDuration], or
  /// [RefractionToaster.actionDuration] when there is an [action] (people
  /// need time to reach "Undo"). [Duration.zero] keeps it until dismissed.
  final Duration? duration;

  /// Whether to show a close button. Defaults to `true`.
  final bool dismissible;

  /// Called once when the toast leaves — by timeout, close button, swipe,
  /// action, or programmatic dismissal.
  final VoidCallback? onDismissed;

  /// Creates toast content.
  const RefractionToastData({
    required this.title,
    this.description,
    this.variant = RefractionToastVariant.neutral,
    this.action,
    this.duration,
    this.dismissible = true,
    this.onDismissed,
  });
}

/// A live toast in a [RefractionToastController].
@immutable
class RefractionToastEntry {
  /// Stable id, unique within its controller.
  final int id;

  /// The content.
  final RefractionToastData data;

  const RefractionToastEntry._(this.id, this.data);
}

/// Returned by [RefractionToast.show] and [RefractionToastController.show];
/// lets the caller dismiss the toast early (e.g. when the retried send
/// succeeds).
class RefractionToastHandle {
  final RefractionToastController _controller;

  /// The toast's id.
  final int id;

  RefractionToastHandle._(this._controller, this.id);

  /// Whether the toast is still queued or visible.
  bool get isActive => _controller.contains(id);

  /// Dismisses the toast if it is still active.
  void dismiss() => _controller.dismiss(id);
}

/// The toast queue: pure state, no widgets, so it can be driven from
/// anywhere (a repository reporting a failed send) and unit-tested.
///
/// Toasts show oldest-first, newest at the bottom (nearest the thumb and
/// the composer). At most [maxVisible] are kept: showing one more retires the
/// oldest, so the newest — usually the one the user just caused — is never
/// hidden behind a queue.
class RefractionToastController extends ChangeNotifier {
  /// Most toasts on screen at once. Defaults to 3.
  final int maxVisible;

  final List<RefractionToastEntry> _entries = [];
  int _nextId = 0;

  /// Creates a controller.
  RefractionToastController({this.maxVisible = 3})
    : assert(maxVisible > 0, 'maxVisible must be positive');

  /// Every active toast, oldest first.
  List<RefractionToastEntry> get entries => List.unmodifiable(_entries);

  /// Whether a toast with [id] is active.
  bool contains(int id) => _entries.any((e) => e.id == id);

  /// Queues [data] and returns a handle to it.
  RefractionToastHandle show(RefractionToastData data) {
    final entry = RefractionToastEntry._(_nextId++, data);
    _entries.add(entry);
    final retired = _entries.length > maxVisible ? _entries.removeAt(0) : null;
    notifyListeners();
    retired?.data.onDismissed?.call();
    return RefractionToastHandle._(this, entry.id);
  }

  /// Removes the toast with [id] (no-op when already gone) and fires its
  /// [RefractionToastData.onDismissed].
  void dismiss(int id) {
    final index = _entries.indexWhere((e) => e.id == id);
    if (index < 0) return;
    final entry = _entries.removeAt(index);
    notifyListeners();
    entry.data.onDismissed?.call();
  }

  /// Removes every toast.
  void dismissAll() {
    final removed = List.of(_entries);
    _entries.clear();
    notifyListeners();
    for (final e in removed) {
      e.data.onDismissed?.call();
    }
  }
}

/// Hosts toasts for everything below it.
///
/// Place one near the root — typically in `MaterialApp.builder` — so a
/// toast survives route changes:
///
/// ```dart
/// MaterialApp(
///   builder: (context, child) => RefractionTheme(
///     data: theme,
///     child: RefractionToaster(child: child!),
///   ),
/// )
/// ```
///
/// Layout adapts to the width: on phones (below [compactBreakpoint]) toasts
/// span the bottom edge above the safe area; on tablets and desktops they
/// stack in the bottom-right corner at [width]. Each toast is a live region,
/// pauses its timer while hovered or focused (WCAG 2.2.1), can be swiped
/// away, and dismisses with Escape when focused.
///
/// [RefractionToast.show] finds the nearest toaster; without one it installs
/// a toaster in the nearest [Overlay], so existing call sites keep working.
class RefractionToaster extends StatefulWidget {
  /// Default time on screen for a toast without an action.
  static const Duration defaultDuration = Duration(seconds: 4);

  /// Default time on screen for a toast with an action ("Undo", "Retry").
  static const Duration actionDuration = Duration(seconds: 6);

  /// Width below which toasts use the full-width phone layout.
  static const double compactBreakpoint = 600;

  /// The app content.
  final Widget child;

  /// Optional external controller. When null, the toaster owns one.
  final RefractionToastController? controller;

  /// Toast width in the wide (corner) layout. Defaults to 360.
  final double width;

  /// Creates a toaster.
  const RefractionToaster({
    super.key,
    required this.child,
    this.controller,
    this.width = 360,
  });

  /// The controller of the nearest [RefractionToaster], or null.
  static RefractionToastController? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_ToasterScope>()?.controller;

  @override
  State<RefractionToaster> createState() => _RefractionToasterState();
}

class _RefractionToasterState extends State<RefractionToaster> {
  RefractionToastController? _owned;

  RefractionToastController get _controller =>
      widget.controller ?? (_owned ??= RefractionToastController());

  @override
  void dispose() {
    _owned?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return _ToasterScope(
      controller: _controller,
      child: Stack(
        children: [
          widget.child,
          Positioned.fill(
            child: _ToastViewport(controller: _controller, width: widget.width),
          ),
        ],
      ),
    );
  }
}

class _ToasterScope extends InheritedWidget {
  final RefractionToastController controller;

  const _ToasterScope({required this.controller, required super.child});

  @override
  bool updateShouldNotify(_ToasterScope old) => old.controller != controller;
}

/// Lays the visible toasts out for the current width.
class _ToastViewport extends StatelessWidget {
  final RefractionToastController controller;
  final double width;

  const _ToastViewport({required this.controller, required this.width});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final media = MediaQuery.of(context);
    final compact = media.size.width < RefractionToaster.compactBreakpoint;
    final gutter = compact ? theme.spacingMd : theme.spacingXl;

    return ListenableBuilder(
      listenable: controller,
      builder: (context, _) {
        final visible = controller.entries;
        if (visible.isEmpty) return const SizedBox.shrink();
        final column = Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            for (final entry in visible)
              Padding(
                key: ValueKey(entry.id),
                padding: EdgeInsets.only(top: theme.spacingSm),
                child: _ToastItem(
                  entry: entry,
                  onDismiss: () => controller.dismiss(entry.id),
                ),
              ),
          ],
        );
        return SafeArea(
          child: Padding(
            padding: EdgeInsets.all(gutter),
            child: Align(
              alignment: compact
                  ? Alignment.bottomCenter
                  : Alignment.bottomRight,
              child: compact ? column : SizedBox(width: width, child: column),
            ),
          ),
        );
      },
    );
  }
}

class _ToastItem extends StatefulWidget {
  final RefractionToastEntry entry;
  final VoidCallback onDismiss;

  const _ToastItem({required this.entry, required this.onDismiss});

  @override
  State<_ToastItem> createState() => _ToastItemState();
}

class _ToastItemState extends State<_ToastItem>
    with SingleTickerProviderStateMixin {
  late final AnimationController _enter = AnimationController(vsync: this);

  /// Counts down the toast's remaining time in [_tick] steps. A periodic
  /// timer rather than a ticker: `pumpAndSettle` in an app's widget tests
  /// must not fast-forward through the toast, and pausing stays exact to one
  /// step.
  static const Duration _tick = Duration(milliseconds: 100);
  Timer? _countdown;
  late Duration _remaining = _total;
  bool _hovered = false;
  bool _focusWithin = false;
  bool _leaving = false;

  RefractionToastData get _data => widget.entry.data;

  Duration get _total =>
      _data.duration ??
      (_data.action != null
          ? RefractionToaster.actionDuration
          : RefractionToaster.defaultDuration);

  @override
  void initState() {
    super.initState();
    _resume();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final theme = RefractionTheme.of(context).data;
    _enter.duration = RefractionMotion.duration(context, theme.motionMedium);
    if (_enter.status == AnimationStatus.dismissed && !_leaving) {
      _enter.forward();
    }
  }

  @override
  void dispose() {
    _countdown?.cancel();
    _enter.dispose();
    super.dispose();
  }

  bool get _paused => _hovered || _focusWithin;

  void _resume() {
    if (_total == Duration.zero || _paused || _leaving) return;
    _countdown ??= Timer.periodic(_tick, (_) {
      _remaining -= _tick;
      if (_remaining <= Duration.zero) _dismiss();
    });
  }

  void _pause() {
    _countdown?.cancel();
    _countdown = null;
  }

  void _setHovered(bool v) {
    if (v == _hovered) return;
    _hovered = v;
    _paused ? _pause() : _resume();
  }

  void _setFocusWithin(bool v) {
    if (v == _focusWithin) return;
    _focusWithin = v;
    _paused ? _pause() : _resume();
  }

  Future<void> _dismiss() async {
    if (_leaving) return;
    _leaving = true;
    _pause();
    if (mounted) await _enter.reverse();
    widget.onDismiss();
  }

  void _runAction() {
    _data.action!.onPressed();
    _dismiss();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final tone = _ToastTone.of(_data.variant, colors);
    final curve = CurvedAnimation(parent: _enter, curve: Curves.easeOutCubic);

    final body = Container(
      padding: EdgeInsets.fromLTRB(
        theme.spacingLg,
        theme.spacingMd,
        theme.spacingSm,
        theme.spacingMd,
      ),
      decoration: BoxDecoration(
        color: colors.surfaceOverlay,
        borderRadius: BorderRadius.circular(theme.radiusLg),
        border: Border.all(color: colors.border),
        boxShadow: theme.elevationLg,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (tone.icon != null) ...[
            Padding(
              padding: const EdgeInsets.only(top: 1),
              child: Icon(tone.icon, size: 20, color: tone.iconColor),
            ),
            SizedBox(width: theme.spacingMd),
          ],
          Expanded(child: _texts(theme)),
          if (_data.action != null) ...[
            SizedBox(width: theme.spacingSm),
            RefractionButton(
              variant: RefractionButtonVariant.ghost,
              size: RefractionButtonSize.sm,
              onPressed: _runAction,
              child: Text(
                _data.action!.label,
                style: TextStyle(
                  color: colors.mentionForeground,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
          if (_data.dismissible) ...[
            SizedBox(width: theme.spacingXs),
            RefractionButton(
              variant: RefractionButtonVariant.ghost,
              size: RefractionButtonSize.sm,
              semanticLabel: 'Dismiss notification',
              onPressed: _dismiss,
              child: Icon(Icons.close, size: 16, color: colors.mutedForeground),
            ),
          ],
          if (!_data.dismissible && _data.action == null)
            SizedBox(width: theme.spacingSm),
        ],
      ),
    );

    return Shortcuts(
      shortcuts: const {
        SingleActivator(LogicalKeyboardKey.escape): DismissIntent(),
      },
      child: Actions(
        actions: {
          DismissIntent: CallbackAction<DismissIntent>(
            onInvoke: (_) {
              _dismiss();
              return null;
            },
          ),
        },
        child: Focus(
          canRequestFocus: false,
          skipTraversal: true,
          onFocusChange: _setFocusWithin,
          child: MouseRegion(
            onEnter: (_) => _setHovered(true),
            onExit: (_) => _setHovered(false),
            child: Semantics(
              container: true,
              liveRegion: true,
              child: FadeTransition(
                opacity: curve,
                child: SlideTransition(
                  position: Tween(
                    begin: const Offset(0, 0.35),
                    end: Offset.zero,
                  ).animate(curve),
                  child: Dismissible(
                    key: ValueKey('toast-${widget.entry.id}'),
                    direction: DismissDirection.horizontal,
                    onDismissed: (_) {
                      _leaving = true;
                      _pause();
                      widget.onDismiss();
                    },
                    child: Material(
                      type: MaterialType.transparency,
                      child: body,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _texts(RefractionThemeData theme) {
    final colors = theme.colors;
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 2),
          child: Text(
            _data.title,
            style: theme.textStyle.copyWith(
              color: colors.popoverForeground,
              fontSize: 14,
              fontWeight: FontWeight.w600,
              height: 1.3,
            ),
          ),
        ),
        if (_data.description != null) ...[
          const SizedBox(height: 2),
          Text(
            _data.description!,
            style: theme.textStyle.copyWith(
              color: colors.mutedForeground,
              fontSize: 13,
              height: 1.35,
            ),
          ),
        ],
      ],
    );
  }
}

/// Icon + tint for a variant, read from the accessible status roles.
class _ToastTone {
  final IconData? icon;
  final Color iconColor;

  const _ToastTone(this.icon, this.iconColor);

  factory _ToastTone.of(RefractionToastVariant v, RefractionColors c) {
    switch (v) {
      case RefractionToastVariant.neutral:
        return _ToastTone(null, c.foreground);
      case RefractionToastVariant.success:
        return _ToastTone(Icons.check_circle_rounded, c.successSoftForeground);
      case RefractionToastVariant.info:
        return _ToastTone(Icons.info_rounded, c.infoSoftForeground);
      case RefractionToastVariant.warning:
        return _ToastTone(Icons.warning_rounded, c.warningSoftForeground);
      case RefractionToastVariant.destructive:
        return _ToastTone(Icons.error_rounded, c.destructiveSoftForeground);
    }
  }
}

/// Imperative entry point for transient notifications.
///
/// ```dart
/// final handle = RefractionToast.show(
///   context: context,
///   title: 'Message deleted',
///   action: RefractionToastAction(label: 'Undo', onPressed: restore),
/// );
///
/// RefractionToast.show(
///   context: context,
///   title: "Couldn't send message",
///   description: 'Check your connection and try again.',
///   variant: RefractionToastVariant.destructive,
///   action: RefractionToastAction(label: 'Retry', onPressed: resend),
/// );
/// ```
///
/// Routes to the nearest [RefractionToaster]; without one, installs a
/// toaster in the nearest [Overlay] (once per overlay) so toasts still stack
/// instead of overlapping.
class RefractionToast {
  RefractionToast._();

  static final Expando<_OverlayToaster> _overlayToasters = Expando();

  /// Shows a toast and returns a handle that can dismiss it early.
  static RefractionToastHandle show({
    required BuildContext context,
    required String title,
    String? description,
    Duration? duration,
    RefractionToastVariant variant = RefractionToastVariant.neutral,
    RefractionToastAction? action,
    bool dismissible = true,
    VoidCallback? onDismissed,
  }) {
    final data = RefractionToastData(
      title: title,
      description: description,
      duration: duration,
      variant: variant,
      action: action,
      dismissible: dismissible,
      onDismissed: onDismissed,
    );
    final scoped = RefractionToaster.maybeOf(context);
    if (scoped != null) return scoped.show(data);

    final overlay = Overlay.of(context, rootOverlay: true);
    final host = _overlayToasters[overlay] ??= _OverlayToaster.install(
      overlay,
      RefractionTheme.of(context).data,
    );
    return host.controller.show(data);
  }
}

/// A toaster living in an [OverlayEntry], for apps without a
/// [RefractionToaster] ancestor. The entry stays mounted (it renders nothing
/// while empty) so later toasts reuse it.
class _OverlayToaster {
  final RefractionToastController controller = RefractionToastController();

  _OverlayToaster._();

  static _OverlayToaster install(
    OverlayState overlay,
    RefractionThemeData theme,
  ) {
    final host = _OverlayToaster._();
    overlay.insert(
      OverlayEntry(
        // Prefer the live theme above the overlay (so a light/dark switch
        // restyles open toasts); fall back to the caller's theme.
        builder: (context) => RefractionTheme(
          data: RefractionTheme.maybeOf(context)?.data ?? theme,
          child: _ToastViewport(controller: host.controller, width: 360),
        ),
      ),
    );
    return host;
  }
}
