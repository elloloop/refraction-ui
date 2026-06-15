import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Horizontal alignment of a segment within the bar.
enum StatusSegmentAlign { left, right }

/// Visual tone / emphasis of a segment.
enum StatusSegmentTone { defaultTone, muted, accent }

/// A single labelled item rendered in the status bar.
class StatusSegment {
  /// Unique identifier for the segment.
  final String id;

  /// Text displayed in the segment.
  final String label;

  /// Which side of the bar this segment lives on. Defaults to [StatusSegmentAlign.left].
  final StatusSegmentAlign align;

  /// Visual tone. Defaults to [StatusSegmentTone.defaultTone].
  final StatusSegmentTone tone;

  const StatusSegment({
    required this.id,
    required this.label,
    this.align = StatusSegmentAlign.left,
    this.tone = StatusSegmentTone.defaultTone,
  });
}

/// An IDE-style bottom status bar.
class RefractionEditorStatusBar extends StatelessWidget {
  /// Explicit list of segments. When provided, the convenience props
  /// (line, col, language, etc.) are ignored.
  final List<StatusSegment>? segments;

  /// Current line number (1-indexed).
  final int? line;

  /// Current column number (1-indexed).
  final int? col;

  /// Indentation descriptor, e.g. 'Spaces: 4' or 'Tab Size: 2'.
  final String? indentation;

  /// Language / runtime label, e.g. 'Python 3.11.4'.
  final String? language;

  /// File encoding, e.g. 'UTF-8'.
  final String? encoding;

  /// End-of-line sequence, e.g. 'LF' or 'CRLF'.
  final String? eol;

  /// Persistence status label, e.g. 'Auto-saved' or 'Unsaved changes'.
  final String? status;

  const RefractionEditorStatusBar({
    super.key,
    this.segments,
    this.line,
    this.col,
    this.indentation,
    this.language,
    this.encoding,
    this.eol,
    this.status,
  });

  List<StatusSegment> _buildSegmentsFromConvenienceProps() {
    final segs = <StatusSegment>[];

    if (line != null && col != null) {
      segs.add(StatusSegment(
        id: 'cursor',
        label: 'Ln $line, Col $col',
        align: StatusSegmentAlign.left,
        tone: StatusSegmentTone.defaultTone,
      ));
    }

    if (indentation != null) {
      segs.add(StatusSegment(
        id: 'indentation',
        label: indentation!,
        align: StatusSegmentAlign.left,
        tone: StatusSegmentTone.muted,
      ));
    }

    if (language != null) {
      segs.add(StatusSegment(
        id: 'language',
        label: language!,
        align: StatusSegmentAlign.right,
        tone: StatusSegmentTone.accent,
      ));
    }

    if (encoding != null) {
      segs.add(StatusSegment(
        id: 'encoding',
        label: encoding!,
        align: StatusSegmentAlign.right,
        tone: StatusSegmentTone.muted,
      ));
    }

    if (eol != null) {
      segs.add(StatusSegment(
        id: 'eol',
        label: eol!,
        align: StatusSegmentAlign.right,
        tone: StatusSegmentTone.muted,
      ));
    }

    if (status != null) {
      segs.add(StatusSegment(
        id: 'status',
        label: status!,
        align: StatusSegmentAlign.right,
        tone: StatusSegmentTone.muted,
      ));
    }

    return segs;
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    final effectiveSegments = segments ?? _buildSegmentsFromConvenienceProps();
    final leftGroup = effectiveSegments.where((s) => s.align == StatusSegmentAlign.left).toList();
    final rightGroup = effectiveSegments.where((s) => s.align == StatusSegmentAlign.right).toList();

    Color getToneColor(StatusSegmentTone tone) {
      switch (tone) {
        case StatusSegmentTone.muted:
          return colors.mutedForeground.withValues(alpha: 0.6);
        case StatusSegmentTone.accent:
          return colors.primary;
        case StatusSegmentTone.defaultTone:
          return colors.mutedForeground;
      }
    }

    Widget renderSegment(StatusSegment seg) {
      return Text(
        seg.label,
        style: theme.textStyle.copyWith(
          fontSize: 12,
          fontFamily: 'monospace',
          color: getToneColor(seg.tone),
        ),
      );
    }

    return Container(
      height: 24,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: colors.muted,
        border: Border(
          top: BorderSide(color: colors.border),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Left Group
          Row(
            children: leftGroup
                .map((seg) => Padding(
                      padding: const EdgeInsets.only(right: 12.0),
                      child: renderSegment(seg),
                    ))
                .toList(),
          ),
          // Right Group
          Row(
            children: rightGroup
                .map((seg) => Padding(
                      padding: const EdgeInsets.only(left: 12.0),
                      child: renderSegment(seg),
                    ))
                .toList(),
          ),
        ],
      ),
    );
  }
}
