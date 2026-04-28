import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Describes a single tab inside [RefractionBottomNav].
///
/// A [NavTab] is a passive data record; activation state and navigation are
/// driven by [RefractionBottomNav.currentPath] and
/// [RefractionBottomNav.onNavigate].
class NavTab {
  /// Text label displayed beneath the icon.
  final String label;

  /// Identifier reported through [RefractionBottomNav.onNavigate] when the
  /// tab is tapped, and compared against
  /// [RefractionBottomNav.currentPath] to decide whether the tab is active.
  ///
  /// Typically a route path such as `'/home'`, but any unique string works.
  final String href;

  /// Icon displayed in the inactive state.
  final Widget? icon;

  /// Optional icon displayed when the tab is the current selection.
  ///
  /// Falls back to [icon] if not provided.
  final Widget? activeIcon;

  /// Creates a [NavTab].
  const NavTab({
    required this.label,
    required this.href,
    this.icon,
    this.activeIcon,
  });
}

/// A bottom navigation bar with up to a handful of [NavTab]s.
///
/// Each tab shows an optional icon and label. The tab whose
/// [NavTab.href] matches [currentPath] is rendered in the
/// active style using [RefractionColors.primary].
///
/// ```dart
/// RefractionBottomNav(
///   currentPath: '/home',
///   onNavigate: (href) => router.go(href),
///   tabs: const [
///     NavTab(label: 'Home', href: '/home', icon: Icon(Icons.home)),
///     NavTab(label: 'Search', href: '/search', icon: Icon(Icons.search)),
///     NavTab(label: 'Profile', href: '/profile', icon: Icon(Icons.person)),
///   ],
/// )
/// ```
///
/// The bar respects the bottom [SafeArea]. For a top-of-screen nav, see the
/// `RefractionNavbar` widget (in `navbar.dart`).
class RefractionBottomNav extends StatelessWidget {
  /// Tabs displayed left-to-right, one per [NavTab]. Defaults to empty.
  final List<NavTab> tabs;

  /// The currently active route. The tab whose [NavTab.href] equals this
  /// value is rendered in the active style.
  final String? currentPath;

  /// Called with the tapped tab's [NavTab.href] when the user selects a tab.
  ///
  /// Apps typically wire this to their router.
  final ValueChanged<String>? onNavigate;

  /// Creates a [RefractionBottomNav].
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
        color: colors.background.withValues(alpha: 0.95),
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
