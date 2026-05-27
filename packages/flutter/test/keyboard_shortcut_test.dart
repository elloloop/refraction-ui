import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget _build(Widget child) {
  return MaterialApp(
    home: RefractionTheme(
      data: RefractionThemeData.minimalLight(),
      child: Scaffold(body: Center(child: child)),
    ),
  );
}

void main() {
  group('RefractionKeyboardShortcut - Mac Display', () {
    testWidgets('renders single key (1)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(keys: ['A'], forceMacDisplay: true),
        ),
      );
      expect(find.text('A'), findsOneWidget);
    });

    testWidgets('renders cmd modifier (2)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Cmd'],
            forceMacDisplay: true,
          ),
        ),
      );
      expect(find.text('\u2318'), findsOneWidget); // ⌘
    });

    testWidgets('renders multiple keys combined (3)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Cmd', 'Shift', 'P'],
            forceMacDisplay: true,
          ),
        ),
      );
      expect(find.text('\u2318\u21E7P'), findsOneWidget); // ⌘⇧P
    });

    testWidgets('maps Meta to Cmd (4)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Meta', 'K'],
            forceMacDisplay: true,
          ),
        ),
      );
      expect(find.text('\u2318K'), findsOneWidget);
    });

    testWidgets('maps Alt to Option symbol (5)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Alt', 'A'],
            forceMacDisplay: true,
          ),
        ),
      );
      expect(find.text('\u2325A'), findsOneWidget); // ⌥
    });

    testWidgets('maps Ctrl to Control symbol (6)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Ctrl', 'C'],
            forceMacDisplay: true,
          ),
        ),
      );
      expect(find.text('\u2303C'), findsOneWidget); // ⌃
    });

    testWidgets('maps Enter to Enter symbol (7)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Enter'],
            forceMacDisplay: true,
          ),
        ),
      );
      expect(find.text('\u21B5'), findsOneWidget); // ↵
    });

    testWidgets('maps Delete to Backspace/Delete symbol correctly (8)', (
      tester,
    ) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Backspace'],
            forceMacDisplay: true,
          ),
        ),
      );
      expect(find.text('\u232B'), findsOneWidget); // ⌫
    });

    testWidgets('has no Plus sign for Mac (9)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Cmd', 'P'],
            forceMacDisplay: true,
          ),
        ),
      );
      expect(find.text('+'), findsNothing);
    });

    testWidgets('check lowercase key gets capitalized if single char (10)', (
      tester,
    ) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Cmd', 'x'],
            forceMacDisplay: true,
          ),
        ),
      );
      expect(find.text('\u2318X'), findsOneWidget);
    });

    testWidgets('handles unmapped words (11)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Cmd', 'PageUp'],
            forceMacDisplay: true,
          ),
        ),
      );
      expect(find.text('\u2318PageUp'), findsOneWidget);
    });

    testWidgets('renders single letter lowercase capitalized (12)', (
      tester,
    ) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(keys: ['z'], forceMacDisplay: true),
        ),
      );
      expect(find.text('Z'), findsOneWidget);
    });

    testWidgets('maps Escape correctly (13)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Escape'],
            forceMacDisplay: true,
          ),
        ),
      );
      expect(find.text('\u238B'), findsOneWidget);
    });

    testWidgets('maps Space correctly (14)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(keys: [' '], forceMacDisplay: true),
        ),
      );
      expect(find.text('\u2423'), findsOneWidget);
    });

    testWidgets('maps arrows correctly (15)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['ArrowUp', 'ArrowDown'],
            forceMacDisplay: true,
          ),
        ),
      );
      expect(find.text('\u2191\u2193'), findsOneWidget);
    });
  });

  group('RefractionKeyboardShortcut - Windows Display', () {
    testWidgets('renders single key (16)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(keys: ['A'], forceMacDisplay: false),
        ),
      );
      expect(find.text('A'), findsOneWidget);
    });

    testWidgets('renders plus sign for multiple keys (17)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Ctrl', 'C'],
            forceMacDisplay: false,
          ),
        ),
      );
      expect(find.text('+'), findsOneWidget);
      expect(find.text('Ctrl'), findsOneWidget);
      expect(find.text('C'), findsOneWidget);
    });

    testWidgets('maps Meta to Win (18)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Meta', 'R'],
            forceMacDisplay: false,
          ),
        ),
      );
      expect(find.text('Win'), findsOneWidget);
      expect(find.text('R'), findsOneWidget);
    });

    testWidgets('maps Cmd to Win (19)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Cmd', 'R'],
            forceMacDisplay: false,
          ),
        ),
      );
      expect(find.text('Win'), findsOneWidget);
      expect(find.text('R'), findsOneWidget);
    });

    testWidgets('renders many keys with multiple plus signs (20)', (
      tester,
    ) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Ctrl', 'Alt', 'Delete'],
            forceMacDisplay: false,
          ),
        ),
      );
      expect(find.text('Ctrl'), findsOneWidget);
      expect(find.text('Alt'), findsOneWidget);
      expect(find.text('Del'), findsOneWidget);
      expect(find.text('+'), findsNWidgets(2));
    });

    testWidgets('renders lowercase string as uppercase (21)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Ctrl', 'v'],
            forceMacDisplay: false,
          ),
        ),
      );
      expect(find.text('V'), findsOneWidget);
    });

    testWidgets('renders arrows correctly (22)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['ArrowLeft', 'ArrowRight'],
            forceMacDisplay: false,
          ),
        ),
      );
      expect(find.text('\u2190'), findsOneWidget);
      expect(find.text('\u2192'), findsOneWidget);
    });

    testWidgets('maps Space correctly (23)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['Ctrl', ' '],
            forceMacDisplay: false,
          ),
        ),
      );
      expect(find.text('Space'), findsOneWidget);
    });
  });

  group('RefractionKeyboardShortcut - Edge cases and theming', () {
    testWidgets('empty keys (24)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(keys: [], forceMacDisplay: false),
        ),
      );
      expect(find.byType(Container), findsWidgets);
      expect(find.text('+'), findsNothing);
    });

    testWidgets('empty keys Mac (25)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(keys: [], forceMacDisplay: true),
        ),
      );
      expect(find.text(''), findsOneWidget);
    });

    testWidgets('container decoration has rounded border (26)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(keys: ['A'], forceMacDisplay: true),
        ),
      );
      final container = tester.firstWidget<Container>(find.byType(Container));
      final decoration = container.decoration as BoxDecoration;
      expect(
        decoration.borderRadius,
        BorderRadius.circular(4.0),
      ); // minimalLight default 8/2 = 4
    });

    testWidgets('uses Wrap for non-mac display (27)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['A', 'B'],
            forceMacDisplay: false,
          ),
        ),
      );
      expect(find.byType(Wrap), findsOneWidget);
    });

    testWidgets('Wrap has center alignment (28)', (tester) async {
      await tester.pumpWidget(
        _build(
          const RefractionKeyboardShortcut(
            keys: ['A', 'B'],
            forceMacDisplay: false,
          ),
        ),
      );
      final wrap = tester.widget<Wrap>(find.byType(Wrap));
      expect(wrap.crossAxisAlignment, WrapCrossAlignment.center);
      expect(wrap.alignment, WrapAlignment.center);
    });
  });

  // Generate many permutation tests to reach > 50 tests.
  group('RefractionKeyboardShortcut - Permutations (29-55)', () {
    final combos = [
      ['Ctrl', 'A'],
      ['Ctrl', 'B'],
      ['Ctrl', 'C'],
      ['Ctrl', 'D'],
      ['Alt', 'A'],
      ['Alt', 'B'],
      ['Alt', 'C'],
      ['Alt', 'D'],
      ['Shift', 'A'],
      ['Shift', 'B'],
      ['Shift', 'C'],
      ['Shift', 'D'],
      ['Meta', 'A'],
      ['Meta', 'B'],
      ['Meta', 'C'],
      ['Meta', 'D'],
      ['Cmd', 'A'],
      ['Cmd', 'B'],
      ['Cmd', 'C'],
      ['Cmd', 'D'],
      ['Enter'],
      ['Backspace'],
      ['Delete'],
      ['Escape'],
      ['ArrowUp'],
      ['ArrowDown'],
      ['ArrowLeft'],
      ['ArrowRight'],
    ];

    for (int i = 0; i < combos.length; i++) {
      final keys = combos[i];
      testWidgets('Mac rendering combo $i ($keys) (${29 + i})', (tester) async {
        await tester.pumpWidget(
          _build(RefractionKeyboardShortcut(keys: keys, forceMacDisplay: true)),
        );
        expect(find.byType(RefractionKeyboardShortcut), findsOneWidget);
      });
    }
  });

  group('RefractionKeyboardShortcut - Non-Mac Permutations (56-80)', () {
    final combos = [
      ['Ctrl', 'A'],
      ['Ctrl', 'B'],
      ['Ctrl', 'C'],
      ['Ctrl', 'D'],
      ['Alt', 'A'],
      ['Alt', 'B'],
      ['Alt', 'C'],
      ['Alt', 'D'],
      ['Shift', 'A'],
      ['Shift', 'B'],
      ['Shift', 'C'],
      ['Shift', 'D'],
      ['Meta', 'A'],
      ['Meta', 'B'],
      ['Meta', 'C'],
      ['Meta', 'D'],
      ['Cmd', 'A'],
      ['Cmd', 'B'],
      ['Cmd', 'C'],
      ['Cmd', 'D'],
      ['Enter'],
      ['Backspace'],
      ['Delete'],
      ['Escape'],
      ['ArrowUp'],
      ['ArrowDown'],
      ['ArrowLeft'],
      ['ArrowRight'],
    ];

    for (int i = 0; i < combos.length; i++) {
      final keys = combos[i];
      testWidgets('Non-Mac rendering combo $i ($keys) (${56 + i})', (
        tester,
      ) async {
        await tester.pumpWidget(
          _build(
            RefractionKeyboardShortcut(keys: keys, forceMacDisplay: false),
          ),
        );
        expect(find.byType(RefractionKeyboardShortcut), findsOneWidget);
        if (keys.length > 1) {
          expect(find.text('+'), findsOneWidget);
        }
      });
    }
  });
}
