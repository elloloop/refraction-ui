import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/mini_map.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Interactive Minimap', type: RefractionMiniMap)
Widget miniMapDefaultUseCase(BuildContext context) {
  return const _InteractiveMiniMap();
}

class _InteractiveMiniMap extends StatefulWidget {
  const _InteractiveMiniMap();

  @override
  State<_InteractiveMiniMap> createState() => _InteractiveMiniMapState();
}

class _InteractiveMiniMapState extends State<_InteractiveMiniMap> {
  MiniMapRect _viewport = const MiniMapRect(x: 100, y: 100, width: 300, height: 200);

  final List<MiniMapItem> _items = const [
    MiniMapItem(id: '1', x: 50, y: 50, width: 80, height: 60),
    MiniMapItem(id: '2', x: 300, y: 120, width: 100, height: 80),
    MiniMapItem(id: '3', x: 500, y: 80, width: 120, height: 90),
    MiniMapItem(id: '4', x: 200, y: 350, width: 90, height: 70),
    MiniMapItem(id: '5', x: 600, y: 300, width: 110, height: 85),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Viewport: x=${_viewport.x.toStringAsFixed(1)}, y=${_viewport.y.toStringAsFixed(1)}'),
            const SizedBox(height: 16),
            RefractionMiniMap(
              items: _items,
              viewport: _viewport,
              width: 300,
              height: 200,
              onViewportChange: (newCenter) {
                setState(() {
                  _viewport = MiniMapRect(
                    x: newCenter.dx - _viewport.width / 2.0,
                    y: newCenter.dy - _viewport.height / 2.0,
                    width: _viewport.width,
                    height: _viewport.height,
                  );
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}
