import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  Widget buildTestWidget({
    TextEditingController? controller,
    List<CommandTrigger> triggers = const [],
    Widget Function(
      BuildContext context,
      String trigger,
      String search,
      VoidCallback close,
    )?
    popoverBuilder,
    void Function(String trigger, String search)? onCommandCommit,
  }) {
    return MaterialApp(
      home: Scaffold(
        body: RefractionTheme(
          data: RefractionThemeData.light(),
          child: RefractionCommandInput(
            controller: controller,
            placeholder: 'Type a command...',
            triggers: triggers,
            popoverBuilder: popoverBuilder,
            onCommandCommit: onCommandCommit,
          ),
        ),
      ),
    );
  }

  testWidgets('renders input correctly', (tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    expect(find.byType(RefractionInput), findsOneWidget);
    expect(find.text('Type a command...'), findsOneWidget);
  });

  testWidgets('detects command trigger and shows popover', (tester) async {
    final triggers = [CommandTrigger(char: '@')];

    bool popoverShown = false;
    String detectedTrigger = '';
    String detectedSearch = '';

    await tester.pumpWidget(
      buildTestWidget(
        triggers: triggers,
        popoverBuilder: (context, trigger, search, close) {
          popoverShown = true;
          detectedTrigger = trigger;
          detectedSearch = search;
          return const Text('Popover Content');
        },
      ),
    );

    // Type '@'
    await tester.enterText(find.byType(EditableText), '@a');
    await tester.pumpAndSettle();

    // Manually updating selection to simulate typing
    final controller = tester
        .widget<EditableText>(find.byType(EditableText))
        .controller;
    controller.selection = const TextSelection.collapsed(offset: 2);
    await tester.pumpAndSettle();

    expect(popoverShown, isTrue);
    expect(detectedTrigger, equals('@'));
    expect(detectedSearch, equals('a'));
    expect(find.text('Popover Content'), findsOneWidget);
  });

  testWidgets('closes popover when trigger is erased', (tester) async {
    final triggers = [CommandTrigger(char: '/')];

    await tester.pumpWidget(
      buildTestWidget(
        triggers: triggers,
        popoverBuilder: (context, trigger, search, close) {
          return const Text('Command List');
        },
      ),
    );

    await tester.showKeyboard(find.byType(EditableText));
    await tester.pumpAndSettle();

    // Type trigger
    await tester.enterText(find.byType(EditableText), '/help');
    await tester.pumpAndSettle();

    // Manually updating selection to simulate typing
    final controller = tester
        .widget<EditableText>(find.byType(EditableText))
        .controller;
    controller.selection = const TextSelection.collapsed(offset: 5);
    await tester.pumpAndSettle();

    expect(find.text('Command List'), findsOneWidget);

    // Erase trigger
    await tester.enterText(find.byType(EditableText), '');
    await tester.pumpAndSettle();
    controller.selection = const TextSelection.collapsed(offset: 0);
    await tester.pumpAndSettle();

    expect(find.text('Command List'), findsNothing);
  });
}
