import 'package:flutter/material.dart';

import '../internal/a11y_support.dart';
import '../theme/hsl_color.dart';
import '../theme/refraction_theme.dart';
import 'status_indicator.dart';

/// Visual treatment of a [RefractionStatusPill].
enum RefractionStatusPillVariant {
  /// Saturated fill with high-contrast ink — the "status column" look of a
  /// work-tracking board. Reads at a glance in dense lists.
  solid,

  /// Tinted fill with a same-hue label and a leading dot. Quieter; suited
  /// to secondary statuses or dense cards where several pills sit together.
  soft,
}

/// Size of a [RefractionStatusPill].
enum RefractionStatusPillSize {
  /// 22 px tall, 11.5 px label — cards and compact rows.
  sm,

  /// 28 px tall, 12.5 px label — list rows and table cells.
  md,
}

/// A labelled, colour-coded status chip — the building block of a
/// work-tracking status column ("Not started", "Working on it", "Stuck",
/// "Done").
///
/// Colours come from the theme's status tokens through [type]
/// (see [RefractionStatusTypeColors]) or from an explicit [color] for custom
/// statuses. Ink is chosen per surface so the label always meets WCAG AA
/// (4.5:1): a light fill gets dark ink, a saturated one gets white, and a
/// hue that suits neither is nudged in lightness until it passes.
///
/// Pass [onPressed] to make the pill a button (e.g. to open a status menu):
/// it becomes focusable, activates on Enter/Space, shows a hover state and a
/// keyboard focus ring, and exposes `button` semantics. Status changes
/// cross-fade the fill and label unless the platform asks for reduced motion.
///
/// ```dart
/// RefractionStatusPill(
///   label: 'Working on it',
///   type: RefractionStatusType.pending,
///   onPressed: () => openStatusMenu(),
/// )
/// ```
class RefractionStatusPill extends StatefulWidget {
  /// Text shown in the pill.
  final String label;

  /// Semantic status; resolves the colour from the theme's status tokens.
  final RefractionStatusType type;

  /// Custom hue that overrides [type]'s token (for host-defined statuses).
  final Color? color;

  /// Visual treatment.
  final RefractionStatusPillVariant variant;

  /// Height and type scale.
  final RefractionStatusPillSize size;

  /// Stretch to the available width with a centred label — the table-cell
  /// treatment. When false the pill hugs its label.
  final bool expand;

  /// Optional leading icon, drawn in the label's ink.
  final IconData? icon;

  /// Called when the pill is activated. Null renders a static label.
  final VoidCallback? onPressed;

  /// Whether to draw a trailing chevron hinting that activation opens a
  /// menu. Defaults to true when [onPressed] is set.
  final bool? showChevron;

  /// Accessible name. Defaults to [label]; hosts typically pass
  /// `'Status: $label'` so screen readers say what the chip means.
  final String? semanticLabel;

  /// Creates a [RefractionStatusPill].
  const RefractionStatusPill({
    super.key,
    required this.label,
    this.type = RefractionStatusType.neutral,
    this.color,
    this.variant = RefractionStatusPillVariant.solid,
    this.size = RefractionStatusPillSize.md,
    this.expand = false,
    this.icon,
    this.onPressed,
    this.showChevron,
    this.semanticLabel,
  });

  @override
  State<RefractionStatusPill> createState() => _RefractionStatusPillState();
}

/// Resolved fill/ink pair for a pill, exposed for tests and for hosts that
/// render a matching swatch (e.g. in a status picker menu).
@immutable
class RefractionStatusPillColors {
  /// Background of the pill.
  final Color fill;

  /// Label and icon colour, guaranteed ≥ 4.5:1 on [fill].
  final Color ink;

  /// Leading dot colour for the soft variant (≥ 3:1 on [fill]).
  final Color dot;

  const RefractionStatusPillColors({
    required this.fill,
    required this.ink,
    required this.dot,
  });

  /// Tint strength of the soft variant's fill over the page background.
  static const double softTint = 0.16;

  /// The most HSL lightness a solid fill may lose to carry white ink before
  /// the pill switches to dark ink on the original hue instead.
  static const double maxDeepen = 0.2;

  /// Hover step applied to an interactive pill's fill.
  static const double hoverShift = 0.06;

  /// Resolves the colours a pill with [hue] and [variant] paints on a page
  /// whose background is [background].
  factory RefractionStatusPillColors.resolve({
    required Color hue,
    required Color background,
    required RefractionStatusPillVariant variant,
  }) {
    switch (variant) {
      case RefractionStatusPillVariant.solid:
        // Status boards read best with one ink across every pill, so prefer
        // white on a deepened shade of the hue (red-500 -> ~red-700). Only a
        // hue that would have to go muddy to carry white (yellows, limes)
        // keeps its own fill and takes dark ink instead.
        final deepened = RefractionA11y.ensure(hue, RefractionA11y.lightInk);
        final drop =
            HSLColor.fromColor(hue).lightness -
            HSLColor.fromColor(deepened).lightness;
        if (RefractionA11y.ratio(RefractionA11y.lightInk, deepened) >=
                RefractionA11y.textContrast &&
            drop <= maxDeepen) {
          return RefractionStatusPillColors(
            fill: deepened,
            ink: RefractionA11y.lightInk,
            dot: RefractionA11y.lightInk,
          );
        }
        final fill = RefractionA11y.ensure(hue, RefractionA11y.darkInk);
        return RefractionStatusPillColors(
          fill: fill,
          ink: RefractionA11y.darkInk,
          dot: RefractionA11y.darkInk,
        );
      case RefractionStatusPillVariant.soft:
        final fill = ColorMath.mix(background, hue, softTint);
        return RefractionStatusPillColors(
          fill: fill,
          ink: RefractionA11y.ensure(hue, fill),
          dot: RefractionA11y.ensure(
            hue,
            fill,
            minRatio: RefractionA11y.nonTextContrast,
          ),
        );
    }
  }
}

class _RefractionStatusPillState extends State<RefractionStatusPill> {
  static const Duration _transition = Duration(milliseconds: 220);
  static const double _dotSize = 6;
  static const double _chevronSize = 14;

  bool _hovered = false;
  bool _focused = false;
  bool _pressed = false;

  bool get _interactive => widget.onPressed != null;

  late final Map<Type, Action<Intent>> _actions = {
    ActivateIntent: CallbackAction<ActivateIntent>(
      onInvoke: (_) {
        widget.onPressed?.call();
        return null;
      },
    ),
  };

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final hue = widget.color ?? widget.type.colorIn(colors);
    final resolved = RefractionStatusPillColors.resolve(
      hue: hue,
      background: colors.background,
      variant: widget.variant,
    );
    final sm = widget.size == RefractionStatusPillSize.sm;
    final height = sm ? 22.0 : 28.0;
    final fontSize = sm ? 11.5 : 12.5;
    final hPad = sm ? theme.spacingSm : theme.spacingMd;
    final radius = BorderRadius.circular(theme.radiusPill);
    final duration = RefractionA11y.motion(context, _transition);

    var fill = resolved.fill;
    if (_interactive && (_hovered || _pressed)) {
      fill = _shift(fill, resolved.ink, _pressed ? 2 : 1);
    }

    final labelStyle = theme.textStyle.copyWith(
      fontSize: fontSize,
      height: 1.2,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.1,
      color: resolved.ink,
    );

    final showChevron = widget.showChevron ?? _interactive;
    final content = Row(
      mainAxisSize: widget.expand ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.variant == RefractionStatusPillVariant.soft) ...[
          Container(
            width: _dotSize,
            height: _dotSize,
            decoration: BoxDecoration(
              color: resolved.dot,
              shape: BoxShape.circle,
            ),
          ),
          SizedBox(width: theme.spacingXs + 2),
        ],
        if (widget.icon != null) ...[
          Icon(widget.icon, size: fontSize + 2, color: resolved.ink),
          SizedBox(width: theme.spacingXs),
        ],
        Flexible(
          child: AnimatedSwitcher(
            duration: duration,
            child: Text(
              widget.label,
              key: ValueKey(widget.label),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              softWrap: false,
              style: labelStyle,
            ),
          ),
        ),
        if (showChevron) ...[
          SizedBox(width: theme.spacingXs),
          Icon(
            Icons.expand_more_rounded,
            size: _chevronSize,
            color: resolved.ink,
          ),
        ],
      ],
    );

    Widget pill = AnimatedContainer(
      duration: duration,
      curve: Curves.easeOutCubic,
      height: height,
      padding: EdgeInsets.symmetric(horizontal: hPad),
      decoration: BoxDecoration(color: fill, borderRadius: radius),
      // widthFactor 1 hugs the label; null fills the width (expand).
      child: Align(widthFactor: widget.expand ? null : 1, child: content),
    );

    if (_interactive) {
      pill = FocusableActionDetector(
        actions: _actions,
        mouseCursor: SystemMouseCursors.click,
        onShowHoverHighlight: (v) => setState(() => _hovered = v),
        onShowFocusHighlight: (v) => setState(() => _focused = v),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: (_) => setState(() => _pressed = true),
          onTapCancel: () => setState(() => _pressed = false),
          onTapUp: (_) => setState(() => _pressed = false),
          onTap: widget.onPressed,
          child: RefractionFocusOutline(
            visible: _focused,
            color: RefractionA11y.focusColor(colors),
            borderRadius: radius,
            child: pill,
          ),
        ),
      );
    }

    return Semantics(
      container: true,
      button: _interactive,
      label: widget.semanticLabel ?? widget.label,
      onTap: widget.onPressed,
      child: ExcludeSemantics(child: pill),
    );
  }

  /// Darkens a light-ink fill / lightens a dark-ink fill by [steps] hover
  /// increments — the direction that keeps the ink legible.
  static Color _shift(Color fill, Color ink, int steps) {
    final amount = RefractionStatusPillColors.hoverShift * steps;
    return ink == RefractionA11y.lightInk
        ? ColorMath.darken(fill, amount)
        : ColorMath.mix(fill, RefractionA11y.lightInk, amount);
  }
}
