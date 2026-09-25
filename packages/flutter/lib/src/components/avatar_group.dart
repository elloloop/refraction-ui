import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'avatar.dart';

/// A horizontally overlapping stack of [RefractionAvatar] widgets, with a
/// `+N` chip for the ones that do not fit — the "who is in this group"
/// facepile.
///
/// Each avatar keeps its own image, tint and presence; the group only sizes
/// them uniformly and rings them in [ringColor] so the overlaps read
/// cleanly. The whole stack is one element to a screen reader, announced as
/// [semanticLabel] or, by default, the names ("Ana, Ben and 3 others").
///
/// ```dart
/// RefractionAvatarGroup(
///   max: 3,
///   avatars: [
///     for (final m in members)
///       RefractionAvatar(fallbackText: m.name, imageUrl: m.photo),
///   ],
/// )
/// ```
class RefractionAvatarGroup extends StatelessWidget {
  /// The avatars, in display order.
  final List<RefractionAvatar> avatars;

  /// How many avatars are drawn before the rest collapse into `+N`.
  final int max;

  /// The size every avatar is drawn at.
  final double size;

  /// How far each avatar slides under the next, in logical pixels.
  final double overlapSpacing;

  /// The ring around each avatar — the surface the group sits on. Defaults
  /// to [RefractionColors.background].
  final Color? ringColor;

  /// What a screen reader announces for the whole group. Defaults to
  /// [describe] over the avatars' names.
  final String? semanticLabel;

  const RefractionAvatarGroup({
    super.key,
    required this.avatars,
    this.max = 3,
    this.size = 40.0,
    this.overlapSpacing = 12.0,
    this.ringColor,
    this.semanticLabel,
  }) : assert(max > 0, 'max must be positive');

  /// Width of the ring separating overlapping avatars.
  static const double _ringWidth = 2.0;

  /// The overflow chip's `+N` takes this fraction of [size].
  static const double _overflowTextScale = 0.35;

  /// A default spoken summary: `"Ana"`, `"Ana and Ben"`, `"Ana, Ben and
  /// Cy"`, or `"Ana, Ben and 3 others"` once there are more than [shown].
  static String describe(List<String> names, {int shown = 3}) {
    if (names.isEmpty) return '';
    if (names.length == 1) return names.single;
    if (names.length <= shown) {
      final head = names.sublist(0, names.length - 1).join(', ');
      return '$head and ${names.last}';
    }
    final rest = names.length - shown;
    final head = names.sublist(0, shown).join(', ');
    return '$head and $rest ${rest == 1 ? 'other' : 'others'}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final ring = ringColor ?? theme.colors.background;

    final displayAvatars = avatars
        .take(max)
        .map((avatar) => avatar.resized(size))
        .toList();
    final remainingCount = avatars.length - displayAvatars.length;
    final overlapFactor = 1.0 - overlapSpacing / (size + 2 * _ringWidth);

    Widget ringed(Widget child) => Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: ring, width: _ringWidth),
      ),
      child: child,
    );

    return Semantics(
      container: true,
      label:
          semanticLabel ??
          describe([for (final a in avatars) a.fallbackText], shown: max),
      excludeSemantics: true,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (int i = 0; i < displayAvatars.length; i++)
            Align(
              widthFactor: i == displayAvatars.length - 1 && remainingCount == 0
                  ? 1.0
                  : overlapFactor,
              child: ringed(displayAvatars[i]),
            ),
          if (remainingCount > 0)
            ringed(
              Container(
                width: size,
                height: size,
                decoration: BoxDecoration(
                  color: theme.colors.muted,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    '+$remainingCount',
                    maxLines: 1,
                    softWrap: false,
                    textScaler: TextScaler.noScaling,
                    style: theme.textStyle.copyWith(
                      color: theme.colors.foreground,
                      fontWeight: FontWeight.w600,
                      fontSize: size * _overflowTextScale,
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
