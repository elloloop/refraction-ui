import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../internal/a11y_support.dart';
import '../theme/hsl_color.dart';
import '../theme/refraction_theme.dart';

// =============================================================================
// Due-date bucketing (pure, no widgets)
// =============================================================================

/// The time bucket a task falls into relative to "now".
enum RefractionDueBucket {
  /// Due before today and not done.
  overdue,

  /// Due today and not done.
  today,

  /// Due after today and not done.
  upcoming,

  /// No due date and not done.
  noDate,

  /// Done, whatever its due date.
  done,
}

/// How urgently a due label should read.
enum RefractionDueTone {
  /// Plain meta text.
  normal,

  /// Due today / very soon — caution colour.
  soon,

  /// Past due — danger colour.
  overdue,
}

/// Pure helpers that sort tasks into the Overdue / Today / Upcoming / Done
/// buckets of a to-do list and describe a due date in words.
///
/// Deterministic: "now" is always an argument, never read from the clock, so
/// the grouping is testable and stable across a frame.
class RefractionDueDates {
  const RefractionDueDates._();

  /// The calendar day of [value] (local date, midnight).
  static DateTime _day(DateTime value) =>
      DateTime(value.year, value.month, value.day);

  /// The bucket for a task due at [due] (null = no date) given [now].
  static RefractionDueBucket bucketOf(
    DateTime? due, {
    required DateTime now,
    bool done = false,
  }) {
    if (done) return RefractionDueBucket.done;
    if (due == null) return RefractionDueBucket.noDate;
    final today = _day(now);
    final day = _day(due);
    if (day.isBefore(today)) return RefractionDueBucket.overdue;
    if (day == today) return RefractionDueBucket.today;
    return RefractionDueBucket.upcoming;
  }

  /// Groups [items] into buckets, in [RefractionDueBucket] order, keeping
  /// each bucket's items in their original relative order. Every bucket is
  /// present (possibly empty) so a list can render stable group headers.
  static Map<RefractionDueBucket, List<T>> group<T>(
    Iterable<T> items, {
    required DateTime now,
    required DateTime? Function(T item) dueOf,
    required bool Function(T item) isDone,
  }) {
    final result = {
      for (final bucket in RefractionDueBucket.values) bucket: <T>[],
    };
    for (final item in items) {
      result[bucketOf(dueOf(item), now: now, done: isDone(item))]!.add(item);
    }
    return result;
  }

  static const List<String> _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', //
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  /// Days ahead within which an upcoming date still reads as "in Nd".
  static const int _relativeHorizonDays = 6;

  /// A short English description of [due] relative to [now] and the tone it
  /// should render in: "Today", "Tomorrow", "Yesterday", "3d overdue",
  /// "in 4d", or "Sep 30". Hosts with their own localisation pass their own
  /// label to [RefractionTaskRow.dueLabel] and use only the tone.
  static (String label, RefractionDueTone tone) describe(
    DateTime due, {
    required DateTime now,
  }) {
    final days = _day(due).difference(_day(now)).inDays;
    if (days == 0) return ('Today', RefractionDueTone.soon);
    if (days == 1) return ('Tomorrow', RefractionDueTone.normal);
    if (days == -1) return ('Yesterday', RefractionDueTone.overdue);
    if (days < 0) return ('${-days}d overdue', RefractionDueTone.overdue);
    if (days <= _relativeHorizonDays) {
      return ('in ${days}d', RefractionDueTone.normal);
    }
    return ('${_months[due.month - 1]} ${due.day}', RefractionDueTone.normal);
  }
}

// =============================================================================
// Completion check
// =============================================================================

/// A round "mark complete" control with a satisfying completion animation:
/// the ring fills with a springy pop and the check mark draws itself in.
///
/// Hovering an unchecked control previews the check (so the affordance is
/// discoverable), it toggles on Space/Enter when focused, shows a keyboard
/// focus ring, and exposes checkbox semantics. Under reduced motion it snaps.
class RefractionCompletionCheck extends StatefulWidget {
  /// Whether the item is complete.
  final bool value;

  /// Called with the requested new value. Null renders it read-only.
  final ValueChanged<bool>? onChanged;

  /// Diameter of the control (the hit target is at least 32 px).
  final double size;

  /// Fill colour when complete. Defaults to the `done` status token.
  final Color? color;

  /// Accessible name, e.g. `'Complete "Write report"'`.
  final String? semanticLabel;

  /// Optional external focus node.
  final FocusNode? focusNode;

  /// Creates a [RefractionCompletionCheck].
  const RefractionCompletionCheck({
    super.key,
    required this.value,
    this.onChanged,
    this.size = 20,
    this.color,
    this.semanticLabel,
    this.focusNode,
  });

  /// Minimum hit target (pointer) around the visual control.
  static const double minHitTarget = 32;

  @override
  State<RefractionCompletionCheck> createState() =>
      _RefractionCompletionCheckState();
}

class _RefractionCompletionCheckState extends State<RefractionCompletionCheck>
    with SingleTickerProviderStateMixin {
  static const Duration _duration = Duration(milliseconds: 420);

  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: _duration,
    value: widget.value ? 1 : 0,
  );
  bool _hovered = false;
  bool _focused = false;

  late final Map<Type, Action<Intent>> _actions = {
    ActivateIntent: CallbackAction<ActivateIntent>(
      onInvoke: (_) {
        _toggle();
        return null;
      },
    ),
  };

  @override
  void didUpdateWidget(RefractionCompletionCheck oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) _animateTo(widget.value);
  }

  void _animateTo(bool value) {
    if (RefractionA11y.reducedMotion(context)) {
      _controller.value = value ? 1 : 0;
    } else if (value) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
  }

  void _toggle() => widget.onChanged?.call(!widget.value);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final fill = RefractionA11y.ensure(
      widget.color ?? colors.done,
      colors.background,
      minRatio: RefractionA11y.nonTextContrast,
    );
    final ring = RefractionA11y.ensure(
      colors.mutedForeground,
      colors.background,
      minRatio: RefractionA11y.nonTextContrast,
    );
    final enabled = widget.onChanged != null;
    final size = widget.size;
    final hit = math.max(size, RefractionCompletionCheck.minHitTarget);

    final painted = AnimatedBuilder(
      animation: _controller,
      builder: (context, _) => CustomPaint(
        size: Size.square(size),
        painter: _CheckPainter(
          progress: _controller.value,
          fill: fill,
          ring: ring,
          ink: RefractionA11y.onColor(fill),
          preview: _hovered && !widget.value && enabled ? ring : null,
        ),
      ),
    );

    Widget control = SizedBox.square(
      dimension: hit,
      child: Center(
        child: RefractionFocusOutline(
          visible: _focused,
          color: RefractionA11y.focusColor(colors),
          borderRadius: BorderRadius.circular(size),
          child: painted,
        ),
      ),
    );

    if (enabled) {
      control = FocusableActionDetector(
        focusNode: widget.focusNode,
        actions: _actions,
        mouseCursor: SystemMouseCursors.click,
        onShowHoverHighlight: (v) => setState(() => _hovered = v),
        onShowFocusHighlight: (v) => setState(() => _focused = v),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _toggle,
          child: control,
        ),
      );
    }

    return Semantics(
      container: true,
      checked: widget.value,
      enabled: enabled,
      label: widget.semanticLabel,
      onTap: enabled ? _toggle : null,
      child: ExcludeSemantics(child: control),
    );
  }
}

class _CheckPainter extends CustomPainter {
  final double progress;
  final Color fill;
  final Color ring;
  final Color ink;
  final Color? preview;

  _CheckPainter({
    required this.progress,
    required this.fill,
    required this.ring,
    required this.ink,
    required this.preview,
  });

  static const double _ringWidth = 1.5;

  /// Portion of the animation spent filling the disc; the rest draws the
  /// check stroke.
  static const double _fillPhase = 0.45;

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final radius = size.shortestSide / 2;

    // Ring (fades out as the disc fills).
    canvas.drawCircle(
      center,
      radius - _ringWidth / 2,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = _ringWidth
        ..color = ring.withValues(alpha: 1 - progress),
    );

    // Disc: grows with a slight overshoot for a springy pop.
    final fillT = (progress / _fillPhase).clamp(0.0, 1.0);
    if (fillT > 0) {
      final scale = Curves.easeOutBack.transform(fillT);
      canvas.drawCircle(center, radius * scale, Paint()..color = fill);
    }

    // Check stroke: drawn in after the disc lands.
    final strokeT = ((progress - _fillPhase) / (1 - _fillPhase)).clamp(
      0.0,
      1.0,
    );
    final check = _checkPath(size);
    if (strokeT > 0) {
      _drawPartial(canvas, check, strokeT, ink, size);
    } else if (preview != null) {
      _drawPartial(canvas, check, 1, preview!.withValues(alpha: 0.7), size);
    }
  }

  Path _checkPath(Size size) {
    final w = size.width;
    final h = size.height;
    return Path()
      ..moveTo(w * 0.28, h * 0.52)
      ..lineTo(w * 0.44, h * 0.67)
      ..lineTo(w * 0.73, h * 0.36);
  }

  void _drawPartial(Canvas canvas, Path path, double t, Color color, Size s) {
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = s.width * 0.1
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..color = color;
    final metrics = path.computeMetrics().toList();
    final total = metrics.fold<double>(0, (sum, m) => sum + m.length);
    var remaining = total * t;
    for (final metric in metrics) {
      if (remaining <= 0) break;
      final length = math.min(metric.length, remaining);
      canvas.drawPath(metric.extractPath(0, length), paint);
      remaining -= length;
    }
  }

  @override
  bool shouldRepaint(_CheckPainter old) =>
      old.progress != progress ||
      old.fill != fill ||
      old.ring != ring ||
      old.ink != ink ||
      old.preview != preview;
}

// =============================================================================
// Keyboard navigation scope
// =============================================================================

/// Registry of row/header focus nodes for arrow-key navigation.
class _TaskNavRegistry {
  final Set<FocusNode> _nodes = {};

  void add(FocusNode node) => _nodes.add(node);
  void remove(FocusNode node) => _nodes.remove(node);

  /// Nodes in visual (top-to-bottom) order.
  List<FocusNode> _ordered() {
    final live = _nodes
        .where((n) => n.context != null && n.canRequestFocus)
        .toList();
    live.sort((a, b) => a.rect.top.compareTo(b.rect.top));
    return live;
  }

  /// Moves focus by [delta] rows from [current]; clamps at the ends.
  bool move(FocusNode current, int delta) {
    final ordered = _ordered();
    final index = ordered.indexOf(current);
    if (index < 0) return false;
    final next = (index + delta).clamp(0, ordered.length - 1);
    if (next == index) return true;
    _focus(ordered[next]);
    return true;
  }

  /// Focuses the first ([last] false) or last row.
  bool jump(bool last) {
    final ordered = _ordered();
    if (ordered.isEmpty) return false;
    _focus(last ? ordered.last : ordered.first);
    return true;
  }

  void _focus(FocusNode node) {
    node.requestFocus();
    final ctx = node.context;
    if (ctx != null) {
      Scrollable.ensureVisible(
        ctx,
        alignmentPolicy: ScrollPositionAlignmentPolicy.keepVisibleAtEnd,
      );
      Scrollable.ensureVisible(
        ctx,
        alignmentPolicy: ScrollPositionAlignmentPolicy.keepVisibleAtStart,
      );
    }
  }
}

class _TaskNavScope extends InheritedWidget {
  final _TaskNavRegistry registry;

  const _TaskNavScope({required this.registry, required super.child});

  static _TaskNavRegistry? maybeOf(BuildContext context) =>
      context.getInheritedWidgetOfExactType<_TaskNavScope>()?.registry;

  @override
  bool updateShouldNotify(_TaskNavScope oldWidget) =>
      registry != oldWidget.registry;
}

/// Handles ↑/↓/Home/End for a focused row or header inside a nav scope.
KeyEventResult _handleNavKey(
  BuildContext context,
  FocusNode node,
  KeyEvent event,
) {
  if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
    return KeyEventResult.ignored;
  }
  final registry = _TaskNavScope.maybeOf(context);
  if (registry == null) return KeyEventResult.ignored;
  final key = event.logicalKey;
  bool handled = false;
  if (key == LogicalKeyboardKey.arrowDown) {
    handled = registry.move(node, 1);
  } else if (key == LogicalKeyboardKey.arrowUp) {
    handled = registry.move(node, -1);
  } else if (key == LogicalKeyboardKey.home) {
    handled = registry.jump(false);
  } else if (key == LogicalKeyboardKey.end) {
    handled = registry.jump(true);
  }
  return handled ? KeyEventResult.handled : KeyEventResult.ignored;
}

/// Mixin that registers a focus node with the nearest nav scope.
mixin _NavRegistration<T extends StatefulWidget> on State<T> {
  late final FocusNode navNode = FocusNode(debugLabel: '$T');
  _TaskNavRegistry? _registry;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final registry = _TaskNavScope.maybeOf(context);
    if (registry != _registry) {
      _registry?.remove(navNode);
      _registry = registry?..add(navNode);
    }
  }

  @override
  void dispose() {
    _registry?.remove(navNode);
    navNode.dispose();
    super.dispose();
  }
}

// =============================================================================
// Task list
// =============================================================================

/// A vertical stack of [RefractionTaskGroup]s (or bare [RefractionTaskRow]s)
/// with desktop/web keyboard navigation: ↑/↓ move between rows and group
/// headers across groups, Home/End jump to the first/last, Space completes
/// the focused row and Enter opens it.
///
/// It lays its children out in a [Column]; put it in a scroll view (it
/// scrolls the focused row into view).
class RefractionTaskList extends StatefulWidget {
  /// Groups and/or rows.
  final List<Widget> children;

  /// Vertical gap between children (defaults to the theme's `spacingLg`).
  final double? spacing;

  /// Accessible name of the list, e.g. `'My to-dos'`.
  final String? semanticLabel;

  /// Creates a [RefractionTaskList].
  const RefractionTaskList({
    super.key,
    required this.children,
    this.spacing,
    this.semanticLabel,
  });

  @override
  State<RefractionTaskList> createState() => _RefractionTaskListState();
}

class _RefractionTaskListState extends State<RefractionTaskList> {
  final _TaskNavRegistry _registry = _TaskNavRegistry();

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final gap = widget.spacing ?? theme.spacingLg;
    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: widget.semanticLabel,
      child: _TaskNavScope(
        registry: _registry,
        child: FocusTraversalGroup(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              for (var i = 0; i < widget.children.length; i++) ...[
                if (i > 0) SizedBox(height: gap),
                widget.children[i],
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// =============================================================================
// Task group
// =============================================================================

/// A collapsible group of task rows — "Overdue", "Today", "Upcoming",
/// "Done" — with a coloured title, an item count, and an optional trailing
/// action.
///
/// The header is a button with `expanded` semantics (Enter/Space toggles).
/// Collapsed rows are removed from the tree, so they are not reachable by
/// Tab or a screen reader. Works controlled ([expanded] +
/// [onExpandedChanged]) or uncontrolled ([initiallyExpanded]).
class RefractionTaskGroup extends StatefulWidget {
  /// Group title.
  final String title;

  /// Rows (typically [RefractionTaskRow]s).
  final List<Widget> children;

  /// Count shown in the header; defaults to `children.length` (pass the
  /// real total when rows are paginated or filtered).
  final int? count;

  /// Accent colour for the title and the rows' leading edge. Defaults to
  /// the theme foreground.
  final Color? color;

  /// Controlled expansion state.
  final bool? expanded;

  /// Initial state when uncontrolled.
  final bool initiallyExpanded;

  /// Called with the requested expansion state.
  final ValueChanged<bool>? onExpandedChanged;

  /// Optional widget at the end of the header (e.g. an "Add" button).
  final Widget? trailing;

  /// Shown instead of rows when [children] is empty. Null hides the body.
  final String? emptyLabel;

  /// Creates a [RefractionTaskGroup].
  const RefractionTaskGroup({
    super.key,
    required this.title,
    required this.children,
    this.count,
    this.color,
    this.expanded,
    this.initiallyExpanded = true,
    this.onExpandedChanged,
    this.trailing,
    this.emptyLabel,
  });

  @override
  State<RefractionTaskGroup> createState() => _RefractionTaskGroupState();
}

class _RefractionTaskGroupState extends State<RefractionTaskGroup>
    with SingleTickerProviderStateMixin, _NavRegistration {
  static const Duration _duration = Duration(milliseconds: 220);
  static const double _chevronSize = 18;

  late bool _open = widget.expanded ?? widget.initiallyExpanded;
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: _duration,
    value: _open ? 1 : 0,
  );
  late final CurvedAnimation _curve = CurvedAnimation(
    parent: _controller,
    curve: Curves.easeOutCubic,
  );
  bool _hovered = false;
  bool _focused = false;

  bool get _isOpen => widget.expanded ?? _open;

  @override
  void didUpdateWidget(RefractionTaskGroup oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.expanded != null && widget.expanded != oldWidget.expanded) {
      _run(widget.expanded!);
    }
  }

  void _run(bool open) {
    _controller.duration = RefractionA11y.motion(context, _duration);
    if (open) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
  }

  void _toggle() {
    final next = !_isOpen;
    if (widget.expanded == null) {
      setState(() => _open = next);
      _run(next);
    }
    widget.onExpandedChanged?.call(next);
  }

  @override
  void dispose() {
    _curve.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final accent = RefractionA11y.ensure(
      widget.color ?? colors.foreground,
      colors.background,
    );
    final count = widget.count ?? widget.children.length;
    final radius = BorderRadius.circular(theme.radiusMd);

    final header = Focus(
      focusNode: navNode,
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.enter ||
                event.logicalKey == LogicalKeyboardKey.space)) {
          _toggle();
          return KeyEventResult.handled;
        }
        return _handleNavKey(context, node, event);
      },
      onFocusChange: (_) => setState(
        () => _focused =
            navNode.hasPrimaryFocus &&
            FocusManager.instance.highlightMode ==
                FocusHighlightMode.traditional,
      ),
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _toggle,
          child: RefractionFocusOutline(
            visible: _focused,
            color: RefractionA11y.focusColor(colors),
            borderRadius: radius,
            child: AnimatedContainer(
              duration: RefractionA11y.motion(context, _duration),
              constraints: BoxConstraints(minHeight: theme.controlHeightMd),
              padding: EdgeInsets.symmetric(horizontal: theme.spacingXs),
              decoration: BoxDecoration(
                color: _hovered ? colors.muted : null,
                borderRadius: radius,
              ),
              child: Row(
                children: [
                  RotationTransition(
                    turns: Tween<double>(begin: -0.25, end: 0).animate(_curve),
                    child: Icon(
                      Icons.expand_more_rounded,
                      size: _chevronSize,
                      color: accent,
                    ),
                  ),
                  SizedBox(width: theme.spacingXs),
                  Flexible(
                    child: Text(
                      widget.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textStyle.copyWith(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: accent,
                      ),
                    ),
                  ),
                  SizedBox(width: theme.spacingSm),
                  _CountChip(count: count),
                  const Spacer(),
                  if (widget.trailing != null) widget.trailing!,
                ],
              ),
            ),
          ),
        ),
      ),
    );

    Widget body;
    if (widget.children.isEmpty) {
      body = widget.emptyLabel == null
          ? const SizedBox.shrink()
          : Padding(
              padding: EdgeInsets.symmetric(
                horizontal: theme.spacingLg,
                vertical: theme.spacingMd,
              ),
              child: Text(
                widget.emptyLabel!,
                style: theme.textStyle.copyWith(
                  fontSize: 13,
                  color: RefractionA11y.metaText(colors),
                ),
              ),
            );
    } else {
      body = Container(
        margin: EdgeInsets.only(top: theme.spacingXs),
        decoration: BoxDecoration(
          color: colors.card,
          borderRadius: radius,
          border: Border.all(color: colors.borderSubtle),
        ),
        clipBehavior: Clip.antiAlias,
        child: _GroupAccent(
          color: widget.color ?? colors.border,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              for (var i = 0; i < widget.children.length; i++) ...[
                if (i > 0) Container(height: 1, color: colors.borderSubtle),
                widget.children[i],
              ],
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Semantics(
          container: true,
          button: true,
          expanded: _isOpen,
          label: '${widget.title}, $count',
          onTap: _toggle,
          child: ExcludeSemantics(child: header),
        ),
        AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            // Fully collapsed: drop the rows so Tab and screen readers
            // cannot reach hidden content.
            if (_controller.isDismissed) return const SizedBox.shrink();
            return ClipRect(
              child: Align(
                alignment: Alignment.topCenter,
                heightFactor: _curve.value,
                child: FadeTransition(opacity: _curve, child: child),
              ),
            );
          },
          child: body,
        ),
      ],
    );
  }
}

class _CountChip extends StatelessWidget {
  final int count;

  const _CountChip({required this.count});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    return Container(
      padding: EdgeInsets.symmetric(horizontal: theme.spacingSm, vertical: 1),
      decoration: BoxDecoration(
        color: colors.muted,
        borderRadius: BorderRadius.circular(theme.radiusPill),
      ),
      child: Text(
        '$count',
        style: theme.textStyle.copyWith(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: RefractionA11y.metaText(colors, surface: colors.muted),
          fontFeatures: const [FontFeature.tabularFigures()],
        ),
      ),
    );
  }
}

/// Carries the group's accent colour to its rows' leading edge.
class _GroupAccent extends InheritedWidget {
  final Color color;

  const _GroupAccent({required this.color, required super.child});

  static Color? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_GroupAccent>()?.color;

  @override
  bool updateShouldNotify(_GroupAccent oldWidget) => color != oldWidget.color;
}

// =============================================================================
// Task row
// =============================================================================

/// One to-do in a work-tracking list: a completion check, the title, an
/// optional source link ("where this came from"), owner, due date and a
/// status pill.
///
/// **Responsive**: at [compactBreakpoint] and above the meta sits in aligned
/// trailing columns (source · owner · due · status) like a board table;
/// below it the title takes up to two lines with source and due underneath,
/// and owner + status stay on the right.
///
/// **Completion**: tapping the check (or Space on a focused row) plays the
/// completion animation immediately — disc pop, check draw, title strike and
/// a brief success tint — and reports [onCompletedChanged] after
/// [completionSettle], so a host that moves done items to a "Done" group
/// does so after the user has seen it land. Un-completing reports at once.
/// Under reduced motion everything is immediate.
///
/// **Keyboard**: the row is one focus stop (Tab), with Enter → [onTap] and
/// Space → toggle; inside a [RefractionTaskList], ↑/↓/Home/End move between
/// rows. The check, the source link and a pill with `onPressed` remain
/// separately reachable by Tab.
class RefractionTaskRow extends StatefulWidget {
  /// Task title.
  final String title;

  /// Whether the task is complete.
  final bool completed;

  /// Called with the requested completion state (see class docs for the
  /// completion timing). Null hides the check control.
  final ValueChanged<bool>? onCompletedChanged;

  /// Opens the task (row tap / Enter).
  final VoidCallback? onTap;

  /// Status widget, typically a [RefractionStatusPill] (`size: sm` reads
  /// best in compact rows).
  final Widget? status;

  /// Owner widget, typically a small `RefractionAvatar`.
  final Widget? owner;

  /// Label of the source link (e.g. the conversation the task came from).
  final String? sourceLabel;

  /// Icon before [sourceLabel].
  final IconData sourceIcon;

  /// Called when the source link is activated. Null renders plain text.
  final VoidCallback? onSourceTap;

  /// Due / age text (see [RefractionDueDates.describe]).
  final String? dueLabel;

  /// Urgency colour for [dueLabel].
  final RefractionDueTone dueTone;

  /// Leading-edge accent. Defaults to the enclosing group's colour.
  final Color? accentColor;

  /// Delay between the completion animation starting and
  /// [onCompletedChanged] firing.
  final Duration completionSettle;

  /// Width at and above which the wide, column-aligned layout is used.
  final double compactBreakpoint;

  /// Width of the status column in the wide layout (aligns across rows).
  final double statusWidth;

  /// Width of the due column in the wide layout.
  final double dueWidth;

  /// Accessible summary. Defaults to "title, due, source".
  final String? semanticLabel;

  /// Creates a [RefractionTaskRow].
  const RefractionTaskRow({
    super.key,
    required this.title,
    this.completed = false,
    this.onCompletedChanged,
    this.onTap,
    this.status,
    this.owner,
    this.sourceLabel,
    this.sourceIcon = Icons.forum_outlined,
    this.onSourceTap,
    this.dueLabel,
    this.dueTone = RefractionDueTone.normal,
    this.accentColor,
    this.completionSettle = const Duration(milliseconds: 650),
    this.compactBreakpoint = 640,
    this.statusWidth = 132,
    this.dueWidth = 96,
    this.semanticLabel,
  });

  @override
  State<RefractionTaskRow> createState() => _RefractionTaskRowState();
}

class _RefractionTaskRowState extends State<RefractionTaskRow>
    with SingleTickerProviderStateMixin, _NavRegistration {
  static const Duration _flash = Duration(milliseconds: 900);
  static const double _accentWidth = 3;
  static const double _ownerSize = 28;
  static const double _sourceMaxWidth = 200;

  /// Status column cap in the compact layout, so the title keeps the room.
  static const double _compactStatusMaxWidth = 104;

  /// Visual completion state while the settle delay runs.
  bool? _pending;
  Timer? _settleTimer;
  bool _hovered = false;
  bool _focused = false;

  late final AnimationController _flashController = AnimationController(
    vsync: this,
    duration: _flash,
  );

  bool get _shownCompleted => _pending ?? widget.completed;

  @override
  void didUpdateWidget(RefractionTaskRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.completed != oldWidget.completed && _pending != null) {
      if (widget.completed == _pending) {
        _settleTimer?.cancel();
        _pending = null;
      }
    }
  }

  void _setCompleted(bool value) {
    final callback = widget.onCompletedChanged;
    if (callback == null) return;
    _settleTimer?.cancel();
    final settle = RefractionA11y.motion(context, widget.completionSettle);
    if (!value || settle == Duration.zero) {
      setState(() => _pending = null);
      callback(value);
      return;
    }
    setState(() => _pending = true);
    if (!RefractionA11y.reducedMotion(context)) {
      _flashController.forward(from: 0);
    }
    _settleTimer = Timer(settle, () {
      _settleTimer = null;
      if (mounted) callback(true);
    });
  }

  @override
  void dispose() {
    // A row removed mid-settle (filtered away, list rebuilt) must still
    // report the completion the user asked for — after this frame, so the
    // host's setState does not run during unmount.
    if (_settleTimer?.isActive ?? false) {
      _settleTimer!.cancel();
      final callback = widget.onCompletedChanged;
      if (callback != null) scheduleMicrotask(() => callback(true));
    }
    _flashController.dispose();
    super.dispose();
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is KeyDownEvent && node.hasPrimaryFocus) {
      if (event.logicalKey == LogicalKeyboardKey.space &&
          widget.onCompletedChanged != null) {
        _setCompleted(!_shownCompleted);
        return KeyEventResult.handled;
      }
      if (event.logicalKey == LogicalKeyboardKey.enter &&
          widget.onTap != null) {
        widget.onTap!();
        return KeyEventResult.handled;
      }
    }
    return _handleNavKey(context, node, event);
  }

  String _semanticSummary() {
    if (widget.semanticLabel != null) return widget.semanticLabel!;
    return [
      widget.title,
      if (_shownCompleted) 'completed',
      if (widget.dueLabel != null) 'due ${widget.dueLabel}',
      if (widget.sourceLabel != null) 'from ${widget.sourceLabel}',
    ].join(', ');
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final done = _shownCompleted;
    final accent = widget.accentColor ?? _GroupAccent.maybeOf(context);
    final duration = RefractionA11y.motion(
      context,
      const Duration(milliseconds: 260),
    );
    final meta = RefractionA11y.metaText(colors, surface: colors.card);

    final titleStyle = theme.textStyle.copyWith(
      fontSize: 14,
      height: 1.35,
      fontWeight: FontWeight.w500,
      color: done ? meta : colors.foreground,
      decoration: done ? TextDecoration.lineThrough : TextDecoration.none,
      decorationColor: meta,
      decorationThickness: 1.5,
    );

    Widget title(int maxLines) => AnimatedDefaultTextStyle(
      duration: duration,
      style: titleStyle,
      child: Text(
        widget.title,
        maxLines: maxLines,
        overflow: TextOverflow.ellipsis,
      ),
    );

    final check = widget.onCompletedChanged == null
        ? null
        : RefractionCompletionCheck(
            value: done,
            onChanged: _setCompleted,
            semanticLabel: 'Complete ${widget.title}',
          );

    final source = widget.sourceLabel == null
        ? null
        : _SourceLink(
            label: widget.sourceLabel!,
            icon: widget.sourceIcon,
            onTap: widget.onSourceTap,
          );

    final due = widget.dueLabel == null
        ? null
        : _DueText(label: widget.dueLabel!, tone: widget.dueTone, done: done);

    final content = LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth >= widget.compactBreakpoint;
        final gap = SizedBox(width: theme.spacingMd);
        if (wide) {
          return ConstrainedBox(
            constraints: BoxConstraints(minHeight: theme.controlHeightLg),
            child: Row(
              children: [
                if (check != null) check else gap,
                SizedBox(width: theme.spacingXs),
                Expanded(child: title(1)),
                if (source != null) ...[
                  gap,
                  ConstrainedBox(
                    constraints: const BoxConstraints(
                      maxWidth: _sourceMaxWidth,
                    ),
                    child: source,
                  ),
                ],
                gap,
                SizedBox.square(
                  dimension: _ownerSize,
                  child: Center(child: widget.owner),
                ),
                gap,
                SizedBox(
                  width: widget.dueWidth,
                  child: due == null
                      ? null
                      : Align(alignment: Alignment.centerLeft, child: due),
                ),
                // Always reserved so columns align across rows.
                SizedBox(width: widget.statusWidth, child: widget.status),
                SizedBox(width: theme.spacingMd),
              ],
            ),
          );
        }
        final subline = [?source, ?due];
        return Padding(
          padding: EdgeInsets.symmetric(vertical: theme.spacingSm),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              if (check != null) check else gap,
              SizedBox(width: theme.spacingXs),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    title(2),
                    if (subline.isNotEmpty) ...[
                      SizedBox(height: theme.spacingXs / 2),
                      Wrap(
                        spacing: theme.spacingSm,
                        runSpacing: 2,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: subline,
                      ),
                    ],
                  ],
                ),
              ),
              if (widget.owner != null) ...[
                SizedBox(width: theme.spacingSm),
                SizedBox.square(dimension: _ownerSize, child: widget.owner),
              ],
              if (widget.status != null) ...[
                SizedBox(width: theme.spacingSm),
                ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth: math.min(
                      widget.statusWidth,
                      _compactStatusMaxWidth,
                    ),
                  ),
                  child: widget.status,
                ),
              ],
              SizedBox(width: theme.spacingMd),
            ],
          ),
        );
      },
    );

    final flashColor = ColorMath.mix(colors.card, colors.done, 0.14);
    final hoverColor = ColorMath.mix(colors.card, colors.foreground, 0.035);

    final row = AnimatedBuilder(
      animation: _flashController,
      builder: (context, child) {
        final t = Curves.easeOut.transform(1 - _flashController.value);
        final flashing = _flashController.isAnimating;
        final base = _hovered ? hoverColor : colors.card;
        return Container(
          decoration: BoxDecoration(
            color: flashing ? Color.lerp(base, flashColor, t) : base,
            border: Border(
              left: BorderSide(
                color: accent ?? Colors.transparent,
                width: _accentWidth,
              ),
            ),
          ),
          padding: EdgeInsets.only(left: theme.spacingXs),
          child: child,
        );
      },
      child: content,
    );

    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: _semanticSummary(),
      button: widget.onTap != null,
      onTap: widget.onTap,
      child: Focus(
        focusNode: navNode,
        onKeyEvent: _onKey,
        onFocusChange: (_) => setState(
          () => _focused =
              navNode.hasPrimaryFocus &&
              FocusManager.instance.highlightMode ==
                  FocusHighlightMode.traditional,
        ),
        child: MouseRegion(
          cursor: widget.onTap != null
              ? SystemMouseCursors.click
              : MouseCursor.defer,
          onEnter: (_) => setState(() => _hovered = true),
          onExit: (_) => setState(() => _hovered = false),
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: widget.onTap,
            child: RefractionFocusOutline(
              visible: _focused,
              inside: true,
              color: RefractionA11y.focusColor(colors, surface: colors.card),
              child: row,
            ),
          ),
        ),
      ),
    );
  }
}

class _SourceLink extends StatefulWidget {
  final String label;
  final IconData icon;
  final VoidCallback? onTap;

  const _SourceLink({required this.label, required this.icon, this.onTap});

  @override
  State<_SourceLink> createState() => _SourceLinkState();
}

class _SourceLinkState extends State<_SourceLink> {
  bool _hovered = false;
  bool _focused = false;

  late final Map<Type, Action<Intent>> _actions = {
    ActivateIntent: CallbackAction<ActivateIntent>(
      onInvoke: (_) {
        widget.onTap?.call();
        return null;
      },
    ),
  };

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final interactive = widget.onTap != null;
    final ink = interactive
        ? RefractionA11y.ensure(colors.info, colors.card)
        : RefractionA11y.metaText(colors, surface: colors.card);
    final label = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(widget.icon, size: 13, color: ink),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            widget.label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textStyle.copyWith(
              fontSize: 12.5,
              color: ink,
              decoration: _hovered
                  ? TextDecoration.underline
                  : TextDecoration.none,
              decorationColor: ink,
            ),
          ),
        ),
      ],
    );
    if (!interactive) return label;
    return Semantics(
      link: true,
      label: widget.label,
      onTap: widget.onTap,
      child: ExcludeSemantics(
        child: FocusableActionDetector(
          actions: _actions,
          mouseCursor: SystemMouseCursors.click,
          onShowHoverHighlight: (v) => setState(() => _hovered = v),
          onShowFocusHighlight: (v) => setState(() => _focused = v),
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: widget.onTap,
            child: RefractionFocusOutline(
              visible: _focused,
              color: RefractionA11y.focusColor(colors, surface: colors.card),
              borderRadius: BorderRadius.circular(theme.radiusSm),
              child: label,
            ),
          ),
        ),
      ),
    );
  }
}

class _DueText extends StatelessWidget {
  final String label;
  final RefractionDueTone tone;
  final bool done;

  const _DueText({required this.label, required this.tone, required this.done});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final surface = colors.card;
    final effective = done ? RefractionDueTone.normal : tone;
    final color = switch (effective) {
      RefractionDueTone.normal => RefractionA11y.metaText(
        colors,
        surface: surface,
      ),
      RefractionDueTone.soon => RefractionA11y.ensure(colors.caution, surface),
      RefractionDueTone.overdue => RefractionA11y.ensure(
        colors.destructive,
        surface,
      ),
    };
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          effective == RefractionDueTone.overdue
              ? Icons.error_outline_rounded
              : Icons.schedule_rounded,
          size: 13,
          color: color,
        ),
        const SizedBox(width: 4),
        Flexible(
          child: Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textStyle.copyWith(
              fontSize: 12.5,
              fontWeight: effective == RefractionDueTone.normal
                  ? FontWeight.w400
                  : FontWeight.w600,
              color: color,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
        ),
      ],
    );
  }
}
