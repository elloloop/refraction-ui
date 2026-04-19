import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class NavTab {
  final String label;
  final String href;
  final Widget? icon;
  final Widget? activeIcon;

  const NavTab({
    required this.label,
    required this.href,
    this.icon,
    this.activeIcon,
  });
}

class RefractionBottomNav extends StatelessWidget {
  final List<NavTab> tabs;
  final String? currentPath;
  final ValueChanged<String>? onNavigate;

  const RefractionBottomNav({
    super.key,
    this.tabs = const [],
    this.currentPath,
    this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;

    return Container(
      decoration: BoxDecoration(
        color: colors.background.withOpacity(0.95),
        border: Border(top: BorderSide(color: colors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: tabs.map((tab) {
              final isActive = currentPath == tab.href;
              return Expanded(
                child: InkWell(
                  onTap: () => onNavigate?.call(tab.href),
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (tab.icon != null)
                          IconTheme(
                            data: IconThemeData(
                              size: 24,
                              color: isActive
                                  ? colors.primary
                                  : colors.mutedForeground,
                            ),
                            child: (isActive && tab.activeIcon != null)
                                ? tab.activeIcon!
                                : tab.icon!,
                          ),
                        if (tab.icon != null) const SizedBox(height: 4),
                        Text(
                          tab.label,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: isActive
                                ? FontWeight.w600
                                : FontWeight.w500,
                            color: isActive
                                ? colors.primary
                                : colors.mutedForeground,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
