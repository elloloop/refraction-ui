import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget _host(Widget child, {RefractionThemeData? theme}) => MaterialApp(
  home: RefractionTheme(
    data: theme ?? RefractionThemeData.light(),
    child: Scaffold(body: Center(child: child)),
  ),
);

Finder _ringOf(Finder control) => find.descendant(
  of: control,
  matching: find.byWidgetPredicate(
    (w) => w is RefractionFocusRing && w.visible,
  ),
);

void main() {
  group('RefractionButton keyboard + semantics', () {
    testWidgets('Tab focuses it, draws the ring, Enter and Space activate', (
      tester,
    ) async {
      var presses = 0;
      await tester.pumpWidget(
        _host(
          RefractionButton(
            onPressed: () => presses++,
            child: const Text('Send'),
          ),
        ),
      );
      final button = find.byType(RefractionButton);
      expect(_ringOf(button), findsNothing);

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(_ringOf(button), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pump();
      expect(presses, 2);
    });

    testWidgets('a mouse click does not draw the focus ring', (tester) async {
      await tester.pumpWidget(
        _host(RefractionButton(onPressed: () {}, child: const Text('Send'))),
      );
      final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await gesture.addPointer(location: Offset.zero);
      addTearDown(gesture.removePointer);
      await tester.tap(find.text('Send'), kind: PointerDeviceKind.mouse);
      await tester.pump();
      expect(_ringOf(find.byType(RefractionButton)), findsNothing);
    });

    testWidgets('disabled and loading buttons are skipped and inert', (
      tester,
    ) async {
      var presses = 0;
      await tester.pumpWidget(
        _host(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const RefractionButton(onPressed: null, child: Text('Off')),
              RefractionButton(
                onPressed: () => presses++,
                isLoading: true,
                child: const Text('Busy'),
              ),
            ],
          ),
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(presses, 0);
      expect(_ringOf(find.byType(RefractionButton)), findsNothing);
    });

    testWidgets('icon button exposes its semanticLabel as a button', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var presses = 0;
      await tester.pumpWidget(
        _host(
          RefractionButton(
            size: RefractionButtonSize.icon,
            semanticLabel: 'Delete message',
            onPressed: () => presses++,
            child: const Icon(Icons.delete_outline),
          ),
        ),
      );
      final node = find.bySemanticsLabel('Delete message');
      expect(node, findsOneWidget);
      expect(
        tester.getSemantics(node),
        matchesSemantics(
          label: 'Delete message',
          isButton: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );
      tester.semantics.tap(find.semantics.byLabel('Delete message'));
      expect(presses, 1);
      handle.dispose();
    });
  });

  group('checkbox / radio / switch keyboard + semantics', () {
    testWidgets('checkbox toggles with Space and announces its label', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      bool? value = false;
      await tester.pumpWidget(
        _host(
          StatefulBuilder(
            builder: (context, setState) => RefractionCheckbox(
              value: value!,
              semanticLabel: 'Mute channel',
              onChanged: (v) => setState(() => value = v),
            ),
          ),
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(_ringOf(find.byType(RefractionCheckbox)), findsOneWidget);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pump();
      expect(value, isTrue);
      expect(
        tester.getSemantics(find.bySemanticsLabel('Mute channel')),
        matchesSemantics(
          label: 'Mute channel',
          hasCheckedState: true,
          isChecked: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          isFocused: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );
      handle.dispose();
    });

    testWidgets('radio selects with Enter', (tester) async {
      String? group = 'a';
      await tester.pumpWidget(
        _host(
          StatefulBuilder(
            builder: (context, setState) => RefractionRadio<String>(
              value: 'b',
              groupValue: group,
              onChanged: (v) => setState(() => group = v),
            ),
          ),
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(group, 'b');
    });

    testWidgets('switch toggles with Space; disabled switch is skipped', (
      tester,
    ) async {
      var on = false;
      await tester.pumpWidget(
        _host(
          StatefulBuilder(
            builder: (context, setState) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                RefractionSwitch(
                  value: false,
                  disabled: true,
                  onChanged: (_) => fail('disabled switch toggled'),
                ),
                RefractionSwitch(
                  value: on,
                  onChanged: (v) => setState(() => on = v),
                ),
              ],
            ),
          ),
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pump();
      expect(on, isTrue);
    });
  });

  group('reduced motion', () {
    testWidgets('button hover transition is instant when motion is reduced', (
      tester,
    ) async {
      await tester.pumpWidget(
        MediaQuery(
          data: const MediaQueryData(disableAnimations: true),
          child: _host(
            RefractionButton(onPressed: () {}, child: const Text('Send')),
          ),
        ),
      );
      final container = tester.widget<AnimatedContainer>(
        find.descendant(
          of: find.byType(RefractionButton),
          matching: find.byType(AnimatedContainer),
        ),
      );
      expect(container.duration, Duration.zero);
    });
  });
}
