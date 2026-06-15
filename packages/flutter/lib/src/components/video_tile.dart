import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

/// Microphone states for a participant in a [RefractionVideoTile].
enum RefractionVideoTileMicState {
  /// Microphone is active and capturing audio.
  on,

  /// Microphone is muted.
  muted,
}

/// A single participant tile for a video meeting grid.
///
/// If [mediaSlot] is provided, it fills the tile. Otherwise, an avatar fallback
/// with initials is centered on a muted background.
///
/// Overlays:
/// - Name chip (bottom-left) with optional mic-muted indicator
/// - Speaking ring (emerald) when [speaking] is true
/// - Pinned ring (primary) when [pinned] is true
/// - Reaction badge (top-right) when [reaction] is provided
class RefractionVideoTile extends StatelessWidget {
  /// Participant display name — shown in the name chip and used for initials.
  final String name;

  /// Current microphone state. Defaults to [RefractionVideoTileMicState.on].
  final RefractionVideoTileMicState micState;

  /// Whether the participant is actively speaking. Adds an emerald ring.
  final bool speaking;

  /// Whether the tile is pinned in the grid. Adds a primary ring.
  final bool pinned;

  /// URL of the participant's avatar image, used in the fallback circle.
  final String? avatarUrl;

  /// Media slot — pass any Widget (e.g., camera preview) to render as the
  /// tile's background media layer. When omitted, an avatar fallback is shown.
  final Widget? mediaSlot;

  /// Optional emoji/reaction badge rendered at the top-right of the tile.
  final Widget? reaction;

  /// Creates a [RefractionVideoTile].
  const RefractionVideoTile({
    super.key,
    required this.name,
    this.micState = RefractionVideoTileMicState.on,
    this.speaking = false,
    this.pinned = false,
    this.avatarUrl,
    this.mediaSlot,
    this.reaction,
  });

  String _getInitials(String name) {
    final words = name.trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
    if (words.isEmpty) return '';
    return words
        .take(2)
        .map((w) => w[0].toUpperCase())
        .join('');
  }

  Widget _buildAvatarFallback(BuildContext context, RefractionThemeData theme) {
    final colors = theme.colors;
    final initials = _getInitials(name);

    Widget avatarCircle;
    if (avatarUrl != null) {
      avatarCircle = Container(
        width: 64,
        height: 64,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: colors.card,
          image: DecorationImage(
            image: NetworkImage(avatarUrl!),
            fit: BoxFit.cover,
          ),
        ),
      );
    } else {
      avatarCircle = Container(
        width: 64,
        height: 64,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: colors.card,
        ),
        alignment: Alignment.center,
        child: Text(
          initials,
          style: TextStyle(
            color: colors.foreground,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
      );
    }

    return Container(
      color: colors.muted,
      alignment: Alignment.center,
      child: avatarCircle,
    );
  }

  Widget _buildNameChip(BuildContext context, RefractionThemeData theme) {
    final colors = theme.colors;
    final isMuted = micState == RefractionVideoTileMicState.muted;

    return Container(
      decoration: BoxDecoration(
        color: colors.background.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(theme.borderRadius / 2),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            name,
            style: TextStyle(
              color: colors.foreground,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          if (isMuted) ...[
            const SizedBox(width: 6),
            Icon(
              Icons.mic_off,
              size: 12,
              color: colors.destructive,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildReactionBadge(BuildContext context, RefractionThemeData theme) {
    final colors = theme.colors;
    if (reaction == null) return const SizedBox.shrink();

    return Container(
      decoration: BoxDecoration(
        color: colors.background.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      child: reaction!,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    Widget tileContent = AspectRatio(
      aspectRatio: 16 / 9,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(theme.borderRadius),
        child: Stack(
          children: [
            // Media layer or Avatar fallback
            Positioned.fill(
              child: mediaSlot ?? _buildAvatarFallback(context, theme.data),
            ),
            // Reaction badge (top-right)
            if (reaction != null)
              Positioned(
                top: 8,
                right: 8,
                child: _buildReactionBadge(context, theme.data),
              ),
            // Name chip (bottom-left)
            Positioned(
              bottom: 8,
              left: 8,
              child: _buildNameChip(context, theme.data),
            ),
          ],
        ),
      ),
    );

    // Speaking/pinned ring overlay
    if (pinned || speaking) {
      final ringColor = pinned ? colors.primary : const Color(0xFF10B981);
      tileContent = Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(theme.borderRadius + 4),
          border: Border.all(color: ringColor, width: 2),
        ),
        padding: const EdgeInsets.all(2),
        child: tileContent,
      );
    }

    return tileContent;
  }
}
