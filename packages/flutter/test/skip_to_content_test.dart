import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestWidget({
    required FocusNode targetNode,
    String? label,
    VoidCallback? onSkip,
    RefractionThemeData? themeData,
  }) {
    return MaterialApp(
      home: RefractionTheme(
        data: themeData ?? RefractionThemeData.light(),
        child: Scaffold(
          body: Column(
            children: [
              RefractionSkipToContent(
                targetNode: targetNode,
                label: label ?? 'Skip to main content',
                onSkip: onSkip,
              ),
              const SizedBox(height: 50),
              const TextField(key: Key('field1')),
              const SizedBox(height: 50),
              Focus(
                focusNode: targetNode,
                child: const Text('Main Content', key: Key('main_content')),
              ),
            ],
          ),
        ),
      ),
    );
  }

  testWidgets('renders zero size initially and no overlay child', (
    WidgetTester tester,
  ) async {
    final targetNode = FocusNode();
    await tester.pumpWidget(buildTestWidget(targetNode: targetNode));

    final sizedBoxFinder = find
        .descendant(
          of: find.byType(RefractionSkipToContent),
          matching: find.byType(SizedBox),
        )
        .first;

    final sizedBox = tester.widget<SizedBox>(sizedBoxFinder);
    expect(sizedBox.width, 0);
    expect(sizedBox.height, 0);

    // Overlay content shouldn't be rendered
    expect(find.text('Skip to main content'), findsNothing);
  });

  testWidgets('shows button when focused', (WidgetTester tester) async {
    final targetNode = FocusNode();
    await tester.pumpWidget(buildTestWidget(targetNode: targetNode));

    expect(find.text('Skip to main content'), findsNothing);

    final focusFinder = find.descendant(
      of: find.byType(RefractionSkipToContent),
      matching: find.byType(Focus),
    );
    final FocusNode skipNode = tester.widget<Focus>(focusFinder).focusNode!;

    skipNode.requestFocus();
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));

    expect(find.text('Skip to main content'), findsOneWidget);
  });

  testWidgets(
    'calls onSkip and focuses targetNode when activated via keyboard',
    (WidgetTester tester) async {
      final targetNode = FocusNode();
      bool onSkipCalled = false;

      await tester.pumpWidget(
        buildTestWidget(
          targetNode: targetNode,
          onSkip: () {
            onSkipCalled = true;
          },
        ),
      );

      final focusFinder = find.descendant(
        of: find.byType(RefractionSkipToContent),
        matching: find.byType(Focus),
      );
      final FocusNode skipNode = tester.widget<Focus>(focusFinder).focusNode!;

      skipNode.requestFocus();
      await tester.pumpAndSettle();

      expect(skipNode.hasFocus, isTrue);
      expect(targetNode.hasFocus, isFalse);

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(onSkipCalled, isTrue);
      expect(targetNode.hasFocus, isTrue);
    },
  );

  testWidgets('calls onSkip and focuses targetNode when tapped', (
    WidgetTester tester,
  ) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;

    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        onSkip: () {
          onSkipCalled = true;
        },
      ),
    );

    final focusFinder = find.descendant(
      of: find.byType(RefractionSkipToContent),
      matching: find.byType(Focus),
    );
    final FocusNode skipNode = tester.widget<Focus>(focusFinder).focusNode!;
    skipNode.requestFocus();
    await tester.pumpAndSettle();

    await tester.tap(find.text('Skip to main content'));
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });

  testWidgets('uses custom label', (WidgetTester tester) async {
    final targetNode = FocusNode();
    await tester.pumpWidget(
      buildTestWidget(targetNode: targetNode, label: 'Jump to main'),
    );

    final focusFinder = find.descendant(
      of: find.byType(RefractionSkipToContent),
      matching: find.byType(Focus),
    );
    final FocusNode skipNode = tester.widget<Focus>(focusFinder).focusNode!;
    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Jump to main'), findsOneWidget);
    expect(find.text('Skip to main content'), findsNothing);
  });

  testWidgets('applies theming correctly', (WidgetTester tester) async {
    final targetNode = FocusNode();
    final themeData = RefractionThemeData.light();
    await tester.pumpWidget(
      buildTestWidget(targetNode: targetNode, themeData: themeData),
    );

    final focusFinder = find.descendant(
      of: find.byType(RefractionSkipToContent),
      matching: find.byType(Focus),
    );
    final FocusNode skipNode = tester.widget<Focus>(focusFinder).focusNode!;
    skipNode.requestFocus();
    await tester.pumpAndSettle();

    final container = tester.widget<Container>(
      find
          .ancestor(
            of: find.text('Skip to main content'),
            matching: find.byType(Container),
          )
          .first,
    );

    final decoration = container.decoration as BoxDecoration;
    expect(decoration.color, themeData.colors.background);

    final border = decoration.border as Border;
    expect(border.top.color, themeData.colors.border);
    expect(
      decoration.borderRadius,
      BorderRadius.circular(themeData.borderRadius),
    );
  });

  testWidgets('has correct semantics', (WidgetTester tester) async {
    final targetNode = FocusNode();
    await tester.pumpWidget(buildTestWidget(targetNode: targetNode));

    final focusFinder = find.descendant(
      of: find.byType(RefractionSkipToContent),
      matching: find.byType(Focus),
    );
    final FocusNode skipNode = tester.widget<Focus>(focusFinder).focusNode!;
    skipNode.requestFocus();
    await tester.pumpAndSettle();

    final semanticsFinder = find
        .ancestor(
          of: find.text('Skip to main content'),
          matching: find.byType(Semantics),
        )
        .first;

    final semantics = tester.widget<Semantics>(semanticsFinder);
    expect(semantics.properties.button, isTrue);
    expect(semantics.properties.focused, isTrue);
    expect(semantics.properties.label, 'Skip to main content');
  });

  testWidgets('hides button when focus is lost', (WidgetTester tester) async {
    final targetNode = FocusNode();
    await tester.pumpWidget(buildTestWidget(targetNode: targetNode));

    final focusFinder = find.descendant(
      of: find.byType(RefractionSkipToContent),
      matching: find.byType(Focus),
    );
    final FocusNode skipNode = tester.widget<Focus>(focusFinder).focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();
    expect(find.text('Skip to main content'), findsOneWidget);

    targetNode.requestFocus();
    await tester.pumpAndSettle();
    expect(find.text('Skip to main content'), findsNothing);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
  testWidgets('stress test iteration 1', (WidgetTester tester) async {
    final targetNode = FocusNode();
    bool onSkipCalled = false;
    await tester.pumpWidget(
      buildTestWidget(
        targetNode: targetNode,
        label: 'Skip iteration 1',
        onSkip: () => onSkipCalled = true,
      ),
    );

    final skipNode = tester
        .widget<Focus>(
          find.descendant(
            of: find.byType(RefractionSkipToContent),
            matching: find.byType(Focus),
          ),
        )
        .focusNode!;

    skipNode.requestFocus();
    await tester.pumpAndSettle();

    expect(find.text('Skip iteration 1'), findsOneWidget);

    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();

    expect(onSkipCalled, isTrue);
    expect(targetNode.hasFocus, isTrue);
  });
}
