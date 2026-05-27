import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class DiffViewerPage extends StatefulWidget {
  const DiffViewerPage({super.key});

  @override
  State<DiffViewerPage> createState() => _DiffViewerPageState();
}

class _DiffViewerPageState extends State<DiffViewerPage> {
  int _activeFileIndex = 0;
  RefractionDiffViewMode _viewMode = RefractionDiffViewMode.inline;

  final List<RefractionDiffFile> _files = const [
    RefractionDiffFile(
      path: 'lib/main.dart',
      status: RefractionDiffFileStatus.modified,
      additions: 2,
      deletions: 1,
      original: '''import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Demo',
      home: Scaffold(
        body: Center(child: Text('Hello World')),
      ),
    );
  }
}''',
      modified: '''import 'package:flutter/material.dart';

void main() {
  runApp(const RefractionApp());
}

class RefractionApp extends StatelessWidget {
  const RefractionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Refraction Demo',
      home: Scaffold(
        body: Center(child: Text('Hello Refraction UI')),
      ),
    );
  }
}''',
    ),
    RefractionDiffFile(
      path: 'lib/utils.dart',
      status: RefractionDiffFileStatus.added,
      additions: 5,
      original: '',
      modified: '''String capitalize(String input) {
  if (input.isEmpty) return input;
  return input[0].toUpperCase() + input.substring(1);
}''',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final activeFile = _files[_activeFileIndex];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Diff Viewer'),
        actions: [
          Row(
            children: [
              const Text('Inline'),
              RefractionSwitch(
                value: _viewMode == RefractionDiffViewMode.sideBySide,
                onChanged: (val) {
                  setState(() {
                    _viewMode = val ? RefractionDiffViewMode.sideBySide : RefractionDiffViewMode.inline;
                  });
                },
              ),
              const Text('Side-by-side'),
              const SizedBox(width: 16),
            ],
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: RefractionDiffViewer(
          files: _files,
          original: activeFile.original,
          modified: activeFile.modified,
          viewMode: _viewMode,
          activeFileIndex: _activeFileIndex,
          onFileSelect: (idx) {
            setState(() {
              _activeFileIndex = idx;
            });
          },
        ),
      ),
    );
  }
}
