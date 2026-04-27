import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class RefractionTabs extends StatefulWidget {
  final List<String> tabs;
  final List<Widget> children;
  final int initialIndex;

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
