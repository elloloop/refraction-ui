import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A bordered surface that groups related content.
///
/// A [RefractionCard] is a passive container: pair it with the dedicated
/// section widgets — [RefractionCardHeader], [RefractionCardTitle],
/// [RefractionCardDescription], [RefractionCardContent], and
/// [RefractionCardFooter] — to compose a fully-styled card.
///
/// Mirrors the shadcn-ui `Card` family shipped in the React, Angular, and
/// Astro Refraction UI packages.
///
/// ```dart
/// RefractionCard(
///   child: Column(
///     crossAxisAlignment: CrossAxisAlignment.start,
///     children: [
///       RefractionCardHeader(
///         child: Column(
///           crossAxisAlignment: CrossAxisAlignment.start,
///           children: const [
///             RefractionCardTitle('Account'),
///             SizedBox(height: 4),
///             RefractionCardDescription('Manage your account settings.'),
///           ],
///         ),
///       ),
///       RefractionCardContent(child: Text('Content goes here.')),
///       RefractionCardFooter(child: RefractionButton(
///         onPressed: () {}, child: const Text('Save'),
///       )),
///     ],
///   ),
/// )
/// ```
class RefractionCard extends StatelessWidget {
  /// The content of the card.
  final Widget child;

  /// Inner padding. Defaults to no padding so callers can compose with
  /// section widgets that own their own padding.
  final EdgeInsetsGeometry? padding;

  /// Optional explicit width. Null means hug content.
  final double? width;

  /// Optional explicit height. Null means hug content.
  final double? height;

  /// Creates a [RefractionCard] containing [child].
  const RefractionCard({
    super.key,
    required this.child,
    this.padding,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    return Container(
      width: width,
      height: height,
      padding: padding,
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: colors.border),
        boxShadow: theme.softShadow,
      ),
      child: DefaultTextStyle(style: theme.textStyle, child: child),
    );
  }
}

/// The padded top region of a [RefractionCard].
///
/// Typically wraps a [RefractionCardTitle] and an optional
/// [RefractionCardDescription].
class RefractionCardHeader extends StatelessWidget {
  /// Header content, usually a [Column] of [RefractionCardTitle] and
  /// [RefractionCardDescription].
  final Widget child;

  /// Padding around the header. Defaults to 24 logical pixels on every side.
  final EdgeInsetsGeometry padding;

  /// Creates a [RefractionCardHeader].
  const RefractionCardHeader({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(24),
  });

  @override
  Widget build(BuildContext context) {
    return Padding(padding: padding, child: child);
  }
}

/// A heading-styled title typically placed inside a [RefractionCardHeader].
class RefractionCardTitle extends StatelessWidget {
  /// The title text.
  final String text;

  /// Style overrides merged on top of the default title style.
  final TextStyle? style;

  /// Creates a [RefractionCardTitle].
  const RefractionCardTitle(this.text, {super.key, this.style});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    return Text(
      text,
      style: theme.textStyle
          .copyWith(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.5,
            color: theme.colors.foreground,
          )
          .merge(style),
    );
  }
}

/// Subtitle-style supporting text, typically placed under a
/// [RefractionCardTitle].
class RefractionCardDescription extends StatelessWidget {
  /// The description text.
  final String text;

  /// Style overrides merged on top of the default description style.
  final TextStyle? style;

  /// Creates a [RefractionCardDescription].
  const RefractionCardDescription(this.text, {super.key, this.style});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    return Text(
      text,
      style: theme.textStyle
          .copyWith(
            fontSize: 14,
            color: theme.colors.mutedForeground,
            height: 1.5,
          )
          .merge(style),
    );
  }
}

/// The main content slot of a [RefractionCard], placed below the header.
class RefractionCardContent extends StatelessWidget {
  /// The body content of the card.
  final Widget child;

  /// Padding around the body. Defaults to 24 pixels on the left, right, and
  /// bottom — leaving the top tight against [RefractionCardHeader].
  final EdgeInsetsGeometry padding;

  /// Creates a [RefractionCardContent].
  const RefractionCardContent({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.only(left: 24, right: 24, bottom: 24),
  });

  @override
  Widget build(BuildContext context) {
    return Padding(padding: padding, child: child);
  }
}

/// Bottom region of a [RefractionCard], typically holding action buttons.
///
/// Wraps [child] in a [Row] so action buttons lay out horizontally; use
/// [mainAxisAlignment] to align them.
class RefractionCardFooter extends StatelessWidget {
  /// Footer content, typically a [RefractionButton] or a small group of them.
  final Widget child;

  /// Padding around the footer. Defaults to 24 pixels on the left, right,
  /// and bottom.
  final EdgeInsetsGeometry padding;

  /// Horizontal alignment of the footer row. Defaults to
  /// [MainAxisAlignment.start].
  final MainAxisAlignment mainAxisAlignment;

  /// Creates a [RefractionCardFooter].
  const RefractionCardFooter({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.only(left: 24, right: 24, bottom: 24),
    this.mainAxisAlignment = MainAxisAlignment.start,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      // Wrap footer content in a Row as it's typically action buttons laid out horizontally
      child: Row(mainAxisAlignment: mainAxisAlignment, children: [child]),
    );
  }
}
