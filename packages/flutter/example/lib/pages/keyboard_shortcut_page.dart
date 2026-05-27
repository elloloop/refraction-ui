import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class KeyboardShortcutPage extends StatelessWidget {
  const KeyboardShortcutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Keyboard Shortcut')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Keyboard Shortcut',
              style: RefractionTheme.of(context).data.textStyle.copyWith(
                fontSize: 24.0,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16.0),
            Text(
              'Visualizes a keyboard shortcut cleanly with styled borders/backgrounds.',
              style: RefractionTheme.of(context).data.textStyle,
            ),
            const SizedBox(height: 32.0),

            _buildSection(
              context,
              'Default (Platform Aware)',
              const RefractionKeyboardShortcut(keys: ['Cmd', 'K']),
            ),

            _buildSection(
              context,
              'Mac Style (forced)',
              const RefractionKeyboardShortcut(
                keys: ['Cmd', 'Shift', 'P'],
                forceMacDisplay: true,
              ),
            ),

            _buildSection(
              context,
              'Windows Style (forced)',
              const RefractionKeyboardShortcut(
                keys: ['Ctrl', 'Shift', 'P'],
                forceMacDisplay: false,
              ),
            ),

            _buildSection(
              context,
              'Complex combination',
              const RefractionKeyboardShortcut(keys: ['Meta', 'Alt', 'Delete']),
            ),

            _buildSection(
              context,
              'Arrows',
              const RefractionKeyboardShortcut(keys: ['ArrowUp', 'ArrowDown']),
            ),

            _buildSection(
              context,
              'Enter / Space / Esc',
              const Wrap(
                spacing: 8.0,
                children: [
                  RefractionKeyboardShortcut(keys: ['Enter']),
                  RefractionKeyboardShortcut(keys: [' ']),
                  RefractionKeyboardShortcut(keys: ['Escape']),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(BuildContext context, String title, Widget child) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: RefractionTheme.of(
              context,
            ).data.textStyle.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12.0),
          child,
        ],
      ),
    );
  }
}
