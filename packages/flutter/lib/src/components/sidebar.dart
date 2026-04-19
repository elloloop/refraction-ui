import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class SidebarItem {
  final String label;
  final String href;
  final Widget? icon;

  const SidebarItem({required this.label, required this.href, this.icon});
}

class SidebarSection {
  final String? title;
  final List<SidebarItem> items;

  const SidebarSection({this.title, required this.items});
}

class RefractionSidebar extends StatelessWidget {
  final List<SidebarSection> sections;
  final String? currentPath;
  final bool collapsed;
  final ValueChanged<String>? onNavigate;
  final double width;
  final double collapsedWidth;

  const RefractionSidebar({
    super.key,
    this.sections = const [],
    this.currentPath,
    this.collapsed = false,
    this.onNavigate,
    this.width = 280.0,
    this.collapsedWidth = 72.0,
  });

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;
    final currentWidth = collapsed ? collapsedWidth : width;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      curve: Curves.fastOutSlowIn,
      width: currentWidth,
      decoration: BoxDecoration(
        color: colors.card,
        border: Border(right: BorderSide(color: colors.border)),
      ),
      child: SafeArea(
        right: false,
        child: ListView.builder(
          padding: const EdgeInsets.all(16.0),
          itemCount: sections.length,
          itemBuilder: (context, sectionIndex) {
            final section = sections[sectionIndex];
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (section.title != null && !collapsed)
                  Padding(
                    padding: EdgeInsets.only(
                      left: 12,
                      bottom: 8,
                      top: sectionIndex > 0 ? 16.0 : 0.0,
                    ),
                    child: Text(
                      section.title!.toUpperCase(),
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.2,
                        color: colors.mutedForeground,
                      ),
                    ),
                  ),
                ...section.items.map((item) {
                  final isActive = currentPath == item.href;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 4.0),
                    child: InkWell(
                      onTap: () => onNavigate?.call(item.href),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: collapsed ? 0 : 12,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8),
                          color: isActive ? colors.accent : Colors.transparent,
                        ),
                        child: Row(
                          mainAxisAlignment: collapsed
                              ? MainAxisAlignment.center
                              : MainAxisAlignment.start,
                          children: [
                            if (item.icon != null)
                              IconTheme(
                                data: IconThemeData(
                                  size: 18,
                                  color: isActive
                                      ? colors.foreground
                                      : colors.mutedForeground,
                                ),
                                child: item.icon!,
                              ),
                            if (item.icon != null && !collapsed)
                              const SizedBox(width: 12),
                            if (!collapsed)
                              Expanded(
                                child: Text(
                                  item.label,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: isActive
                                        ? FontWeight.w600
                                        : FontWeight.w400,
                                    color: isActive
                                        ? colors.foreground
                                        : colors.mutedForeground,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
                if (!collapsed) const SizedBox(height: 8),
              ],
            );
          },
        ),
      ),
    );
  }
}
