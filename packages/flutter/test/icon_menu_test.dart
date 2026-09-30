import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'composer_test.dart' show buildApp;

void main() {
  testWidgets('keyboard reaches icon menu and Enter and Space toggle it', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildApp(
        RefractionDropdownMenu(
          triggerBuilder: (context, toggle) => RefractionButton(
            size: RefractionButtonSize.icon,
            semanticLabel: 'Dictation language',
            onPressed: toggle,
            child: const Icon(Icons.keyboard_arrow_down),
          ),
          items: [RefractionDropdownItem(label: 'English', onSelected: () {})],
        ),
      ),
    );
    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    await tester.pumpAndSettle();
    expect(find.text('English'), findsOneWidget);
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    await tester.pumpAndSettle();
    expect(find.text('English'), findsNothing);
  });

  for (final loading in [false, true]) {
    testWidgets(
      'disabled or loading icon action cannot activate by keyboard ($loading)',
      (tester) async {
        var calls = 0;
        await tester.pumpWidget(
          buildApp(
            RefractionButton(
              onPressed: loading ? () => calls++ : null,
              isLoading: loading,
              semanticLabel: 'Dictate',
              size: RefractionButtonSize.icon,
              child: const Icon(Icons.mic_none),
            ),
          ),
        );
        await tester.sendKeyEvent(LogicalKeyboardKey.tab);
        await tester.sendKeyEvent(LogicalKeyboardKey.enter);
        await tester.sendKeyEvent(LogicalKeyboardKey.space);
        await tester.pump();
        expect(calls, 0);
      },
    );
  }

  testWidgets(
    'icon action and adjacent language menu are separate accessible actions',
    (tester) async {
      var starts = 0;
      String? selected;
      await tester.pumpWidget(
        buildApp(
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              RefractionButton(
                size: RefractionButtonSize.icon,
                semanticLabel: 'Dictate',
                onPressed: () => starts++,
                child: const Icon(Icons.mic_none),
              ),
              RefractionDropdownMenu(
                triggerBuilder: (context, toggle) => RefractionButton(
                  size: RefractionButtonSize.icon,
                  semanticLabel: 'Dictation language',
                  onPressed: toggle,
                  child: const Icon(Icons.keyboard_arrow_down),
                ),
                items: [
                  for (final label in ['Auto', 'English', 'Telugu'])
                    RefractionDropdownItem(
                      label: label,
                      onSelected: () => selected = label,
                    ),
                ],
              ),
            ],
          ),
        ),
      );
      expect(find.text('Dictate'), findsNothing);
      expect(find.text('English'), findsNothing);
      await tester.tap(find.bySemanticsLabel('Dictate'));
      expect(starts, 1);
      expect(find.text('English'), findsNothing);
      await tester.tap(find.bySemanticsLabel('Dictation language'));
      await tester.pumpAndSettle();
      expect(find.text('English'), findsOneWidget);
      expect(starts, 1);
      await tester.tap(find.text('Telugu'));
      await tester.pumpAndSettle();
      expect(selected, 'Telugu');
      expect(find.text('English'), findsNothing);
      await tester.tap(find.bySemanticsLabel('Dictation language'));
      await tester.pumpAndSettle();
      await tester.tap(find.bySemanticsLabel('Dictation language'));
      await tester.pumpAndSettle();
      expect(find.text('English'), findsNothing);
    },
  );

  testWidgets('legacy dropdown trigger still opens and selects', (
    tester,
  ) async {
    var selected = false;
    await tester.pumpWidget(
      buildApp(
        RefractionDropdownMenu(
          trigger: const Text('Choose'),
          items: [
            RefractionDropdownItem(
              label: 'Option',
              onSelected: () => selected = true,
            ),
          ],
        ),
      ),
    );
    await tester.tap(find.text('Choose'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Option'));
    await tester.pumpAndSettle();
    expect(selected, isTrue);
  });

  testWidgets('disabled icon action does not fire and keeps accessible name', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildApp(
        const RefractionButton(
          size: RefractionButtonSize.icon,
          semanticLabel: 'Dictate',
          onPressed: null,
          child: Icon(Icons.mic_none),
        ),
      ),
    );
    expect(find.bySemanticsLabel('Dictate'), findsOneWidget);
    await tester.tap(find.bySemanticsLabel('Dictate'));
    expect(tester.takeException(), isNull);
  });
}
