import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class TableOfContentsPage extends StatefulWidget {
  const TableOfContentsPage({super.key});

  @override
  State<TableOfContentsPage> createState() => _TableOfContentsPageState();
}

class _TableOfContentsPageState extends State<TableOfContentsPage> {
  String _activeId = 'intro';

  final List<RefractionTocItem> _items = const [
    RefractionTocItem(id: 'intro', text: 'Introduction', level: 2),
    RefractionTocItem(id: 'usage', text: 'Usage', level: 2),
    RefractionTocItem(id: 'basic', text: 'Basic Example', level: 3),
    RefractionTocItem(id: 'advanced', text: 'Advanced Usage', level: 3),
    RefractionTocItem(id: 'nested', text: 'Deeply Nested', level: 4),
    RefractionTocItem(id: 'api', text: 'API Reference', level: 2),
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Table of Contents',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          const Text(
            'A headless, styleable table of contents component that highlights the active section.',
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
          const SizedBox(height: 48),
          
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              border: Border.all(color: context.refractionColors.border),
              borderRadius: BorderRadius.circular(context.refractionTheme.borderRadius),
              color: context.refractionColors.card,
            ),
            child: RefractionTableOfContents(
              items: _items,
              activeId: _activeId,
              onActiveIdChange: (id) {
                setState(() => _activeId = id);
              },
            ),
          ),
        ],
      ),
    );
  }
}
