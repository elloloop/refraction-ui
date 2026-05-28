import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../refraction_ui.dart';

class RefractionCommandItem {
  final String label;
  final Widget icon;
  final String? shortcut;
  final VoidCallback onSelected;

  const RefractionCommandItem({
    required this.label,
    required this.icon,
    this.shortcut,
    required this.onSelected,
  });
}

class RefractionCommandGroup {
  final String heading;
  final List<RefractionCommandItem> items;

  const RefractionCommandGroup({required this.heading, required this.items});
}

class RefractionCommand extends StatefulWidget {
  final String placeholder;
  final List<RefractionCommandGroup> groups;
  final double maxHeight;

  const RefractionCommand({
    super.key,
    this.placeholder = 'Type a command or search...',
    required this.groups,
    this.maxHeight = 400.0,
  });

  @override
  State<RefractionCommand> createState() => _RefractionCommandState();
}

class _RefractionCommandState extends State<RefractionCommand> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    setState(() {
      _selectedIndex = 0;
    });
  }

  void _handleKeyEvent(KeyEvent event) {
    if (event is! KeyDownEvent) return;

    final filteredGroups = _getFilteredGroups();
    int totalItems = filteredGroups.fold(
      0,
      (sum, group) => sum + group.items.length,
    );

    if (totalItems == 0) return;

    if (event.logicalKey == LogicalKeyboardKey.arrowDown) {
      setState(() {
        _selectedIndex = (_selectedIndex + 1) % totalItems;
      });
    } else if (event.logicalKey == LogicalKeyboardKey.arrowUp) {
      setState(() {
        _selectedIndex = (_selectedIndex - 1 + totalItems) % totalItems;
      });
    } else if (event.logicalKey == LogicalKeyboardKey.enter) {
      int currentIndex = 0;
      for (var group in filteredGroups) {
        for (var item in group.items) {
          if (currentIndex == _selectedIndex) {
            item.onSelected();
            return;
          }
          currentIndex++;
        }
      }
    }
  }

  List<RefractionCommandGroup> _getFilteredGroups() {
    final query = _searchController.text.toLowerCase();
    if (query.isEmpty) return widget.groups;

    return widget.groups
        .map((group) {
          final filteredItems = group.items.where((item) {
            return item.label.toLowerCase().contains(query);
          }).toList();
          return RefractionCommandGroup(
            heading: group.heading,
            items: filteredItems,
          );
        })
        .where((group) => group.items.isNotEmpty)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final filteredGroups = _getFilteredGroups();

    int globalIndex = 0;

    return Container(
      constraints: BoxConstraints(maxHeight: widget.maxHeight),
      decoration: BoxDecoration(
        color: theme.colors.background,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: theme.colors.border),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          KeyboardListener(
            focusNode: _focusNode,
            onKeyEvent: _handleKeyEvent,
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 12.0,
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.search,
                    color: theme.colors.mutedForeground,
                    size: 20,
                  ),
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
            child: filteredGroups.isEmpty
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
                    padding: const EdgeInsets.symmetric(
                      vertical: 8.0,
                      horizontal: 8.0,
                    ),
                    itemCount: filteredGroups.length,
                    itemBuilder: (context, groupIndex) {
                      final group = filteredGroups[groupIndex];
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8.0,
                              vertical: 6.0,
                            ),
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
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12.0,
                                    vertical: 10.0,
                                  ),
                                  margin: const EdgeInsets.symmetric(
                                    vertical: 2.0,
                                  ),
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? theme.colors.accent
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(
                                      theme.borderRadius - 2,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      IconTheme(
                                        data: IconThemeData(
                                          color: isSelected
                                              ? theme.colors.accentForeground
                                              : theme.colors.foreground,
                                          size: 16,
                                        ),
                                        child: item.icon,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Text(
                                          item.label,
                                          style: theme.textStyle.copyWith(
                                            color: isSelected
                                                ? theme.colors.accentForeground
                                                : theme.colors.foreground,
                                            fontSize: 14,
                                          ),
                                        ),
                                      ),
                                      if (item.shortcut != null) ...[
                                        const SizedBox(width: 12),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 6.0,
                                            vertical: 2.0,
                                          ),
                                          decoration: BoxDecoration(
                                            color: isSelected
                                                ? theme.colors.background
                                                : theme.colors.muted,
                                            borderRadius: BorderRadius.circular(
                                              4.0,
                                            ),
                                            border: Border.all(
                                              color: theme.colors.border,
                                            ),
                                          ),
                                          child: Text(
                                            item.shortcut!,
                                            style: theme.textStyle.copyWith(
                                              color:
                                                  theme.colors.mutedForeground,
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
