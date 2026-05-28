import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

final _messages = [
  RefractionThreadMessageData(
    id: '1',
    author: const RefractionThreadMessageAuthor(id: 'u1', name: 'Alice'),
    content: 'Has anyone seen the new design docs?',
    timestamp: DateTime(2026, 5, 27, 9, 0),
    reactions: const [
      RefractionThreadMessageReaction(emoji: '👀', count: 2, userReacted: true),
    ],
    replies: [
      RefractionThreadMessageData(
        id: '1a',
        author: const RefractionThreadMessageAuthor(id: 'u2', name: 'Bob'),
        content: 'Yes, they look great!',
        timestamp: DateTime(2026, 5, 27, 9, 15),
      ),
    ],
  ),
  RefractionThreadMessageData(
    id: '2',
    author: const RefractionThreadMessageAuthor(id: 'u3', name: 'Charlie'),
    content: 'I will review them later today.',
    timestamp: DateTime(2026, 5, 27, 10, 0),
    attachments: const [
      RefractionThreadMessageAttachment(
        id: 'a1',
        name: 'feedback.pdf',
        url: 'https://example.com/feedback.pdf',
        type: 'application/pdf',
      ),
    ],
  ),
];

@widgetbook.UseCase(name: 'Default', type: RefractionThreadView)
Widget defaultThreadView(BuildContext context) {
  return RefractionThreadView(
    messages: _messages,
    currentUserId: 'u1',
    onReply: (_) {},
    onReact: (_, __) {},
  );
}

@widgetbook.UseCase(name: 'Empty', type: RefractionThreadView)
Widget emptyThreadView(BuildContext context) {
  return const RefractionThreadView(messages: []);
}
