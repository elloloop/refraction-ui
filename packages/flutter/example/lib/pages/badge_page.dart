import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../dev_tools/gallery_page.dart';

class BadgePage extends StatelessWidget {
  const BadgePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final gap = theme.spacingLg;

    return GalleryPage(
      title: 'Badge',
      description:
          'Labels, unread counts capped at 99+, and numberless dots. Count '
          'numerals stay at AA contrast on every palette.',
      sections: [
        GallerySection(
          title: 'Label',
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            children: const [
              RefractionBadge(child: Text('Primary')),
              RefractionBadge(
                variant: RefractionBadgeVariant.secondary,
                child: Text('Secondary'),
              ),
              RefractionBadge(
                variant: RefractionBadgeVariant.outline,
                child: Text('Outline'),
              ),
              RefractionBadge(
                variant: RefractionBadgeVariant.destructive,
                child: Text('Destructive'),
              ),
            ],
          ),
        ),
        GallerySection(
          title: 'Count',
          caption: 'Zero renders nothing; anything past max reads "99+".',
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              for (final n in const [0, 1, 7, 42, 99, 100, 1500])
                _Labelled(
                  label: '$n',
                  child: RefractionBadge.count(count: n),
                ),
              const _Labelled(
                label: 'sm',
                child: RefractionBadge.count(
                  count: 12,
                  size: RefractionBadgeSize.sm,
                ),
              ),
              const _Labelled(
                label: 'primary',
                child: RefractionBadge.count(
                  count: 5,
                  variant: RefractionBadgeVariant.primary,
                ),
              ),
              const _Labelled(
                label: 'secondary',
                child: RefractionBadge.count(
                  count: 5,
                  variant: RefractionBadgeVariant.secondary,
                ),
              ),
              const _Labelled(
                label: 'max 9',
                child: RefractionBadge.count(count: 12, max: 9),
              ),
            ],
          ),
        ),
        GallerySection(
          title: 'Dot',
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: const [
              _Labelled(label: 'md', child: RefractionBadge.dot()),
              _Labelled(
                label: 'sm',
                child: RefractionBadge.dot(size: RefractionBadgeSize.sm),
              ),
              _Labelled(
                label: 'primary',
                child: RefractionBadge.dot(
                  variant: RefractionBadgeVariant.primary,
                ),
              ),
            ],
          ),
        ),
        GallerySection(
          title: 'On an icon',
          caption:
              'A ring in the surface color separates the badge from the '
              'glyph it overlaps.',
          child: Wrap(
            spacing: theme.spacingXl,
            runSpacing: gap,
            children: [
              _IconWithBadge(
                icon: Icons.chat_bubble_outline,
                badge: RefractionBadge.count(
                  count: 3,
                  size: RefractionBadgeSize.sm,
                  ringColor: colors.card,
                ),
              ),
              _IconWithBadge(
                icon: Icons.notifications_none,
                badge: RefractionBadge.count(
                  count: 120,
                  size: RefractionBadgeSize.sm,
                  ringColor: colors.card,
                ),
              ),
              _IconWithBadge(
                icon: Icons.checklist,
                badge: RefractionBadge.dot(ringColor: colors.card),
              ),
            ],
          ),
        ),
        GallerySection(
          title: 'In a row',
          caption:
              'The label takes the remaining width and ellipsizes; the count '
              'never overlaps it.',
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 260),
            child: Column(
              children: [
                for (final (label, count) in const [
                  ('General', 4),
                  ('A very long channel name that will not fit', 128),
                  ('Design reviews', 0),
                ])
                  Padding(
                    padding: EdgeInsets.symmetric(vertical: theme.spacingXs),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            label,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textStyle.copyWith(
                              color: colors.foreground,
                              fontSize: 14,
                            ),
                          ),
                        ),
                        SizedBox(width: theme.spacingSm),
                        RefractionBadge.count(count: count),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _Labelled extends StatelessWidget {
  final String label;
  final Widget child;

  const _Labelled({required this.label, required this.child});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(height: 22, child: Center(widthFactor: 1, child: child)),
        SizedBox(height: theme.spacingXs),
        Text(
          label,
          style: theme.textStyle.copyWith(
            fontSize: 11,
            color: theme.colors.mutedForeground,
          ),
        ),
      ],
    );
  }
}

class _IconWithBadge extends StatelessWidget {
  final IconData icon;
  final Widget badge;

  const _IconWithBadge({required this.icon, required this.badge});

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).data.colors;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Icon(icon, size: 28, color: colors.foreground),
        Positioned(left: 16, top: -6, child: badge),
      ],
    );
  }
}
