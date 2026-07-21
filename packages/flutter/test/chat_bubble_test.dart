// Widget tests for RefractionChatBubble / RefractionChatAttachmentView.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lottie/lottie.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget buildApp(Widget child) {
  return MaterialApp(
    home: RefractionTheme(
      data: RefractionThemeData.light(),
      child: Scaffold(body: Builder(builder: (context) => child)),
    ),
  );
}

RefractionChatAttachment attachment(
  String type, {
  String id = 'a1',
  String name = 'file.bin',
  int? size,
}) => RefractionChatAttachment(
  id: id,
  name: name,
  url: '',
  type: type,
  size: size,
);

/// Deterministic placeholder for media tiles (no network/file IO in tests).
Widget placeholderTile(
  BuildContext context,
  RefractionChatAttachment attachment,
) => Container(key: ValueKey('tile-${attachment.id}'), color: Colors.red);

void main() {
  testWidgets('text bubble renders content, footer time and read ticks', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildApp(
        RefractionChatBubble(
          text: 'hello world',
          outgoing: true,
          createdAt: DateTime(2025, 1, 1, 9, 5),
          status: RefractionChatMessageStatus.read,
        ),
      ),
    );
    expect(find.text('hello world'), findsOneWidget);
    expect(find.text('09:05'), findsOneWidget);
    expect(find.byIcon(Icons.done_all), findsOneWidget);
  });

  testWidgets('image attachment renders via imageBuilder with the message '
      'text as caption', (tester) async {
    await tester.pumpWidget(
      buildApp(
        RefractionChatBubble(
          text: 'check this photo',
          attachments: [attachment('image/jpeg', id: 'img1')],
          imageBuilder: placeholderTile,
        ),
      ),
    );
    expect(find.byKey(const ValueKey('tile-img1')), findsOneWidget);
    expect(find.text('check this photo'), findsOneWidget);
  });

  testWidgets('media grid lays out multiple images and marks overflow', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildApp(
        RefractionChatBubble(
          attachments: [
            for (var i = 0; i < 5; i++)
              attachment('image/png', id: 'img$i'),
          ],
          imageBuilder: placeholderTile,
        ),
      ),
    );
    expect(find.byKey(const ValueKey('tile-img3')), findsOneWidget);
    expect(find.byKey(const ValueKey('tile-img4')), findsNothing);
    expect(find.text('+1'), findsOneWidget);
  });

  testWidgets('video attachment shows a play affordance, not the filename', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildApp(
        RefractionChatBubble(
          attachments: [attachment('video/mp4', name: 'clip.mp4')],
        ),
      ),
    );
    expect(find.byIcon(Icons.play_arrow_rounded), findsOneWidget);
    expect(find.text('clip.mp4'), findsNothing);
  });

  testWidgets('file card shows the name and formatted size', (tester) async {
    await tester.pumpWidget(
      buildApp(
        RefractionChatBubble(
          text: 'spec attached',
          attachments: [
            attachment('application/pdf', name: 'spec.pdf', size: 122880),
          ],
        ),
      ),
    );
    expect(find.text('spec.pdf'), findsOneWidget);
    expect(find.text('120 KB'), findsOneWidget);
    expect(find.byIcon(Icons.download_outlined), findsOneWidget);
  });

  testWidgets('audio attachment renders a play row, not a file card', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildApp(
        RefractionChatBubble(
          attachments: [attachment('audio/m4a', name: 'note.m4a')],
        ),
      ),
    );
    expect(find.byIcon(Icons.play_arrow_rounded), findsOneWidget);
    expect(find.byIcon(Icons.graphic_eq), findsOneWidget);
    expect(find.byIcon(Icons.download_outlined), findsNothing);
  });

  testWidgets('tapping an image tile reports the attachment', (tester) async {
    final tapped = <RefractionChatAttachment>[];
    await tester.pumpWidget(
      buildApp(
        RefractionChatBubble(
          attachments: [attachment('image/jpeg', id: 'img1')],
          imageBuilder: placeholderTile,
          onAttachmentTap: tapped.add,
        ),
      ),
    );
    await tester.tap(find.byKey(const ValueKey('tile-img1')));
    expect(tapped.single.id, 'img1');
  });

  testWidgets('tapping a file card reports the attachment', (tester) async {
    final tapped = <RefractionChatAttachment>[];
    await tester.pumpWidget(
      buildApp(
        RefractionChatBubble(
          attachments: [attachment('application/pdf', name: 'spec.pdf')],
          onAttachmentTap: tapped.add,
        ),
      ),
    );
    await tester.tap(find.text('spec.pdf'));
    expect(tapped.single.name, 'spec.pdf');
  });

  testWidgets('RefractionConversation renders message attachments', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildApp(
        RefractionConversation(
          messages: [
            RefractionMessage(
              id: 'm1',
              role: RefractionMessageRole.user,
              content: 'here you go',
              attachments: [attachment('application/pdf', name: 'deck.pdf')],
            ),
          ],
        ),
      ),
    );
    expect(find.text('here you go'), findsOneWidget);
    expect(find.text('deck.pdf'), findsOneWidget);
  });

  testWidgets('emoji-only messages animate when a Noto asset exists, stay '
      'static otherwise; 4+ emoji stay regular text', (tester) async {
    // 🎉 has a bundled Lottie → animates, no static fallback.
    await tester.pumpWidget(buildApp(const RefractionChatBubble(text: '🎉')));
    expect(find.byType(Lottie), findsOneWidget);
    expect(find.text('🎉'), findsNothing);

    await tester.pumpWidget(buildApp(const RefractionChatBubble(text: '🎉🎉🎉')));
    expect(find.byType(Lottie), findsNWidgets(3));

    // The ZWJ family emoji has no animated asset → static jumbo glyph.
    await tester.pumpWidget(buildApp(const RefractionChatBubble(text: '👨‍👩‍👧')));
    expect(find.byType(Lottie), findsNothing);
    expect(tester.widget<Text>(find.text('👨‍👩‍👧')).style?.fontSize, 56);

    // Four emoji is regular text again (WhatsApp's rule): no explicit size.
    await tester.pumpWidget(
      buildApp(const RefractionChatBubble(text: '🎉🎉🎉🎉')),
    );
    expect(find.byType(Lottie), findsNothing);
    expect(tester.widget<Text>(find.text('🎉🎉🎉🎉')).style?.fontSize, isNull);

    // Emoji plus words is regular text.
    await tester.pumpWidget(buildApp(const RefractionChatBubble(text: 'nice 🎉')));
    expect(find.byType(Lottie), findsNothing);
    expect(tester.widget<Text>(find.text('nice 🎉')).style?.fontSize, isNull);
  });

  testWidgets('a single emoji with no animated asset renders static jumbo', (
    tester,
  ) async {
    // 🐶 is not in Google's animated set → static 56px glyph.
    await tester.pumpWidget(buildApp(const RefractionChatBubble(text: '🐶')));
    expect(find.byType(Lottie), findsNothing);
    expect(tester.widget<Text>(find.text('🐶')).style?.fontSize, 56);
  });

  testWidgets('sticker messages render through the sticker builder', (
    tester,
  ) async {
    await tester.pumpWidget(
      buildApp(
        RefractionChatBubble(
          sticker: EmojiSticker(
            id: 's1',
            label: 'Pulse',
            builder: (context, size) =>
                Container(key: const ValueKey('sticker-s1')),
          ),
        ),
      ),
    );
    expect(find.byKey(const ValueKey('sticker-s1')), findsOneWidget);
  });
}
