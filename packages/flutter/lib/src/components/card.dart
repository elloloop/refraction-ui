import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class RefractionCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double? width;
  final double? height;

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

class RefractionCardHeader extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;

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

class RefractionCardTitle extends StatelessWidget {
  final String text;
  final TextStyle? style;

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

class RefractionCardDescription extends StatelessWidget {
  final String text;
  final TextStyle? style;

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

class RefractionCardContent extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;

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

class RefractionCardFooter extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final MainAxisAlignment mainAxisAlignment;

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
