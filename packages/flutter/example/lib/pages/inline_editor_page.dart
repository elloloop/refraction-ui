import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class InlineEditorPage extends StatefulWidget {
  const InlineEditorPage({super.key});

  @override
  State<InlineEditorPage> createState() => _InlineEditorPageState();
}

class _InlineEditorPageState extends State<InlineEditorPage> {
  String _content =
      "Hello, world! Click this text to edit it.\n\nTry using the **bold** or # heading actions.";

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Inline Editor",
      description:
          "A headless-style editor that displays plain text and converts to a markdown editor on click.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: RefractionInlineEditor(
            value: _content,
            onSave: (value) {
              setState(() {
                _content = value;
              });
              RefractionToast.show(
                context: context,
                title: "Saved changes",
                description: "Content successfully updated.",
              );
            },
            onCancel: () {
              RefractionToast.show(
                context: context,
                title: "Cancelled editing",
              );
            },
          ),
        ),
      ),
    );
  }
}
