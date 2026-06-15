import 'package:flutter/material.dart';

/// Data for a single collaborator cursor.
class CursorData {
  final String id;
  final String name;
  final double x;
  final double y;
  final Color? color;

  const CursorData({
    required this.id,
    required this.name,
    required this.x,
    required this.y,
    this.color,
  });
}

/// A fixed palette of 8 colors for collaborator cursors.
const List<Color> cursorColors = [
  Color(0xFFE94560), // red
  Color(0xFFF57C00), // orange
  Color(0xFFF9C840), // yellow
  Color(0xFF4CAF50), // green
  Color(0xFF00ACC1), // cyan
  Color(0xFF5C6BC0), // indigo
  Color(0xFFAB47BC), // purple
  Color(0xFFEC407A), // pink
];

/// Assign a stable color to a cursor.
Color assignCursorColor(String id, [int? index]) {
  if (index != null) {
    return cursorColors[index % cursorColors.length];
  }

  // djb2 hash — deterministic, no side-effects
  int hash = 5381;
  for (int i = 0; i < id.codeUnits.length; i++) {
    hash = (((hash << 5) + hash) ^ id.codeUnitAt(i)) & 0xFFFFFFFF;
  }
  return cursorColors[hash % cursorColors.length];
}

/// LiveCursors — an overlay that renders collaborator cursors on a surface.
class RefractionLiveCursors extends StatelessWidget {
  /// Array of collaborator cursor data to render.
  final List<CursorData> cursors;

  const RefractionLiveCursors({
    super.key,
    required this.cursors,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: IgnorePointer(
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            for (int i = 0; i < cursors.length; i++)
              _buildCursor(cursors[i], i),
          ],
        ),
      ),
    );
  }

  Widget _buildCursor(CursorData cursor, int index) {
    final Color color = cursor.color ?? assignCursorColor(cursor.id, index);

    return Positioned(
      left: cursor.x,
      top: cursor.y,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          CustomPaint(
            size: const Size(20, 20),
            painter: _CursorArrowPainter(color),
          ),
          Padding(
            padding: const EdgeInsets.only(top: 2, left: 8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(4),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 2,
                    offset: Offset(0, 1),
                  ),
                ],
              ),
              child: Text(
                cursor.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  decoration: TextDecoration.none,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CursorArrowPainter extends CustomPainter {
  final Color color;

  _CursorArrowPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path()
      ..moveTo(3, 2)
      ..lineTo(17, 9.5)
      ..lineTo(10.5, 11.5)
      ..lineTo(8, 18)
      ..close();

    final fillPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final strokePaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke
      ..strokeJoin = StrokeJoin.round;

    canvas.drawPath(path, fillPaint);
    canvas.drawPath(path, strokePaint);
  }

  @override
  bool shouldRepaint(covariant _CursorArrowPainter oldDelegate) {
    return oldDelegate.color != color;
  }
}
