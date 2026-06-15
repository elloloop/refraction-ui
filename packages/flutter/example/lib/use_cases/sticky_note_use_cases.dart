import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/sticky_note.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default (Yellow)', type: RefractionStickyNote)
Widget stickyNoteDefaultUseCase(BuildContext context) {
  return const _InteractiveStickyNote(color: StickyNoteColor.yellow);
}

@widgetbook.UseCase(name: 'Pink Note', type: RefractionStickyNote)
Widget stickyNotePinkUseCase(BuildContext context) {
  return const _InteractiveStickyNote(color: StickyNoteColor.pink);
}

@widgetbook.UseCase(name: 'Blue Note', type: RefractionStickyNote)
Widget stickyNoteBlueUseCase(BuildContext context) {
  return const _InteractiveStickyNote(color: StickyNoteColor.blue);
}

@widgetbook.UseCase(name: 'Green Note', type: RefractionStickyNote)
Widget stickyNoteGreenUseCase(BuildContext context) {
  return const _InteractiveStickyNote(color: StickyNoteColor.green);
}

@widgetbook.UseCase(name: 'Purple Note', type: RefractionStickyNote)
Widget stickyNotePurpleUseCase(BuildContext context) {
  return const _InteractiveStickyNote(color: StickyNoteColor.purple);
}

@widgetbook.UseCase(name: 'Orange Note', type: RefractionStickyNote)
Widget stickyNoteOrangeUseCase(BuildContext context) {
  return const _InteractiveStickyNote(color: StickyNoteColor.orange);
}

class _InteractiveStickyNote extends StatefulWidget {
  final StickyNoteColor color;

  const _InteractiveStickyNote({required this.color});

  @override
  State<_InteractiveStickyNote> createState() => _InteractiveStickyNoteState();
}

class _InteractiveStickyNoteState extends State<_InteractiveStickyNote> {
  double _x = 50.0;
  double _y = 50.0;
  String _text = 'Hello World!\nTry typing and dragging me.';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          RefractionStickyNote(
            color: widget.color,
            text: _text,
            onTextChange: (val) {
              setState(() {
                _text = val;
              });
            },
            author: 'Jane Doe',
            x: _x,
            y: _y,
            draggable: true,
            onMove: (offset) {
              setState(() {
                _x = offset.dx;
                _y = offset.dy;
              });
            },
          ),
        ],
      ),
    );
  }
}
