import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class DropdownMenuPage extends StatelessWidget {
  const DropdownMenuPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dropdown Menu')),
      body: Center(
        child: RefractionDropdownMenu(
          trigger: RefractionButton(
            onPressed: null,
            child: const Text('Options'),
          ),
          items: [
            RefractionDropdownGroup(
              label: 'My Account',
              children: [
                RefractionDropdownItem(
                  icon: const Icon(Icons.person),
                  label: 'Profile',
                  shortcut: '⇧⌘P',
                  onSelected: () {
                    print('Profile selected');
                  },
                ),
                RefractionDropdownItem(
                  icon: const Icon(Icons.credit_card),
                  label: 'Billing',
                  shortcut: '⌘B',
                  onSelected: () {},
                ),
                RefractionDropdownItem(
                  icon: const Icon(Icons.settings),
                  label: 'Settings',
                  shortcut: '⌘S',
                  onSelected: () {},
                ),
              ],
            ),
            const RefractionDropdownDivider(),
            RefractionDropdownSubmenu(
              icon: const Icon(Icons.group_add),
              label: 'Invite users',
              children: [
                RefractionDropdownItem(
                  icon: const Icon(Icons.email),
                  label: 'Email',
                  onSelected: () {},
                ),
                RefractionDropdownItem(
                  icon: const Icon(Icons.message),
                  label: 'Message',
                  onSelected: () {},
                ),
                const RefractionDropdownDivider(),
                RefractionDropdownItem(
                  icon: const Icon(Icons.more_horiz),
                  label: 'More...',
                  onSelected: () {},
                ),
              ],
            ),
            const RefractionDropdownDivider(),
            RefractionDropdownItem(
              icon: const Icon(Icons.logout),
              label: 'Log out',
              shortcut: '⇧⌘Q',
              onSelected: () {},
            ),
          ],
        ),
      ),
    );
  }
}
