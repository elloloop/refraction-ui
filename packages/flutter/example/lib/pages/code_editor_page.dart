import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class CodeEditorPage extends StatefulWidget {
  const CodeEditorPage({super.key});

  @override
  State<CodeEditorPage> createState() => _CodeEditorPageState();
}

class _CodeEditorPageState extends State<CodeEditorPage> {
  final TextEditingController _controller = TextEditingController(
    text: '''
function helloWorld() {
  console.log("Hello, Refraction!");
}

helloWorld();
''',
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const RefractionNavbar(logo: Text('Code Editor')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Code Editor',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text(
              'A headless code editor that supports various languages and custom header actions.',
            ),
            const SizedBox(height: 32),
            const Text(
              'Default Example',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            RefractionCodeEditor(
              language: 'ts',
              controller: _controller,
              actions: [
                RefractionCodeEditorAction(
                  label: 'Copy',
                  onClick: () {
                    // In a real app, copy to clipboard
                    debugPrint('Copied to clipboard');
                  },
                ),
              ],
            ),
            const SizedBox(height: 32),
            const Text(
              'Read-only Example',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const RefractionCodeEditor(
              language: 'python',
              readOnly: true,
              controller: null, // use unmanaged for simple viewing
            ),
          ],
        ),
      ),
    );
  }
}
