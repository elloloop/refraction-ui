import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

/// Placeholder media for the gallery — Widgetbook and CI must render without
/// network or local files, so the `imageBuilder` seam returns flat tiles.
Widget _placeholderTile(
  BuildContext context,
  RefractionChatAttachment attachment,
) {
  final colors = [
    Colors.teal.shade300,
    Colors.indigo.shade300,
    Colors.orange.shade300,
    Colors.pink.shade300,
  ];
  final index = attachment.id.hashCode.abs() % colors.length;
  return Container(
    color: colors[index],
    alignment: Alignment.center,
    child: const Icon(Icons.image_outlined, color: Colors.white54, size: 40),
  );
}

RefractionChatAttachment _image(String id) => RefractionChatAttachment(
  id: id,
  name: '$id.jpg',
  url: '',
  type: 'image/jpeg',
  size: 482113,
);

@widgetbook.UseCase(name: 'Text', type: RefractionChatBubble)
Widget textChatBubbleUseCase(BuildContext context) {
  final now = DateTime.now();
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      RefractionChatBubble(
        text: 'Hey! Did the new message renderers land?',
        createdAt: now.subtract(const Duration(minutes: 4)),
      ),
      RefractionChatBubble(
        text: 'Just now — text, media, files and audio all render.',
        outgoing: true,
        createdAt: now,
        status: RefractionChatMessageStatus.read,
      ),
    ],
  );
}

@widgetbook.UseCase(name: 'Image with caption', type: RefractionChatBubble)
Widget imageChatBubbleUseCase(BuildContext context) {
  return RefractionChatBubble(
    text: 'This one has a caption, WhatsApp-style 🙌',
    outgoing: true,
    createdAt: DateTime.now(),
    status: RefractionChatMessageStatus.delivered,
    attachments: [_image('cafe')],
    imageBuilder: _placeholderTile,
  );
}

@widgetbook.UseCase(name: 'Media grid', type: RefractionChatBubble)
Widget gridChatBubbleUseCase(BuildContext context) {
  return RefractionChatBubble(
    text: 'Three from the offsite',
    attachments: [_image('a'), _image('b'), _image('c')],
    imageBuilder: _placeholderTile,
    createdAt: DateTime.now(),
  );
}

@widgetbook.UseCase(name: 'Video', type: RefractionChatBubble)
Widget videoChatBubbleUseCase(BuildContext context) {
  return const RefractionChatBubble(
    text: 'Screen recording of the flow',
    outgoing: true,
    attachments: [
      RefractionChatAttachment(
        id: 'v1',
        name: 'composer-flow.mp4',
        url: '',
        type: 'video/mp4',
        size: 7340032,
      ),
    ],
  );
}

@widgetbook.UseCase(name: 'File card', type: RefractionChatBubble)
Widget fileChatBubbleUseCase(BuildContext context) {
  return const RefractionChatBubble(
    text: 'Spec attached — have a look?',
    attachments: [
      RefractionChatAttachment(
        id: 'f1',
        name: 'message-renderers-spec.pdf',
        url: '',
        type: 'application/pdf',
        size: 482113,
      ),
    ],
  );
}

@widgetbook.UseCase(name: 'Audio', type: RefractionChatBubble)
Widget audioChatBubbleUseCase(BuildContext context) {
  return const RefractionChatBubble(
    outgoing: true,
    attachments: [
      RefractionChatAttachment(
        id: 'a1',
        name: 'voice-note.m4a',
        url: '',
        type: 'audio/m4a',
        size: 122880,
      ),
    ],
  );
}

@widgetbook.UseCase(name: 'Jumbo emoji', type: RefractionChatBubble)
Widget jumboChatBubbleUseCase(BuildContext context) {
  final now = DateTime.now();
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      RefractionChatBubble(
        text: '🙌',
        createdAt: now.subtract(const Duration(minutes: 2)),
      ),
      RefractionChatBubble(
        text: '🎉🎉🎉',
        outgoing: true,
        createdAt: now,
        status: RefractionChatMessageStatus.read,
      ),
      // Four emoji is regular text again (WhatsApp's rule).
      RefractionChatBubble(text: '🎉🎉🎉🎉', outgoing: true, createdAt: now),
    ],
  );
}

@widgetbook.UseCase(name: 'Animated sticker', type: RefractionChatBubble)
Widget stickerChatBubbleUseCase(BuildContext context) {
  // The starter pack's last sticker is the Lottie-animated one — it loops
  // in chat exactly like an animated sticker in WhatsApp.
  final animated = refractionStarterStickers().last;
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      RefractionChatBubble(
        sticker: animated,
        createdAt: DateTime.now().subtract(const Duration(minutes: 1)),
      ),
      RefractionChatBubble(
        sticker: animated,
        outgoing: true,
        createdAt: DateTime.now(),
        status: RefractionChatMessageStatus.delivered,
      ),
    ],
  );
}
