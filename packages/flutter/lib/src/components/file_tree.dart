import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_theme.dart';

/// A single node in a [RefractionFileTree].
///
/// Can represent either a file or a folder (which can contain [children]).
class RefractionFileTreeNode {
  /// Unique identifier for this node.
  final String id;

  /// The text displayed for this node.
  final String label;

  /// Whether this node acts as a folder (can be expanded/collapsed).
  final bool isFolder;

  /// The child nodes if [isFolder] is true.
  final List<RefractionFileTreeNode>? children;

  /// Optional icon to display next to the label. If null, a default folder
  /// or file icon is used based on [isFolder] and expanded state.
  final Widget? icon;

  /// Creates a file tree node.
  const RefractionFileTreeNode({
    required this.id,
    required this.label,
    this.isFolder = false,
    this.children,
    this.icon,
  });
}

/// A highly customizable, deeply nestable file tree component themed with
/// [RefractionTheme].
///
/// This component is the Flutter equivalent of a headless file tree, handling
/// keyboard navigation, selection, and expansion state natively.
class RefractionFileTree extends StatefulWidget {
  /// The root-level nodes of the tree.
  final List<RefractionFileTreeNode> nodes;

  /// Set of currently expanded folder node IDs. If provided, the tree's
  /// expansion state is completely controlled by the parent.
  final Set<String>? expandedIds;

  /// The ID of the currently selected node, if any.
  final String? selectedId;

  /// Callback fired when a node is tapped (whether it's a file or folder).
  final ValueChanged<String>? onNodeSelect;

  /// Callback fired when a folder's expansion state is toggled.
  final ValueChanged<String>? onNodeToggle;

  /// The indent in pixels for each level of nesting. Defaults to 16.0.
  final double indent;

  /// Creates a [RefractionFileTree].
  const RefractionFileTree({
    super.key,
    required this.nodes,
    this.expandedIds,
    this.selectedId,
    this.onNodeSelect,
    this.onNodeToggle,
    this.indent = 16.0,
  });

  @override
  State<RefractionFileTree> createState() => _RefractionFileTreeState();
}

class _RefractionFileTreeState extends State<RefractionFileTree> {
  late Set<String> _internalExpandedIds;

  // Track the currently focused node ID for keyboard navigation.
  String? _focusedId;

  late FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    _internalExpandedIds = widget.expandedIds ?? {};
    _focusNode = FocusNode();
  }

  @override
  void didUpdateWidget(RefractionFileTree oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.expandedIds != null) {
      _internalExpandedIds = widget.expandedIds!;
    }
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  bool _isExpanded(String id) {
    return _internalExpandedIds.contains(id);
  }

  void _toggleNode(String id) {
    if (widget.expandedIds == null) {
      setState(() {
        if (_internalExpandedIds.contains(id)) {
          _internalExpandedIds.remove(id);
        } else {
          _internalExpandedIds.add(id);
        }
      });
    }
    widget.onNodeToggle?.call(id);
  }

  void _selectNode(String id) {
    widget.onNodeSelect?.call(id);
    setState(() {
      _focusedId = id;
    });
    if (!_focusNode.hasFocus) {
      _focusNode.requestFocus();
    }
  }

  List<RefractionFileTreeNode> _flattenTree(
    List<RefractionFileTreeNode> nodes,
  ) {
    final List<RefractionFileTreeNode> flat = [];
    void traverse(List<RefractionFileTreeNode> currentNodes) {
      for (final node in currentNodes) {
        flat.add(node);
        if (node.isFolder && _isExpanded(node.id) && node.children != null) {
          traverse(node.children!);
        }
      }
    }

    traverse(nodes);
    return flat;
  }

  void _handleKeyEvent(KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) return;

    final flatNodes = _flattenTree(widget.nodes);
    if (flatNodes.isEmpty) return;

    final currentIndex = flatNodes.indexWhere((n) => n.id == _focusedId);

    if (event.logicalKey == LogicalKeyboardKey.arrowDown) {
      if (currentIndex < flatNodes.length - 1) {
        setState(
          () => _focusedId =
              flatNodes[currentIndex >= 0 ? currentIndex + 1 : 0].id,
        );
      } else if (currentIndex == -1) {
        setState(() => _focusedId = flatNodes[0].id);
      }
    } else if (event.logicalKey == LogicalKeyboardKey.arrowUp) {
      if (currentIndex > 0) {
        setState(() => _focusedId = flatNodes[currentIndex - 1].id);
      } else if (currentIndex == -1) {
        setState(() => _focusedId = flatNodes.last.id);
      }
    } else if (event.logicalKey == LogicalKeyboardKey.enter ||
        event.logicalKey == LogicalKeyboardKey.space) {
      if (currentIndex >= 0) {
        final node = flatNodes[currentIndex];
        if (node.isFolder) {
          _toggleNode(node.id);
        } else {
          _selectNode(node.id);
        }
      }
    } else if (event.logicalKey == LogicalKeyboardKey.arrowRight) {
      if (currentIndex >= 0) {
        final node = flatNodes[currentIndex];
        if (node.isFolder && !_isExpanded(node.id)) {
          _toggleNode(node.id);
        } else if (node.isFolder &&
            _isExpanded(node.id) &&
            currentIndex < flatNodes.length - 1) {
          setState(() => _focusedId = flatNodes[currentIndex + 1].id);
        }
      }
    } else if (event.logicalKey == LogicalKeyboardKey.arrowLeft) {
      if (currentIndex >= 0) {
        final node = flatNodes[currentIndex];
        if (node.isFolder && _isExpanded(node.id)) {
          _toggleNode(node.id);
        } else {
          // Move to parent
          _focusedId = _findParentId(widget.nodes, node.id) ?? _focusedId;
          setState(() {});
        }
      }
    }
  }

  String? _findParentId(List<RefractionFileTreeNode> nodes, String targetId) {
    for (final node in nodes) {
      if (node.isFolder && node.children != null) {
        if (node.children!.any((c) => c.id == targetId)) {
          return node.id;
        }
        final found = _findParentId(node.children!, targetId);
        if (found != null) return found;
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Focus(
      focusNode: _focusNode,
      onKeyEvent: (node, event) {
        _handleKeyEvent(event);
        return KeyEventResult.handled;
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: widget.nodes.map((node) => _buildNode(node, 0)).toList(),
      ),
    );
  }

  Widget _buildNode(RefractionFileTreeNode node, int depth) {
    final colors = RefractionTheme.of(context).colors;
    final isSelected = widget.selectedId == node.id;
    final isFocused = _focusedId == node.id;
    final isExpanded = _isExpanded(node.id);

    Widget content = Padding(
      padding: EdgeInsets.only(left: widget.indent * depth),
      child: InkWell(
        onTap: () {
          if (node.isFolder) {
            _toggleNode(node.id);
          }
          _selectNode(node.id);
        },
        borderRadius: BorderRadius.circular(4),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(4),
            color: isSelected
                ? colors.accent
                : isFocused
                ? colors.muted.withValues(alpha: 0.5)
                : Colors.transparent,
            border: isFocused && !isSelected
                ? Border.all(color: colors.border)
                : Border.all(color: Colors.transparent),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          child: Row(
            children: [
              if (node.isFolder)
                Icon(
                  isExpanded
                      ? Icons.keyboard_arrow_down
                      : Icons.keyboard_arrow_right,
                  size: 16,
                  color: colors.mutedForeground,
                )
              else
                const SizedBox(width: 16),
              const SizedBox(width: 4),
              if (node.icon != null) ...[
                IconTheme(
                  data: IconThemeData(
                    size: 16,
                    color: isSelected
                        ? colors.foreground
                        : colors.mutedForeground,
                  ),
                  child: node.icon!,
                ),
                const SizedBox(width: 8),
              ] else ...[
                Icon(
                  node.isFolder
                      ? (isExpanded ? Icons.folder_open : Icons.folder)
                      : Icons.insert_drive_file_outlined,
                  size: 16,
                  color: isSelected
                      ? colors.foreground
                      : colors.mutedForeground,
                ),
                const SizedBox(width: 8),
              ],
              Expanded(
                child: Text(
                  node.label,
                  style: TextStyle(
                    fontSize: 14,
                    color: isSelected
                        ? colors.foreground
                        : colors.mutedForeground,
                    fontWeight: isSelected ? FontWeight.w500 : FontWeight.w400,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );

    if (node.isFolder && isExpanded && node.children != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          content,
          ...node.children!.map((child) => _buildNode(child, depth + 1)),
        ],
      );
    }

    return content;
  }
}
