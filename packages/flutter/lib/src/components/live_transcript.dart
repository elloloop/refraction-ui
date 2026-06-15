import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A single transcript entry from a speaker.
class RefractionTranscriptEntry {
  /// Unique identifier for this entry.
  final String id;

  /// Display name of the speaker.
  final String speaker;

  /// The spoken text.
  final String text;

  /// Optional formatted timestamp string (e.g. "0:42").
  final String? timestamp;

  /// Optional text color for the speaker's name.
  final Color? speakerColor;

  /// Creates a [RefractionTranscriptEntry].
  const RefractionTranscriptEntry({
    required this.id,
    required this.speaker,
    required this.text,
    this.timestamp,
    this.speakerColor,
  });
}

class _TranscriptBlock {
  final String speaker;
  final String? timestamp;
  final Color? speakerColor;
  final List<String> texts;

  _TranscriptBlock({
    required this.speaker,
    this.timestamp,
    this.speakerColor,
    required this.texts,
  });
}

/// A speaker-attributed transcript panel for audio rooms and meetings.
///
/// Consecutive entries from the same speaker are merged into a single block
/// (one speaker header followed by all their text lines) so the panel stays
/// readable.
class RefractionLiveTranscript extends StatelessWidget {
  /// The ordered list of transcript entries to display.
  final List<RefractionTranscriptEntry> entries;

  /// Tightens spacing between speaker blocks and text lines. Defaults to false.
  final bool compact;

  /// Creates a [RefractionLiveTranscript] view.
  const RefractionLiveTranscript({
    super.key,
    required this.entries,
    this.compact = false,
  });

  List<_TranscriptBlock> _groupConsecutiveBySpeaker(List<RefractionTranscriptEntry> entries) {
    final blocks = <_TranscriptBlock>[];
    for (final entry in entries) {
      if (blocks.isNotEmpty && blocks.last.speaker == entry.speaker) {
        blocks.last.texts.add(entry.text);
      } else {
        blocks.add(_TranscriptBlock(
          speaker: entry.speaker,
          timestamp: entry.timestamp,
          speakerColor: entry.speakerColor,
          texts: [entry.text],
        ));
      }
    }
    return blocks;
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final blocks = _groupConsecutiveBySpeaker(entries);
    final padding = compact
        ? const EdgeInsets.all(12.0)
        : const EdgeInsets.all(16.0);
    final blockGap = compact ? 8.0 : 16.0;

    return Semantics(
      container: true,
      liveRegion: true,
      label: 'Live transcript',
      child: ListView.separated(
        padding: padding,
        itemCount: blocks.length,
        separatorBuilder: (context, index) => SizedBox(height: blockGap),
        itemBuilder: (context, index) {
          final block = blocks[index];
          final textGap = compact ? 2.0 : 4.0;
          return Column(
            key: ValueKey('${block.speaker}_$index'),
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Speaker row
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    block.speaker,
                    style: TextStyle(
                      fontSize: 14.0,
                      fontWeight: FontWeight.w600,
                      color: block.speakerColor ?? colors.foreground,
                      height: 1.25, // leading-snug
                    ),
                  ),
                  if (block.timestamp != null) ...[
                    const SizedBox(width: 8),
                    Text(
                      block.timestamp!,
                      style: TextStyle(
                        fontSize: 12.0,
                        color: colors.mutedForeground,
                        fontFeatures: const [FontFeature.tabularFigures()],
                      ),
                    ),
                  ],
                ],
              ),
              SizedBox(height: textGap),
              // Text lines
              for (final text in block.texts)
                Padding(
                  padding: const EdgeInsets.only(top: 2.0),
                  child: Text(
                    text,
                    style: TextStyle(
                      fontSize: 14.0,
                      color: colors.foreground.withValues(alpha: 0.8),
                      height: 1.625, // leading-relaxed
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
