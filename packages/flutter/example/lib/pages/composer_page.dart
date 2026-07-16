import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class ComposerPage extends StatefulWidget {
  const ComposerPage({super.key});

  @override
  State<ComposerPage> createState() => _ComposerPageState();
}

class _ComposerPageState extends State<ComposerPage> {
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
  final List<EmojiEntry> _recentEmojis = [];

  @override
  void initState() {
    super.initState();
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
    _controller.dispose();
    _focusNode.dispose();
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

  void _handleSubmit(ComposerSubmission submission) {
    RefractionToast.show(
      context: context,
      title: 'Message sent',
      description: submission.tokens.isEmpty
          ? submission.plainText
          : '${submission.plainText}\n(${submission.tokens.length} token(s))',
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;
    return PreviewCanvas(
      title: 'Composer',
      description:
          'A headless-core chat composer with auto-grow, IME-safe Enter-to-send, '
          '@mention / /slash / :emoji: trigger menus committing atomic tokens, '
          'attachments, drafts, and edit-in-place. Try typing @, / (at the start), '
          'or :fire: below.',
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: RefractionComposer(
            controller: _controller,
            focusNode: _focusNode,
            placeholder: 'Message the team — try @, / or :joy:',
            maxLines: 6,
            triggers: _triggers,
            onSubmit: _handleSubmit,
            onAttachRequested: () {
              RefractionToast.show(
                context: context,
                title: 'Attach',
                description: 'Wire this slot to your file picker.',
              );
            },
            leadingBuilder: (context, controller) => IconButton(
              onPressed: () => controller.addAttachment(
                ComposerAttachment(
                  id: '',
                  kind: ComposerAttachmentKind.file,
                  name: 'demo.pdf',
                  sizeBytes: 48213,
                  status: ComposerAttachmentStatus.ready,
                ),
              ),
              icon: Icon(Icons.attach_file, color: colors.mutedForeground),
            ),
            // WhatsApp-style emoji toggle: the icon swaps emoji <-> keyboard.
            trailingBuilder: (context, controller) => IconButton(
              onPressed: _toggleEmojiPanel,
              icon: Icon(
                controller.isAccessoryPanelOpen
                    ? Icons.keyboard_outlined
                    : Icons.emoji_emotions_outlined,
                color: colors.mutedForeground,
              ),
            ),
            // The emoji/sticker picker lives in the accessory panel below the
            // pill (never a modal sheet over the composer — issue #432 Gap 3).
            accessoryPanelBuilder: (context) => RefractionEmojiPicker(
              width: double.infinity,
              fillHeight: true,
              recentEmojis: _recentEmojis,
              stickers: refractionStarterStickers(),
              onSelect: _insertEmoji,
              onStickerSelect: (sticker) => RefractionToast.show(
                context: context,
                title: 'Sticker',
                description: sticker.label,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
