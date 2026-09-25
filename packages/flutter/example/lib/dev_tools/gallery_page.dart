import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

/// A docs page made of titled sections that works in both hosts: inside the
/// docs layout (which already scrolls, so height is unbounded) and on its
/// own under `#/preview/<slug>` (bounded by the window, so it scrolls
/// itself). Keeps every section usable from 390 px phones up.
class GalleryPage extends StatelessWidget {
  final String title;
  final String? description;
  final List<GallerySection> sections;

  const GalleryPage({
    super.key,
    required this.title,
    this.description,
    required this.sections,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final children = <Widget>[
      Text(
        title,
        style: theme.textStyle.copyWith(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: colors.foreground,
        ),
      ),
      if (description != null) ...[
        SizedBox(height: theme.spacingSm),
        Text(
          description!,
          style: theme.textStyle.copyWith(
            fontSize: 15,
            color: colors.mutedForeground,
          ),
        ),
      ],
      for (final section in sections) ...[
        SizedBox(height: theme.spacingXl),
        section,
      ],
    ];
    return LayoutBuilder(
      builder: (context, constraints) {
        if (!constraints.hasBoundedHeight) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: children,
          );
        }
        final gutter = constraints.maxWidth < 600
            ? theme.gutter
            : theme.spacingXl;
        return ListView(
          padding: EdgeInsets.symmetric(
            horizontal: gutter,
            vertical: theme.spacingXl,
          ),
          children: children,
        );
      },
    );
  }
}

/// One titled block of a [GalleryPage], drawn on a card.
class GallerySection extends StatelessWidget {
  final String title;
  final String? caption;
  final Widget child;

  const GallerySection({
    super.key,
    required this.title,
    this.caption,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textStyle.copyWith(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: colors.foreground,
          ),
        ),
        if (caption != null) ...[
          SizedBox(height: theme.spacingXs),
          Text(
            caption!,
            style: theme.textStyle.copyWith(
              fontSize: 13,
              color: colors.mutedForeground,
            ),
          ),
        ],
        SizedBox(height: theme.spacingMd),
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(theme.spacingLg),
          decoration: BoxDecoration(
            color: colors.card,
            border: Border.all(color: colors.border),
            borderRadius: BorderRadius.circular(theme.radiusLg),
          ),
          child: child,
        ),
      ],
    );
  }
}
