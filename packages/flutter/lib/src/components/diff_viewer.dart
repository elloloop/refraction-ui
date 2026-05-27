import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// The status of a file in the diff.
enum RefractionDiffFileStatus {
  /// The file was newly added.
  added,

  /// The file was modified.
  modified,

  /// The file was deleted.
  deleted,

  /// The file was renamed.
  renamed,
}

/// A representation of a single file in a diff viewer.
class RefractionDiffFile {
  /// File path.
  final String path;

  /// Change status.
  final RefractionDiffFileStatus status;

  /// Number of lines added.
  final int additions;

  /// Number of lines deleted.
  final int deletions;

  /// Old path for renamed files.
  final String? oldPath;

  /// The original content of the file.
  final String original;

  /// The modified content of the file.
  final String modified;

  const RefractionDiffFile({
    required this.path,
    this.status = RefractionDiffFileStatus.modified,
    this.additions = 0,
    this.deletions = 0,
    this.oldPath,
    this.original = '',
    this.modified = '',
  });
}

/// The visual mode for the diff viewer.
enum RefractionDiffViewMode {
  /// Show original and modified texts side by side.
  sideBySide,

  /// Show changes inline.
  inline,
}

enum _RefractionDiffType { insertion, deletion, equal }

class _RefractionLineDiff {
  final _RefractionDiffType type;
  final String text;
  final int? oldLineNumber;
  final int? newLineNumber;

  _RefractionLineDiff({
    required this.type,
    required this.text,
    this.oldLineNumber,
    this.newLineNumber,
  });
}

/// A headless-inspired diff viewer component for Flutter.
/// Provides syntax comparison, line differences, and an optional file sidebar.
class RefractionDiffViewer extends StatefulWidget {
  /// The list of files to show in the sidebar (if [showSidebar] is true).
  ///
  /// If provided, [onFileSelect] will be triggered when a user taps a file.
  /// Ensure you update [original] and [modified] dynamically to reflect
  /// the active file selection.
  final List<RefractionDiffFile> files;

  /// The original text block.
  final String original;

  /// The modified text block.
  final String modified;

  /// The active view mode.
  final RefractionDiffViewMode viewMode;

  /// Whether to show the file sidebar.
  final bool showSidebar;

  /// Width of the file sidebar.
  final double sidebarWidth;

  /// The index of the active file in [files].
  final int activeFileIndex;

  /// Called when a file is selected from the sidebar.
  final ValueChanged<int>? onFileSelect;

  /// Custom class-like or padding options for the container.
  final EdgeInsetsGeometry padding;

  const RefractionDiffViewer({
    super.key,
    this.files = const [],
    this.original = '',
    this.modified = '',
    this.viewMode = RefractionDiffViewMode.inline,
    this.showSidebar = true,
    this.sidebarWidth = 240,
    this.activeFileIndex = 0,
    this.onFileSelect,
    this.padding = EdgeInsets.zero,
  });

  @override
  State<RefractionDiffViewer> createState() => _RefractionDiffViewerState();
}

class _RefractionDiffViewerState extends State<RefractionDiffViewer> {
  late int _activeIdx;

  @override
  void initState() {
    super.initState();
    _activeIdx = widget.activeFileIndex;
  }

  @override
  void didUpdateWidget(RefractionDiffViewer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.activeFileIndex != widget.activeFileIndex) {
      _activeIdx = widget.activeFileIndex;
    }
  }

  List<_RefractionLineDiff> _computeLineDiff(String original, String modified) {
    if (original.isEmpty && modified.isEmpty) return [];

    final oldLines = original.isEmpty ? <String>[] : original.split('\n');
    final newLines = modified.isEmpty ? <String>[] : modified.split('\n');

    final m = oldLines.length;
    final n = newLines.length;

    final c = List.generate(m + 1, (_) => List.filled(n + 1, 0));

    for (int i = 1; i <= m; i++) {
      for (int j = 1; j <= n; j++) {
        if (oldLines[i - 1] == newLines[j - 1]) {
          c[i][j] = c[i - 1][j - 1] + 1;
        } else {
          c[i][j] = c[i - 1][j] > c[i][j - 1] ? c[i - 1][j] : c[i][j - 1];
        }
      }
    }

    final List<_RefractionLineDiff> diffs = [];
    int i = m;
    int j = n;
    while (i > 0 && j > 0) {
      if (oldLines[i - 1] == newLines[j - 1]) {
        diffs.insert(
          0,
          _RefractionLineDiff(
            type: _RefractionDiffType.equal,
            text: oldLines[i - 1],
            oldLineNumber: i,
            newLineNumber: j,
          ),
        );
        i--;
        j--;
      } else if (c[i - 1][j] > c[i][j - 1]) {
        diffs.insert(
          0,
          _RefractionLineDiff(
            type: _RefractionDiffType.deletion,
            text: oldLines[i - 1],
            oldLineNumber: i,
            newLineNumber: null,
          ),
        );
        i--;
      } else {
        diffs.insert(
          0,
          _RefractionLineDiff(
            type: _RefractionDiffType.insertion,
            text: newLines[j - 1],
            oldLineNumber: null,
            newLineNumber: j,
          ),
        );
        j--;
      }
    }
    while (i > 0) {
      diffs.insert(
        0,
        _RefractionLineDiff(
          type: _RefractionDiffType.deletion,
          text: oldLines[i - 1],
          oldLineNumber: i,
          newLineNumber: null,
        ),
      );
      i--;
    }
    while (j > 0) {
      diffs.insert(
        0,
        _RefractionLineDiff(
          type: _RefractionDiffType.insertion,
          text: newLines[j - 1],
          oldLineNumber: null,
          newLineNumber: j,
        ),
      );
      j--;
    }

    return diffs;
  }

  String _getFileStatusIcon(RefractionDiffFileStatus status) {
    switch (status) {
      case RefractionDiffFileStatus.added:
        return '🟩';
      case RefractionDiffFileStatus.modified:
        return '🟨';
      case RefractionDiffFileStatus.deleted:
        return '🟥';
      case RefractionDiffFileStatus.renamed:
        return '🟦';
    }
  }

  Widget _buildSidebar(BuildContext context) {
    final colors = context.refractionColors;
    final theme = context.refractionTheme;

    return Container(
      width: widget.sidebarWidth,
      decoration: BoxDecoration(
        color: colors.muted.withValues(alpha: 0.3),
        border: Border(right: BorderSide(color: colors.border)),
      ),
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: widget.files.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                'Files (${widget.files.length})',
                style: theme.textStyle.copyWith(
                  fontSize: 12,
                  color: colors.mutedForeground,
                  fontWeight: FontWeight.bold,
                ),
              ),
            );
          }
          final fIndex = index - 1;
          final f = widget.files[fIndex];
          final isActive = fIndex == _activeIdx;
          final parts = f.path.split('/');
          final fname = parts.isNotEmpty ? parts.last : f.path;

          return InkWell(
            onTap: () {
              setState(() => _activeIdx = fIndex);
              widget.onFileSelect?.call(fIndex);
            },
            child: Container(
              color: isActive ? colors.accent : Colors.transparent,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Text(
                    _getFileStatusIcon(f.status),
                    style: const TextStyle(fontSize: 10),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      fname,
                      style: theme.textStyle.copyWith(
                        fontSize: 14,
                        color: isActive
                            ? colors.accentForeground
                            : colors.foreground,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  if (f.additions > 0)
                    Text(
                      '+${f.additions}',
                      style: const TextStyle(color: Colors.green, fontSize: 10),
                    ),
                  if (f.deletions > 0) ...[
                    const SizedBox(width: 4),
                    Text(
                      '-${f.deletions}',
                      style: const TextStyle(color: Colors.red, fontSize: 10),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildInlineDiff(
    BuildContext context,
    List<_RefractionLineDiff> diffs,
  ) {
    final colors = context.refractionColors;
    final theme = context.refractionTheme;
    final textStyle = theme.textStyle.copyWith(
      fontFamily: 'monospace',
      color: colors.foreground,
      fontSize: 13,
    );
    final numStyle = theme.textStyle.copyWith(
      fontFamily: 'monospace',
      color: colors.mutedForeground,
      fontSize: 13,
    );

    return ListView.builder(
      itemCount: diffs.length,
      padding: widget.padding,
      itemBuilder: (context, index) {
        final d = diffs[index];
        Color? bgColor;
        if (d.type == _RefractionDiffType.insertion) {
          bgColor = Colors.green.withValues(alpha: 0.15);
        } else if (d.type == _RefractionDiffType.deletion) {
          bgColor = Colors.red.withValues(alpha: 0.15);
        }

        return Container(
          color: bgColor,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 40,
                child: Padding(
                  padding: const EdgeInsets.only(right: 8.0, top: 2, bottom: 2),
                  child: Text(
                    d.oldLineNumber?.toString() ?? '',
                    style: numStyle,
                    textAlign: TextAlign.right,
                  ),
                ),
              ),
              SizedBox(
                width: 40,
                child: Padding(
                  padding: const EdgeInsets.only(right: 8.0, top: 2, bottom: 2),
                  child: Text(
                    d.newLineNumber?.toString() ?? '',
                    style: numStyle,
                    textAlign: TextAlign.right,
                  ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8.0,
                    vertical: 2,
                  ),
                  child: Text(d.text, style: textStyle),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSideBySideDiff(
    BuildContext context,
    List<_RefractionLineDiff> diffs,
  ) {
    final colors = context.refractionColors;
    final theme = context.refractionTheme;
    final textStyle = theme.textStyle.copyWith(
      fontFamily: 'monospace',
      color: colors.foreground,
      fontSize: 13,
    );
    final numStyle = theme.textStyle.copyWith(
      fontFamily: 'monospace',
      color: colors.mutedForeground,
      fontSize: 13,
    );

    // Group deletions and insertions side-by-side if they align
    final List<Widget> rows = [];
    int i = 0;
    while (i < diffs.length) {
      final d = diffs[i];
      if (d.type == _RefractionDiffType.equal) {
        rows.add(
          _buildSideBySideRow(
            context,
            leftNum: d.oldLineNumber?.toString() ?? '',
            leftText: d.text,
            leftBg: null,
            rightNum: d.newLineNumber?.toString() ?? '',
            rightText: d.text,
            rightBg: null,
            textStyle: textStyle,
            numStyle: numStyle,
          ),
        );
        i++;
      } else if (d.type == _RefractionDiffType.deletion) {
        // Try to find a matching insertion immediately after
        _RefractionLineDiff? insertion;
        if (i + 1 < diffs.length &&
            diffs[i + 1].type == _RefractionDiffType.insertion) {
          insertion = diffs[i + 1];
          i += 2;
        } else {
          i++;
        }
        rows.add(
          _buildSideBySideRow(
            context,
            leftNum: d.oldLineNumber?.toString() ?? '',
            leftText: d.text,
            leftBg: Colors.red.withValues(alpha: 0.15),
            rightNum: insertion?.newLineNumber?.toString() ?? '',
            rightText: insertion?.text ?? '',
            rightBg: insertion != null
                ? Colors.green.withValues(alpha: 0.15)
                : Colors.grey.withValues(alpha: 0.05),
            textStyle: textStyle,
            numStyle: numStyle,
          ),
        );
      } else {
        // standalone insertion
        rows.add(
          _buildSideBySideRow(
            context,
            leftNum: '',
            leftText: '',
            leftBg: Colors.grey.withValues(alpha: 0.05),
            rightNum: d.newLineNumber?.toString() ?? '',
            rightText: d.text,
            rightBg: Colors.green.withValues(alpha: 0.15),
            textStyle: textStyle,
            numStyle: numStyle,
          ),
        );
        i++;
      }
    }

    return ListView.builder(
      itemCount: rows.length,
      padding: widget.padding,
      itemBuilder: (context, index) => rows[index],
    );
  }

  Widget _buildSideBySideRow(
    BuildContext context, {
    required String leftNum,
    required String leftText,
    required Color? leftBg,
    required String rightNum,
    required String rightText,
    required Color? rightBg,
    required TextStyle textStyle,
    required TextStyle numStyle,
  }) {
    final colors = context.refractionColors;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Left side
        Expanded(
          child: Container(
            color: leftBg,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 40,
                  child: Padding(
                    padding: const EdgeInsets.only(
                      right: 8.0,
                      top: 2,
                      bottom: 2,
                    ),
                    child: Text(
                      leftNum,
                      style: numStyle,
                      textAlign: TextAlign.right,
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8.0,
                      vertical: 2,
                    ),
                    child: Text(leftText, style: textStyle),
                  ),
                ),
              ],
            ),
          ),
        ),
        Container(width: 1, color: colors.border),
        // Right side
        Expanded(
          child: Container(
            color: rightBg,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 40,
                  child: Padding(
                    padding: const EdgeInsets.only(
                      right: 8.0,
                      top: 2,
                      bottom: 2,
                    ),
                    child: Text(
                      rightNum,
                      style: numStyle,
                      textAlign: TextAlign.right,
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8.0,
                      vertical: 2,
                    ),
                    child: Text(rightText, style: textStyle),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.refractionColors;
    final diffs = _computeLineDiff(widget.original, widget.modified);

    return Container(
      decoration: BoxDecoration(
        color: colors.background,
        border: Border.all(color: colors.border),
        borderRadius: BorderRadius.circular(
          context.refractionTheme.borderRadius,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (widget.showSidebar && widget.files.isNotEmpty)
            _buildSidebar(context),
          Expanded(
            child: widget.viewMode == RefractionDiffViewMode.inline
                ? _buildInlineDiff(context, diffs)
                : _buildSideBySideDiff(context, diffs),
          ),
        ],
      ),
    );
  }
}
