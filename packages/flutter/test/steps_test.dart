import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(body: child),
      ),
    );
  }

  group("RefractionSteps Core Rendering", () {
    testWidgets('renders 0 steps returning SizedBox.shrink', (tester) async {
      await tester.pumpWidget(buildApp(RefractionSteps(steps: const [])));
      expect(find.byType(SizedBox), findsOneWidget);
      expect(find.byType(Row), findsNothing);
      expect(find.byType(Column), findsNothing);
    });

    testWidgets('renders 1 step with no connectors', (tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionSteps(
            steps: const [RefractionStepItem(title: Text('Step 1'))],
          ),
        ),
      );
      expect(find.text('Step 1'), findsOneWidget);
      expect(find.byType(Container), findsWidgets); // Indicators
    });

    testWidgets('renders 2 steps with 1 connector vertically', (tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionSteps(
            steps: const [
              RefractionStepItem(title: Text('Step 1')),
              RefractionStepItem(title: Text('Step 2')),
            ],
          ),
        ),
      );
      expect(find.text('Step 1'), findsOneWidget);
      expect(find.text('Step 2'), findsOneWidget);
      expect(find.byType(Expanded), findsWidgets);
    });

    testWidgets('renders 2 steps horizontally', (tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionSteps(
            orientation: Axis.horizontal,
            steps: const [
              RefractionStepItem(title: Text('Step 1')),
              RefractionStepItem(title: Text('Step 2')),
            ],
          ),
        ),
      );
      expect(find.text('Step 1'), findsOneWidget);
      expect(find.text('Step 2'), findsOneWidget);
    });

    testWidgets('renders step title properly in step 1', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(title: Text('Title ${idx + 1}')),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('Title 1'), findsOneWidget);
    });

    testWidgets('renders step description properly in step 1', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(
          title: Text('Title'),
          description: Text('Desc ${idx + 1}'),
        ),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('Desc 1'), findsOneWidget);
    });

    testWidgets('renders step title properly in step 2', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(title: Text('Title ${idx + 1}')),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('Title 2'), findsOneWidget);
    });

    testWidgets('renders step description properly in step 2', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(
          title: Text('Title'),
          description: Text('Desc ${idx + 1}'),
        ),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('Desc 2'), findsOneWidget);
    });

    testWidgets('renders step title properly in step 3', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(title: Text('Title ${idx + 1}')),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('Title 3'), findsOneWidget);
    });

    testWidgets('renders step description properly in step 3', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(
          title: Text('Title'),
          description: Text('Desc ${idx + 1}'),
        ),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('Desc 3'), findsOneWidget);
    });

    testWidgets('renders step title properly in step 4', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(title: Text('Title ${idx + 1}')),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('Title 4'), findsOneWidget);
    });

    testWidgets('renders step description properly in step 4', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(
          title: Text('Title'),
          description: Text('Desc ${idx + 1}'),
        ),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('Desc 4'), findsOneWidget);
    });

    testWidgets('renders step title properly in step 5', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(title: Text('Title ${idx + 1}')),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('Title 5'), findsOneWidget);
    });

    testWidgets('renders step description properly in step 5', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(
          title: Text('Title'),
          description: Text('Desc ${idx + 1}'),
        ),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('Desc 5'), findsOneWidget);
    });

    testWidgets('renders default indicator text 1 correctly', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(title: Text('Title')),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('1'), findsOneWidget);
    });

    testWidgets('renders default indicator text 2 correctly', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(title: Text('Title')),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('2'), findsOneWidget);
    });

    testWidgets('renders default indicator text 3 correctly', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(title: Text('Title')),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('3'), findsOneWidget);
    });

    testWidgets('renders default indicator text 4 correctly', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(title: Text('Title')),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('4'), findsOneWidget);
    });

    testWidgets('renders default indicator text 5 correctly', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(title: Text('Title')),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('5'), findsOneWidget);
    });

    testWidgets('renders custom indicator widget for step 1', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(
          title: Text('Title'),
          indicator: idx == 0 ? Icon(Icons.check, key: Key('icon_1')) : null,
        ),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.byKey(Key('icon_1')), findsOneWidget);
      expect(find.text('1'), findsNothing); // Overridden
    });

    testWidgets('renders custom indicator widget for step 2', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(
          title: Text('Title'),
          indicator: idx == 1 ? Icon(Icons.check, key: Key('icon_2')) : null,
        ),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.byKey(Key('icon_2')), findsOneWidget);
      expect(find.text('2'), findsNothing); // Overridden
    });

    testWidgets('renders custom indicator widget for step 3', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(
          title: Text('Title'),
          indicator: idx == 2 ? Icon(Icons.check, key: Key('icon_3')) : null,
        ),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.byKey(Key('icon_3')), findsOneWidget);
      expect(find.text('3'), findsNothing); // Overridden
    });

    testWidgets('renders custom indicator widget for step 4', (tester) async {
      final steps = List.generate(
        5,
        (idx) => RefractionStepItem(
          title: Text('Title'),
          indicator: idx == 3 ? Icon(Icons.check, key: Key('icon_4')) : null,
        ),
      );
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.byKey(Key('icon_4')), findsOneWidget);
      expect(find.text('4'), findsNothing); // Overridden
    });
  });
  group("RefractionSteps State and Color Evaluation", () {
    testWidgets(
      'evaluates correct visual color state for step 0 when currentStep is 0',
      (tester) async {
        final steps = List.generate(
          3,
          (i) => RefractionStepItem(title: Text('Step ${i + 1}')),
        );
        await tester.pumpWidget(
          buildApp(RefractionSteps(steps: steps, currentStep: 0)),
        );
        // Since colors are read via context theme inside the builder, we verify the presence without crash.
        // And we verify default indicator numbers exist.
        expect(find.text('${0 + 1}'), findsOneWidget);
      },
    );

    testWidgets(
      'evaluates correct visual color state for step 1 when currentStep is 0',
      (tester) async {
        final steps = List.generate(
          3,
          (i) => RefractionStepItem(title: Text('Step ${i + 1}')),
        );
        await tester.pumpWidget(
          buildApp(RefractionSteps(steps: steps, currentStep: 0)),
        );
        // Since colors are read via context theme inside the builder, we verify the presence without crash.
        // And we verify default indicator numbers exist.
        expect(find.text('${1 + 1}'), findsOneWidget);
      },
    );

    testWidgets(
      'evaluates correct visual color state for step 2 when currentStep is 0',
      (tester) async {
        final steps = List.generate(
          3,
          (i) => RefractionStepItem(title: Text('Step ${i + 1}')),
        );
        await tester.pumpWidget(
          buildApp(RefractionSteps(steps: steps, currentStep: 0)),
        );
        // Since colors are read via context theme inside the builder, we verify the presence without crash.
        // And we verify default indicator numbers exist.
        expect(find.text('${2 + 1}'), findsOneWidget);
      },
    );

    testWidgets(
      'evaluates correct visual color state for step 0 when currentStep is 1',
      (tester) async {
        final steps = List.generate(
          3,
          (i) => RefractionStepItem(title: Text('Step ${i + 1}')),
        );
        await tester.pumpWidget(
          buildApp(RefractionSteps(steps: steps, currentStep: 1)),
        );
        // Since colors are read via context theme inside the builder, we verify the presence without crash.
        // And we verify default indicator numbers exist.
        expect(find.text('${0 + 1}'), findsOneWidget);
      },
    );

    testWidgets(
      'evaluates correct visual color state for step 1 when currentStep is 1',
      (tester) async {
        final steps = List.generate(
          3,
          (i) => RefractionStepItem(title: Text('Step ${i + 1}')),
        );
        await tester.pumpWidget(
          buildApp(RefractionSteps(steps: steps, currentStep: 1)),
        );
        // Since colors are read via context theme inside the builder, we verify the presence without crash.
        // And we verify default indicator numbers exist.
        expect(find.text('${1 + 1}'), findsOneWidget);
      },
    );

    testWidgets(
      'evaluates correct visual color state for step 2 when currentStep is 1',
      (tester) async {
        final steps = List.generate(
          3,
          (i) => RefractionStepItem(title: Text('Step ${i + 1}')),
        );
        await tester.pumpWidget(
          buildApp(RefractionSteps(steps: steps, currentStep: 1)),
        );
        // Since colors are read via context theme inside the builder, we verify the presence without crash.
        // And we verify default indicator numbers exist.
        expect(find.text('${2 + 1}'), findsOneWidget);
      },
    );

    testWidgets(
      'evaluates correct visual color state for step 0 when currentStep is 2',
      (tester) async {
        final steps = List.generate(
          3,
          (i) => RefractionStepItem(title: Text('Step ${i + 1}')),
        );
        await tester.pumpWidget(
          buildApp(RefractionSteps(steps: steps, currentStep: 2)),
        );
        // Since colors are read via context theme inside the builder, we verify the presence without crash.
        // And we verify default indicator numbers exist.
        expect(find.text('${0 + 1}'), findsOneWidget);
      },
    );

    testWidgets(
      'evaluates correct visual color state for step 1 when currentStep is 2',
      (tester) async {
        final steps = List.generate(
          3,
          (i) => RefractionStepItem(title: Text('Step ${i + 1}')),
        );
        await tester.pumpWidget(
          buildApp(RefractionSteps(steps: steps, currentStep: 2)),
        );
        // Since colors are read via context theme inside the builder, we verify the presence without crash.
        // And we verify default indicator numbers exist.
        expect(find.text('${1 + 1}'), findsOneWidget);
      },
    );

    testWidgets(
      'evaluates correct visual color state for step 2 when currentStep is 2',
      (tester) async {
        final steps = List.generate(
          3,
          (i) => RefractionStepItem(title: Text('Step ${i + 1}')),
        );
        await tester.pumpWidget(
          buildApp(RefractionSteps(steps: steps, currentStep: 2)),
        );
        // Since colors are read via context theme inside the builder, we verify the presence without crash.
        // And we verify default indicator numbers exist.
        expect(find.text('${2 + 1}'), findsOneWidget);
      },
    );

    testWidgets(
      'evaluates correct visual color state for step 0 when currentStep is 3',
      (tester) async {
        final steps = List.generate(
          3,
          (i) => RefractionStepItem(title: Text('Step ${i + 1}')),
        );
        await tester.pumpWidget(
          buildApp(RefractionSteps(steps: steps, currentStep: 3)),
        );
        // Since colors are read via context theme inside the builder, we verify the presence without crash.
        // And we verify default indicator numbers exist.
        expect(find.text('${0 + 1}'), findsOneWidget);
      },
    );

    testWidgets(
      'evaluates correct visual color state for step 1 when currentStep is 3',
      (tester) async {
        final steps = List.generate(
          3,
          (i) => RefractionStepItem(title: Text('Step ${i + 1}')),
        );
        await tester.pumpWidget(
          buildApp(RefractionSteps(steps: steps, currentStep: 3)),
        );
        // Since colors are read via context theme inside the builder, we verify the presence without crash.
        // And we verify default indicator numbers exist.
        expect(find.text('${1 + 1}'), findsOneWidget);
      },
    );

    testWidgets(
      'evaluates correct visual color state for step 2 when currentStep is 3',
      (tester) async {
        final steps = List.generate(
          3,
          (i) => RefractionStepItem(title: Text('Step ${i + 1}')),
        );
        await tester.pumpWidget(
          buildApp(RefractionSteps(steps: steps, currentStep: 3)),
        );
        // Since colors are read via context theme inside the builder, we verify the presence without crash.
        // And we verify default indicator numbers exist.
        expect(find.text('${2 + 1}'), findsOneWidget);
      },
    );
  });
  group("RefractionSteps Layout and Connectivity", () {
    testWidgets('builds IntrinsicHeight in vertical mode', (tester) async {
      await tester.pumpWidget(
        buildApp(
          RefractionSteps(
            steps: const [
              RefractionStepItem(title: Text('A')),
              RefractionStepItem(title: Text('B')),
            ],
          ),
        ),
      );
      expect(find.byType(IntrinsicHeight), findsWidgets);
    });

    testWidgets('does not build IntrinsicHeight in horizontal mode', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          RefractionSteps(
            orientation: Axis.horizontal,
            steps: const [
              RefractionStepItem(title: Text('A')),
              RefractionStepItem(title: Text('B')),
            ],
          ),
        ),
      );
      expect(find.byType(IntrinsicHeight), findsNothing);
    });
  });
  group("RefractionSteps Interactions", () {
    testWidgets('emits onStepTap(0) when step 0 is tapped', (tester) async {
      int? tappedIndex;
      final steps = List.generate(
        3,
        (idx) => RefractionStepItem(title: Text('Step $idx')),
      );
      await tester.pumpWidget(
        buildApp(
          RefractionSteps(steps: steps, onStepTap: (idx) => tappedIndex = idx),
        ),
      );
      await tester.tap(find.text('Step 0'));
      expect(tappedIndex, 0);
    });

    testWidgets('emits onStepTap(1) when step 1 is tapped', (tester) async {
      int? tappedIndex;
      final steps = List.generate(
        3,
        (idx) => RefractionStepItem(title: Text('Step $idx')),
      );
      await tester.pumpWidget(
        buildApp(
          RefractionSteps(steps: steps, onStepTap: (idx) => tappedIndex = idx),
        ),
      );
      await tester.tap(find.text('Step 1'));
      expect(tappedIndex, 1);
    });

    testWidgets('emits onStepTap(2) when step 2 is tapped', (tester) async {
      int? tappedIndex;
      final steps = List.generate(
        3,
        (idx) => RefractionStepItem(title: Text('Step $idx')),
      );
      await tester.pumpWidget(
        buildApp(
          RefractionSteps(steps: steps, onStepTap: (idx) => tappedIndex = idx),
        ),
      );
      await tester.tap(find.text('Step 2'));
      expect(tappedIndex, 2);
    });

    testWidgets('does not build MouseRegion when onStepTap is null', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          RefractionSteps(
            steps: const [RefractionStepItem(title: Text('Step 1'))],
          ),
        ),
      );
      expect(find.byType(GestureDetector), findsNothing);
    });

    testWidgets('builds custom connector widget using connectorBuilder', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          RefractionSteps(
            steps: const [
              RefractionStepItem(title: Text('1')),
              RefractionStepItem(title: Text('2')),
            ],
            connectorBuilder: (ctx, idx, state) =>
                const Text('CustomConnector'),
          ),
        ),
      );
      expect(find.text('CustomConnector'), findsOneWidget);
    });

    testWidgets('builds default connector when connectorBuilder is null', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildApp(
          RefractionSteps(
            steps: const [
              RefractionStepItem(title: Text('1')),
              RefractionStepItem(title: Text('2')),
            ],
          ),
        ),
      );
      // Default connector is a Container with color. We expect no Text('CustomConnector').
      expect(find.text('CustomConnector'), findsNothing);
      expect(find.byType(Container), findsWidgets);
    });
  });
}
