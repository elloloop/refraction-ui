import 'dart:async';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:video_player/video_player.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

/// Full chat demo — transcript, emoji/sticker panel, real attach pickers,
/// @mention / /slash / :emoji: triggers, and busy/stop simulated replies.
///
/// Registered here rather than in composer_use_cases.dart: the package's
/// golden tests import that file, and this demo pulls in picker plugins the
/// library package doesn't (and shouldn't) depend on.
@widgetbook.UseCase(name: 'Full featured', type: RefractionComposer)
Widget fullFeaturedComposerUseCase(BuildContext context) {
  return const ComposerFullDemo();
}

/// A full-fledged chat composer demo — WhatsApp/Slack style:
///
/// - A live chat transcript; sent messages append as bubbles.
/// - `@` mentions, `/` commands (start of message), `:` emoji shortcodes.
/// - Attach sheet with real device pickers: photo, video, camera, document,
///   audio. Picked files stage in the tray with simulated upload progress
///   (no upload backend exists; staging is local).
/// - Emoji/sticker panel in the keyboard's place (accessory panel), with
///   recents.
/// - Send → simulated reply with busy/stop; stop cancels the reply.
class ComposerFullDemo extends StatefulWidget {
  const ComposerFullDemo({super.key});

  @override
  State<ComposerFullDemo> createState() => _ComposerFullDemoState();
}

class _ChatMessage {
  final String text;
  final bool outgoing;
  final List<ComposerAttachment> attachments;
  final EmojiSticker? sticker;
  final DateTime time;

  _ChatMessage(
    this.text, {
    required this.outgoing,
    this.attachments = const [],
    this.sticker,
    DateTime? time,
  }) : time = time ?? DateTime.now();
}

/// Best-effort MIME type for a staged attachment (the pickers don't always
/// report one) — the bubble dispatches its renderer on this.
String _mimeForComposerAttachment(ComposerAttachment attachment) {
  if (attachment.mimeType != null && attachment.mimeType!.isNotEmpty) {
    return attachment.mimeType!;
  }
  switch (attachment.kind) {
    case ComposerAttachmentKind.image:
      return 'image/jpeg';
    case ComposerAttachmentKind.video:
      return 'video/mp4';
    case ComposerAttachmentKind.audio:
      return 'audio/mpeg';
    default:
      return 'application/octet-stream';
  }
}

class _ComposerFullDemoState extends State<ComposerFullDemo> {
  static const _roster = [
    ComposerCandidate(
      id: 'u_priya',
      display: 'Priya Sharma',
      subtitle: '@priya',
    ),
    ComposerCandidate(
      id: 'u_jordan',
      display: 'Jordan Lee',
      subtitle: '@jordan',
    ),
    ComposerCandidate(id: 'u_sam', display: 'Sam Okafor', subtitle: '@sam'),
    ComposerCandidate(id: 'u_mei', display: 'Mei Tanaka', subtitle: '@mei'),
    ComposerCandidate(id: 'u_alex', display: 'Alex Rivera', subtitle: '@alex'),
  ];

  static const _commands = [
    ComposerCandidate(
      id: 'poll',
      display: 'poll',
      subtitle: 'Create a quick poll',
    ),
    ComposerCandidate(
      id: 'remind',
      display: 'remind',
      subtitle: 'Set a reminder',
    ),
    ComposerCandidate(
      id: 'shrug',
      display: 'shrug',
      subtitle: r'Append ¯\_(ツ)_/¯',
    ),
  ];

  late final RefractionComposerController _controller;
  late final List<ComposerTrigger> _triggers;
  final FocusNode _focusNode = FocusNode();
  final ScrollController _scroll = ScrollController();
  final List<EmojiEntry> _recentEmojis = [];
  Timer? _replyTimer;

  final List<_ChatMessage> _messages = [];

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _messages.addAll([
      _ChatMessage(
        'Hey! Did you wire up the new composer yet?',
        outgoing: false,
        time: now.subtract(const Duration(minutes: 12)),
      ),
      _ChatMessage(
        'Almost — mentions, emoji and attachments are in. Want a demo?',
        outgoing: true,
        time: now.subtract(const Duration(minutes: 11)),
      ),
      _ChatMessage(
        'Yes please 🙌',
        outgoing: false,
        time: now.subtract(const Duration(minutes: 10)),
      ),
    ]);
    final shortcodes = refractionDefaultShortcodes();
    _triggers = [
      ComposerTrigger(
        id: 'mention',
        symbol: '@',
        resolve: (query) => _roster
            .where(
              (c) =>
                  c.display.toLowerCase().contains(query.toLowerCase()) ||
                  (c.subtitle ?? '').toLowerCase().contains(
                    query.toLowerCase(),
                  ),
            )
            .toList(),
      ),
      ComposerTrigger(
        id: 'slash-command',
        symbol: '/',
        scope: ComposerTriggerScope.startOfMessage,
        resolve: (query) => _commands
            .where((c) => c.display.startsWith(query.toLowerCase()))
            .toList(),
        buildDisplay: (candidate) => '/${candidate.display}',
      ),
      ComposerTrigger(
        id: 'emoji',
        symbol: ':',
        maxVisibleResults: 9,
        resolve: (query) => shortcodes.entries
            .where((e) => e.key.contains(query.toLowerCase()))
            .take(30)
            .map(
              (e) => ComposerCandidate(
                id: ':${e.key}:',
                display: e.value,
                subtitle: ':${e.key}:',
              ),
            )
            .toList(),
        buildDisplay: (candidate) => candidate.display,
      ),
    ];
    _controller = RefractionComposerController(
      triggers: _triggers,
      shortcodes: shortcodes,
      maxLength: 2000,
    );
  }

  @override
  void dispose() {
    _replyTimer?.cancel();
    _controller.dispose();
    _focusNode.dispose();
    _scroll.dispose();
    super.dispose();
  }

  /// WhatsApp-style toggle: open the emoji panel (dismissing the keyboard) or,
  /// if already open, close it and bring the keyboard back.
  void _toggleEmojiPanel() {
    if (_controller.isAccessoryPanelOpen) {
      _controller.closeAccessoryPanel();
      _focusNode.requestFocus();
    } else {
      _controller.openAccessoryPanel();
    }
  }

  void _insertEmoji(EmojiEntry entry) {
    _controller.insertTextAtCursor(entry.emoji);
    setState(() {
      _recentEmojis
        ..removeWhere((e) => e.emoji == entry.emoji)
        ..insert(0, entry);
    });
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.jumpTo(_scroll.position.maxScrollExtent);
      }
    });
  }

  void _handleSubmit(ComposerSubmission submission) {
    setState(() {
      _messages.add(
        _ChatMessage(
          submission.plainText,
          outgoing: true,
          attachments: submission.attachments,
        ),
      );
    });
    _scrollToEnd();
    _queueSimulatedReply(
      submission.attachments.isEmpty
          ? 'Looks great — ship it! 🚢'
          : 'Got the files, thanks! 🙏',
    );
  }

  /// Stickers send immediately (they don't go through the composer's text
  /// submission), exactly like WhatsApp.
  void _sendSticker(EmojiSticker sticker) {
    setState(() {
      _messages.add(_ChatMessage('', outgoing: true, sticker: sticker));
    });
    _scrollToEnd();
    _queueSimulatedReply('Haha, love it 😄');
  }

  /// Simulates a reply: the primary action morphs send → stop while "the
  /// other side is typing"; stop cancels the pending reply.
  void _queueSimulatedReply(String text) {
    _controller.setBusy(true);
    _replyTimer = Timer(const Duration(seconds: 2), () {
      if (!mounted) return;
      setState(() {
        _messages.add(_ChatMessage(text, outgoing: false));
      });
      _controller.setBusy(false);
      _scrollToEnd();
    });
  }

  void _handleStop() {
    _replyTimer?.cancel();
    _controller.setBusy(false);
  }

  Widget _buildMessage(BuildContext context, _ChatMessage message) {
    return RefractionChatBubble(
      text: message.text,
      outgoing: message.outgoing,
      createdAt: message.time,
      status: message.outgoing ? RefractionChatMessageStatus.read : null,
      sticker: message.sticker,
      attachments: [
        for (final attachment in message.attachments)
          RefractionChatAttachment(
            id: attachment.id,
            name: attachment.name,
            url: attachment.previewUrl ?? '',
            type: _mimeForComposerAttachment(attachment),
            size: attachment.sizeBytes,
          ),
      ],
      onAttachmentTap: (attachment) => _openAttachment(context, attachment),
    );
  }

  void _openAttachment(BuildContext context, RefractionChatAttachment attachment) {
    if (attachment.isImage) {
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => _ImageViewerPage(attachment: attachment),
        ),
      );
    } else if (attachment.isVideo) {
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => _VideoPlayerPage(attachment: attachment),
        ),
      );
    } else {
      RefractionToast.show(
        context: context,
        title: attachment.name,
        description: 'No preview wired for this file type.',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            controller: _scroll,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
            itemCount: _messages.length,
            itemBuilder: (context, index) =>
                _buildMessage(context, _messages[index]),
          ),
        ),
        RefractionComposer(
          controller: _controller,
          focusNode: _focusNode,
          maxLines: 6,
          triggers: _triggers,
          onSubmit: _handleSubmit,
          onStop: _handleStop,
          onAttachRequested: () =>
              showComposerAttachSheet(context, _controller),
          // WhatsApp-style emoji toggle: the icon swaps emoji <-> keyboard.
          trailingBuilder: (context, controller) => ComposerActionSlot(
            semanticLabel: controller.isAccessoryPanelOpen
                ? 'Show keyboard'
                : 'Emoji and stickers',
            onPressed: _toggleEmojiPanel,
            icon: Icon(
              controller.isAccessoryPanelOpen
                  ? Icons.keyboard_outlined
                  : Icons.emoji_emotions_outlined,
              color: colors.mutedForeground,
            ),
          ),
          accessoryPanelBuilder: (context) => RefractionEmojiPicker(
            width: double.infinity,
            fillHeight: true,
            recentEmojis: _recentEmojis,
            stickers: refractionStarterStickers(),
            onSelect: _insertEmoji,
            onStickerSelect: _sendSticker,
          ),
        ),
      ],
    );
  }
}

class _ImageViewerPage extends StatelessWidget {
  final RefractionChatAttachment attachment;

  const _ImageViewerPage({required this.attachment});

  @override
  Widget build(BuildContext context) {
    final url = attachment.url;
    final image = url.startsWith('http://') || url.startsWith('https://')
        ? Image.network(url)
        : Image.file(File(url));
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(
          attachment.name,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 14),
        ),
      ),
      body: Center(child: InteractiveViewer(child: image)),
    );
  }
}

class _VideoPlayerPage extends StatefulWidget {
  final RefractionChatAttachment attachment;

  const _VideoPlayerPage({required this.attachment});

  @override
  State<_VideoPlayerPage> createState() => _VideoPlayerPageState();
}

class _VideoPlayerPageState extends State<_VideoPlayerPage> {
  late final VideoPlayerController _controller = VideoPlayerController.file(
    File(widget.attachment.url),
  );
  late final Future<void> _initialized = _controller.initialize();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(
          widget.attachment.name,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 14),
        ),
      ),
      body: FutureBuilder<void>(
        future: _initialized,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          return Center(
            child: AspectRatio(
              aspectRatio: _controller.value.aspectRatio,
              child: VideoPlayer(_controller),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => setState(() {
          _controller.value.isPlaying
              ? _controller.pause()
              : _controller.play();
        }),
        child: Icon(
          _controller.value.isPlaying ? Icons.pause : Icons.play_arrow,
        ),
      ),
    );
  }
}

/// Maps a file extension to a [ComposerAttachmentKind].
ComposerAttachmentKind composerAttachmentKindForExtension(String? extension) {
  switch (extension?.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'heic':
      return ComposerAttachmentKind.image;
    case 'mp4':
    case 'mov':
    case 'mkv':
    case 'webm':
      return ComposerAttachmentKind.video;
    case 'mp3':
    case 'aac':
    case 'wav':
    case 'm4a':
    case 'ogg':
      return ComposerAttachmentKind.audio;
    default:
      return ComposerAttachmentKind.file;
  }
}

/// Stages an attachment in the composer tray and drives a simulated upload
/// (no upload backend exists; staging is local). Progress ticks to 100% over
/// ~1.5 s, then the chip flips to ready.
void stageComposerAttachmentWithSimulatedUpload(
  RefractionComposerController controller, {
  required ComposerAttachmentKind kind,
  required String name,
  int? sizeBytes,
  String? mimeType,
  String? previewPath,
}) {
  final id = controller.addAttachment(
    ComposerAttachment(
      kind: kind,
      name: name,
      sizeBytes: sizeBytes,
      mimeType: mimeType,
      previewUrl: previewPath,
      status: ComposerAttachmentStatus.uploading,
      progress: 0,
    ),
  );
  if (id == null) return; // rejected — the composer surfaces the event

  var ticks = 0;
  Timer.periodic(const Duration(milliseconds: 180), (timer) {
    ticks += 1;
    final progress = (ticks / 8).clamp(0.0, 1.0);
    try {
      if (progress >= 1.0) {
        controller.updateAttachment(
          id,
          status: ComposerAttachmentStatus.ready,
          progress: 1,
        );
        timer.cancel();
      } else {
        controller.updateAttachment(id, progress: progress);
      }
    } catch (_) {
      timer.cancel(); // controller was disposed mid-upload
    }
  });
}

enum _AttachAction { photo, video, camera, document, audio }

/// Opens the WhatsApp-style attach sheet and runs the real device picker for
/// the chosen source. Shared by the Widgetbook full demo and the docs-app
/// composer page.
Future<void> showComposerAttachSheet(
  BuildContext context,
  RefractionComposerController controller,
) {
  final colors = RefractionTheme.of(context).colors;
  const options = [
    (icon: Icons.photo_outlined, label: 'Photo', action: _AttachAction.photo),
    (icon: Icons.videocam_outlined, label: 'Video', action: _AttachAction.video),
    (
      icon: Icons.photo_camera_outlined,
      label: 'Camera',
      action: _AttachAction.camera,
    ),
    (
      icon: Icons.insert_drive_file_outlined,
      label: 'Document',
      action: _AttachAction.document,
    ),
    (
      icon: Icons.audio_file_outlined,
      label: 'Audio',
      action: _AttachAction.audio,
    ),
  ];

  return showModalBottomSheet<void>(
    context: context,
    backgroundColor: colors.card,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (sheetContext) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            for (final option in options)
              _AttachOption(
                icon: option.icon,
                label: option.label,
                onTap: () {
                  Navigator.of(sheetContext).pop();
                  _pickAndStage(context, controller, option.action);
                },
              ),
          ],
        ),
      ),
    ),
  );
}

class _AttachOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _AttachOption({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: colors.primary.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: colors.primary),
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(fontSize: 12, color: colors.mutedForeground),
            ),
          ],
        ),
      ),
    );
  }
}

Future<void> _pickAndStage(
  BuildContext context,
  RefractionComposerController controller,
  _AttachAction action,
) async {
  try {
    switch (action) {
      case _AttachAction.photo:
        final picked = await ImagePicker().pickImage(
          source: ImageSource.gallery,
        );
        if (picked == null) return;
        stageComposerAttachmentWithSimulatedUpload(
          controller,
          kind: ComposerAttachmentKind.image,
          name: picked.name,
          sizeBytes: await picked.length(),
          previewPath: picked.path,
        );
      case _AttachAction.video:
        final picked = await ImagePicker().pickVideo(
          source: ImageSource.gallery,
        );
        if (picked == null) return;
        stageComposerAttachmentWithSimulatedUpload(
          controller,
          kind: ComposerAttachmentKind.video,
          name: picked.name,
          sizeBytes: await picked.length(),
          previewPath: picked.path,
        );
      case _AttachAction.camera:
        try {
          final picked = await ImagePicker().pickImage(
            source: ImageSource.camera,
          );
          if (picked == null) return;
          stageComposerAttachmentWithSimulatedUpload(
            controller,
            kind: ComposerAttachmentKind.image,
            name: picked.name,
            sizeBytes: await picked.length(),
            previewPath: picked.path,
          );
        } catch (_) {
          if (!context.mounted) return;
          RefractionToast.show(
            context: context,
            title: 'Camera unavailable',
            description: 'This device/simulator has no camera.',
          );
        }
      case _AttachAction.document:
        final result = await FilePicker.pickFiles();
        final file = result?.files.firstOrNull;
        if (file == null) return;
        stageComposerAttachmentWithSimulatedUpload(
          controller,
          kind: composerAttachmentKindForExtension(file.extension),
          name: file.name,
          sizeBytes: file.size,
          previewPath: file.path,
        );
      case _AttachAction.audio:
        final result = await FilePicker.pickFiles(
          type: FileType.audio,
        );
        final file = result?.files.firstOrNull;
        if (file == null) return;
        stageComposerAttachmentWithSimulatedUpload(
          controller,
          kind: ComposerAttachmentKind.audio,
          name: file.name,
          sizeBytes: file.size,
          previewPath: file.path,
        );
    }
  } catch (_) {
    if (!context.mounted) return;
    RefractionToast.show(
      context: context,
      title: 'Could not pick a file',
      description: 'The picker failed or was denied permission.',
    );
  }
}
