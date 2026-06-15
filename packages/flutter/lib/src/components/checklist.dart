import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_theme.dart';

/// Data describing a single item in a checklist.
class RefractionChecklistItemData {
  /// Unique identifier for this item.
  final String id;

  /// Display label for the item.
  final String label;

  /// Whether the item is checked.
  final bool checked;

  /// Optional additional description text.
  final String? description;

  /// Creates a [RefractionChecklistItemData].
  const RefractionChecklistItemData({
    required this.id,
    required this.label,
    this.checked = false,
    this.description,
  });

  /// Copy with helper to easily toggle/update checked status.
  RefractionChecklistItemData copyWith({
    bool? checked,
  }) {
    return RefractionChecklistItemData(
      id: id,
      label: label,
      checked: checked ?? this.checked,
      description: description,
    );
  }
}

/// An interactive task list with optional progress summary.
///
/// Mirrors the React/Astro `Checklist` component. Supports controlled (`items`)
/// and uncontrolled (`defaultItems`) usage. Clicking an item toggles its state,
/// and checked items are visually rendered with strikethrough/muted colors.
///
/// ```dart
/// RefractionChecklist(
///   items: checklistItems,
///   onItemToggle: (id) => print('Toggled item $id'),
///   showProgress: true,
/// )
/// ```
class RefractionChecklist extends StatefulWidget {
  /// Controlled list of items.
  final List<RefractionChecklistItemData>? items;

  /// Initial items for uncontrolled usage.
  final List<RefractionChecklistItemData>? defaultItems;

  /// Called when an item is toggled, with the updated items list.
  final ValueChanged<List<RefractionChecklistItemData>>? onChange;

  /// Called with the id of the item that was toggled.
  final ValueChanged<String>? onItemToggle;

  /// Show a "completed/total completed" progress summary below the list.
  final bool showProgress;

  /// Creates a [RefractionChecklist].
  const RefractionChecklist({
    super.key,
    this.items,
    this.defaultItems,
    this.onChange,
    this.onItemToggle,
    this.showProgress = false,
  });

  @override
  State<RefractionChecklist> createState() => _RefractionChecklistState();
}

class _RefractionChecklistState extends State<RefractionChecklist> {
  List<RefractionChecklistItemData>? _internalItems;

  bool get _isControlled => widget.items != null;
  List<RefractionChecklistItemData> get _activeItems =>
      _isControlled ? widget.items! : (_internalItems ?? const []);

  @override
  void initState() {
    super.initState();
    if (!_isControlled) {
      _internalItems = List.from(widget.defaultItems ?? const []);
    }
  }

  void _handleToggle(String id) {
    final nextItems = _activeItems.map((item) {
      if (item.id == id) {
        return item.copyWith(checked: !item.checked);
      }
      return item;
    }).toList();

    if (!_isControlled) {
      setState(() {
        _internalItems = nextItems;
      });
    }

    widget.onChange?.call(nextItems);
    widget.onItemToggle?.call(id);
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final items = _activeItems;

    final completed = items.where((item) => item.checked).length;
    final total = items.length;

    return Semantics(
      container: true,
      label: 'Checklist',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              for (var i = 0; i < items.length; i++)
                Padding(
                  padding: EdgeInsets.only(top: i == 0 ? 0 : 4.0),
                  child: _ChecklistItem(
                    item: items[i],
                    onTap: () => _handleToggle(items[i].id),
                  ),
                ),
            ],
          ),
          if (widget.showProgress) ...[
            const SizedBox(height: 8.0),
            Text(
              '$completed/$total completed',
              style: theme.data.textStyle.copyWith(
                fontSize: 12.0,
                color: colors.mutedForeground,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ChecklistItem extends StatefulWidget {
  final RefractionChecklistItemData item;
  final VoidCallback onTap;

  const _ChecklistItem({
    required this.item,
    required this.onTap,
  });

  @override
  State<_ChecklistItem> createState() => _ChecklistItemState();
}

class _ChecklistItemState extends State<_ChecklistItem> {
  bool _hovered = false;
  final FocusNode _focusNode = FocusNode();

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;
    final checked = widget.item.checked;

    Color labelColor = checked ? colors.mutedForeground : colors.foreground;
    TextDecoration labelDecoration = checked ? TextDecoration.lineThrough : TextDecoration.none;

    Widget checkboxBox;
    if (checked) {
      checkboxBox = Container(
        width: 16.0,
        height: 16.0,
        decoration: BoxDecoration(
          color: colors.primary,
          border: Border.all(color: colors.primary),
          borderRadius: BorderRadius.circular(4.0),
        ),
        alignment: Alignment.center,
        child: Icon(
          Icons.check,
          size: 12.0,
          color: colors.primaryForeground,
        ),
      );
    } else {
      checkboxBox = Container(
        width: 16.0,
        height: 16.0,
        decoration: BoxDecoration(
          color: colors.background,
          border: Border.all(color: colors.input),
          borderRadius: BorderRadius.circular(4.0),
        ),
      );
    }

    return Semantics(
      checked: checked,
      label: widget.item.label,
      value: checked ? 'checked' : 'unchecked',
      child: Focus(
        focusNode: _focusNode,
        onKeyEvent: (_, event) {
          if (event is KeyDownEvent &&
              (event.logicalKey == LogicalKeyboardKey.space ||
                  event.logicalKey == LogicalKeyboardKey.enter)) {
            widget.onTap();
            return KeyEventResult.handled;
          }
          return KeyEventResult.ignored;
        },
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          onEnter: (_) => setState(() => _hovered = true),
          onExit: (_) => setState(() => _hovered = false),
          child: GestureDetector(
            onTap: () {
              _focusNode.requestFocus();
              widget.onTap();
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
              decoration: BoxDecoration(
                color: _hovered ? colors.accent : Colors.transparent,
                borderRadius: BorderRadius.circular(theme.borderRadius),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(top: 2.0),
                    child: checkboxBox,
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          widget.item.label,
                          style: theme.data.textStyle.copyWith(
                            fontSize: 14.0,
                            fontWeight: FontWeight.w500,
                            color: labelColor,
                            decoration: labelDecoration,
                            decorationColor: colors.mutedForeground,
                          ),
                        ),
                        if (widget.item.description != null &&
                            widget.item.description!.isNotEmpty) ...[
                          const SizedBox(height: 2.0),
                          Text(
                            widget.item.description!,
                            style: theme.data.textStyle.copyWith(
                              fontSize: 12.0,
                              color: colors.mutedForeground,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
