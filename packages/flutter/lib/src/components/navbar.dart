import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class NavLink {
  final String label;
  final String href;
  final IconData? icon;

  const NavLink({required this.label, required this.href, this.icon});
}

class RefractionNavbar extends StatelessWidget implements PreferredSizeWidget {
  final List<NavLink> links;
  final String? currentPath;
  final Widget? logo;
  final Widget? actions;
  final ValueChanged<String>? onNavigate;
  final bool forceMobileLayout;

  const RefractionNavbar({
    super.key,
    this.links = const [],
    this.currentPath,
    this.logo,
    this.actions,
    this.onNavigate,
    this.forceMobileLayout = false,
  });

  @override
  Size get preferredSize => const Size.fromHeight(56.0); // Equivalent to h-14

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;

    // In Flutter we do layout constraints via LayoutBuilder or MediaQuery
    // In React this was handled via `hidden md:flex`.
    final isMobile =
        forceMobileLayout || MediaQuery.of(context).size.width < 768;

    return Container(
      height: preferredSize.height,
      decoration: BoxDecoration(
        color: colors.background.withValues(alpha: 0.95), // Slight glass feel
        border: Border(bottom: BorderSide(color: colors.border)),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Logo / Brand
              if (logo != null) logo! else const SizedBox.shrink(),

              // Main Navigation Links
              if (!isMobile && links.isNotEmpty)
                Expanded(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: links.map((link) {
                      final isActive = currentPath == link.href;
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                        child: InkWell(
                          onTap: () => onNavigate?.call(link.href),
                          borderRadius: BorderRadius.circular(6),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            child: Text(
                              link.label,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isActive
                                    ? FontWeight.w600
                                    : FontWeight.w500,
                                color: isActive
                                    ? colors.foreground
                                    : colors.mutedForeground,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                )
              else if (links.isNotEmpty || actions != null)
                const Spacer(),

              // Trailing Actions Slot
              ?actions,
            ],
          ),
        ),
      ),
    );
  }
}
