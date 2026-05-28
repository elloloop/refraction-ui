import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// An item in a [RefractionCombobox].
class RefractionComboboxItem<T> {
  /// The underlying value of the item.
  final T value;

  /// The text displayed for the item in the list and when selected.
  final String label;

  /// Creates a new combobox item.
  const RefractionComboboxItem({required this.value, required this.label});
}

/// A searchable dropdown component.
///
/// `RefractionCombobox` acts like a select but allows searching through the
/// options. It renders a trigger button that, when tapped, opens a popover
/// containing a search input and a filtered list of options.
///
/// The popover paints itself with [RefractionColors.popover] and animates
/// in with a quick scale + fade.
///
/// ```dart
/// RefractionCombobox<String>(
///   value: selectedCity,
///   items: const [
///     RefractionComboboxItem(value: 'sf', label: 'San Francisco'),
///     RefractionComboboxItem(value: 'nyc', label: 'New York'),
///   ],
///   onChanged: (val) => setState(() => selectedCity = val),
///   placeholder: 'Select a city...',
/// );
/// ```
class RefractionCombobox<T> extends StatefulWidget {
  /// The options available to select.
  final List<RefractionComboboxItem<T>> items;

  /// The currently selected value, or `null`.
  final T? value;

  /// Called when an item is selected.
  final ValueChanged<T?>? onChanged;

  /// Text shown when no value is selected.
  final String placeholder;

  /// Text shown in the search input inside the popover.
  final String searchPlaceholder;

  /// Text shown when no items match the search query.
  final String emptyText;

  /// Whether the combobox is disabled.
  final bool disabled;

  /// Creates a [RefractionCombobox].
  const RefractionCombobox({
    super.key,
    required this.items,
    this.value,
    this.onChanged,
    this.placeholder = 'Select an option...',
    this.searchPlaceholder = 'Search...',
    this.emptyText = 'No options found.',
    this.disabled = false,
  });

  @override
  State<RefractionCombobox<T>> createState() => _RefractionComboboxState<T>();
}

class _RefractionComboboxState<T> extends State<RefractionCombobox<T>> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  bool _isOpen = false;
  bool _isHovered = false;

  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();

  @override
  void dispose() {
    _closePopover(isDisposing: true);
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  void _togglePopover() {
    if (widget.disabled) return;
    if (_isOpen) {
      _closePopover();
    } else {
      _showPopover();
    }
  }

  void _showPopover() {
    final renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;
    final theme = RefractionTheme.of(context);

    _searchController.clear();

    _overlayEntry = OverlayEntry(
      builder: (context) {
        return Stack(
          children: [
            GestureDetector(
              behavior: HitTestBehavior.translucent,
              onTap: _closePopover,
              child: Container(color: Colors.transparent),
            ),
            Positioned(
              width: size.width,
              child: CompositedTransformFollower(
                link: _layerLink,
                showWhenUnlinked: false,
                offset: Offset(0, size.height + 8),
                child: Material(
                  color: Colors.transparent,
                  child: _ComboboxPopoverContent<T>(
                    items: widget.items,
                    value: widget.value,
                    searchController: _searchController,
                    searchFocusNode: _searchFocusNode,
                    onSelected: (val) {
                      widget.onChanged?.call(val);
                      _closePopover();
                    },
                    searchPlaceholder: widget.searchPlaceholder,
                    emptyText: widget.emptyText,
                    theme: theme,
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );

    Overlay.of(context).insert(_overlayEntry!);
    setState(() => _isOpen = true);

    Future.microtask(() {
      if (mounted && _isOpen) {
        _searchFocusNode.requestFocus();
      }
    });
  }

  void _closePopover({bool isDisposing = false}) {
    _overlayEntry?.remove();
    _overlayEntry = null;
    if (!isDisposing && mounted) {
      setState(() => _isOpen = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final backgroundColor = widget.disabled ? colors.muted : colors.background;
    final borderColor = _isOpen || (_isHovered && !widget.disabled)
        ? colors.ring
        : colors.input;

    final selectedItem = widget.items
        .where((i) => i.value == widget.value)
        .firstOrNull;

    return CompositedTransformTarget(
      link: _layerLink,
      child: Semantics(
        button: true,
        enabled: !widget.disabled,
        child: MouseRegion(
          onEnter: (_) => setState(() => _isHovered = true),
          onExit: (_) => setState(() => _isHovered = false),
          child: GestureDetector(
            onTap: _togglePopover,
            behavior: HitTestBehavior.opaque,
            child: Opacity(
              opacity: widget.disabled ? 0.5 : 1.0,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: backgroundColor,
                  border: Border.all(color: borderColor),
                  borderRadius: BorderRadius.circular(theme.borderRadius),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        selectedItem?.label ?? widget.placeholder,
                        style: TextStyle(
                          color: selectedItem != null
                              ? colors.foreground
                              : colors.mutedForeground,
                          fontSize: 14,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Icon(
                      Icons.unfold_more,
                      size: 16,
                      color: colors.mutedForeground,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ComboboxPopoverContent<T> extends StatefulWidget {
  final List<RefractionComboboxItem<T>> items;
  final T? value;
  final TextEditingController searchController;
  final FocusNode searchFocusNode;
  final ValueChanged<T> onSelected;
  final String searchPlaceholder;
  final String emptyText;
  final RefractionTheme theme;

  const _ComboboxPopoverContent({
    required this.items,
    required this.value,
    required this.searchController,
    required this.searchFocusNode,
    required this.onSelected,
    required this.searchPlaceholder,
    required this.emptyText,
    required this.theme,
  });

  @override
  State<_ComboboxPopoverContent<T>> createState() =>
      _ComboboxPopoverContentState<T>();
}

class _ComboboxPopoverContentState<T>
    extends State<_ComboboxPopoverContent<T>> {
  String _query = '';

  @override
  void initState() {
    super.initState();
    widget.searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    widget.searchController.removeListener(_onSearchChanged);
    super.dispose();
  }

  void _onSearchChanged() {
    setState(() {
      _query = widget.searchController.text.toLowerCase();
    });
  }

  @override
  Widget build(BuildContext context) {
    final colors = widget.theme.colors;
    final filteredItems = widget.items.where((item) {
      return item.label.toLowerCase().contains(_query);
    }).toList();

    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 150),
      curve: Curves.easeOutCubic,
      tween: Tween(begin: 0.95, end: 1.0),
      builder: (context, scale, child) {
        return Transform.scale(
          scale: scale,
          alignment: Alignment.topCenter,
          child: Opacity(
            opacity: ((scale - 0.95) * 20).clamp(0.0, 1.0),
            child: Container(
              decoration: BoxDecoration(
                color: colors.popover,
                borderRadius: BorderRadius.circular(widget.theme.borderRadius),
                border: Border.all(color: colors.border),
                boxShadow: widget.theme.data.heavyShadow,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12.0,
                      vertical: 12.0,
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.search,
                          size: 16,
                          color: colors.mutedForeground,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: widget.searchController,
                            focusNode: widget.searchFocusNode,
                            style: TextStyle(
                              color: colors.foreground,
                              fontSize: 14,
                            ),
                            decoration: InputDecoration(
                              hintText: widget.searchPlaceholder,
                              hintStyle: TextStyle(
                                color: colors.mutedForeground,
                                fontSize: 14,
                              ),
                              isDense: true,
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Divider(height: 1, thickness: 1, color: colors.border),
                  Flexible(
                    child: filteredItems.isEmpty
                        ? Padding(
                            padding: const EdgeInsets.symmetric(vertical: 24.0),
                            child: Text(
                              widget.emptyText,
                              style: TextStyle(
                                color: colors.mutedForeground,
                                fontSize: 14,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          )
                        : ConstrainedBox(
                            constraints: const BoxConstraints(maxHeight: 250),
                            child: ListView.builder(
                              shrinkWrap: true,
                              padding: const EdgeInsets.all(4.0),
                              itemCount: filteredItems.length,
                              itemBuilder: (context, index) {
                                final item = filteredItems[index];
                                final isSelected = item.value == widget.value;

                                return _ComboboxItem(
                                  item: item,
                                  isSelected: isSelected,
                                  onSelected: () =>
                                      widget.onSelected(item.value),
                                  theme: widget.theme,
                                );
                              },
                            ),
                          ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _ComboboxItem<T> extends StatefulWidget {
  final RefractionComboboxItem<T> item;
  final bool isSelected;
  final VoidCallback onSelected;
  final RefractionTheme theme;

  const _ComboboxItem({
    required this.item,
    required this.isSelected,
    required this.onSelected,
    required this.theme,
  });

  @override
  State<_ComboboxItem<T>> createState() => _ComboboxItemState<T>();
}

class _ComboboxItemState<T> extends State<_ComboboxItem<T>> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final colors = widget.theme.colors;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onSelected,
        behavior: HitTestBehavior.opaque,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          margin: const EdgeInsets.only(bottom: 2),
          decoration: BoxDecoration(
            color: _isHovered ? colors.accent : Colors.transparent,
            borderRadius: BorderRadius.circular(widget.theme.borderRadius - 2),
          ),
          child: Row(
            children: [
              SizedBox(
                width: 24,
                child: widget.isSelected
                    ? Icon(
                        Icons.check,
                        size: 16,
                        color: _isHovered
                            ? colors.accentForeground
                            : colors.foreground,
                      )
                    : null,
              ),
              Expanded(
                child: Text(
                  widget.item.label,
                  style: TextStyle(
                    color: _isHovered
                        ? colors.accentForeground
                        : colors.foreground,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
