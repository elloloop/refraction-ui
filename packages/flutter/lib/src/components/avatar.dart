import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

class RefractionAvatar extends StatelessWidget {
  final String? imageUrl;
  final String fallbackText;
  final double radius;
  final double size;

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

class RefractionAvatarGroup extends StatelessWidget {
  final List<RefractionAvatar> avatars;
  final int max;
  final double overlapSpacing;

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
