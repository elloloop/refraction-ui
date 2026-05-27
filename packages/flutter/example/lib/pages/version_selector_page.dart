import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class VersionSelectorPage extends StatefulWidget {
  const VersionSelectorPage({super.key});

  @override
  State<VersionSelectorPage> createState() => _VersionSelectorPageState();
}

class _VersionSelectorPageState extends State<VersionSelectorPage> {
  String? _selectedVersion = 'v2.0.0';

  final List<RefractionVersionOption> _versions = [
    const RefractionVersionOption(value: 'v3.0.0-beta', label: 'v3.0.0 (Beta)'),
    const RefractionVersionOption(
      value: 'v2.0.0',
      label: 'v2.0.0',
      isLatest: true,
    ),
    const RefractionVersionOption(value: 'v1.5.0', label: 'v1.5.0'),
    const RefractionVersionOption(value: 'v1.0.0', label: 'v1.0.0'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Version Selector')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Default Version Selector'),
            const SizedBox(height: 16),
            RefractionVersionSelector(
              versions: _versions,
              value: _selectedVersion,
              onChanged: (val) {
                setState(() => _selectedVersion = val);
              },
            ),
            const SizedBox(height: 32),
            const Text('Disabled Version Selector'),
            const SizedBox(height: 16),
            RefractionVersionSelector(
              versions: _versions,
              value: 'v1.0.0',
              disabled: true,
            ),
          ],
        ),
      ),
    );
  }
}
