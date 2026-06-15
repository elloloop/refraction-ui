import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Available colors for a sticky note.
enum StickyNoteColor {
  yellow,
  pink,
  blue,
  green,
  purple,
  orange,
}

/// StickyNote — a draggable colored note for whiteboard / canvas surfaces.
class RefractionStickyNote extends StatefulWidget {
  /// Color variant of the sticky note.
  final StickyNoteColor color;

  /// Text content of the note.
  final String? text;

  /// Called when the text changes (makes text editable via a TextField).
  final ValueChanged<String>? onTextChange;

  /// Optional author name shown in the note footer.
  final String? author;

  /// Absolute x position in pixels (for board/canvas placement).
  final double? x;

  /// Absolute y position in pixels (for board/canvas placement).
  final double? y;

  /// Whether the note can be dragged. Requires `onMove` to receive updates.
  final bool draggable;

  /// Called with the new position after a drag update.
  final ValueChanged<Offset>? onMove;

  /// Optional custom child widget to display inside the note.
  final Widget? child;

  const RefractionStickyNote({
    super.key,
    this.color = StickyNoteColor.yellow,
    this.text,
    this.onTextChange,
    this.author,
    this.x,
    this.y,
    this.draggable = false,
    this.onMove,
    this.child,
  });

  @override
  State<RefractionStickyNote> createState() => _RefractionStickyNoteState();
}

class _RefractionStickyNoteState extends State<RefractionStickyNote> {
  double _startX = 0.0;
  double _startY = 0.0;

  Color _getBackgroundColor() {
    switch (widget.color) {
      case StickyNoteColor.yellow:
        return const Color(0xFFFEF9C3); // yellow-100
      case StickyNoteColor.pink:
        return const Color(0xFFFCE7F3); // pink-100
      case StickyNoteColor.blue:
        return const Color(0xFFDBEAFE); // blue-100
      case StickyNoteColor.green:
        return const Color(0xFFDCFCE7); // green-100
      case StickyNoteColor.purple:
        return const Color(0xFFF3E8FF); // purple-100
      case StickyNoteColor.orange:
        return const Color(0xFFFFEDD5); // orange-100
    }
  }

  Color _getTextColor() {
    switch (widget.color) {
      case StickyNoteColor.yellow:
        return const Color(0xFF713F12); // yellow-900
      case StickyNoteColor.pink:
        return const Color(0xFF831843); // pink-900
      case StickyNoteColor.blue:
        return const Color(0xFF1E3A8A); // blue-900
      case StickyNoteColor.green:
        return const Color(0xFF065F46); // green-900
      case StickyNoteColor.purple:
        return const Color(0xFF581C87); // purple-900
      case StickyNoteColor.orange:
        return const Color(0xFF7C2D12); // orange-900
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final Color bgColor = _getBackgroundColor();
    final Color textColor = _getTextColor();

    Widget noteContent = Container(
      constraints: const BoxConstraints(
        minWidth: 160,
        minHeight: 120,
      ),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        boxShadow: theme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Expanded(
            child: widget.onTextChange != null
                ? _StickyNoteTextArea(
                    text: widget.text ?? '',
                    onTextChange: widget.onTextChange,
                    textColor: textColor,
                  )
                : widget.child ??
                    Text(
                      widget.text ?? '',
                      style: TextStyle(
                        color: textColor,
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),
          ),
          if (widget.author != null) ...[
            const SizedBox(height: 8),
            Text(
              widget.author!,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: textColor.withOpacity(0.7),
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );

    if (widget.draggable && widget.onMove != null) {
      noteContent = GestureDetector(
        onPanStart: (details) {
          _startX = widget.x ?? 0.0;
          _startY = widget.y ?? 0.0;
        },
        onPanUpdate: (details) {
          _startX += details.delta.dx;
          _startY += details.delta.dy;
          widget.onMove?.call(Offset(_startX, _startY));
        },
        child: noteContent,
      );
    }

    if (widget.x != null && widget.y != null) {
      return Positioned(
        left: widget.x,
        top: widget.y,
        child: noteContent,
      );
    }

    return noteContent;
  }
}

class _StickyNoteTextArea extends StatefulWidget {
  final String text;
  final ValueChanged<String>? onTextChange;
  final Color textColor;

  const _StickyNoteTextArea({
    required this.text,
    required this.onTextChange,
    required this.textColor,
  });

  @override
  State<_StickyNoteTextArea> createState() => _StickyNoteTextAreaState();
}

class _StickyNoteTextAreaState extends State<_StickyNoteTextArea> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.text);
  }

  @override
  void didUpdateWidget(covariant _StickyNoteTextArea oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.text != _controller.text) {
      _controller.text = widget.text;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      maxLines: null,
      keyboardType: TextInputType.multiline,
      style: TextStyle(
        color: widget.textColor,
        fontSize: 14,
        height: 1.4,
      ),
      cursorColor: widget.textColor,
      decoration: const InputDecoration(
        hintText: 'Type a note…',
        hintStyle: TextStyle(color: Colors.black38),
        border: InputBorder.none,
        isDense: true,
        contentPadding: EdgeInsets.zero,
      ),
      onChanged: widget.onTextChange,
    );
  }
}
