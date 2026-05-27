import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import './../dev_tools/preview_canvas.dart';

class ConversationPage extends StatefulWidget {
  const ConversationPage({super.key});

  @override
  State<ConversationPage> createState() => _ConversationPageState();
}

class _ConversationPageState extends State<ConversationPage> {
  final List<RefractionMessage> _messages = [
    RefractionMessage(
      id: '1',
      role: RefractionMessageRole.system,
      content: 'Chat started',
      createdAt: DateTime.now().subtract(const Duration(minutes: 5)),
    ),
    RefractionMessage(
      id: '2',
      role: RefractionMessageRole.assistant,
      content: 'Hello! How can I help you today?',
      createdAt: DateTime.now().subtract(const Duration(minutes: 4)),
      avatar: const RefractionAvatar(fallbackText: 'AI'),
      authorName: 'Assistant',
    ),
    RefractionMessage(
      id: '3',
      role: RefractionMessageRole.user,
      content: 'I need to check my recent transactions.',
      createdAt: DateTime.now().subtract(const Duration(minutes: 3)),
      avatar: const RefractionAvatar(fallbackText: 'US'),
      authorName: 'User',
    ),
  ];

  bool _isLoading = false;
  final TextEditingController _controller = TextEditingController();

  void _sendMessage() {
    if (_controller.text.trim().isEmpty) return;

    setState(() {
      _messages.add(
        RefractionMessage(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          role: RefractionMessageRole.user,
          content: _controller.text.trim(),
          createdAt: DateTime.now(),
          avatar: const RefractionAvatar(fallbackText: 'US'),
          authorName: 'User',
        ),
      );
      _controller.clear();
      _isLoading = true;
    });

    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _messages.add(
          RefractionMessage(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            role: RefractionMessageRole.assistant,
            content: 'Here are your recent transactions.',
            createdAt: DateTime.now(),
            avatar: const RefractionAvatar(fallbackText: 'AI'),
            authorName: 'Assistant',
            customContent: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Here are your recent transactions.',
                  style: TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black12,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Coffee: \$4.50\nGroceries: \$45.00',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        );
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: 'Conversation',
      fill: true,
      child: Column(
        children: [
          Expanded(
            child: RefractionConversation(
              messages: _messages,
              isLoading: _isLoading,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _sendMessage,
                  child: const Text('Send'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
