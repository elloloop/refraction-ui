import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_theme.dart';

/// A single selectable entry inside a [RefractionCommandMenu].
class RefractionCommandItem {
  /// Leading icon displayed beside [label].
  final Widget icon;

  /// Human-readable label, also used for substring filtering against the
  /// search query.
  final String label;

  /// Optional keyboard shortcut hint, displayed at the trailing edge —
  /// for example `'⌘K'`. Purely informational; the menu does not bind it.
  final String? shortcut;

  /// Invoked when the user taps the item or presses `Enter` while it is
  /// highlighted.
  final VoidCallback onSelected;

  /// Creates a [RefractionCommandItem].
  const RefractionCommandItem({
    required this.icon,
    required this.label,
    this.shortcut,
    required this.onSelected,
  });
}

/// A named cluster of [RefractionCommandItem]s rendered under a single
/// heading inside a [RefractionCommandMenu].
class RefractionCommandGroup {
  /// Section heading rendered in uppercase muted text.
  final String heading;

  /// Items belonging to this group, in display order.
  final List<RefractionCommandItem> items;

  /// Creates a [RefractionCommandGroup].
  const RefractionCommandGroup({
    required this.heading,
    required this.items,
  });
}

/// A searchable command palette — the equivalent of macOS Spotlight or
/// VS Code's command palette.
///
/// Renders a search field followed by [groups] of items. Typing in the field
/// filters items whose [RefractionCommandItem.label] contains the (case-
/// insensitive) query. Use the up/down arrow keys to move the highlight and
/// `Enter` to invoke the highlighted item's [RefractionCommandItem.onSelected].
///
/// Mirrors the shadcn-ui `Command` primitive shipped in the React, Angular,
/// and Astro Refraction UI packages.
///
/// ```dart
/// RefractionCommandMenu(
///   placeholder: 'Search actions...',
///   groups: [
///     RefractionCommandGroup(
///       heading: 'General',
///       items: [
///         RefractionCommandItem(
///           icon: const Icon(Icons.settings),
///           label: 'Open Settings',
///           shortcut: 'Cmd+,',
///           onSelected: () => openSettings(),
///         ),
///       ],
///     ),
///   ],
/// )
/// ```
class RefractionCommandMenu extends StatefulWidget {
  /// Groups of commands rendered inside the menu.
  final List<RefractionCommandGroup> groups;

  /// Hint text for the search field. Defaults to
  /// `'Type a command or search...'`.
  final String placeholder;

  /// Creates a [RefractionCommandMenu].
  const RefractionCommandMenu({
    super.key,
    required this.groups,
    this.placeholder = 'Type a command or search...',
  });

  @override
  State<RefractionCommandMenu> createState() => _RefractionCommandMenuState();
}

class _RefractionCommandMenuState extends State<RefractionCommandMenu> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  String _searchQuery = '';
  int _selectedIndex = 0;
  
  List<RefractionCommandItem> _flatItems = [];

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.toLowerCase();
        _selectedIndex = 0;
      });
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _handleKeyEvent(KeyEvent event) {
    if (event is KeyDownEvent || event is KeyRepeatEvent) {
      if (event.logicalKey == LogicalKeyboardKey.arrowDown) {
        setState(() {
          if (_selectedIndex < _flatItems.length - 1) {
            _selectedIndex++;
          }
        });
      } else if (event.logicalKey == LogicalKeyboardKey.arrowUp) {
        setState(() {
          if (_selectedIndex > 0) {
            _selectedIndex--;
          }
        });
      } else if (event.logicalKey == LogicalKeyboardKey.enter) {
        if (_flatItems.isNotEmpty && _selectedIndex < _flatItems.length) {
          _flatItems[_selectedIndex].onSelected();
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    
    final filteredGroups = widget.groups.map((group) {
      final items = group.items.where((item) => item.label.toLowerCase().contains(_searchQuery)).toList();
      return RefractionCommandGroup(heading: group.heading, items: items);
    }).where((group) => group.items.isNotEmpty).toList();

    _flatItems = filteredGroups.expand((g) => g.items).toList();

    int globalIndex = 0;

    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(maxHeight: 400),
      decoration: BoxDecoration(
        color: theme.colors.background,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: theme.colors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          KeyboardListener(
            focusNode: _focusNode,
            onKeyEvent: _handleKeyEvent,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              child: Row(
                children: [
                  Icon(Icons.search, color: theme.colors.mutedForeground, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      style: theme.textStyle.copyWith(
                        color: theme.colors.foreground,
                        fontSize: 16,
                      ),
                      decoration: InputDecoration(
                        hintText: widget.placeholder,
                        hintStyle: theme.textStyle.copyWith(
                          color: theme.colors.mutedForeground,
                          fontSize: 16,
                        ),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Divider(height: 1, thickness: 1, color: theme.colors.border),
          Flexible(
            child: _flatItems.isEmpty
                ? Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Text(
                      "No results found.",
                      style: theme.textStyle.copyWith(
                        color: theme.colors.mutedForeground,
                      ),
                    ),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 8.0),
                    itemCount: filteredGroups.length,
                    itemBuilder: (context, groupIndex) {
                      final group = filteredGroups[groupIndex];
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 6.0),
                            child: Text(
                              group.heading.toUpperCase(),
                              style: theme.textStyle.copyWith(
                                color: theme.colors.mutedForeground,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          ...group.items.map((item) {
                            final isSelected = globalIndex == _selectedIndex;
                            final currentIndex = globalIndex;
                            globalIndex++;
                            
                            return GestureDetector(
                              onTap: item.onSelected,
                              behavior: HitTestBehavior.opaque,
                              child: MouseRegion(
                                onEnter: (_) {
                                  setState(() {
                                    _selectedIndex = currentIndex;
                                  });
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
                                  margin: const EdgeInsets.symmetric(vertical: 2.0),
                                  decoration: BoxDecoration(
                                    color: isSelected ? theme.colors.accent : Colors.transparent,
                                    borderRadius: BorderRadius.circular(theme.borderRadius - 2),
                                  ),
                                  child: Row(
                                    children: [
                                      IconTheme(
                                        data: IconThemeData(
                                          color: isSelected ? theme.colors.accentForeground : theme.colors.foreground,
                                          size: 16,
                                        ),
                                        child: item.icon,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Text(
                                          item.label,
                                          style: theme.textStyle.copyWith(
                                            color: isSelected ? theme.colors.accentForeground : theme.colors.foreground,
                                            fontSize: 14,
                                          ),
                                        ),
                                      ),
                                      if (item.shortcut != null) ...[
                                        const SizedBox(width: 12),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 2.0),
                                          decoration: BoxDecoration(
                                            color: isSelected ? theme.colors.background : theme.colors.muted,
                                            borderRadius: BorderRadius.circular(4.0),
                                            border: Border.all(color: theme.colors.border),
                                          ),
                                          child: Text(
                                            item.shortcut!,
                                            style: theme.textStyle.copyWith(
                                              color: theme.colors.mutedForeground,
                                              fontSize: 10,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                              ),
                            );
                          }),
                        ],
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
