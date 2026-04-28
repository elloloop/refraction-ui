import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

/// A circular profile image with a graceful text fallback.
///
/// Renders the network image at [imageUrl]; if the URL is null or the image
/// fails to load, the first one or two characters of [fallbackText] are
/// displayed (uppercased) on a muted background.
///
/// Mirrors the shadcn-ui `Avatar` primitive shipped in the React, Angular, and
/// Astro Refraction UI packages.
///
/// ```dart
/// RefractionAvatar(
///   imageUrl: 'https://example.com/jane.png',
///   fallbackText: 'Jane Doe',
///   size: 48,
/// )
/// ```
///
/// To stack several avatars together, use [RefractionAvatarGroup].
class RefractionAvatar extends StatelessWidget {
  /// Network URL of the avatar image. If null or unloadable, the
  /// initials fallback is shown.
  final String? imageUrl;

  /// Text used to derive the fallback initials.
  ///
  /// The first one or two characters are taken and uppercased. Pass a full
  /// name (e.g. `"Jane Doe"`) and the avatar will display `"JA"`.
  final String fallbackText;

  /// Corner radius applied to the container, in logical pixels.
  ///
  /// Defaults to `999.0`, producing a circle. Lower values produce a
  /// rounded square.
  final double radius;

  /// Width and height of the avatar in logical pixels. Defaults to `40.0`.
  final double size;

  /// Creates a [RefractionAvatar].
  ///
  /// [fallbackText] is required because it is used both as the visible
  /// fallback and (typically) for accessibility.
  const RefractionAvatar({
    super.key,
    this.imageUrl,
    required this.fallbackText,
    this.radius = 999.0,
    this.size = 40.0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: theme.colors.muted,
        borderRadius: BorderRadius.circular(radius),
      ),
      clipBehavior: Clip.antiAlias,
      child: imageUrl != null
          ? Image.network(
              imageUrl!,
              width: size,
              height: size,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => _buildFallback(theme),
            )
          : _buildFallback(theme),
    );
  }

  Widget _buildFallback(RefractionThemeData theme) {
    return Center(
      child: Text(
        fallbackText.isNotEmpty ? fallbackText.substring(0, fallbackText.length > 2 ? 2 : fallbackText.length).toUpperCase() : '?',
        style: theme.textStyle.copyWith(
          color: theme.colors.mutedForeground,
          fontWeight: FontWeight.w600,
          fontSize: size * 0.4,
        ),
      ),
    );
  }
}

/// A horizontally overlapping stack of [RefractionAvatar] widgets.
///
/// Useful for showing collaborators or participants. Renders up to [max]
/// avatars; any beyond that are summarised as a `+N` indicator at the end.
///
/// ```dart
/// RefractionAvatarGroup(
///   max: 3,
///   avatars: [
///     RefractionAvatar(fallbackText: 'AB'),
///     RefractionAvatar(fallbackText: 'CD'),
///     RefractionAvatar(fallbackText: 'EF'),
///     RefractionAvatar(fallbackText: 'GH'),
///   ],
/// )
/// ```
class RefractionAvatarGroup extends StatelessWidget {
  /// The avatars to display, in left-to-right stacking order.
  final List<RefractionAvatar> avatars;

  /// Maximum number of avatars rendered before the `+N` indicator appears.
  /// Defaults to `3`.
  final int max;

  /// Horizontal overlap between adjacent avatars in logical pixels.
  ///
  /// Larger values produce tighter overlap. Defaults to `12.0`.
  final double overlapSpacing;

  /// Creates a [RefractionAvatarGroup].
  const RefractionAvatarGroup({
    super.key,
    required this.avatars,
    this.max = 3,
    this.overlapSpacing = 12.0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    
    final displayAvatars = avatars.take(max).toList();
    final remainingCount = avatars.length - displayAvatars.length;

    return SizedBox(
      height: displayAvatars.isNotEmpty ? displayAvatars.first.size : 40,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (int i = 0; i < displayAvatars.length; i++)
            Align(
              widthFactor: i == displayAvatars.length - 1 && remainingCount == 0 ? 1.0 : (1.0 - overlapSpacing / displayAvatars[i].size),
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: theme.colors.background, width: 2),
                ),
                child: displayAvatars[i],
              ),
            ),
          if (remainingCount > 0)
            Align(
              widthFactor: 1.0,
              child: Container(
                width: displayAvatars.first.size,
                height: displayAvatars.first.size,
                decoration: BoxDecoration(
                  color: theme.colors.muted,
                  shape: BoxShape.circle,
                  border: Border.all(color: theme.colors.background, width: 2),
                ),
                child: Center(
                  child: Text(
                    '+$remainingCount',
                    style: theme.textStyle.copyWith(
                      color: theme.colors.mutedForeground,
                      fontWeight: FontWeight.w600,
                      fontSize: displayAvatars.first.size * 0.35,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
