import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('RefractionThreadView', () {
    testWidgets('renders empty state without error', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        RefractionTheme(
          data: RefractionThemeData.light(),
          child: const MaterialApp(
            home: Scaffold(body: RefractionThreadView(messages: [])),
          ),
        ),
      );

      // Verify no messages are rendered
      expect(find.byType(RefractionThreadView), findsOneWidget);
      expect(find.byType(Column), findsNothing);
    });

    testWidgets('renders single message correctly', (
      WidgetTester tester,
    ) async {
      final messages = [
        RefractionThreadMessageData(
          id: '1',
          author: const RefractionThreadMessageAuthor(id: 'u1', name: 'Alice'),
          content: 'Hello, World!',
          timestamp: DateTime(2026, 1, 1, 10, 0),
        ),
      ];

      await tester.pumpWidget(
        RefractionTheme(
          data: RefractionThemeData.light(),
          child: MaterialApp(
            home: Scaffold(body: RefractionThreadView(messages: messages)),
          ),
        ),
      );

      expect(find.text('Alice'), findsOneWidget);
      expect(find.text('Hello, World!'), findsOneWidget);
      expect(find.text('10:00 AM'), findsOneWidget);
    });

    testWidgets('renders multiple messages', (WidgetTester tester) async {
      final messages = [
        RefractionThreadMessageData(
          id: '1',
          author: const RefractionThreadMessageAuthor(id: 'u1', name: 'Alice'),
          content: 'Hello',
          timestamp: DateTime(2026, 1, 1, 10, 0),
        ),
        RefractionThreadMessageData(
          id: '2',
          author: const RefractionThreadMessageAuthor(id: 'u2', name: 'Bob'),
          content: 'Hi Alice',
          timestamp: DateTime(2026, 1, 1, 10, 5),
        ),
      ];

      await tester.pumpWidget(
        RefractionTheme(
          data: RefractionThemeData.light(),
          child: MaterialApp(
            home: Scaffold(body: RefractionThreadView(messages: messages)),
          ),
        ),
      );

      expect(find.text('Alice'), findsOneWidget);
      expect(find.text('Hello'), findsOneWidget);
      expect(find.text('Bob'), findsOneWidget);
      expect(find.text('Hi Alice'), findsOneWidget);
    });

    testWidgets('renders edited state', (WidgetTester tester) async {
      final messages = [
        RefractionThreadMessageData(
          id: '1',
          author: const RefractionThreadMessageAuthor(id: 'u1', name: 'Alice'),
          content: 'Typo fix',
          timestamp: DateTime(2026, 1, 1, 10, 0),
          edited: true,
        ),
      ];

      await tester.pumpWidget(
        RefractionTheme(
          data: RefractionThemeData.light(),
          child: MaterialApp(
            home: Scaffold(body: RefractionThreadView(messages: messages)),
          ),
        ),
      );

      expect(find.text('(edited)'), findsOneWidget);
    });

    testWidgets('calls onReply when reply button is tapped', (
      WidgetTester tester,
    ) async {
      String? repliedMessageId;

      final messages = [
        RefractionThreadMessageData(
          id: 'msg_1',
          author: const RefractionThreadMessageAuthor(id: 'u1', name: 'Alice'),
          content: 'Click reply',
          timestamp: DateTime(2026, 1, 1, 10, 0),
        ),
      ];

      await tester.pumpWidget(
        RefractionTheme(
          data: RefractionThemeData.light(),
          child: MaterialApp(
            home: Scaffold(
              body: RefractionThreadView(
                messages: messages,
                onReply: (id) => repliedMessageId = id,
              ),
            ),
          ),
        ),
      );

      // Need to hover to see the reply button since it has animated opacity,
      // but it's physically in the tree, we can just tap the text.
      final replyFinder = find.text('Reply');
      expect(replyFinder, findsOneWidget);

      await tester.tap(replyFinder);
      await tester.pumpAndSettle();

      expect(repliedMessageId, equals('msg_1'));
    });

    testWidgets('calls onReact when reaction is tapped', (
      WidgetTester tester,
    ) async {
      String? reactedMsgId;
      String? reactedEmoji;

      final messages = [
        RefractionThreadMessageData(
          id: 'msg_1',
          author: const RefractionThreadMessageAuthor(id: 'u1', name: 'Alice'),
          content: 'Cool stuff',
          timestamp: DateTime(2026, 1, 1, 10, 0),
          reactions: [
            const RefractionThreadMessageReaction(
              emoji: '👍',
              count: 2,
              userReacted: false,
            ),
          ],
        ),
      ];

      await tester.pumpWidget(
        RefractionTheme(
          data: RefractionThemeData.light(),
          child: MaterialApp(
            home: Scaffold(
              body: RefractionThreadView(
                messages: messages,
                onReact: (msgId, emoji) {
                  reactedMsgId = msgId;
                  reactedEmoji = emoji;
                },
              ),
            ),
          ),
        ),
      );

      final reactionFinder = find.text('👍 2');
      expect(reactionFinder, findsOneWidget);

      await tester.tap(reactionFinder);
      await tester.pumpAndSettle();

      expect(reactedMsgId, equals('msg_1'));
      expect(reactedEmoji, equals('👍'));
    });

    testWidgets('expands and collapses replies', (WidgetTester tester) async {
      final messages = [
        RefractionThreadMessageData(
          id: '1',
          author: const RefractionThreadMessageAuthor(id: 'u1', name: 'Alice'),
          content: 'Has replies',
          timestamp: DateTime(2026, 1, 1, 10, 0),
          replies: [
            RefractionThreadMessageData(
              id: '1.1',
              author: const RefractionThreadMessageAuthor(
                id: 'u2',
                name: 'Bob',
              ),
              content: 'I am a reply',
              timestamp: DateTime(2026, 1, 1, 10, 5),
            ),
          ],
        ),
      ];

      await tester.pumpWidget(
        RefractionTheme(
          data: RefractionThemeData.light(),
          child: MaterialApp(
            home: Scaffold(body: RefractionThreadView(messages: messages)),
          ),
        ),
      );

      // The reply should not be visible initially
      expect(find.text('I am a reply'), findsNothing);

      // Find the reply indicator
      final indicatorFinder = find.text('1 reply');
      expect(indicatorFinder, findsOneWidget);

      // Tap to expand
      await tester.tap(indicatorFinder);
      await tester.pumpAndSettle();

      // Reply should now be visible
      expect(find.text('I am a reply'), findsOneWidget);

      // Tap again to collapse
      await tester.tap(indicatorFinder);
      await tester.pumpAndSettle();

      // Reply should be hidden
      expect(find.text('I am a reply'), findsNothing);
    });

    testWidgets('renders attachments correctly', (WidgetTester tester) async {
      final messages = [
        RefractionThreadMessageData(
          id: '1',
          author: const RefractionThreadMessageAuthor(id: 'u1', name: 'Alice'),
          content: 'Check this out',
          timestamp: DateTime(2026, 1, 1, 10, 0),
          attachments: [
            const RefractionThreadMessageAttachment(
              id: 'a1',
              name: 'document.pdf',
              url: 'https://example.com/document.pdf',
              type: 'application/pdf',
            ),
          ],
        ),
      ];

      await tester.pumpWidget(
        RefractionTheme(
          data: RefractionThemeData.light(),
          child: MaterialApp(
            home: Scaffold(body: RefractionThreadView(messages: messages)),
          ),
        ),
      );

      expect(find.text('document.pdf'), findsOneWidget);
      expect(find.byIcon(Icons.picture_as_pdf_outlined), findsOneWidget);
    });

    testWidgets('supports deep nesting of replies', (
      WidgetTester tester,
    ) async {
      final messages = [
        RefractionThreadMessageData(
          id: '1',
          author: const RefractionThreadMessageAuthor(id: 'u1', name: 'Alice'),
          content: 'Level 0',
          timestamp: DateTime(2026, 1, 1, 10, 0),
          replies: [
            RefractionThreadMessageData(
              id: '1.1',
              author: const RefractionThreadMessageAuthor(
                id: 'u2',
                name: 'Bob',
              ),
              content: 'Level 1',
              timestamp: DateTime(2026, 1, 1, 10, 5),
              replies: [
                RefractionThreadMessageData(
                  id: '1.1.1',
                  author: const RefractionThreadMessageAuthor(
                    id: 'u1',
                    name: 'Alice',
                  ),
                  content: 'Level 2',
                  timestamp: DateTime(2026, 1, 1, 10, 10),
                ),
              ],
            ),
          ],
        ),
      ];

      await tester.pumpWidget(
        RefractionTheme(
          data: RefractionThemeData.light(),
          child: MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: RefractionThreadView(messages: messages),
              ),
            ),
          ),
        ),
      );

      // Expand level 0
      await tester.tap(find.text('1 reply'));
      await tester.pumpAndSettle();
      expect(find.text('Level 1'), findsOneWidget);

      // Expand level 1
      await tester.tap(find.text('1 reply').last);
      await tester.pumpAndSettle();
      expect(find.text('Level 2'), findsOneWidget);
    });

    testWidgets('avatar fallbacks render properly', (
      WidgetTester tester,
    ) async {
      final messages = [
        RefractionThreadMessageData(
          id: '1',
          author: const RefractionThreadMessageAuthor(id: 'u1', name: 'Zack'),
          content: 'No avatar',
          timestamp: DateTime(2026, 1, 1, 10, 0),
        ),
      ];

      await tester.pumpWidget(
        RefractionTheme(
          data: RefractionThemeData.light(),
          child: MaterialApp(
            home: Scaffold(body: RefractionThreadView(messages: messages)),
          ),
        ),
      );

      // Should show 'Z' as fallback
      expect(find.text('Z'), findsOneWidget);
    });
  });
}
