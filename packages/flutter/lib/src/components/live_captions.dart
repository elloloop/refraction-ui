import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

/// Layout positions for [RefractionLiveCaptions].
enum RefractionLiveCaptionsPosition {
  /// Sits in the normal layout flow.
  staticPosition,

  /// Positions itself relative to its container (e.g. aligned at bottom center).
  absolutePosition,
}

/// A single caption cue inside the overlay.
class RefractionCaptionCue {
  /// Unique identifier for this cue.
  final String id;

  /// Speaker name, shown as a prefix when present.
  final String? speaker;

  /// The caption text.
  final String text;

  /// Whether this cue is finalised (true) or still being transcribed (false).
  final bool isFinal;

  /// Creates a [RefractionCaptionCue].
  const RefractionCaptionCue({
    required this.id,
    required this.text,
    this.speaker,
    this.isFinal = true,
  });
}

/// A rolling caption overlay for meeting / video surfaces.
///
/// Only the last [maxLines] cues are shown; non-final (interim) cues are rendered dimmed
/// and italic.
class RefractionLiveCaptions extends StatelessWidget {
  /// The full ordered list of caption cues.
  final List<RefractionCaptionCue> cues;

  /// Maximum number of cue lines to display at once. Defaults to 2.
  final int maxLines;

  /// How the container is positioned in the layout. Defaults to [RefractionLiveCaptionsPosition.staticPosition].
  final RefractionLiveCaptionsPosition position;

  /// Creates a [RefractionLiveCaptions] overlay.
  const RefractionLiveCaptions({
    super.key,
    required this.cues,
    this.maxLines = 2,
    this.position = RefractionLiveCaptionsPosition.staticPosition,
  });

  Widget _buildCueRow(BuildContext context, RefractionCaptionCue cue, RefractionThemeData theme) {
    final colors = theme.colors;

    final baseStyle = TextStyle(
      fontSize: 14.0,
      color: colors.foreground,
      fontStyle: cue.isFinal ? FontStyle.normal : FontStyle.italic,
      height: 1.375, // leading-snug
    );

    return Opacity(
      opacity: cue.isFinal ? 1.0 : 0.6,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 2.0),
        child: RichText(
          text: TextSpan(
            style: baseStyle,
            children: [
              if (cue.speaker != null && cue.speaker!.isNotEmpty) ...[
                TextSpan(
                  text: cue.speaker,
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: colors.mutedForeground,
                  ),
                ),
                const TextSpan(text: ': '),
              ],
              TextSpan(text: cue.text),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final shownCues = cues.length > maxLines
        ? cues.sublist(cues.length - maxLines)
        : cues;

    Widget content = Container(
      constraints: const BoxConstraints(maxWidth: 672.0), // max-w-2xl
      decoration: BoxDecoration(
        color: colors.card.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: colors.border.withValues(alpha: 0.5)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: shownCues.isEmpty
            ? [
                Text(
                  'Waiting for captions...',
                  style: TextStyle(
                    color: colors.mutedForeground,
                    fontSize: 14.0,
                    fontStyle: FontStyle.italic,
                  ),
                )
              ]
            : shownCues.map((cue) => _buildCueRow(context, cue, theme.data)).toList(),
      ),
    );

    if (position == RefractionLiveCaptionsPosition.absolutePosition) {
      content = Align(
        alignment: Alignment.bottomCenter,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: content,
        ),
      );
    }

    return Semantics(
      container: true,
      liveRegion: true,
      label: 'Live captions',
      child: content,
    );
  }
}
