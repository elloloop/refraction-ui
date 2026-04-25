import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class CommandMenuPage extends StatelessWidget {
  const CommandMenuPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Command Menu",
      description: "A searchable, keyboard-navigable command palette.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: RefractionCommandMenu(
            groups: [
              RefractionCommandGroup(
                heading: 'Suggestions',
                items: [
                  RefractionCommandItem(
                    icon: const Icon(Icons.calendar_today),
                    label: 'Calendar',
                    onSelected: () {},
                  ),
                  RefractionCommandItem(
                    icon: const Icon(Icons.emoji_emotions),
                    label: 'Search Emoji',
                    onSelected: () {},
                  ),
                  RefractionCommandItem(
                    icon: const Icon(Icons.calculate),
                    label: 'Calculator',
                    onSelected: () {},
                  ),
                ],
              ),
              RefractionCommandGroup(
                heading: 'Settings',
                items: [
                  RefractionCommandItem(
                    icon: const Icon(Icons.person),
                    label: 'Profile',
                    shortcut: '⌘ P',
                    onSelected: () {},
                  ),
                  RefractionCommandItem(
                    icon: const Icon(Icons.mail),
                    label: 'Billing',
                    shortcut: '⌘ B',
                    onSelected: () {},
                  ),
                  RefractionCommandItem(
                    icon: const Icon(Icons.settings),
                    label: 'Settings',
                    shortcut: '⌘ S',
                    onSelected: () {},
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
