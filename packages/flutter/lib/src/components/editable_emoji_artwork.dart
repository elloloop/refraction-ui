import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import '../data/emoji_renderers.dart';
import '../data/emoji_entry_lookup.dart';
import '../data/emoji_types.dart';
import '../data/unicode_emoji.dart';

/// Paints artwork over the editable's original grapheme boxes. The editor
/// still owns the complete Unicode string, hit testing, semantics and undo.
/// No placeholder characters or WidgetSpans enter its text layout.
class EditableEmojiArtwork extends MultiChildRenderObjectWidget {
  EditableEmojiArtwork({
    super.key,
    required Widget editor,
    required List<UnicodeEmojiRun> runs,
    required double size,
    EmojiRenderer renderer = twemojiEmojiRenderer,
  }) : _runs = runs,
       _size = size,
       super(
         children: [
           editor,
           for (final run in runs)
             ExcludeSemantics(
               child: IgnorePointer(
                 // Size already includes the editor's accessibility scaling.
                 child: MediaQuery.withNoTextScaling(
                   child: Builder(
                     builder: (context) => renderer(
                       context,
                       emojiEntryForGrapheme(run.emoji),
                       size,
                     ),
                   ),
                 ),
               ),
             ),
         ],
       );

  final List<UnicodeEmojiRun> _runs;
  final double _size;

  @override
  RenderObject createRenderObject(BuildContext context) =>
      _ArtworkRenderBox(_runs, _size);

  @override
  void updateRenderObject(
    BuildContext context,
    covariant RenderObject renderObject,
  ) {
    (renderObject as _ArtworkRenderBox).update(_runs, _size);
  }
}

class _ArtworkParentData extends ContainerBoxParentData<RenderBox> {}

class _ArtworkRenderBox extends RenderBox
    with
        ContainerRenderObjectMixin<RenderBox, _ArtworkParentData>,
        RenderBoxContainerDefaultsMixin<RenderBox, _ArtworkParentData> {
  _ArtworkRenderBox(this._runs, this._glyphSize);
  List<UnicodeEmojiRun> _runs;
  double _glyphSize;
  RenderEditable? _editable;

  void update(List<UnicodeEmojiRun> runs, double glyphSize) {
    _runs = runs;
    _glyphSize = glyphSize;
    markNeedsLayout();
  }

  @override
  void setupParentData(RenderBox child) {
    if (child.parentData is! _ArtworkParentData) {
      child.parentData = _ArtworkParentData();
    }
  }

  RenderEditable? _findEditable(RenderObject root) {
    if (root is RenderEditable) return root;
    RenderEditable? found;
    root.visitChildren((child) {
      found ??= _findEditable(child);
    });
    return found;
  }

  void _watch(RenderEditable? editable) {
    if (identical(_editable, editable)) return;
    _editable?.offset.removeListener(markNeedsPaint);
    _editable = editable;
    _editable?.offset.addListener(markNeedsPaint);
  }

  @override
  void detach() {
    _watch(null);
    super.detach();
  }

  @override
  double computeMinIntrinsicWidth(double height) =>
      firstChild!.getMinIntrinsicWidth(height);
  @override
  double computeMaxIntrinsicWidth(double height) =>
      firstChild!.getMaxIntrinsicWidth(height);
  @override
  double computeMinIntrinsicHeight(double width) =>
      firstChild!.getMinIntrinsicHeight(width);
  @override
  double computeMaxIntrinsicHeight(double width) =>
      firstChild!.getMaxIntrinsicHeight(width);
  @override
  Size computeDryLayout(BoxConstraints constraints) =>
      firstChild!.getDryLayout(constraints);
  @override
  double? computeDistanceToActualBaseline(TextBaseline baseline) =>
      firstChild!.getDistanceToActualBaseline(baseline);

  @override
  void performLayout() {
    final editor = firstChild!;
    editor.layout(constraints, parentUsesSize: true);
    size = editor.size;
    _watch(_findEditable(editor));
    var glyph = childAfter(editor);
    while (glyph != null) {
      glyph.layout(BoxConstraints.tight(Size.square(_glyphSize)));
      glyph = childAfter(glyph);
    }
  }

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) =>
      firstChild!.hitTest(result, position: position);

  @override
  void paint(PaintingContext context, Offset offset) {
    context.paintChild(firstChild!, offset);
    final editable = _editable;
    if (editable == null || !editable.attached) return;
    final origin = editable.localToGlobal(Offset.zero, ancestor: this);
    context.pushClipRect(needsCompositing, offset, origin & editable.size, (
      context,
      offset,
    ) {
      var glyph = childAfter(firstChild!);
      for (final run in _runs) {
        if (glyph == null) break;
        final boxes = editable.getBoxesForSelection(
          TextSelection(baseOffset: run.start, extentOffset: run.end),
        );
        if (boxes.length == 1) {
          final rect = boxes.single.toRect();
          context.paintChild(
            glyph,
            offset +
                origin +
                rect.center -
                Offset(_glyphSize / 2, _glyphSize / 2),
          );
        }
        glyph = childAfter(glyph);
      }
    });
  }
}
