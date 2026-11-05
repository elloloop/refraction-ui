import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

// macOS excludes native hit testing beneath Flutter pictures painted above a
// platform view. This leaf preserves that real compositing boundary.
class _NativeDocument extends LeafRenderObjectWidget {
  const _NativeDocument();
  @override
  RenderObject createRenderObject(BuildContext context) => _NativeDocumentBox();
}

class _NativeDocumentBox extends RenderBox {
  @override
  void performLayout() => size = constraints.constrain(const Size(240, 160));
  @override
  void paint(PaintingContext context, Offset offset) {
    context.addLayer(PlatformViewLayer(rect: offset & size, viewId: 42));
  }
}

List<Layer> _paintOrder(Layer layer) => [
  layer,
  if (layer is ContainerLayer)
    for (var child = layer.firstChild; child != null; child = child.nextSibling)
      ..._paintOrder(child),
];

void main() {
  for (final dark in [false, true]) {
    testWidgets(
      'keyboard ring leaves native content above Flutter paint $dark',
      (tester) async {
        var activations = 0;
        await tester.pumpWidget(
          MaterialApp(
            debugShowCheckedModeBanner: false,
            home: RefractionTheme(
              data: dark
                  ? RefractionThemeData.minimalDark()
                  : RefractionThemeData.minimalLight(),
              child: Scaffold(
                body: Align(
                  alignment: Alignment.topLeft,
                  child: RefractionFocusRing(
                    onActivate: () => activations++,
                    child: const _NativeDocument(),
                  ),
                ),
              ),
            ),
          ),
        );
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.pump();
        final decoration = tester.widget<DecoratedBox>(
          find
              .descendant(
                of: find.byType(RefractionFocusRing),
                matching: find.byType(DecoratedBox),
              )
              .last,
        );
        expect((decoration.decoration as BoxDecoration).border, isNotNull);
        final layers = _paintOrder(
          tester.binding.renderViews.single.debugLayer!,
        );
        final native = layers.indexWhere((layer) => layer is PlatformViewLayer);
        expect(native, greaterThanOrEqualTo(0));
        expect(
          layers.skip(native + 1).whereType<PictureLayer>(),
          isEmpty,
          reason: 'Foreground Flutter paint excludes native macOS mouse input.',
        );
        await tester.sendKeyEvent(LogicalKeyboardKey.enter);
        expect(activations, 1);
      },
    );
  }
}
