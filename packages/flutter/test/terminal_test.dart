import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/terminal.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionTerminal renders terminal lines correctly', (
    WidgetTester tester,
  ) async {
    final lines = [
      const TerminalLine(kind: TerminalLineKind.info, text: 'Starting...'),
      const TerminalLine(kind: TerminalLineKind.command, text: 'echo hello'),
      const TerminalLine(kind: TerminalLineKind.stdout, text: 'hello'),
      const TerminalLine(kind: TerminalLineKind.stderr, text: 'error occurred'),
      const TerminalLine(kind: TerminalLineKind.success, text: 'done'),
    ];

    await tester.pumpWidget(
      buildTestApp(
        RefractionTerminal(
          lines: lines,
          promptSymbol: '❯',
        ),
      ),
    );

    expect(find.text('Starting...'), findsOneWidget);
    expect(find.text('hello'), findsOneWidget);
    expect(find.text('error occurred'), findsOneWidget);
    expect(find.text('done'), findsOneWidget);

    // Verify that the command line renders with the prompt symbol inside a RichText
    expect(
      find.byWidgetPredicate((widget) =>
          widget is RichText &&
          widget.text.toPlainText().contains('echo hello')),
      findsOneWidget,
    );
  });
}
