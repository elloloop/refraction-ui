import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// The semantic kind of a terminal output line.
enum TerminalLineKind { command, stdout, stderr, info, success }

/// Height cap for the scrollable terminal surface.
enum TerminalMaxHeight { sm, md, lg, none }

/// A single line displayed in the terminal output panel.
class TerminalLine {
  /// Optional stable key for list rendering.
  final String? id;

  /// Semantic kind — drives styling and screen-reader announcements.
  final TerminalLineKind kind;

  /// Text content of the line.
  final String text;

  const TerminalLine({
    this.id,
    required this.kind,
    required this.text,
  });
}

/// A read-only output console panel.
class RefractionTerminal extends StatelessWidget {
  /// Lines to render in order. Each line's kind determines its styling.
  final List<TerminalLine> lines;

  /// Prompt symbol prepended to command lines.
  final String promptSymbol;

  /// Maximum height of the scroll region before it becomes scrollable.
  final TerminalMaxHeight maxHeight;

  /// Accessible label for the live region.
  final String? ariaLabel;

  const RefractionTerminal({
    super.key,
    required this.lines,
    this.promptSymbol = '\$',
    this.maxHeight = TerminalMaxHeight.md,
    this.ariaLabel,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    double? getMaxHeightValue() {
      switch (maxHeight) {
        case TerminalMaxHeight.sm:
          return 192;
        case TerminalMaxHeight.md:
          return 320;
        case TerminalMaxHeight.lg:
          return 512;
        case TerminalMaxHeight.none:
        default:
          return null;
      }
    }

    Color getKindColor(TerminalLineKind kind) {
      switch (kind) {
        case TerminalLineKind.stderr:
          return colors.destructive;
        case TerminalLineKind.info:
          return colors.mutedForeground;
        case TerminalLineKind.success:
          return const Color(0xFF10B981); // emerald green
        case TerminalLineKind.command:
        case TerminalLineKind.stdout:
        default:
          return colors.foreground;
      }
    }

    FontWeight getKindFontWeight(TerminalLineKind kind) {
      if (kind == TerminalLineKind.command) {
        return FontWeight.w600;
      }
      return FontWeight.normal;
    }

    Widget renderLine(TerminalLine line) {
      final textColor = getKindColor(line.kind);
      final fontWeight = getKindFontWeight(line.kind);

      if (line.kind == TerminalLineKind.command) {
        return RichText(
          text: TextSpan(
            style: theme.textStyle.copyWith(
              fontSize: 14,
              fontFamily: 'monospace',
              color: textColor,
              fontWeight: fontWeight,
            ),
            children: [
              TextSpan(
                text: '$promptSymbol ',
                style: TextStyle(
                  color: colors.mutedForeground,
                  fontWeight: FontWeight.normal,
                ),
              ),
              TextSpan(text: line.text),
            ],
          ),
        );
      }

      return Text(
        line.text,
        style: theme.textStyle.copyWith(
          fontSize: 14,
          fontFamily: 'monospace',
          color: textColor,
          fontWeight: fontWeight,
        ),
      );
    }

    final double? maxH = getMaxHeightValue();

    return Semantics(
      label: ariaLabel ?? 'Terminal output',
      container: true,
      child: Container(
        constraints: maxH != null ? BoxConstraints(maxHeight: maxH) : null,
        decoration: BoxDecoration(
          color: colors.card,
          borderRadius: BorderRadius.circular(theme.borderRadius),
          border: Border.all(color: colors.border),
        ),
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: lines.map((line) => Padding(
              padding: const EdgeInsets.only(bottom: 2.0),
              child: renderLine(line),
            )).toList(),
          ),
        ),
      ),
    );
  }
}
