import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/hsl_color.dart';
import '../theme/refraction_colors.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

/// The semantic meaning of a [RefractionStatusPill]. Each tone resolves to a
/// status token on [RefractionColors], so a palette swap re-skins every pill.
enum RefractionStatusTone {
  /// Not started / no status — [RefractionColors.neutral].
  neutral,

  /// Informational or "in review" — [RefractionColors.info].
  info,

  /// In progress / on track — [RefractionColors.positive].
  positive,

  /// At risk / needs attention — [RefractionColors.caution].
  caution,

  /// Waiting on someone — [RefractionColors.pending].
  pending,

  /// Blocked / failed — [RefractionColors.destructive].
  negative,

  /// Completed — [RefractionColors.done].
  done,

  /// Brand-highlighted status — [RefractionColors.primary].
  primary,
}

/// Fill treatment for a [RefractionStatusPill].
enum RefractionStatusPillVariant {
  /// Saturated status fill with a contrast-checked label (monday-style
  /// board cells).
  solid,

  /// Tinted fill with status-colored text — calmer, for dense lists.
  soft,

  /// Transparent with a status-colored hairline.
  outline,
}

/// Size of a [RefractionStatusPill].
enum RefractionStatusPillSize {
  /// Compact — dense rows and inline metadata.
  sm,

  /// Default — table/board cells.
  md,
}

/// The resolved colors for one pill — exposed so tests and custom renderers
/// agree with the widget on what a tone paints.
@immutable
class RefractionStatusPillColors {
  /// Fill color (transparent for [RefractionStatusPillVariant.outline]).
  final Color background;

  /// Label/icon color, guaranteed to reach WCAG AA (4.5:1) against
  /// [background] (or against the page background for outline pills).
  final Color foreground;

  /// Hairline color; null when the variant has no border.
  final Color? border;

  /// Creates a resolved color set.
  const RefractionStatusPillColors({
    required this.background,
    required this.foreground,
    this.border,
  });

  /// Resolves [tone] + [variant] against [colors].
  ///
  /// [color] overrides the tone's status token (for app-defined statuses);
  /// the label color is still contrast-checked.
  factory RefractionStatusPillColors.resolve(
    RefractionColors colors, {
    required RefractionStatusTone tone,
    required RefractionStatusPillVariant variant,
    Color? color,
  }) {
    final (Color fill, Color onFill) = color != null
        ? (color, colors.foreground)
        : _toneColors(colors, tone);
    final candidates = [colors.foreground, colors.background];
    switch (variant) {
      case RefractionStatusPillVariant.solid:
        return RefractionStatusPillColors(
          background: fill,
          foreground: ColorMath.readableOn(
            fill,
            preferred: onFill,
            candidates: candidates,
          ),
        );
      case RefractionStatusPillVariant.soft:
        final tint = ColorMath.mix(colors.background, fill, _softTintAmount);
        return RefractionStatusPillColors(
          background: tint,
          foreground: ColorMath.readableOn(
            tint,
            preferred: fill,
            candidates: candidates,
          ),
        );
      case RefractionStatusPillVariant.outline:
        return RefractionStatusPillColors(
          background: Colors.transparent,
          foreground: ColorMath.readableOn(
            colors.background,
            preferred: fill,
            candidates: candidates,
          ),
          border: fill,
        );
    }
  }

  /// How strongly the soft variant tints the page background.
  static const double _softTintAmount = 0.16;

  static (Color, Color) _toneColors(
    RefractionColors colors,
    RefractionStatusTone tone,
  ) {
    return switch (tone) {
      RefractionStatusTone.neutral => (
        colors.neutral,
        colors.neutralForeground,
      ),
      RefractionStatusTone.info => (colors.info, colors.primaryForeground),
      RefractionStatusTone.positive => (
        colors.positive,
        colors.positiveForeground,
      ),
      RefractionStatusTone.caution => (
        colors.caution,
        colors.cautionForeground,
      ),
      RefractionStatusTone.pending => (
        colors.pending,
        colors.pendingForeground,
      ),
      RefractionStatusTone.negative => (
        colors.destructive,
        colors.destructiveForeground,
      ),
      RefractionStatusTone.done => (colors.done, colors.positiveForeground),
      RefractionStatusTone.primary => (
        colors.primary,
        colors.primaryForeground,
      ),
    };
  }
}

/// A compact status label — the "Working on it / Stuck / Done" cell of a
/// work-management board, a ticket state, a deploy state.
///
/// Colors come from the status tokens on [RefractionColors] (see
/// [RefractionStatusTone]); the label color is always contrast-checked to
/// WCAG AA against the fill, so a palette whose white "on-status" token is
/// too light for its amber or green still produces a readable pill.
///
/// Pass [onPressed] to make the pill an interactive status picker trigger:
/// it becomes focusable, activates on Enter/Space, shows the theme focus
/// ring, and is announced as a button.
///
/// ```dart
/// RefractionStatusPill(
///   label: 'Working on it',
///   tone: RefractionStatusTone.caution,
///   onPressed: () => openStatusMenu(),
/// )
/// ```
class RefractionStatusPill extends StatefulWidget {
  /// The visible status text.
  final String label;

  /// Semantic tone; resolves to a status token.
  final RefractionStatusTone tone;

  /// Optional fill override for app-defined statuses (the label color is
  /// still contrast-checked). Prefer [tone] so palettes stay in control.
  final Color? color;

  /// Fill treatment. Defaults to [RefractionStatusPillVariant.solid].
  final RefractionStatusPillVariant variant;

  /// Size. Defaults to [RefractionStatusPillSize.md].
  final RefractionStatusPillSize size;

  /// Optional leading glyph (an [Icon] is tinted with the label color).
  final Widget? leading;

  /// Stretch to the available width with a centered label, like a board
  /// cell. Defaults to false (hug the label).
  final bool expand;

  /// Makes the pill interactive (e.g. opens a status menu).
  final VoidCallback? onPressed;

  /// Accessible name. Defaults to `"Status: <label>"`.
  final String? semanticLabel;

  /// Creates a status pill.
  const RefractionStatusPill({
    super.key,
    required this.label,
    this.tone = RefractionStatusTone.neutral,
    this.color,
    this.variant = RefractionStatusPillVariant.solid,
    this.size = RefractionStatusPillSize.md,
    this.leading,
    this.expand = false,
    this.onPressed,
    this.semanticLabel,
  });

  @override
  State<RefractionStatusPill> createState() => _RefractionStatusPillState();
}

class _RefractionStatusPillState extends State<RefractionStatusPill> {
  bool _focused = false;
  bool _hovered = false;

  static const double _focusRingWidth = 2;
  static const double _hoverDarken = 0.05;

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
    final resolved = RefractionStatusPillColors.resolve(
      theme.colors,
      tone: widget.tone,
      variant: widget.variant,
      color: widget.color,
    );
    final pill = _buildPill(theme, resolved);
    final label = widget.semanticLabel ?? 'Status: ${widget.label}';

    if (!_interactive) {
      return Semantics(
        label: label,
        container: true,
        child: ExcludeSemantics(child: pill),
      );
    }

    return Semantics(
      label: label,
      button: true,
      container: true,
      onTap: widget.onPressed,
      child: ExcludeSemantics(
        child: FocusableActionDetector(
          actions: _actions,
          mouseCursor: SystemMouseCursors.click,
          onShowFocusHighlight: (value) => setState(() => _focused = value),
          onShowHoverHighlight: (value) => setState(() => _hovered = value),
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: widget.onPressed,
            child: pill,
          ),
        ),
      ),
    );
  }

  Widget _buildPill(
    RefractionThemeData theme,
    RefractionStatusPillColors resolved,
  ) {
    final isSm = widget.size == RefractionStatusPillSize.sm;
    final typography = theme.resolvedTypography;
    final textStyle = (isSm ? typography.caption : typography.label).copyWith(
      color: resolved.foreground,
      fontWeight: FontWeight.w600,
    );
    final background = _hovered && widget.variant ==
            RefractionStatusPillVariant.solid
        ? ColorMath.darken(resolved.background, _hoverDarken)
        : resolved.background;

    final text = Text(
      widget.label,
      style: textStyle,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      textAlign: TextAlign.center,
    );

    return Container(
      constraints: BoxConstraints(
        minHeight: isSm ? theme.controlHeightSm * 0.75 : theme.controlHeightSm,
      ),
      padding: EdgeInsets.symmetric(
        horizontal: isSm ? theme.spacingSm : theme.spacingMd,
      ),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(theme.radiusPill),
        border: _focused
            ? Border.all(color: theme.colors.ring, width: _focusRingWidth)
            : resolved.border != null
            ? Border.all(color: resolved.border!)
            : null,
      ),
      child: IconTheme.merge(
        data: IconThemeData(
          color: resolved.foreground,
          size: textStyle.fontSize,
        ),
        child: Row(
          mainAxisSize: widget.expand ? MainAxisSize.max : MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (widget.leading != null) ...[
              widget.leading!,
              SizedBox(width: theme.spacingXs),
            ],
            Flexible(child: text),
          ],
        ),
      ),
    );
  }
}
