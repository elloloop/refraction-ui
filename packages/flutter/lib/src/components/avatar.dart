import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

/// A circular profile image with a graceful text fallback.
///
/// Renders the network image at [imageUrl]; if the URL is null or the image
/// fails to load, the first one or two characters of [fallbackText] are
/// displayed (uppercased) on a muted background.
///
/// Mirrors the shadcn-ui `Avatar` primitive shipped in the React and
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
              errorBuilder: (context, error, stackTrace) =>
                  _buildFallback(theme),
            )
          : _buildFallback(theme),
    );
  }

  Widget _buildFallback(RefractionThemeData theme) {
    return Center(
      child: Text(
        fallbackText.isNotEmpty
            ? fallbackText
                  .substring(
                    0,
                    fallbackText.length > 2 ? 2 : fallbackText.length,
                  )
                  .toUpperCase()
            : '?',
        style: theme.textStyle.copyWith(
          color: theme.colors.mutedForeground,
          fontWeight: FontWeight.w600,
          fontSize: size * 0.4,
        ),
      ),
    );
  }
}
