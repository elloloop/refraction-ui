import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';

/// The current status of a [RefractionFileEntry].
enum RefractionFileStatus {
  /// The file is waiting to be uploaded.
  pending,

  /// The file is currently being uploaded.
  uploading,

  /// The upload has finished successfully.
  complete,

  /// The upload failed or the file was invalid.
  error,
}

/// Represents a single file tracked by [RefractionFileUpload].
class RefractionFileEntry {
  /// Unique identifier for this file.
  final String id;

  /// Original name of the file (e.g. `document.pdf`).
  final String name;

  /// File size in bytes.
  final int size;

  /// MIME type or extension of the file.
  final String type;

  /// Upload progress from `0.0` to `1.0`.
  final double progress;

  /// The current state of this file's upload.
  final RefractionFileStatus status;

  /// An error message, present only if [status] is [RefractionFileStatus.error].
  final String? error;

  /// Creates a [RefractionFileEntry].
  const RefractionFileEntry({
    required this.id,
    required this.name,
    required this.size,
    required this.type,
    this.progress = 0.0,
    this.status = RefractionFileStatus.pending,
    this.error,
  });

  /// Creates a copy of this entry with the given fields replaced.
  RefractionFileEntry copyWith({
    String? id,
    String? name,
    int? size,
    String? type,
    double? progress,
    RefractionFileStatus? status,
    String? error,
  }) {
    return RefractionFileEntry(
      id: id ?? this.id,
      name: name ?? this.name,
      size: size ?? this.size,
      type: type ?? this.type,
      progress: progress ?? this.progress,
      status: status ?? this.status,
      error: error ?? this.error,
    );
  }
}

/// A highly customizable, headless-friendly file upload dropzone and list.
///
/// Handles the visual representation of an upload dropzone and its selected files.
/// This component is purely presentational: it does not open OS file pickers
/// or manage real drag-and-drop itself. The parent widget is responsible for
/// invoking pickers, managing the list of [RefractionFileEntry] objects, and
/// determining the drag state.
///
/// ```dart
/// RefractionFileUpload(
///   files: _myFiles,
///   isDragging: _isDragging,
///   onTapDropZone: () => _pickFiles(),
///   onRemoveFile: (id) => _removeFile(id),
/// )
/// ```
class RefractionFileUpload extends StatefulWidget {
  /// The list of files to display below the dropzone.
  final List<RefractionFileEntry> files;

  /// Whether a file is currently being dragged over the zone.
  /// Modifies the dropzone appearance.
  final bool isDragging;

  /// Whether the dropzone is disabled.
  final bool disabled;

  /// Invoked when the user taps the dropzone.
  /// Typically used to open a file picker.
  final VoidCallback? onTapDropZone;

  /// Invoked when the user clicks the remove ('X') icon on a file entry.
  final ValueChanged<String>? onRemoveFile;

  /// Optional widget displayed inside the dropzone.
  /// If null, a default icon and instruction text are shown.
  final Widget? dropZoneChild;

  /// Optional tooltip text to display when hovering over the dropzone.
  final String tooltipMessage;

  /// Creates a [RefractionFileUpload] widget.
  const RefractionFileUpload({
    super.key,
    required this.files,
    this.isDragging = false,
    this.disabled = false,
    this.onTapDropZone,
    this.onRemoveFile,
    this.dropZoneChild,
    this.tooltipMessage = 'Drop files here or click to upload',
  });

  @override
  State<RefractionFileUpload> createState() => _RefractionFileUploadState();
}

class _RefractionFileUploadState extends State<RefractionFileUpload> {
  bool _isHovered = false;

  String _formatFileSize(int bytes) {
    if (bytes == 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    var i = 0;
    double size = bytes.toDouble();
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return '${size.toStringAsFixed(i == 0 ? 0 : 1)} ${units[i]}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;

    // Dropzone styling based on state
    Color borderColor = theme.colors.mutedForeground.withValues(alpha: 0.25);
    Color backgroundColor = Colors.transparent;

    if (widget.disabled) {
      borderColor = theme.colors.mutedForeground.withValues(alpha: 0.25);
    } else if (widget.isDragging) {
      borderColor = theme.colors.primary;
      backgroundColor = theme.colors.primary.withValues(alpha: 0.05);
    } else if (_isHovered) {
      borderColor = theme.colors.mutedForeground.withValues(alpha: 0.5);
    }

    Widget dropZone = MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      cursor: widget.disabled
          ? SystemMouseCursors.forbidden
          : SystemMouseCursors.click,
      child: GestureDetector(
        onTap: widget.disabled ? null : widget.onTapDropZone,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: double.infinity,
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: BorderRadius.circular(theme.borderRadius),
            // We use a custom dashed border if we had one, but standard flutter doesn't have dashed borders out of the box.
            // Using a solid border for now, or we can use an empty container if the user provides dropZoneChild
            border: Border.all(color: borderColor, width: 2),
          ),
          child: Opacity(
            opacity: widget.disabled ? 0.5 : 1.0,
            child: widget.dropZoneChild ?? _buildDefaultDropZone(theme),
          ),
        ),
      ),
    );

    if (widget.tooltipMessage.isNotEmpty && !widget.disabled) {
      dropZone = Tooltip(message: widget.tooltipMessage, child: dropZone);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        dropZone,
        if (widget.files.isNotEmpty) ...[
          const SizedBox(height: 16),
          _buildFileList(theme),
        ],
      ],
    );
  }

  Widget _buildDefaultDropZone(RefractionThemeData theme) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.upload_file, size: 40, color: theme.colors.mutedForeground),
        const SizedBox(height: 16),
        Text(
          'Drop files here or click to upload',
          style: theme.textStyle.copyWith(
            color: theme.colors.foreground,
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        Text(
          'Any file type is supported',
          style: theme.textStyle.copyWith(
            color: theme.colors.mutedForeground,
            fontSize: 14,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildFileList(RefractionThemeData theme) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: widget.files.map((file) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 8.0),
          child: _buildFileItem(file, theme),
        );
      }).toList(),
    );
  }

  Widget _buildFileItem(RefractionFileEntry file, RefractionThemeData theme) {
    final bool isError = file.status == RefractionFileStatus.error;
    final bool isComplete = file.status == RefractionFileStatus.complete;

    Color iconColor = theme.colors.mutedForeground;
    IconData iconData = Icons.insert_drive_file;

    if (isError) {
      iconColor = theme.colors.destructive;
      iconData = Icons.error;
    } else if (isComplete) {
      iconColor = theme.colors.primary;
      iconData = Icons.check_circle;
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colors.background,
        borderRadius: BorderRadius.circular(theme.borderRadius - 2),
        border: Border.all(
          color: isError ? theme.colors.destructive : theme.colors.border,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(iconData, color: iconColor, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        file.name,
                        style: theme.textStyle.copyWith(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: isError
                              ? theme.colors.destructive
                              : theme.colors.foreground,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _formatFileSize(file.size),
                      style: theme.textStyle.copyWith(
                        fontSize: 12,
                        color: theme.colors.mutedForeground,
                      ),
                    ),
                  ],
                ),
                if (isError && file.error != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    file.error!,
                    style: theme.textStyle.copyWith(
                      fontSize: 12,
                      color: theme.colors.destructive,
                    ),
                  ),
                ],
                if (!isError &&
                    file.status != RefractionFileStatus.pending &&
                    file.status != RefractionFileStatus.complete) ...[
                  const SizedBox(height: 8),
                  _buildProgressBar(file.progress, theme),
                ],
              ],
            ),
          ),
          if (widget.onRemoveFile != null) ...[
            const SizedBox(width: 12),
            MouseRegion(
              cursor: SystemMouseCursors.click,
              child: GestureDetector(
                onTap: () => widget.onRemoveFile!(file.id),
                child: Icon(
                  Icons.close,
                  size: 20,
                  color: theme.colors.mutedForeground,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildProgressBar(double progress, RefractionThemeData theme) {
    return Container(
      height: 6,
      width: double.infinity,
      decoration: BoxDecoration(
        color: theme.colors.secondary,
        borderRadius: BorderRadius.circular(999),
      ),
      alignment: Alignment.centerLeft,
      child: FractionallySizedBox(
        widthFactor: progress.clamp(0.0, 1.0),
        child: Container(
          decoration: BoxDecoration(
            color: theme.colors.primary,
            borderRadius: BorderRadius.circular(999),
          ),
        ),
      ),
    );
  }
}
