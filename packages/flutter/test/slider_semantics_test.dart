import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

class RecordingBinding extends AutomatedTestWidgetsFlutterBinding {
  @override
  ui.SemanticsUpdateBuilder createSemanticsUpdateBuilder() =>
      RecordingBuilder();
}

// Observe the exact incremental updates sent to the real engine builder.
// Keeping the latest child lists models native accessibility-tree reachability.
class RecordingBuilder extends Fake implements ui.SemanticsUpdateBuilder {
  final ui.SemanticsUpdateBuilder delegate = ui.SemanticsUpdateBuilder();
  static final nodes = <int, List<int>>{};
  static final orphanBatches = <List<int>>[];
  final updated = <int>[];
  @override
  dynamic noSuchMethod(Invocation invocation) {
    if (invocation.memberName == #updateNode) {
      final args = invocation.namedArguments;
      final id = args[#id] as int;
      updated.add(id);
      nodes[id] = List<int>.from(args[#childrenInTraversalOrder] as Iterable);
      return Function.apply(delegate.updateNode, [], args);
    }
    return super.noSuchMethod(invocation);
  }

  @override
  void updateCustomAction({
    required int id,
    String? label,
    String? hint,
    int overrideId = -1,
  }) => delegate.updateCustomAction(
    id: id,
    label: label,
    hint: hint,
    overrideId: overrideId,
  );
  @override
  ui.SemanticsUpdate build() {
    final reachable = <int>{};
    void visit(int id) {
      if (!reachable.add(id)) return;
      for (final child in nodes[id] ?? <int>[]) {
        visit(child);
      }
    }

    visit(0);
    final orphans = updated.where((id) => !reachable.contains(id)).toList();
    if (orphans.isNotEmpty) orphanBatches.add(orphans);
    return delegate.build();
  }
}

void main() {
  RecordingBinding();
  testWidgets(
    'RefractionSlider serialized nodes stay reachable on pushed route and keyboard interaction',
    (tester) async {
      final semantics = tester.ensureSemantics();
      try {
        RecordingBuilder.nodes.clear();
        RecordingBuilder.orphanBatches.clear();
        await tester.pumpWidget(
          RefractionTheme(
            data: RefractionThemeData.light(),
            child: MaterialApp(
              home: Builder(
                builder: (context) => Scaffold(
                  body: TextButton(
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => const Scaffold(
                          body: SingleChildScrollView(child: SliderFixture()),
                        ),
                      ),
                    ),
                    child: const Text('Open'),
                  ),
                ),
              ),
            ),
          ),
        );
        await tester.tap(find.text('Open'));
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 400));
        await tester.ensureVisible(find.byType(Slider));
        await tester.pump();
        final before = tester.widget<Slider>(find.byType(Slider)).value;
        await tester.drag(find.byType(Slider), const Offset(100, 0));
        await tester.pump();
        final afterDrag = tester.widget<Slider>(find.byType(Slider)).value;
        expect(afterDrag, greaterThan(before));
        final candidates = <SemanticsNode>[];
        void visit(SemanticsNode node) {
          if (node.getSemanticsData().flagsCollection.isSlider) {
            candidates.add(node);
          }
          node.visitChildren((child) {
            visit(child);
            return true;
          });
        }

        visit(tester.getSemantics(find.byType(Slider)));
        expect(candidates, hasLength(1));
        final node = candidates.single;
        expect(node.getSemanticsData().flagsCollection.isSlider, isTrue);
        expect(
          node.getSemanticsData().hasAction(ui.SemanticsAction.increase),
          isTrue,
        );
        expect(
          node.getSemanticsData().hasAction(ui.SemanticsAction.decrease),
          isTrue,
        );
        final focus = find
            .descendant(of: find.byType(Slider), matching: find.byType(Focus))
            .last;
        tester.widget<Focus>(focus).focusNode!.requestFocus();
        await tester.pump();
        await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
        await tester.pump();
        expect(
          tester.widget<Slider>(find.byType(Slider)).value,
          greaterThan(afterDrag),
        );
        debugPrint('SERIALIZED_ORPHANS ${RecordingBuilder.orphanBatches}');
        expect(RecordingBuilder.orphanBatches, isEmpty);
        await tester.pumpWidget(const SizedBox());
      } finally {
        semantics.dispose();
      }
    },
  );
}

class SliderFixture extends StatefulWidget {
  const SliderFixture({super.key});
  @override
  State<SliderFixture> createState() => _SliderFixtureState();
}

class _SliderFixtureState extends State<SliderFixture> {
  double energy = 65;
  @override
  Widget build(BuildContext context) => SizedBox(
    height: 400,
    child: RefractionSlider(
      value: energy,
      min: 10,
      max: 100,
      label: '${energy.round()}%',
      sliderTheme: SliderTheme.of(context).copyWith(trackHeight: 3),
      onChanged: (value) => setState(() => energy = value),
    ),
  );
}
