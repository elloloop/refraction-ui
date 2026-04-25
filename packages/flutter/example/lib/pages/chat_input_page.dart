import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class ChatInputPage extends StatefulWidget {
  const ChatInputPage({super.key});

  @override
  State<ChatInputPage> createState() => _ChatInputPageState();
}

class _ChatInputPageState extends State<ChatInputPage> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;
    return PreviewCanvas(
      title: "Chat Input",
      description: "A highly capable, auto-expanding textbox identical in UX to AI chat interfaces.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: RefractionRichChatInput(
            controller: _controller,
            placeholder: "Message ChatGPT...",
            prefixIcon: IconButton(
              onPressed: () {},
              icon: Icon(Icons.add_circle_outline, color: colors.mutedForeground, size: 24),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              splashRadius: 20,
            ),
            suffixIcon: IconButton(
              onPressed: () {
                if (_controller.text.isNotEmpty) {
                  // Simulate submit
                  _controller.clear();
                }
              },
              icon: Icon(Icons.arrow_upward, color: colors.primary, size: 24),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              splashRadius: 20,
            ),
            onSubmitted: (value) {
              // Handle submit
              RefractionToast.show(
                context: context,
                title: "Message Sent",
                description: value,
              );
            },
          ),
        ),
      ),
    );
  }
}
