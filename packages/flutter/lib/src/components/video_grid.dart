import 'package:flutter/material.dart';
import 'video_tile.dart';

/// Layout modes for a [RefractionVideoGrid].
enum RefractionVideoGridLayout {
  /// Choose grid or speaker view based on participant count (<= 1 forces speaker).
  auto,

  /// Always render an even grid of tiles.
  grid,

  /// Render one large spotlight tile + a filmstrip row for the rest.
  speaker,
}

/// Data describing a video meeting participant tile in the grid.
class RefractionVideoTileData {
  /// Unique participant identifier.
  final String id;

  /// Display name shown in the name chip.
  final String name;

  /// Current microphone state. Defaults to [RefractionVideoTileMicState.on].
  final RefractionVideoTileMicState micState;

  /// Whether the participant is currently speaking.
  final bool speaking;

  /// Whether the tile is pinned in the grid.
  final bool pinned;

  /// URL of the participant's avatar image.
  final String? avatarUrl;

  /// Creates participant data for [RefractionVideoGrid].
  const RefractionVideoTileData({
    required this.id,
    required this.name,
    this.micState = RefractionVideoTileMicState.on,
    this.speaking = false,
    this.pinned = false,
    this.avatarUrl,
  });
}

/// A component that layouts video tiles dynamically.
///
/// Supports automatic grid column calculation based on the participant count,
/// or a spotlight speaker view with a horizontal filmstrip.
class RefractionVideoGrid extends StatelessWidget {
  /// List of participant data to render as tiles.
  final List<RefractionVideoTileData> participants;

  /// Grid layout mode. Defaults to [RefractionVideoGridLayout.auto].
  final RefractionVideoGridLayout layout;

  /// Participant `id` to spotlight in speaker view.
  /// Falls back to the first participant when omitted.
  final String? spotlightId;

  /// Creates a [RefractionVideoGrid].
  const RefractionVideoGrid({
    super.key,
    required this.participants,
    this.layout = RefractionVideoGridLayout.auto,
    this.spotlightId,
  });

  int _computeGridColumns(int count) {
    if (count <= 1) return 1;
    if (count <= 4) return 2;
    if (count <= 9) return 3;
    if (count <= 16) return 4;
    if (count <= 25) return 5;
    return 6;
  }

  @override
  Widget build(BuildContext context) {
    final count = participants.length;

    // Resolve effective layout
    final effectiveLayout = layout == RefractionVideoGridLayout.auto
        ? (count <= 1 ? RefractionVideoGridLayout.speaker : RefractionVideoGridLayout.grid)
        : layout;

    if (effectiveLayout == RefractionVideoGridLayout.speaker) {
      if (participants.isEmpty) {
        return const SizedBox.shrink();
      }

      final spotlightParticipant = participants.firstWhere(
        (p) => p.id == spotlightId,
        orElse: () => participants.first,
      );

      final filmstrip = participants.where((p) => p.id != spotlightParticipant.id).toList();

      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Spotlight Area
          Expanded(
            child: RefractionVideoTile(
              key: ValueKey(spotlightParticipant.id),
              name: spotlightParticipant.name,
              micState: spotlightParticipant.micState,
              speaking: spotlightParticipant.speaking,
              pinned: spotlightParticipant.pinned,
              avatarUrl: spotlightParticipant.avatarUrl,
            ),
          ),
          // Filmstrip Area
          if (filmstrip.isNotEmpty) ...[
            const SizedBox(height: 8),
            SizedBox(
              height: 81, // 144 * 9 / 16 aspect ratio height
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: filmstrip.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final p = filmstrip[index];
                  return SizedBox(
                    width: 144,
                    child: RefractionVideoTile(
                      key: ValueKey(p.id),
                      name: p.name,
                      micState: p.micState,
                      speaking: p.speaking,
                      pinned: p.pinned,
                      avatarUrl: p.avatarUrl,
                    ),
                  );
                },
              ),
            ),
          ],
        ],
      );
    }

    // Grid view layout
    final columns = _computeGridColumns(count);

    return GridView.builder(
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: columns,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 16 / 9,
      ),
      itemCount: count,
      itemBuilder: (context, index) {
        final p = participants[index];
        return RefractionVideoTile(
          key: ValueKey(p.id),
          name: p.name,
          micState: p.micState,
          speaking: p.speaking,
          pinned: p.pinned,
          avatarUrl: p.avatarUrl,
        );
      },
    );
  }
}
