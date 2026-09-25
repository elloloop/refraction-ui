import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../theme/focus_ring.dart';

/// Interaction state reported to a [RefractionPressable.builder].
@immutable
class RefractionPressableState {
  /// A mouse pointer is over the control (desktop / web only).
  final bool hovered;

  /// The control has keyboard focus in keyboard-highlight mode. A mouse
  /// click or tap never sets this, so a focus visual never flashes on click.
  final bool focused;

  /// A pointer is currently pressed on the control.
  final bool pressed;

  /// Creates an interaction state snapshot.
  const RefractionPressableState({
    this.hovered = false,
    this.focused = false,
    this.pressed = false,
  });
}

/// The keyboard/pointer/focus layer every Refraction control shares.
///
/// Makes [child] (built by [builder]) reachable with Tab, activatable with
/// Enter / Space, clickable, hover-aware, and draws the theme focus ring
/// ([RefractionFocusRing]) while keyboard-focused. It deliberately adds **no
/// semantics** — each control wraps it in the [Semantics] that fits its role
/// (button, checkbox, switch, …) and passes the same activation callback as
/// that node's `onTap`, so a screen reader, the keyboard and a pointer all
/// run one code path.
///
/// ```dart
/// Semantics(
///   button: true,
///   label: 'Delete message',
///   onTap: enabled ? onDelete : null,
///   child: RefractionPressable(
///     onPressed: enabled ? onDelete : null,
///     borderRadius: BorderRadius.circular(8),
///     builder: (context, state) => Icon(
///       Icons.delete_outline,
///       color: state.hovered ? colors.destructive : colors.mutedForeground,
///     ),
///   ),
/// )
/// ```
class RefractionPressable extends StatefulWidget {
  /// Called on click, tap, Enter or Space. `null` disables the control: it
  /// leaves the focus order and ignores pointers.
  final VoidCallback? onPressed;

  /// Builds the control for the current interaction state.
  final Widget Function(BuildContext context, RefractionPressableState state)
  builder;

  /// Corner radius of the built control, so the focus ring follows it.
  final BorderRadius borderRadius;

  /// Optional external focus node.
  final FocusNode? focusNode;

  /// Whether to take focus when first built.
  final bool autofocus;

  /// Pointer cursor while enabled. Disabled controls show
  /// [SystemMouseCursors.forbidden].
  final MouseCursor cursor;

  /// Whether to paint the focus ring. Controls that render their own focus
  /// treatment (e.g. an input's border) turn this off and read
  /// [RefractionPressableState.focused] instead.
  final bool showFocusRing;

  /// Creates a pressable control.
  const RefractionPressable({
    super.key,
    required this.onPressed,
    required this.builder,
    this.borderRadius = BorderRadius.zero,
    this.focusNode,
    this.autofocus = false,
    this.cursor = SystemMouseCursors.click,
    this.showFocusRing = true,
  });

  @override
  State<RefractionPressable> createState() => _RefractionPressableState();
}

class _RefractionPressableState extends State<RefractionPressable> {
  bool _hovered = false;
  bool _focused = false;
  bool _pressed = false;

  /// Declared here as well as by [WidgetsApp] so activation works under any
  /// app shell (and in bare widget tests).
  static const Map<ShortcutActivator, Intent> _shortcuts = {
    SingleActivator(LogicalKeyboardKey.enter): ActivateIntent(),
    SingleActivator(LogicalKeyboardKey.numpadEnter): ActivateIntent(),
    SingleActivator(LogicalKeyboardKey.space): ActivateIntent(),
  };

  bool get _enabled => widget.onPressed != null;

  void _setPressed(bool value) {
    if (_pressed != value) setState(() => _pressed = value);
  }

  @override
  void didUpdateWidget(RefractionPressable old) {
    super.didUpdateWidget(old);
    // A control disabled mid-hover/press must not stay painted as active.
    if (!_enabled && (_hovered || _pressed)) {
      _hovered = false;
      _pressed = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = RefractionPressableState(
      hovered: _enabled && _hovered,
      focused: _enabled && _focused,
      pressed: _enabled && _pressed,
    );
    return FocusableActionDetector(
      enabled: _enabled,
      focusNode: widget.focusNode,
      autofocus: widget.autofocus,
      shortcuts: _shortcuts,
      actions: {
        ActivateIntent: CallbackAction<ActivateIntent>(
          onInvoke: (_) {
            widget.onPressed?.call();
            return null;
          },
        ),
      },
      onShowFocusHighlight: (v) => setState(() => _focused = v),
      onShowHoverHighlight: (v) => setState(() => _hovered = v),
      mouseCursor: _enabled ? widget.cursor : SystemMouseCursors.forbidden,
      child: GestureDetector(
        onTap: widget.onPressed,
        onTapDown: _enabled ? (_) => _setPressed(true) : null,
        onTapUp: _enabled ? (_) => _setPressed(false) : null,
        onTapCancel: _enabled ? () => _setPressed(false) : null,
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        child: RefractionFocusRing(
          visible: widget.showFocusRing && state.focused,
          borderRadius: widget.borderRadius,
          child: widget.builder(context, state),
        ),
      ),
    );
  }
}
