import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../dev_tools/gallery_page.dart';

const _people = [
  'Jane Doe',
  'Arjun Mehta',
  'Mary Jane Watson',
  'Li Wei',
  'Olu Adeyemi',
  'Sofia García',
  'Émile Zola',
  'kai',
];

class AvatarPage extends StatelessWidget {
  const AvatarPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final gap = theme.spacingLg;

    return GalleryPage(
      title: 'Avatar',
      description:
          'Initials from the first and last name on a tint picked from the '
          'name, the same on every device; an optional presence dot; and '
          'overlapping groups.',
      sections: [
        GallerySection(
          title: 'Initials and tint',
          caption: 'Every tint keeps its initials at AA contrast.',
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            children: [
              for (final name in _people)
                _Captioned(
                  caption: name,
                  child: RefractionAvatar(fallbackText: name),
                ),
            ],
          ),
        ),
        GallerySection(
          title: 'Presence',
          caption:
              'Filled for online and busy, hollow for away and offline, a '
              'bar for do-not-disturb — never color alone.',
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            children: [
              for (final status in RefractionPresenceStatus.values)
                _Captioned(
                  caption: RefractionPresenceIndicator.defaultLabels[status]!,
                  child: RefractionAvatar(
                    fallbackText: _people[status.index],
                    presence: status,
                    ringColor: colors.card,
                  ),
                ),
            ],
          ),
        ),
        GallerySection(
          title: 'Sizes',
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            crossAxisAlignment: WrapCrossAlignment.end,
            children: [
              for (final size in const [24.0, 32.0, 40.0, 56.0, 72.0])
                RefractionAvatar(
                  fallbackText: 'Arjun Mehta',
                  size: size,
                  presence: RefractionPresenceStatus.online,
                  ringColor: colors.card,
                ),
              RefractionAvatar(
                fallbackText: 'Design Team',
                size: 40,
                radius: theme.radiusMd,
              ),
            ],
          ),
        ),
        GallerySection(
          title: 'Image',
          caption: 'Initials show while loading and if the image fails.',
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            children: const [
              _Captioned(
                caption: 'Loaded',
                child: RefractionAvatar(
                  imageUrl: 'https://i.pravatar.cc/150?img=5',
                  fallbackText: 'Jane Doe',
                ),
              ),
              _Captioned(
                caption: 'Broken URL',
                child: RefractionAvatar(
                  imageUrl: 'https://invalid.example/avatar.png',
                  fallbackText: 'Li Wei',
                ),
              ),
            ],
          ),
        ),
        GallerySection(
          title: 'Group',
          caption: 'Announced as one element: "Jane Doe, Arjun Mehta, …".',
          child: Wrap(
            spacing: theme.spacingXl,
            runSpacing: gap,
            children: [
              RefractionAvatarGroup(
                ringColor: colors.card,
                avatars: [
                  for (final name in _people)
                    RefractionAvatar(fallbackText: name),
                ],
              ),
              RefractionAvatarGroup(
                size: 28,
                overlapSpacing: 8,
                max: 4,
                ringColor: colors.card,
                avatars: [
                  for (final name in _people.take(3))
                    RefractionAvatar(fallbackText: name),
                ],
              ),
            ],
          ),
        ),
        GallerySection(
          title: 'Presence indicator on its own',
          child: Wrap(
            spacing: gap,
            runSpacing: gap,
            children: [
              for (final status in RefractionPresenceStatus.values)
                RefractionPresenceIndicator(status: status, showLabel: true),
            ],
          ),
        ),
      ],
    );
  }
}

class _Captioned extends StatelessWidget {
  final String caption;
  final Widget child;

  const _Captioned({required this.caption, required this.child});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    return SizedBox(
      width: 72,
      child: Column(
        children: [
          child,
          SizedBox(height: theme.spacingXs),
          Text(
            caption,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: theme.textStyle.copyWith(
              fontSize: 11,
              color: theme.colors.mutedForeground,
            ),
          ),
        ],
      ),
    );
  }
}
