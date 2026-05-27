import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class AppShellPage extends StatefulWidget {
  const AppShellPage({super.key});

  @override
  State<AppShellPage> createState() => _AppShellPageState();
}

class _AppShellPageState extends State<AppShellPage> {
  bool _leftOpen = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'App Shell',
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'A comprehensive layout shell for Refraction UI applications.',
          style: TextStyle(fontSize: 16, color: Colors.grey),
        ),
        const SizedBox(height: 32),
        Container(
          height: 600,
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            border: Border.all(
              color: RefractionTheme.of(context).colors.border,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: RefractionAppShell(
            isLeftSidebarOpen: _leftOpen,
            onLeftSidebarOpenChanged: (val) => setState(() => _leftOpen = val),
            header: RefractionNavbar(
              logo: const Text(
                'Brand',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              forceMobileLayout:
                  true, // Forces hamburger menu rendering (conceptual, as we add an action manually)
              actions: IconButton(
                icon: const Icon(Icons.menu),
                onPressed: () => setState(() => _leftOpen = !_leftOpen),
              ),
            ),
            leftSidebar: const RefractionSidebar(
              currentPath: '/home',
              sections: [
                SidebarSection(
                  title: 'Overview',
                  items: [
                    SidebarItem(
                      label: 'Home',
                      href: '/home',
                      icon: Icon(Icons.home),
                    ),
                    SidebarItem(
                      label: 'Dashboard',
                      href: '/dashboard',
                      icon: Icon(Icons.dashboard),
                    ),
                  ],
                ),
                SidebarSection(
                  title: 'Settings',
                  items: [
                    SidebarItem(
                      label: 'Account',
                      href: '/account',
                      icon: Icon(Icons.person),
                    ),
                  ],
                ),
              ],
            ),
            content: Container(
              color: RefractionTheme.of(context).colors.muted,
              child: const Center(child: Text('Main Content Area')),
            ),
          ),
        ),
      ],
    );
  }
}
