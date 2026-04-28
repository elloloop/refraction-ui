import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A pill-style tab bar with a swappable content panel.
///
/// `RefractionTabs` is the Flutter version of the `RefractionTabs` compound
/// component from the React, Angular and Astro Refraction UI packages
/// (a shadcn-equivalent pattern that bundles `Tabs`, `TabsList`,
/// `TabsTrigger` and `TabsContent`). Rather than expose those as separate
/// widgets, this Flutter API takes two parallel lists — [tabs] (the
/// trigger labels) and [children] (the content panels) — and shows the
/// child whose index matches the active tab.
///
/// The two lists must have the same length; this is enforced by an
/// `assert` in the constructor.
///
/// ```dart
/// RefractionTabs(
///   initialIndex: 0,
///   tabs: const ['Account', 'Password', 'Sessions'],
///   children: [
///     // Wired in the same order as `tabs`:
///     AccountForm(),
///     PasswordForm(),
///     SessionList(),
///   ],
/// );
/// ```
///
/// The active tab pill uses [RefractionColors.background] over a
/// [RefractionColors.muted] track, with the inactive labels rendered in
/// [RefractionColors.mutedForeground].
class RefractionTabs extends StatefulWidget {
  /// The trigger labels rendered in the tab bar.
  ///
  /// Must have the same length as [children].
  final List<String> tabs;

  /// The content panels, one per entry of [tabs].
  ///
  /// Must have the same length as [tabs]. Only the panel for the active
  /// tab is built.
  final List<Widget> children;

  /// The index of the tab to show when first mounted. Defaults to `0`.
  final int initialIndex;

  /// Creates a tabs widget pairing each entry of [tabs] with the
  /// matching entry of [children].
  const RefractionTabs({
    super.key,
    required this.tabs,
    required this.children,
    this.initialIndex = 0,
  }) : assert(tabs.length == children.length);

  @override
  State<RefractionTabs> createState() => _RefractionTabsState();
}

class _RefractionTabsState extends State<RefractionTabs> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Tab Headers
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: colors.muted,
            borderRadius: BorderRadius.circular(theme.borderRadius),
          ),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(widget.tabs.length, (index) {
                final isSelected = _currentIndex == index;
                return GestureDetector(
                  onTap: () => setState(() => _currentIndex = index),
                  behavior: HitTestBehavior.opaque,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? colors.background
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(
                        theme.borderRadius - 2,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.05),
                                blurRadius: 2,
                                offset: const Offset(0, 1),
                              ),
                            ]
                          : [],
                    ),
                    child: Text(
                      widget.tabs[index],
                      style: TextStyle(
                        color: isSelected
                            ? colors.foreground
                            : colors.mutedForeground,
                        fontWeight: isSelected
                            ? FontWeight.w600
                            : FontWeight.w500,
                        fontSize: 14,
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
        const SizedBox(height: 16),
        // Tab Content
        widget.children[_currentIndex],
      ],
    );
  }
}
