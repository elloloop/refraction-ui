import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class FileTreePage extends StatefulWidget {
  const FileTreePage({super.key});

  @override
  State<FileTreePage> createState() => _FileTreePageState();
}

class _FileTreePageState extends State<FileTreePage> {
  String? _selectedId;
  final Set<String> _expandedIds = {'src', 'components'};

  final List<RefractionFileTreeNode> _nodes = const [
    RefractionFileTreeNode(
      id: 'lib',
      label: 'lib',
      isFolder: true,
      children: [
        RefractionFileTreeNode(
          id: 'src',
          label: 'src',
          isFolder: true,
          children: [
            RefractionFileTreeNode(
              id: 'components',
              label: 'components',
              isFolder: true,
              children: [
                RefractionFileTreeNode(id: 'button.dart', label: 'button.dart'),
                RefractionFileTreeNode(id: 'file_tree.dart', label: 'file_tree.dart'),
                RefractionFileTreeNode(id: 'input.dart', label: 'input.dart'),
              ],
            ),
            RefractionFileTreeNode(
              id: 'theme',
              label: 'theme',
              isFolder: true,
              children: [
                RefractionFileTreeNode(id: 'refraction_theme.dart', label: 'refraction_theme.dart'),
              ],
            ),
          ],
        ),
        RefractionFileTreeNode(id: 'refraction_ui.dart', label: 'refraction_ui.dart'),
      ],
    ),
    RefractionFileTreeNode(id: 'pubspec.yaml', label: 'pubspec.yaml'),
    RefractionFileTreeNode(id: 'README.md', label: 'README.md'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('File Tree Component')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'RefractionFileTree',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text('A deeply nestable file tree supporting keyboard navigation and selection.'),
            const SizedBox(height: 24),
            Container(
              width: 300,
              decoration: BoxDecoration(
                border: Border.all(color: RefractionTheme.of(context).colors.border),
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.all(12),
              child: RefractionFileTree(
                nodes: _nodes,
                selectedId: _selectedId,
                expandedIds: _expandedIds,
                onNodeSelect: (id) {
                  setState(() => _selectedId = id);
                },
                onNodeToggle: (id) {
                  setState(() {
                    if (_expandedIds.contains(id)) {
                      _expandedIds.remove(id);
                    } else {
                      _expandedIds.add(id);
                    }
                  });
                },
              ),
            ),
            const SizedBox(height: 24),
            Text('Selected ID: ${_selectedId ?? 'None'}'),
          ],
        ),
      ),
    );
  }
}
