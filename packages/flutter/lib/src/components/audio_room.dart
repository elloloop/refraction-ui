import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Participant model for [RefractionAudioRoom].
class RefractionAudioParticipant {
  /// Unique participant identifier.
  final String id;

  /// Display name shown below the orb.
  final String name;

  /// Optional avatar image URL. Falls back to initials when absent.
  final String? avatarUrl;

  /// Whether this participant is currently speaking.
  final bool speaking;

  /// Whether this participant's microphone is muted.
  final bool muted;

  /// Whether this participant has raised their hand.
  final bool handRaised;

  /// Creates an [RefractionAudioParticipant].
  const RefractionAudioParticipant({
    required this.id,
    required this.name,
    this.avatarUrl,
    this.speaking = false,
    this.muted = false,
    this.handRaised = false,
  });
}

/// A circular avatar for one audio-room participant.
///
/// Features an animated speaking ring, mic-muted badge, and hand-raised badge.
class RefractionSpeakingOrb extends StatelessWidget {
  /// Participant display name; used for initials and accessibility label.
  final String name;

  /// Optional avatar image URL.
  final String? avatarUrl;

  /// Whether this participant is actively speaking.
  final bool speaking;

  /// Whether this participant is muted.
  final bool muted;

  /// Whether this participant has raised their hand.
  final bool handRaised;

  /// Creates a [RefractionSpeakingOrb].
  const RefractionSpeakingOrb({
    super.key,
    required this.name,
    this.avatarUrl,
    this.speaking = false,
    this.muted = false,
    this.handRaised = false,
  });

  String _getInitials(String name) {
    final words = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((w) => RegExp(r'[A-Za-z]').hasMatch(w))
        .toList();
    if (words.isEmpty) return '';
    if (words.length == 1) return words[0][0].toUpperCase();
    return (words.first[0] + words.last[0]).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final initials = _getInitials(name);

    Widget orb = Container(
      width: 80.0,
      height: 80.0,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: colors.muted,
      ),
      alignment: Alignment.center,
      child: avatarUrl != null
          ? ClipOval(
              child: Image.network(
                avatarUrl!,
                width: 80.0,
                height: 80.0,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Text(
                  initials,
                  style: TextStyle(
                    color: colors.mutedForeground,
                    fontSize: 20.0,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            )
          : Text(
              initials,
              style: TextStyle(
                color: colors.mutedForeground,
                fontSize: 20.0,
                fontWeight: FontWeight.w600,
              ),
            ),
    );

    // Apply ring decorations
    if (speaking) {
      orb = Container(
        padding: const EdgeInsets.all(2.0),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: colors.primary, width: 4.0),
          boxShadow: [
            BoxShadow(
              color: colors.primary.withValues(alpha: 0.25),
              spreadRadius: 4.0,
            ),
            BoxShadow(
              color: colors.primary.withValues(alpha: 0.35),
              blurRadius: 16.0,
              spreadRadius: 4.0,
            ),
          ],
        ),
        child: orb,
      );
    } else {
      orb = Container(
        padding: const EdgeInsets.all(2.0),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: colors.border, width: 2.0),
        ),
        child: orb,
      );
    }

    if (muted) {
      orb = Opacity(
        opacity: 0.6,
        child: orb,
      );
    }

    return Semantics(
      label: name,
      image: true,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          orb,
          if (muted)
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                width: 24.0,
                height: 24.0,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: colors.destructive,
                  border: Border.all(color: colors.background, width: 2.0),
                ),
                alignment: Alignment.center,
                child: Icon(
                  Icons.mic_off,
                  size: 12.0,
                  color: colors.destructiveForeground,
                ),
              ),
            ),
          if (handRaised)
            Positioned(
              top: 0,
              right: 0,
              child: Container(
                width: 24.0,
                height: 24.0,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFF59E0B), // warning/amber color
                  border: Border.all(color: colors.background, width: 2.0),
                ),
                alignment: Alignment.center,
                child: const Text(
                  '✋',
                  style: TextStyle(
                    fontSize: 10.0,
                    height: 1.0,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// A responsive grid of [RefractionSpeakingOrb]s for an audio-only meeting.
class RefractionAudioRoom extends StatelessWidget {
  /// List of participants to render as speaking orbs.
  final List<RefractionAudioParticipant> participants;

  /// Creates a [RefractionAudioRoom].
  const RefractionAudioRoom({
    super.key,
    required this.participants,
  });

  int _orbColumns(int count) {
    if (count <= 1) return 1;
    if (count <= 4) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final cols = _orbColumns(participants.length);

    return Semantics(
      container: true,
      label: 'Audio room',
      child: GridView.builder(
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: cols,
          crossAxisSpacing: 24.0,
          mainAxisSpacing: 24.0,
          childAspectRatio: 0.8,
        ),
        padding: const EdgeInsets.all(24.0),
        itemCount: participants.length,
        itemBuilder: (context, index) {
          final p = participants[index];
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RefractionSpeakingOrb(
                name: p.name,
                avatarUrl: p.avatarUrl,
                speaking: p.speaking,
                muted: p.muted,
                handRaised: p.handRaised,
              ),
              const SizedBox(height: 8.0),
              Text(
                p.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 14.0,
                  fontWeight: FontWeight.w500,
                  color: colors.foreground,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
