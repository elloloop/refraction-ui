import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A compound widget that expands and collapses its content.
///
/// `RefractionCollapsible` mirrors the `Collapsible` component from the
/// React and Astro Refraction UI packages. It manages the open state and
/// animation controller, which are accessed by its descendant compound parts:
/// [RefractionCollapsibleTrigger] and [RefractionCollapsibleContent].
///
/// It can be used uncontrolled (with [defaultOpen]) or controlled
/// (passing [isOpen] and [onOpenChange]).
///
/// ```dart
/// RefractionCollapsible(
///   child: Column(
///     crossAxisAlignment: CrossAxisAlignment.stretch,
///     children: [
///       RefractionCollapsibleTrigger(
///         child: Container(
///           padding: const EdgeInsets.all(12),
///           decoration: BoxDecoration(border: Border.all()),
///           child: const Text('Toggle Content'),
///         ),
///       ),
///       RefractionCollapsibleContent(
///         child: Container(
///           padding: const EdgeInsets.all(12),
///           child: const Text('This content is collapsible.'),
///         ),
///       ),
///     ],
///   ),
/// )
/// ```
class RefractionCollapsible extends StatefulWidget {
  /// Whether the collapsible is open. If provided, the collapsible operates
  /// in controlled mode.
  final bool? isOpen;

  /// Whether the collapsible is open by default. Only used if [isOpen] is null.
  final bool defaultOpen;

  /// Callback fired when the open state changes.
  final ValueChanged<bool>? onOpenChange;

  /// Whether the collapsible is disabled, preventing the trigger from working.
  final bool disabled;

  /// The widget below this widget in the tree, typically containing a trigger
  /// and content.
  final Widget child;

  /// Creates a [RefractionCollapsible] state container.
  const RefractionCollapsible({
    super.key,
    this.isOpen,
    this.defaultOpen = false,
    this.onOpenChange,
    this.disabled = false,
    required this.child,
  });

  /// Retrieves the [RefractionCollapsibleState] from the given [context].
  static RefractionCollapsibleState of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<_CollapsibleScope>();
    assert(
      scope != null,
      'RefractionCollapsible parts must be wrapped in a RefractionCollapsible.',
    );
    return scope!.state;
  }

  @override
  State<RefractionCollapsible> createState() => RefractionCollapsibleState();
}

class RefractionCollapsibleState extends State<RefractionCollapsible>
    with SingleTickerProviderStateMixin {
  late bool _isOpen;
  late AnimationController animationController;

  /// Whether the collapsible is currently open.
  bool get isOpen => widget.isOpen ?? _isOpen;

  @override
  void initState() {
    super.initState();
    _isOpen = widget.isOpen ?? widget.defaultOpen;
    animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
      value: _isOpen ? 1.0 : 0.0,
    );
  }

  @override
  void didUpdateWidget(RefractionCollapsible oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isOpen != null && widget.isOpen != oldWidget.isOpen) {
      if (widget.isOpen!) {
        animationController.forward();
      } else {
        animationController.reverse();
      }
    }
  }

  @override
  void dispose() {
    animationController.dispose();
    super.dispose();
  }

  /// Toggles the open state of the collapsible.
  void toggle() {
    if (widget.disabled) return;
    
    final newValue = !isOpen;
    
    if (widget.isOpen == null) {
      setState(() {
        _isOpen = newValue;
      });
      if (_isOpen) {
        animationController.forward();
      } else {
        animationController.reverse();
      }
    }
    
    widget.onOpenChange?.call(newValue);
  }

  @override
  Widget build(BuildContext context) {
    return _CollapsibleScope(
      state: this,
      isOpen: isOpen,
      disabled: widget.disabled,
      child: widget.child,
    );
  }
}

class _CollapsibleScope extends InheritedWidget {
  final RefractionCollapsibleState state;
  final bool isOpen;
  final bool disabled;

  const _CollapsibleScope({
    required this.state,
    required this.isOpen,
    required this.disabled,
    required super.child,
  });

  @override
  bool updateShouldNotify(_CollapsibleScope oldWidget) {
    return isOpen != oldWidget.isOpen || disabled != oldWidget.disabled;
  }
}

/// The button that toggles the collapsible open or closed.
class RefractionCollapsibleTrigger extends StatelessWidget {
  /// The widget to display as the trigger button.
  final Widget child;
  
  /// Optional callback to run alongside the default toggle behavior.
  final VoidCallback? onTap;

  /// Creates a [RefractionCollapsibleTrigger].
  const RefractionCollapsibleTrigger({
    super.key,
    required this.child,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final state = RefractionCollapsible.of(context);
    final theme = RefractionTheme.of(context);

    return InkWell(
      onTap: state.widget.disabled
          ? null
          : () {
              state.toggle();
              onTap?.call();
            },
      hoverColor: theme.colors.accent.withValues(alpha: 0.5),
      child: child,
    );
  }
}

/// The content that is revealed or hidden by the [RefractionCollapsible].
class RefractionCollapsibleContent extends StatelessWidget {
  /// The content widget.
  final Widget child;

  /// The curve used for the size animation.
  final Curve curve;

  /// Creates a [RefractionCollapsibleContent].
  const RefractionCollapsibleContent({
    super.key,
    required this.child,
    this.curve = Curves.easeInOut,
  });

  @override
  Widget build(BuildContext context) {
    final state = RefractionCollapsible.of(context);
    
    return SizeTransition(
      sizeFactor: CurvedAnimation(
        parent: state.animationController,
        curve: curve,
      ),
      child: child,
    );
  }
}
