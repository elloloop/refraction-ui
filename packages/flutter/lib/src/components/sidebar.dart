import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A single navigation entry inside a [SidebarSection].
///
/// Each item maps a human readable [label] and optional [icon] to a route
/// [href] that the host application is responsible for resolving.
class SidebarItem {
  /// Text displayed for this item.
  final String label;

  /// Application route or URL associated with the item.
  ///
  /// Compared against [RefractionSidebar.currentPath] to determine the
  /// active state and forwarded to [RefractionSidebar.onNavigate] on tap.
  final String href;

  /// Optional leading icon rendered next to (or instead of, when collapsed)
  /// the [label].
  final Widget? icon;

  /// Creates an immutable description of a sidebar item.
  const SidebarItem({required this.label, required this.href, this.icon});
}

/// A logical grouping of [SidebarItem]s with an optional heading.
///
/// Sections render their [title] above the items in
/// [RefractionColors.mutedForeground] using uppercase tracking. When the
/// parent [RefractionSidebar] is collapsed, the title is hidden but the
/// items remain visible.
class SidebarSection {
  /// Optional uppercase title rendered above the section's items.
  final String? title;

  /// Items belonging to this section.
  final List<SidebarItem> items;

  /// Creates a section with the given [title] and [items].
  const SidebarSection({this.title, required this.items});
}

/// A vertical navigation rail for app shells, themed with [RefractionTheme].
///
/// `RefractionSidebar` is the Flutter counterpart of the `RefractionSidebar`
/// component from the React, Angular and Astro Refraction UI packages
/// (a shadcn-equivalent pattern). It renders a list of [SidebarSection]s
/// and animates between [width] and [collapsedWidth] when [collapsed] flips.
///
/// ```dart
/// RefractionSidebar(
///   currentPath: '/inbox',
///   onNavigate: (href) => router.go(href),
///   sections: const [
///     SidebarSection(
///       title: 'Mail',
///       items: [
///         SidebarItem(label: 'Inbox', href: '/inbox', icon: Icon(Icons.inbox)),
///         SidebarItem(label: 'Drafts', href: '/drafts', icon: Icon(Icons.drafts)),
///       ],
///     ),
///     SidebarSection(
///       title: 'Settings',
///       items: [
///         SidebarItem(label: 'Account', href: '/settings/account', icon: Icon(Icons.person)),
///       ],
///     ),
///   ],
/// );
/// ```
///
/// See also:
///
///  * [SidebarSection] and [SidebarItem], the data types accepted by
///    [sections].
class RefractionSidebar extends StatelessWidget {
  /// The sections to render, in order.
  final List<SidebarSection> sections;

  /// The href of the active route — drives the highlighted state.
  final String? currentPath;

  /// When `true`, only icons are shown and the rail shrinks to
  /// [collapsedWidth].
  final bool collapsed;

  /// Called with [SidebarItem.href] when the user taps any entry.
  final ValueChanged<String>? onNavigate;

  /// Width in logical pixels when expanded. Defaults to `280`.
  final double width;

  /// Width in logical pixels when [collapsed] is `true`. Defaults to `72`.
  final double collapsedWidth;

  /// Creates a sidebar with the supplied [sections].
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
