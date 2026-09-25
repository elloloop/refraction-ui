import 'package:flutter/material.dart';
import '../theme/hsl_color.dart';
import '../theme/refraction_colors.dart';
import '../theme/refraction_theme.dart';

/// Visual style for a [RefractionBadge].
enum RefractionBadgeVariant {
  /// High-emphasis badge using [RefractionColors.primary]. Use to highlight
  /// an active or featured state.
  primary,

  /// Lower-emphasis badge using [RefractionColors.secondary]. Use for
  /// neutral metadata such as tags.
  secondary,

  /// Indicates an error or destructive state, using
  /// [RefractionColors.destructive]. Also the default for
  /// [RefractionBadge.count] and [RefractionBadge.dot] — the conventional
  /// "something is waiting for you" hue.
  destructive,

  /// Transparent badge with a border, using [RefractionColors.foreground]
  /// for text and [RefractionColors.border] for the outline. Use when the
  /// surrounding surface is already colored.
  outline,
}

/// Size of a [RefractionBadge.count] or [RefractionBadge.dot].
enum RefractionBadgeSize {
  /// 16 px count pill / 6 px dot — for dense rows and icon corners.
  sm,

  /// 18 px count pill / 8 px dot (default).
  md,
}

enum _BadgeKind { label, count, dot }

/// A small pill-shaped label used to highlight status, count, or category.
///
/// Three shapes share one set of [RefractionBadgeVariant] colors:
///
/// * the default constructor wraps an arbitrary [child] (typically a short
///   [Text]) — a tag or status label;
/// * [RefractionBadge.count] shows a number, capped at `max` as `"99+"`,
///   and renders nothing at zero — an unread or pending count;
/// * [RefractionBadge.dot] is a bare dot — "something new" without a
///   number.
///
/// ```dart
/// RefractionBadge(
///   variant: RefractionBadgeVariant.secondary,
///   child: Text('New'),
/// )
///
/// RefractionBadge.count(count: unread, semanticLabel: '$unread unread')
///
/// RefractionBadge.dot(semanticLabel: 'New activity')
/// ```
///
/// Count and dot badges keep their text at WCAG AA contrast: when a
/// variant's token pair falls short (a bright red with white numerals), the
/// fill is darkened in lightness only, so it still reads as that token.
///
/// Mirrors the shadcn-ui `Badge` primitive shipped in the React and Astro
/// Refraction UI packages.
class RefractionBadge extends StatelessWidget {
  /// The widget displayed inside a label badge — typically a short [Text].
  ///
  /// Null for [RefractionBadge.count] and [RefractionBadge.dot].
  final Widget? child;

  /// Color treatment applied to the badge.
  ///
  /// Defaults to [RefractionBadgeVariant.primary] for label badges and
  /// [RefractionBadgeVariant.destructive] for count and dot badges.
  final RefractionBadgeVariant variant;

  /// The number shown by [RefractionBadge.count].
  final int? count;

  /// Counts above this read as `"$max+"` (see [formatCount]).
  final int max;

  /// Whether [RefractionBadge.count] still renders when [count] is zero.
  final bool showZero;

  /// Size of a count or dot badge. Ignored by label badges.
  final RefractionBadgeSize size;

  /// Optional ring drawn around a count or dot badge in this color —
  /// normally the surface it sits on — so it separates cleanly from an
  /// icon or avatar it overlaps.
  final Color? ringColor;

  /// What a screen reader announces instead of the visible content.
  ///
  /// For a count badge this defaults to the formatted count; give it
  /// context ("3 unread messages") when the badge stands alone. A dot badge
  /// with no label is treated as decorative and hidden from assistive
  /// technology — its parent should say what it means.
  final String? semanticLabel;

  final _BadgeKind _kind;

  /// Creates a label badge containing [child].
  const RefractionBadge({
    super.key,
    required Widget this.child,
    this.variant = RefractionBadgeVariant.primary,
    this.semanticLabel,
  }) : _kind = _BadgeKind.label,
       count = null,
       max = defaultMax,
       showZero = false,
       size = RefractionBadgeSize.md,
       ringColor = null;

  /// Creates a numeric badge showing [count], capped at [max] (`"99+"`).
  ///
  /// Renders nothing when [count] is zero or negative unless [showZero].
  const RefractionBadge.count({
    super.key,
    required int this.count,
    this.max = defaultMax,
    this.showZero = false,
    this.variant = RefractionBadgeVariant.destructive,
    this.size = RefractionBadgeSize.md,
    this.ringColor,
    this.semanticLabel,
  }) : assert(max > 0, 'max must be positive'),
       _kind = _BadgeKind.count,
       child = null;

  /// Creates a dot badge — a numberless "something new" marker.
  const RefractionBadge.dot({
    super.key,
    this.variant = RefractionBadgeVariant.destructive,
    this.size = RefractionBadgeSize.md,
    this.ringColor,
    this.semanticLabel,
  }) : _kind = _BadgeKind.dot,
       child = null,
       count = null,
       max = defaultMax,
       showZero = false;

  /// The default cap for [RefractionBadge.count]: counts above it read
  /// `"99+"`.
  static const int defaultMax = 99;

  static const double _labelRadius = 16;
  static const EdgeInsets _labelPadding = EdgeInsets.symmetric(
    horizontal: 10,
    vertical: 2,
  );
  static const double _labelFontSize = 12;
  static const double _ringWidth = 2;
  static const Map<RefractionBadgeSize, double> _countHeight = {
    RefractionBadgeSize.sm: 16,
    RefractionBadgeSize.md: 18,
  };
  static const Map<RefractionBadgeSize, double> _countFontSize = {
    RefractionBadgeSize.sm: 10,
    RefractionBadgeSize.md: 11,
  };
  static const Map<RefractionBadgeSize, double> _countPadding = {
    RefractionBadgeSize.sm: 4,
    RefractionBadgeSize.md: 5,
  };
  static const Map<RefractionBadgeSize, double> _dotDiameter = {
    RefractionBadgeSize.sm: 6,
    RefractionBadgeSize.md: 8,
  };

  /// The text a count badge shows for [count]: the number itself, or
  /// `"$max+"` once it passes [max]. Exposed so a parent composing its own
  /// semantics label announces exactly what is drawn.
  static String formatCount(int count, {int max = defaultMax}) =>
      count > max ? '$max+' : '$count';

  /// Whether [RefractionBadge.count] would draw anything for [count].
  static bool isCountVisible(int count, {bool showZero = false}) =>
      count > 0 || (showZero && count == 0);

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final (background, foreground, border) = _palette(colors);

    switch (_kind) {
      case _BadgeKind.label:
        return Semantics(
          label: semanticLabel,
          excludeSemantics: semanticLabel != null,
          child: Container(
            padding: _labelPadding,
            decoration: BoxDecoration(
              color: background,
              borderRadius: BorderRadius.circular(_labelRadius),
              border: border != null ? Border.all(color: border) : null,
            ),
            child: DefaultTextStyle(
              style: TextStyle(
                color: foreground,
                fontSize: _labelFontSize,
                fontWeight: FontWeight.w600,
              ),
              child: child!,
            ),
          ),
        );
      case _BadgeKind.count:
        final value = count!;
        if (!isCountVisible(value, showZero: showZero)) {
          return const SizedBox.shrink();
        }
        final text = formatCount(value, max: max);
        final height = _countHeight[size]!;
        final fill = _readableFill(background, foreground, border);
        return Semantics(
          label: semanticLabel ?? text,
          excludeSemantics: true,
          child: _ring(
            radius: height,
            child: Container(
              constraints: BoxConstraints(minWidth: height, minHeight: height),
              padding: EdgeInsets.symmetric(horizontal: _countPadding[size]!),
              decoration: BoxDecoration(
                color: fill,
                borderRadius: BorderRadius.circular(height),
                border: border != null ? Border.all(color: border) : null,
              ),
              // Hug the numerals: a bare `alignment` would let the pill
              // grow to fill loose constraints.
              child: Center(
                widthFactor: 1,
                heightFactor: 1,
                child: Text(
                  text,
                  maxLines: 1,
                  softWrap: false,
                  textScaler: TextScaler.noScaling,
                  style: TextStyle(
                    color: foreground,
                    fontSize: _countFontSize[size],
                    fontWeight: FontWeight.w700,
                    height: 1.0,
                    fontFeatures: const [FontFeature.tabularFigures()],
                  ),
                ),
              ),
            ),
          ),
        );
      case _BadgeKind.dot:
        final diameter = _dotDiameter[size]!;
        final dot = _ring(
          radius: diameter,
          child: Container(
            width: diameter,
            height: diameter,
            decoration: BoxDecoration(
              color: border == null ? background : foreground,
              shape: BoxShape.circle,
            ),
          ),
        );
        if (semanticLabel == null) return ExcludeSemantics(child: dot);
        return Semantics(label: semanticLabel, child: dot);
    }
  }

  /// (fill, text, border) for [variant].
  (Color, Color, Color?) _palette(RefractionColors colors) {
    switch (variant) {
      case RefractionBadgeVariant.secondary:
        return (colors.secondary, colors.secondaryForeground, null);
      case RefractionBadgeVariant.destructive:
        return (colors.destructive, colors.destructiveForeground, null);
      case RefractionBadgeVariant.outline:
        return (Colors.transparent, colors.foreground, colors.border);
      case RefractionBadgeVariant.primary:
        return (colors.primary, colors.primaryForeground, null);
    }
  }

  /// A count badge's numerals are 10–11 px, so they need AA text contrast;
  /// outline badges draw their text on the surrounding surface and are left
  /// alone.
  Color _readableFill(Color background, Color foreground, Color? border) {
    if (border != null) return background;
    return ColorMath.ensureContrast(background, foreground);
  }

  Widget _ring({required double radius, required Widget child}) {
    final ring = ringColor;
    if (ring == null) return child;
    return Container(
      padding: const EdgeInsets.all(_ringWidth),
      decoration: BoxDecoration(
        color: ring,
        borderRadius: BorderRadius.circular(radius + _ringWidth),
      ),
      child: child,
    );
  }
}
