import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class RefractionMenuItem {
  final Widget? icon;
  final String label;
  final String? shortcut;
  final VoidCallback onSelected;

  const RefractionMenuItem({
    this.icon,
    required this.label,
    this.shortcut,
    required this.onSelected,
  });
}

class RefractionDropdownMenu extends StatefulWidget {
  final Widget trigger;
  final List<RefractionMenuItem> items;
  final double width;

  const RefractionDropdownMenu({
    super.key,
    required this.trigger,
    required this.items,
    this.width = 220,
  });

  @override
  State<RefractionDropdownMenu> createState() => _RefractionDropdownMenuState();
}

class _RefractionDropdownMenuState extends State<RefractionDropdownMenu> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _isOpen = false;

  void _toggleMenu() {
    if (_isOpen) {
      _closeMenu();
    } else {
      _openMenu();
    }
  }

  void _openMenu() {
    if (_overlayEntry != null) return;

    _overlayEntry = _createOverlayEntry();
    Overlay.of(context).insert(_overlayEntry!);
    setState(() {
      _isOpen = true;
    });
  }

  void _closeMenu() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    if (mounted) {
      setState(() {
        _isOpen = false;
      });
    }
  }

  OverlayEntry _createOverlayEntry() {
    final theme = RefractionTheme.of(context).data;
    
    return OverlayEntry(
      builder: (context) {
        return Stack(
          children: [
            GestureDetector(
              behavior: HitTestBehavior.translucent,
              onTap: _closeMenu,
              child: Container(
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.height,
                color: Colors.transparent,
              ),
            ),
            CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              offset: const Offset(0, 48), // Adjust based on trigger height
              child: Material(
                color: Colors.transparent,
                child: Container(
                  width: widget.width,
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
                    children: widget.items.map((item) {
                      return InkWell(
                        onTap: () {
                          _closeMenu();
                          item.onSelected();
                        },
                        borderRadius: BorderRadius.circular(theme.borderRadius - 2),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
                          margin: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 2.0),
                          child: Row(
                            children: [
                              if (item.icon != null) ...[
                                IconTheme(
                                  data: IconThemeData(
                                    color: theme.colors.foreground,
                                    size: 16,
                                  ),
                                  child: item.icon!,
                                ),
                                const SizedBox(width: 12),
                              ],
                              Expanded(
                                child: Text(
                                  item.label,
                                  style: theme.textStyle.copyWith(
                                    color: theme.colors.foreground,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                              if (item.shortcut != null) ...[
                                const SizedBox(width: 12),
                                Text(
                                  item.shortcut!,
                                  style: theme.textStyle.copyWith(
                                    color: theme.colors.mutedForeground,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: GestureDetector(
        onTap: _toggleMenu,
        child: widget.trigger,
      ),
    );
  }
}
