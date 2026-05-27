import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class ThreadViewPage extends StatefulWidget {
  const ThreadViewPage({super.key});

  @override
  State<ThreadViewPage> createState() => _ThreadViewPageState();
}

class _ThreadViewPageState extends State<ThreadViewPage> {
  late List<RefractionThreadMessageData> _messages;

  @override
  void initState() {
    super.initState();
    _messages = [
      RefractionThreadMessageData(
        id: 'msg_1',
        author: const RefractionThreadMessageAuthor(
          id: 'u1',
          name: 'Sarah Connor',
          avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
        ),
        content: 'Has anyone seen the latest designs for the dashboard?',
        timestamp: DateTime.now().subtract(const Duration(hours: 2)),
        reactions: const [
          RefractionThreadMessageReaction(emoji: '👀', count: 3, userReacted: true),
        ],
        replies: [
          RefractionThreadMessageData(
            id: 'msg_2',
            author: const RefractionThreadMessageAuthor(
              id: 'u2',
              name: 'John Smith',
            ),
            content: 'I think they are in the shared folder.',
            timestamp: DateTime.now().subtract(const Duration(hours: 1, minutes: 45)),
            reactions: const [
              RefractionThreadMessageReaction(emoji: '👍', count: 1, userReacted: false),
            ],
            replies: [
              RefractionThreadMessageData(
                id: 'msg_3',
                author: const RefractionThreadMessageAuthor(
                  id: 'u1',
                  name: 'Sarah Connor',
                  avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
                ),
                content: 'Found them, thanks!',
                timestamp: DateTime.now().subtract(const Duration(hours: 1, minutes: 30)),
              ),
            ],
          ),
        ],
      ),
      RefractionThreadMessageData(
        id: 'msg_4',
        author: const RefractionThreadMessageAuthor(
          id: 'u3',
          name: 'Tech Lead',
          avatarUrl: 'https://i.pravatar.cc/150?u=techlead',
        ),
        content: 'Please review the attached PR before EOD.',
        timestamp: DateTime.now().subtract(const Duration(minutes: 30)),
        edited: true,
        attachments: const [
          RefractionThreadMessageAttachment(
            id: 'att_1',
            name: 'PR_1042_summary.pdf',
            url: '#',
            type: 'application/pdf',
          ),
        ],
      ),
    ];
  }

  void _handleReply(String messageId) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Replying to message: $messageId')),
    );
  }

  void _handleReact(String messageId, String emoji) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Reacted with $emoji on message: $messageId')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thread View'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Interactive Thread',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            RefractionCard(
              padding: const EdgeInsets.all(16),
              child: RefractionThreadView(
                messages: _messages,
                onReply: _handleReply,
                onReact: _handleReact,
                currentUserId: 'u1',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
