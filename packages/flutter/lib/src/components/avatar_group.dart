import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'avatar.dart';

/// A horizontally overlapping stack of [RefractionAvatar] widgets.
class RefractionAvatarGroup extends StatelessWidget {
  final List<RefractionAvatar> avatars;
  final int max;
  final double size;
  final double overlapSpacing;

  const RefractionAvatarGroup({
    super.key,
    required this.avatars,
    this.max = 3,
    this.size = 40.0,
    this.overlapSpacing = 12.0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;

    final displayAvatars = avatars
        .map((avatar) {
          return RefractionAvatar(
            imageUrl: avatar.imageUrl,
            fallbackText: avatar.fallbackText,
            radius: avatar.radius,
            size: size,
          );
        })
        .take(max)
        .toList();

    final remainingCount = avatars.length - displayAvatars.length;

    return SizedBox(
      height: size,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (int i = 0; i < displayAvatars.length; i++)
            Align(
              widthFactor: i == displayAvatars.length - 1 && remainingCount == 0
                  ? 1.0
                  : (1.0 - overlapSpacing / size),
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
                width: size,
                height: size,
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
                      fontSize: size * 0.35,
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
