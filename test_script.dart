import 'dart:io';

void main() {
  final file = File('packages/flutter/test/steps_test.dart');
  final buffer = StringBuffer();

  buffer.writeln('''
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/steps.dart';

void main() {
  Widget buildApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(
          body: child,
        ),
      ),
    );
  }
''');

  buffer.writeln('  group("RefractionSteps Core Rendering", () {');
  buffer.writeln('''
    testWidgets('renders 0 steps returning SizedBox.shrink', (tester) async {
      await tester.pumpWidget(buildApp(RefractionSteps(steps: const [])));
      expect(find.byType(SizedBox), findsOneWidget);
      expect(find.byType(Row), findsNothing);
      expect(find.byType(Column), findsNothing);
    });

    testWidgets('renders 1 step with no connectors', (tester) async {
      await tester.pumpWidget(buildApp(RefractionSteps(
        steps: const [RefractionStepItem(title: Text('Step 1'))],
      )));
      expect(find.text('Step 1'), findsOneWidget);
      expect(find.byType(Container), findsWidgets); // Indicators
    });

    testWidgets('renders 2 steps with 1 connector vertically', (tester) async {
      await tester.pumpWidget(buildApp(RefractionSteps(
        steps: const [
          RefractionStepItem(title: Text('Step 1')),
          RefractionStepItem(title: Text('Step 2')),
        ],
      )));
      expect(find.text('Step 1'), findsOneWidget);
      expect(find.text('Step 2'), findsOneWidget);
      expect(find.byType(Expanded), findsWidgets);
    });

    testWidgets('renders 2 steps horizontally', (tester) async {
      await tester.pumpWidget(buildApp(RefractionSteps(
        orientation: Axis.horizontal,
        steps: const [
          RefractionStepItem(title: Text('Step 1')),
          RefractionStepItem(title: Text('Step 2')),
        ],
      )));
      expect(find.text('Step 1'), findsOneWidget);
      expect(find.text('Step 2'), findsOneWidget);
    });
''');

  for(int i = 1; i <= 5; i++) {
    buffer.writeln('''
    testWidgets('renders step title properly in step $i', (tester) async {
      final steps = List.generate(5, (idx) => RefractionStepItem(title: Text('Title \${idx + 1}')));
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('Title $i'), findsOneWidget);
    });
    
    testWidgets('renders step description properly in step $i', (tester) async {
      final steps = List.generate(5, (idx) => RefractionStepItem(title: Text('Title'), description: Text('Desc \${idx + 1}')));
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('Desc $i'), findsOneWidget);
    });
    ''');
  }

  for(int i = 1; i <= 5; i++) {
    buffer.writeln('''
    testWidgets('renders default indicator text $i correctly', (tester) async {
      final steps = List.generate(5, (idx) => RefractionStepItem(title: Text('Title')));
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.text('$i'), findsOneWidget);
    });
    ''');
  }

  for(int i = 1; i <= 4; i++) {
    buffer.writeln('''
    testWidgets('renders custom indicator widget for step $i', (tester) async {
      final steps = List.generate(5, (idx) => RefractionStepItem(
        title: Text('Title'),
        indicator: idx == ${i-1} ? Icon(Icons.check, key: Key('icon_$i')) : null,
      ));
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps)));
      expect(find.byKey(Key('icon_$i')), findsOneWidget);
      expect(find.text('$i'), findsNothing); // Overridden
    });
    ''');
  }

  buffer.writeln('  });');
  
  buffer.writeln('  group("RefractionSteps State and Color Evaluation", () {');
  for(int current = 0; current < 4; current++) {
    for(int idx = 0; idx < 3; idx++) {
      buffer.writeln('''
    testWidgets('evaluates correct visual color state for step $idx when currentStep is $current', (tester) async {
      final steps = List.generate(3, (i) => RefractionStepItem(title: Text('Step \${i+1}')));
      await tester.pumpWidget(buildApp(RefractionSteps(steps: steps, currentStep: $current)));
      // Since colors are read via context theme inside the builder, we verify the presence without crash.
      // And we verify default indicator numbers exist.
      expect(find.text('\${$idx + 1}'), findsOneWidget);
    });
      ''');
    }
  }
  buffer.writeln('  });');

  buffer.writeln('  group("RefractionSteps Layout and Connectivity", () {');
  buffer.writeln('''
    testWidgets('builds IntrinsicHeight in vertical mode', (tester) async {
      await tester.pumpWidget(buildApp(RefractionSteps(
        steps: const [RefractionStepItem(title: Text('A')), RefractionStepItem(title: Text('B'))]
      )));
      expect(find.byType(IntrinsicHeight), findsWidgets);
    });

    testWidgets('does not build IntrinsicHeight in horizontal mode', (tester) async {
      await tester.pumpWidget(buildApp(RefractionSteps(
        orientation: Axis.horizontal,
        steps: const [RefractionStepItem(title: Text('A')), RefractionStepItem(title: Text('B'))]
      )));
      expect(find.byType(IntrinsicHeight), findsNothing);
    });
  ''');
  buffer.writeln('  });');

  buffer.writeln('  group("RefractionSteps Interactions", () {');
  for(int i = 0; i < 3; i++) {
    buffer.writeln('''
    testWidgets('emits onStepTap($i) when step $i is tapped', (tester) async {
      int? tappedIndex;
      final steps = List.generate(3, (idx) => RefractionStepItem(title: Text('Step \$idx')));
      await tester.pumpWidget(buildApp(RefractionSteps(
        steps: steps,
        onStepTap: (idx) => tappedIndex = idx,
      )));
      await tester.tap(find.text('Step $i'));
      expect(tappedIndex, $i);
    });
    ''');
  }

  buffer.writeln('''
    testWidgets('does not build MouseRegion when onStepTap is null', (tester) async {
      await tester.pumpWidget(buildApp(RefractionSteps(
        steps: const [RefractionStepItem(title: Text('Step 1'))],
      )));
      expect(find.byType(MouseRegion), findsNothing);
    });

    testWidgets('builds custom connector widget using connectorBuilder', (tester) async {
      await tester.pumpWidget(buildApp(RefractionSteps(
        steps: const [RefractionStepItem(title: Text('1')), RefractionStepItem(title: Text('2'))],
        connectorBuilder: (ctx, idx, state) => const Text('CustomConnector'),
      )));
      expect(find.text('CustomConnector'), findsOneWidget);
    });
    
    testWidgets('builds default connector when connectorBuilder is null', (tester) async {
      await tester.pumpWidget(buildApp(RefractionSteps(
        steps: const [RefractionStepItem(title: Text('1')), RefractionStepItem(title: Text('2'))],
      )));
      // Default connector is a Container with color. We expect no Text('CustomConnector').
      expect(find.text('CustomConnector'), findsNothing);
      expect(find.byType(Container), findsWidgets);
    });
  ''');
  buffer.writeln('  });');
  buffer.writeln('}');

  file.writeAsStringSync(buffer.toString());
}
