import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Horizontal alignment of the [RefractionSectionHead] cluster.
enum RefractionSectionHeadAlign {
  /// Center aligned with auto margins and constrained max width.
  center,

  /// Flush left, no margin constraint.
  left,
}

/// RefractionSectionHead — marketing section heading cluster.
///
/// Renders an optional small-caps kicker above a title with an optional
/// lede paragraph below. Alignment is controlled via the [align] parameter.
///
/// Mirrors the react-section-head / astro-section-head equivalents.
class RefractionSectionHead extends StatelessWidget {
  /// Optional eyebrow / kicker rendered above the title.
  final Widget? kicker;

  /// Primary heading content.
  final Widget title;

  /// Optional lede paragraph rendered below the title.
  final Widget? lede;

  /// Horizontal alignment of the cluster. Defaults to [RefractionSectionHeadAlign.center].
  final RefractionSectionHeadAlign align;

  /// Creates a [RefractionSectionHead].
  const RefractionSectionHead({
    super.key,
    this.kicker,
    required this.title,
    this.lede,
    this.align = RefractionSectionHeadAlign.center,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    final isCenter = align == RefractionSectionHeadAlign.center;
    final crossAlign = isCenter ? CrossAxisAlignment.center : CrossAxisAlignment.start;
    final textAlign = isCenter ? TextAlign.center : TextAlign.left;

    Widget? kickerWidget;
    if (kicker != null) {
      kickerWidget = DefaultTextStyle(
        style: theme.textStyle.copyWith(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.5,
          color: colors.primary,
        ),
        textAlign: textAlign,
        child: kicker!,
      );
    }

    final titleWidget = DefaultTextStyle(
      style: theme.textStyle.copyWith(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.5,
        color: colors.foreground,
      ),
      textAlign: textAlign,
      child: title,
    );

    Widget? ledeWidget;
    if (lede != null) {
      ledeWidget = Padding(
        padding: const EdgeInsets.only(top: 12),
        child: DefaultTextStyle(
          style: theme.textStyle.copyWith(
            fontSize: 16,
            color: colors.mutedForeground,
            height: 1.5,
          ),
          textAlign: textAlign,
          child: lede!,
        ),
      );
    }

    Widget content = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: crossAlign,
      children: [
        if (kickerWidget != null) ...[
          kickerWidget,
          const SizedBox(height: 8),
        ],
        titleWidget,
        if (ledeWidget != null) ledeWidget,
      ],
    );

    if (isCenter) {
      content = Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 672),
          child: content,
        ),
      );
    }

    return content;
  }
}
