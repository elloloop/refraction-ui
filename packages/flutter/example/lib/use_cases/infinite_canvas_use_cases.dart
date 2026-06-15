import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/infinite_canvas.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionInfiniteCanvas)
Widget infiniteCanvasDefaultUseCase(BuildContext context) {
  return Scaffold(
    body: RefractionInfiniteCanvas(
      showGrid: true,
      showControls: true,
      contentBounds: const CanvasBounds(minX: 0, minY: 0, maxX: 1000, maxY: 1000),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            left: 100,
            top: 100,
            child: Container(
              width: 200,
              height: 200,
              color: Colors.blue.withOpacity(0.5),
              child: const Center(
                child: Text('Drag to pan\nScroll to zoom', textAlign: TextAlign.center),
              ),
            ),
          ),
          Positioned(
            left: 400,
            top: 300,
            child: Container(
              width: 150,
              height: 150,
              color: Colors.green.withOpacity(0.5),
              child: const Center(
                child: Text('Element 2'),
              ),
            ),
          ),
        ],
      ),
    ),
  );
}
