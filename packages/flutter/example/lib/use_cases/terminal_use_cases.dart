import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

// Exporting types directly needed for cases
import 'package:refraction_ui/src/components/terminal.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionTerminal)
Widget defaultTerminalUseCase(BuildContext context) {
  return const _TerminalDemo();
}

class _TerminalDemo extends StatefulWidget {
  const _TerminalDemo();

  @override
  State<_TerminalDemo> createState() => _TerminalDemoState();
}

class _TerminalDemoState extends State<_TerminalDemo> {
  final List<TerminalLine> _lines = const [
    TerminalLine(kind: TerminalLineKind.info, text: 'System session initialized...'),
    TerminalLine(kind: TerminalLineKind.command, text: 'git status'),
    TerminalLine(kind: TerminalLineKind.stdout, text: 'On branch main\nYour branch is up to date with \'origin/main\'.'),
    TerminalLine(kind: TerminalLineKind.command, text: 'flutter test test/terminal_test.dart'),
    TerminalLine(kind: TerminalLineKind.info, text: 'Running tests...'),
    TerminalLine(kind: TerminalLineKind.stdout, text: '00:01 +0: loading test/terminal_test.dart\n00:02 +1: RefractionTerminal renders correctly'),
    TerminalLine(kind: TerminalLineKind.success, text: '00:02 +2: All tests passed!'),
    TerminalLine(kind: TerminalLineKind.command, text: 'pnpm run build --filter=broken'),
    TerminalLine(kind: TerminalLineKind.stderr, text: 'Error: Cannot find package configuration for \'broken\' in packages/'),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: RefractionTerminal(
        lines: _lines,
        promptSymbol: '❯',
        maxHeight: TerminalMaxHeight.md,
      ),
    );
  }
}
