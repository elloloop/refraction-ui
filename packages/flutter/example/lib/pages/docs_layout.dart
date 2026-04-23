import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class DocsLayout extends StatelessWidget {
  final Widget child;
  final String currentRoute;
  final ValueChanged<String> onNavigate;
  final List<String> components;

  const DocsLayout({
    super.key,
    required this.child,
    required this.currentRoute,
    required this.onNavigate,
    required this.components,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    // Build the Sidebar Items from the components list
    final List<SidebarItem> sidebarItems = components.map((c) {
      return SidebarItem(
        label: c,
        href: '/docs/${c.toLowerCase().replaceAll(' ', '-')}',
      );
    }).toList();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Sidebar (Fixed Width)
        Container(
          width: 280,
          decoration: BoxDecoration(
            border: Border(right: BorderSide(color: colors.border)),
          ),
          child: RefractionSidebar(
            currentPath: currentRoute,
            onNavigate: onNavigate,
            sections: [
              const SidebarSection(
                title: "Getting Started",
                items: [
                  SidebarItem(label: "Introduction", href: "/docs/introduction"),
                  SidebarItem(label: "Installation", href: "/docs/installation"),
                  SidebarItem(label: "Theming", href: "/docs/theming"),
                ],
              ),
              SidebarSection(
                title: "Components",
                items: sidebarItems,
              ),
              const SidebarSection(
                title: "Application Layouts",
                items: [
                  SidebarItem(label: "Pregnancy Tracker", href: "/docs/pregnancy-tracker"),
                  SidebarItem(label: "Family Calendar", href: "/docs/family-calendar"),
                  SidebarItem(label: "My Prototype", href: "/docs/my-prototype"),
                ],
              ),
            ],
          ),
        ),
        
        // Main Content Area (Fluid)
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 64, vertical: 48),
            child: Align(
              alignment: Alignment.topCenter,
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1000),
                child: child,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
