import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionCommand)
Widget defaultCommand(BuildContext context) {
  return Container(
    padding: const EdgeInsets.all(16.0),
    color: RefractionTheme.of(context).colors.background,
    child: Center(
      child: SizedBox(
        width: 400,
        child: RefractionCommand(
          placeholder: 'Type a command or search...',
          groups: [
            RefractionCommandGroup(
              heading: 'Suggestions',
              items: [
                RefractionCommandItem(
                  label: 'Calendar',
                  icon: const Icon(Icons.calendar_today),
                  onSelected: () {},
                ),
                RefractionCommandItem(
                  label: 'Search Emoji',
                  icon: const Icon(Icons.emoji_emotions),
                  onSelected: () {},
                ),
                RefractionCommandItem(
                  label: 'Calculator',
                  icon: const Icon(Icons.calculate),
                  onSelected: () {},
                ),
              ],
            ),
            RefractionCommandGroup(
              heading: 'Settings',
              items: [
                RefractionCommandItem(
                  label: 'Profile',
                  icon: const Icon(Icons.person),
                  shortcut: '⌘P',
                  onSelected: () {},
                ),
                RefractionCommandItem(
                  label: 'Billing',
                  icon: const Icon(Icons.payment),
                  shortcut: '⌘B',
                  onSelected: () {},
                ),
                RefractionCommandItem(
                  label: 'Settings',
                  icon: const Icon(Icons.settings),
                  shortcut: '⌘S',
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

@widgetbook.UseCase(name: 'With Many Items', type: RefractionCommand)
Widget manyItemsCommand(BuildContext context) {
  return Container(
    padding: const EdgeInsets.all(16.0),
    color: RefractionTheme.of(context).colors.background,
    child: Center(
      child: SizedBox(
        width: 400,
        child: RefractionCommand(
          placeholder: 'Search documentation...',
          groups: [
            RefractionCommandGroup(
              heading: 'Components',
              items: [
                RefractionCommandItem(
                  label: 'Alert',
                  icon: const Icon(Icons.warning),
                  onSelected: () {},
                ),
                RefractionCommandItem(
                  label: 'Button',
                  icon: const Icon(Icons.smart_button),
                  onSelected: () {},
                ),
                RefractionCommandItem(
                  label: 'Card',
                  icon: const Icon(Icons.credit_card),
                  onSelected: () {},
                ),
                RefractionCommandItem(
                  label: 'Dialog',
                  icon: const Icon(Icons.picture_in_picture),
                  onSelected: () {},
                ),
              ],
            ),
            RefractionCommandGroup(
              heading: 'Themes',
              items: [
                RefractionCommandItem(
                  label: 'Light Mode',
                  icon: const Icon(Icons.light_mode),
                  shortcut: '⌘L',
                  onSelected: () {},
                ),
                RefractionCommandItem(
                  label: 'Dark Mode',
                  icon: const Icon(Icons.dark_mode),
                  shortcut: '⌘D',
                  onSelected: () {},
                ),
                RefractionCommandItem(
                  label: 'System Mode',
                  icon: const Icon(Icons.computer),
                  onSelected: () {},
                ),
              ],
            ),
            RefractionCommandGroup(
              heading: 'Help',
              items: [
                RefractionCommandItem(
                  label: 'Documentation',
                  icon: const Icon(Icons.book),
                  onSelected: () {},
                ),
                RefractionCommandItem(
                  label: 'Report an issue',
                  icon: const Icon(Icons.bug_report),
                  onSelected: () {},
                ),
                RefractionCommandItem(
                  label: 'Keyboard Shortcuts',
                  icon: const Icon(Icons.keyboard),
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
