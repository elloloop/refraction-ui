import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class FileUploadPage extends StatefulWidget {
  const FileUploadPage({super.key});

  @override
  State<FileUploadPage> createState() => _FileUploadPageState();
}

class _FileUploadPageState extends State<FileUploadPage> {
  final List<RefractionFileEntry> _files = [];
  bool _isDragging = false;

  void _addFile() {
    setState(() {
      _files.add(
        RefractionFileEntry(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          name: 'example_file_${_files.length + 1}.png',
          size: 1024 * 1024 * (_files.length + 1),
          type: 'image/png',
          status: RefractionFileStatus.pending,
        ),
      );
    });
  }

  void _removeFile(String id) {
    setState(() {
      _files.removeWhere((file) => file.id == id);
    });
  }

  void _simulateUpload() async {
    for (int i = 0; i < _files.length; i++) {
      if (_files[i].status == RefractionFileStatus.pending) {
        setState(() {
          _files[i] = _files[i].copyWith(
            status: RefractionFileStatus.uploading,
          );
        });

        for (int p = 1; p <= 10; p++) {
          await Future.delayed(const Duration(milliseconds: 200));
          if (!mounted) return;
          // check if file still exists
          final idx = _files.indexWhere((f) => f.id == _files[i].id);
          if (idx == -1) break;

          setState(() {
            _files[idx] = _files[idx].copyWith(progress: p / 10.0);
          });
        }

        if (!mounted) return;
        final finalIdx = _files.indexWhere((f) => f.id == _files[i].id);
        if (finalIdx != -1) {
          setState(() {
            // Randomly succeed or fail
            if (_files[finalIdx].size > 2000000) {
              _files[finalIdx] = _files[finalIdx].copyWith(
                status: RefractionFileStatus.error,
                error: 'File size exceeds 2MB limit',
              );
            } else {
              _files[finalIdx] = _files[finalIdx].copyWith(
                status: RefractionFileStatus.complete,
              );
            }
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;

    return Scaffold(
      backgroundColor: theme.colors.background,
      appBar: AppBar(
        backgroundColor: theme.colors.background,
        title: Text(
          'File Upload',
          style: theme.textStyle.copyWith(
            color: theme.colors.foreground,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        iconTheme: IconThemeData(color: theme.colors.foreground),
        elevation: 1,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Interactive File Upload',
              style: theme.textStyle.copyWith(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: theme.colors.foreground,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'A headless-friendly drop zone and file list view. Supports dragging states, progress bars, and status indicators.',
              style: theme.textStyle.copyWith(
                fontSize: 16,
                color: theme.colors.mutedForeground,
              ),
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: theme.colors.border),
                borderRadius: BorderRadius.circular(theme.borderRadius),
              ),
              child: RefractionFileUpload(
                files: _files,
                isDragging: _isDragging,
                onTapDropZone: _addFile,
                onRemoveFile: _removeFile,
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                RefractionButton(
                  onPressed: _addFile,
                  child: const Text('Simulate Select File'),
                ),
                const SizedBox(width: 12),
                RefractionButton(
                  variant: RefractionButtonVariant.secondary,
                  onPressed: _files.isNotEmpty ? _simulateUpload : null,
                  child: const Text('Simulate Upload Progress'),
                ),
                const SizedBox(width: 12),
                Row(
                  children: [
                    Text(
                      'Simulate Drag',
                      style: theme.textStyle.copyWith(
                        color: theme.colors.foreground,
                      ),
                    ),
                    const SizedBox(width: 8),
                    RefractionSwitch(
                      value: _isDragging,
                      onChanged: (val) {
                        setState(() {
                          _isDragging = val;
                        });
                      },
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
