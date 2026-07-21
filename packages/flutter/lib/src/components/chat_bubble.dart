import 'dart:io';

import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

import '../data/animated_emoji_manifest.dart';
import '../data/emoji_data.dart';
import '../theme/refraction_theme.dart';

/// Delivery state of an outgoing chat message.
enum RefractionChatMessageStatus { sending, sent, delivered, read, failed }

/// A file/media attachment on a chat message. Mirrors the React
/// `MessageAttachment` shape (`{id, name, url, type, size}`) so the same
/// payload drives both frameworks.
class RefractionChatAttachment {
  /// Stable identity.
  final String id;

  /// File/display name (shown on file cards; media tiles don't show it).
  final String name;

  /// Where the bytes live: `http(s)://` for remote, a filesystem path for
  /// local picks, empty when unknown.
  final String url;

  /// MIME type (`image/png`, `video/mp4`, `application/pdf`, …).
  final String type;

  /// Size in bytes, when known.
  final int? size;

  /// Creates an attachment.
  const RefractionChatAttachment({
    required this.id,
    required this.name,
    required this.url,
    required this.type,
    this.size,
  });

  /// Whether this renders as an image tile.
  bool get isImage => type.startsWith('image/');

  /// Whether this renders as a video tile.
  bool get isVideo => type.startsWith('video/');

  /// Whether this renders as an audio row.
  bool get isAudio => type.startsWith('audio/');
}

/// Builds the visual for an image attachment — the seam for hosts that load
/// media through their own stack (cached_network_image, auth headers,
/// placeholders). The default loads `url` via [Image.network] for http(s)
/// and [Image.file] for local paths.
typedef RefractionChatImageBuilder =
    Widget Function(
      BuildContext context,
      RefractionChatAttachment attachment,
    );

/// Fired when an attachment tile/card is tapped (host opens the
/// viewer/player/share sheet).
typedef RefractionChatAttachmentTap =
    void Function(RefractionChatAttachment attachment);

/// The glyph set backing emoji-only detection — built once from the shared
/// dataset so a message and the picker agree on what counts as an emoji.
Set<String>? _emojiGlyphSet;
Set<String> _emojiGlyphs() =>
    _emojiGlyphSet ??= {for (final entry in EmojiData.getAllEmojis()) entry.emoji};

bool _isEmojiCluster(String cluster) {
  final glyphs = _emojiGlyphs();
  if (glyphs.contains(cluster)) return true;
  // Tolerate a missing/varied VS16 (`❤︎` vs `❤️`).
  return glyphs.contains(cluster.replaceAll('\uFE0F', ''));
}

/// WhatsApp jumbo rule: a message of 1–3 emoji and nothing else renders as
/// oversized glyphs with no bubble. Returns the jumbo font size
/// (1 → 56, 2 → 44, 3 → 36), or null when the text isn't emoji-only.
double? _jumboEmojiSize(String text) {
  final clusters = text.characters
      .where((cluster) => cluster.trim().isNotEmpty)
      .toList(growable: false);
  if (clusters.isEmpty || clusters.length > 3) return null;
  if (!clusters.every(_isEmojiCluster)) return null;
  return switch (clusters.length) { 1 => 56.0, 2 => 44.0, _ => 36.0 };
}

/// The bundled-asset key for [cluster] (`1f525` for 🔥), or null when
/// Google's animated set has no animation for it.
String? _animatedEmojiKey(String cluster) {
  final key = cluster.runes
      .where((rune) => rune != 0xFE0F)
      .map((rune) => rune.toRadixString(16))
      .join('_');
  return kAnimatedEmojiAssets.contains(key) ? key : null;
}

/// One jumbo glyph: the animated Noto Lottie when bundled, the static
/// glyph otherwise (Telegram-style motion with a graceful fallback).
Widget _jumboGlyph(BuildContext context, String cluster, double size) {
  final key = _animatedEmojiKey(cluster);
  if (key != null) {
    return Lottie.asset(
      'assets/emoji_animated/$key.json',
      package: 'refraction_ui',
      width: size,
      height: size,
      repeat: true,
      errorBuilder: (context, error, stackTrace) =>
          _staticJumboGlyph(context, cluster, size),
    );
  }
  return _staticJumboGlyph(context, cluster, size);
}

Widget _staticJumboGlyph(BuildContext context, String cluster, double size) {
  final theme = RefractionTheme.of(context).data;
  return Text(
    cluster,
    style: theme.textStyle.copyWith(
      fontSize: size,
      height: 1.1,
      color: theme.colors.foreground,
    ),
  );
}

/// Renders a single chat attachment by type: image tile, video tile with a
/// play affordance, audio row, or a file card. Used by
/// [RefractionChatBubble]; also the shared attachment renderer for
/// `RefractionConversation` and `RefractionThreadView`.
class RefractionChatAttachmentView extends StatelessWidget {
  /// The attachment to render.
  final RefractionChatAttachment attachment;

  /// Optional image-loading seam.
  final RefractionChatImageBuilder? imageBuilder;

  /// Optional tap handler (viewer/player/share).
  final RefractionChatAttachmentTap? onTap;

  /// Maximum tile width.
  final double maxWidth;

  /// Whether text/icons sit on a filled (primary) bubble — flips muted
  /// colors so overlays stay readable.
  final bool onFilledBubble;

  /// Creates an attachment view.
  const RefractionChatAttachmentView({
    super.key,
    required this.attachment,
    this.imageBuilder,
    this.onTap,
    this.maxWidth = 320,
    this.onFilledBubble = false,
  });

  @override
  Widget build(BuildContext context) {
    if (attachment.isImage) {
      return _ImageTile(
        attachment: attachment,
        imageBuilder: imageBuilder,
        onTap: onTap,
        maxWidth: maxWidth,
      );
    }
    if (attachment.isVideo) {
      return _VideoTile(
        attachment: attachment,
        imageBuilder: imageBuilder,
        onTap: onTap,
        maxWidth: maxWidth,
        onFilledBubble: onFilledBubble,
      );
    }
    if (attachment.isAudio) {
      return _AudioRow(
        attachment: attachment,
        onTap: onTap,
        onFilledBubble: onFilledBubble,
      );
    }
    return _FileCard(
      attachment: attachment,
      onTap: onTap,
      onFilledBubble: onFilledBubble,
    );
  }
}

/// A WhatsApp-style chat message bubble: text, media (image/video grid),
/// audio, and file attachments, with an optional author header, caption, and
/// timestamp/status footer. One renderer per message — apps compose a
/// transcript by listing bubbles.
///
/// The message [text] doubles as the media caption when attachments are
/// present (one caption per message, WhatsApp semantics).
class RefractionChatBubble extends StatelessWidget {
  /// Message text; renders as the caption under media when
  /// [attachments] are present.
  final String text;

  /// Attachments to render above the text.
  final List<RefractionChatAttachment> attachments;

  /// A sticker message (WhatsApp-style: no bubble, oversized, animated when
  /// the sticker's builder animates — e.g. the bundled Lottie pack). When
  /// set, [attachments] and [text] are ignored.
  final EmojiSticker? sticker;

  /// Right-aligned outgoing message (primary bubble) when true;
  /// left-aligned incoming (muted bubble) when false.
  final bool outgoing;

  /// Optional author header (incoming group chats).
  final String? authorName;

  /// Optional creation time, shown in the footer.
  final DateTime? createdAt;

  /// Optional delivery status, shown as ticks on outgoing messages.
  final RefractionChatMessageStatus? status;

  /// Optional image-loading seam for media tiles.
  final RefractionChatImageBuilder? imageBuilder;

  /// Optional attachment tap handler.
  final RefractionChatAttachmentTap? onAttachmentTap;

  /// Maximum bubble width.
  final double maxWidth;

  /// Creates a chat bubble.
  const RefractionChatBubble({
    super.key,
    this.text = '',
    this.attachments = const [],
    this.sticker,
    this.outgoing = false,
    this.authorName,
    this.createdAt,
    this.status,
    this.imageBuilder,
    this.onAttachmentTap,
    this.maxWidth = 320,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final bubbleColor = outgoing ? colors.primary : colors.muted;
    final textColor = outgoing ? colors.primaryForeground : colors.foreground;
    final hintColor = outgoing
        ? colors.primaryForeground.withValues(alpha: 0.7)
        : colors.mutedForeground;

    final media = attachments
        .where((a) => a.isImage || a.isVideo)
        .toList(growable: false);
    final files = attachments
        .where((a) => !a.isImage && !a.isVideo)
        .toList(growable: false);
    final hasMedia = media.isNotEmpty;

    // WhatsApp conventions: sticker messages and emoji-only messages (1–3
    // emoji, nothing else) render oversized with no bubble background.
    if (sticker != null) {
      return _buildUnbubbled(
        context,
        hintColor: colors.mutedForeground,
        textStyle: theme.textStyle,
        child: Semantics(
          label: sticker!.label,
          child:
              sticker!.builder?.call(context, 96) ??
              Text(
                sticker!.glyph ?? '',
                style: const TextStyle(fontSize: 64, height: 1.1),
              ),
        ),
      );
    }
    final jumboSize = attachments.isEmpty ? _jumboEmojiSize(text) : null;
    if (jumboSize != null) {
      final clusters = text.characters
          .where((cluster) => cluster.trim().isNotEmpty)
          .toList(growable: false);
      return _buildUnbubbled(
        context,
        hintColor: colors.mutedForeground,
        textStyle: theme.textStyle,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final cluster in clusters)
              _jumboGlyph(context, cluster, jumboSize),
          ],
        ),
      );
    }

    return Align(
      alignment: outgoing ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        constraints: BoxConstraints(maxWidth: maxWidth),
        decoration: BoxDecoration(
          color: bubbleColor,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(outgoing ? 16 : 4),
            bottomRight: Radius.circular(outgoing ? 4 : 16),
          ),
        ),
        child: Padding(
          // Media bubbles pad tight so tiles reach the bubble edge.
          padding: hasMedia
              ? const EdgeInsets.all(4)
              : const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (authorName != null)
                Padding(
                  padding: EdgeInsets.only(
                    left: hasMedia ? 8 : 0,
                    bottom: 2,
                  ),
                  child: Text(
                    authorName!,
                    style: theme.textStyle.copyWith(
                      color: hintColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              if (hasMedia)
                _MediaGrid(
                  media: media,
                  imageBuilder: imageBuilder,
                  onTap: onAttachmentTap,
                  maxWidth: maxWidth - 8,
                  onFilledBubble: outgoing,
                ),
              for (final attachment in files)
                Padding(
                  padding: EdgeInsets.only(
                    top: 4,
                    left: hasMedia ? 4 : 0,
                    right: hasMedia ? 4 : 0,
                  ),
                  child: RefractionChatAttachmentView(
                    attachment: attachment,
                    imageBuilder: imageBuilder,
                    onTap: onAttachmentTap,
                    maxWidth: maxWidth - 8,
                    onFilledBubble: outgoing,
                  ),
                ),
              if (text.isNotEmpty)
                Padding(
                  padding: hasMedia
                      ? const EdgeInsets.fromLTRB(8, 6, 8, 2)
                      : EdgeInsets.zero,
                  child: Text(
                    text,
                    style: theme.textStyle.copyWith(color: textColor),
                  ),
                ),
              if (createdAt != null || (outgoing && status != null))
                Padding(
                  padding: hasMedia
                      ? const EdgeInsets.fromLTRB(8, 2, 4, 2)
                      : const EdgeInsets.only(top: 2),
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: _BubbleFooter(
                      createdAt: createdAt,
                      status: outgoing ? status : null,
                      color: hintColor,
                      textStyle: theme.textStyle,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
  /// Renders content without the bubble background (stickers, jumbo emoji),
  /// keeping alignment and putting the footer in a subtle chip so it stays
  /// readable on the page.
  Widget _buildUnbubbled(
    BuildContext context, {
    required Widget child,
    required Color hintColor,
    required TextStyle textStyle,
  }) {
    return Align(
      alignment: outgoing ? Alignment.centerRight : Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Column(
          crossAxisAlignment: outgoing
              ? CrossAxisAlignment.end
              : CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            child,
            if (createdAt != null || (outgoing && status != null))
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: _FooterChip(
                  child: _BubbleFooter(
                    createdAt: createdAt,
                    status: outgoing ? status : null,
                    color: hintColor,
                    textStyle: textStyle,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// The small translucent pill behind the timestamp/ticks on bubble-less
/// messages (stickers, jumbo emoji) — WhatsApp's floating-footer treatment.
class _FooterChip extends StatelessWidget {
  final Widget child;

  const _FooterChip({required this.child});

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).data.colors;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: colors.muted.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(8),
      ),
      child: child,
    );
  }
}

/// Time + delivery ticks, WhatsApp-style, in a 10px hint line.
class _BubbleFooter extends StatelessWidget {
  static const _readTickBlue = Color(0xFF53BDEB);

  final DateTime? createdAt;
  final RefractionChatMessageStatus? status;
  final Color color;
  final TextStyle textStyle;

  const _BubbleFooter({
    required this.createdAt,
    required this.status,
    required this.color,
    required this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (createdAt != null)
          Text(
            '${createdAt!.hour.toString().padLeft(2, '0')}:'
            '${createdAt!.minute.toString().padLeft(2, '0')}',
            style: textStyle.copyWith(color: color, fontSize: 10),
          ),
        if (status != null) ...[
          const SizedBox(width: 4),
          Icon(
            switch (status!) {
              RefractionChatMessageStatus.sending => Icons.schedule,
              RefractionChatMessageStatus.sent => Icons.done,
              RefractionChatMessageStatus.delivered => Icons.done_all,
              RefractionChatMessageStatus.read => Icons.done_all,
              RefractionChatMessageStatus.failed => Icons.error_outline,
            },
            size: 13,
            color: switch (status!) {
              RefractionChatMessageStatus.read => _readTickBlue,
              RefractionChatMessageStatus.failed =>
                RefractionTheme.of(context).data.colors.destructive,
              _ => color,
            },
          ),
        ],
      ],
    );
  }
}

/// WhatsApp-style media grid: 1 large tile, 2 side-by-side, 3–4 in a 2×2
/// grid, 5+ as 2×2 with a "+N" overflow tile.
class _MediaGrid extends StatelessWidget {
  final List<RefractionChatAttachment> media;
  final RefractionChatImageBuilder? imageBuilder;
  final RefractionChatAttachmentTap? onTap;
  final double maxWidth;
  final bool onFilledBubble;

  const _MediaGrid({
    required this.media,
    required this.imageBuilder,
    required this.onTap,
    required this.maxWidth,
    required this.onFilledBubble,
  });

  @override
  Widget build(BuildContext context) {
    if (media.length == 1) {
      return ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth, maxHeight: 260),
        child: RefractionChatAttachmentView(
          attachment: media.single,
          imageBuilder: imageBuilder,
          onTap: onTap,
          maxWidth: maxWidth,
          onFilledBubble: onFilledBubble,
        ),
      );
    }

    final shown = media.take(4).toList(growable: false);
    final overflow = media.length - shown.length;
    final rows = <Widget>[];
    for (var i = 0; i < shown.length; i += 2) {
      final pair = shown.sublist(i, i + 2 > shown.length ? shown.length : i + 2);
      rows.add(
        Padding(
          padding: EdgeInsets.only(top: i == 0 ? 0 : 2),
          child: Row(
            children: [
              for (var j = 0; j < pair.length; j++) ...[
                if (j > 0) const SizedBox(width: 2),
                Expanded(
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        RefractionChatAttachmentView(
                          attachment: pair[j],
                          imageBuilder: imageBuilder,
                          onTap: onTap,
                          maxWidth: maxWidth / 2,
                          onFilledBubble: onFilledBubble,
                        ),
                        if (i + j == 3 && overflow > 0)
                          IgnorePointer(
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.45),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                '+$overflow',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      );
    }
    return Column(mainAxisSize: MainAxisSize.min, children: rows);
  }
}

Widget _defaultChatImage(
  BuildContext context,
  RefractionChatAttachment attachment,
) {
  final url = attachment.url;
  Widget broken(
    BuildContext context,
    Object error,
    StackTrace? stackTrace,
  ) => _MediaPlaceholder(icon: Icons.broken_image_outlined);
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return Image.network(url, fit: BoxFit.cover, errorBuilder: broken);
  }
  if (url.isEmpty) {
    return _MediaPlaceholder(icon: Icons.image_outlined);
  }
  return Image.file(File(url), fit: BoxFit.cover, errorBuilder: broken);
}

/// Neutral tile used when an image can't be loaded or has no source.
class _MediaPlaceholder extends StatelessWidget {
  final IconData icon;

  const _MediaPlaceholder({required this.icon});

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).data.colors;
    return Container(
      color: colors.mutedForeground.withValues(alpha: 0.15),
      alignment: Alignment.center,
      child: Icon(icon, color: colors.mutedForeground, size: 32),
    );
  }
}

class _ImageTile extends StatelessWidget {
  final RefractionChatAttachment attachment;
  final RefractionChatImageBuilder? imageBuilder;
  final RefractionChatAttachmentTap? onTap;
  final double maxWidth;

  const _ImageTile({
    required this.attachment,
    required this.imageBuilder,
    required this.onTap,
    required this.maxWidth,
  });

  @override
  Widget build(BuildContext context) {
    final image =
        (imageBuilder ?? _defaultChatImage)(context, attachment);
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: GestureDetector(
        onTap: onTap == null ? null : () => onTap!(attachment),
        child: SizedBox(width: maxWidth, child: image),
      ),
    );
  }
}

class _VideoTile extends StatelessWidget {
  final RefractionChatAttachment attachment;
  final RefractionChatImageBuilder? imageBuilder;
  final RefractionChatAttachmentTap? onTap;
  final double maxWidth;
  final bool onFilledBubble;

  const _VideoTile({
    required this.attachment,
    required this.imageBuilder,
    required this.onTap,
    required this.maxWidth,
    required this.onFilledBubble,
  });

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).data.colors;
    final thumbnail = imageBuilder?.call(context, attachment);
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: GestureDetector(
        onTap: onTap == null ? null : () => onTap!(attachment),
        child: Container(
          width: maxWidth,
          constraints: const BoxConstraints(minHeight: 120),
          color: onFilledBubble
              ? Colors.black.withValues(alpha: 0.35)
              : colors.mutedForeground.withValues(alpha: 0.25),
          child: Stack(
            alignment: Alignment.center,
            children: [
              if (thumbnail != null)
                Positioned.fill(child: thumbnail),
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.55),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.play_arrow_rounded,
                  color: Colors.white,
                  size: 32,
                ),
              ),
              Positioned(
                left: 8,
                bottom: 8,
                child: _OverlayChip(
                  icon: Icons.videocam_outlined,
                  label: attachment.size != null
                      ? _formatChatBytes(attachment.size!)
                      : 'Video',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Small dark pill overlaid on media (size/duration labels).
class _OverlayChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _OverlayChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.55),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: Colors.white),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(color: Colors.white, fontSize: 11),
          ),
        ],
      ),
    );
  }
}

class _FileCard extends StatelessWidget {
  final RefractionChatAttachment attachment;
  final RefractionChatAttachmentTap? onTap;
  final bool onFilledBubble;

  const _FileCard({
    required this.attachment,
    required this.onTap,
    required this.onFilledBubble,
  });

  IconData _iconFor(String name) {
    switch (name.split('.').last.toLowerCase()) {
      case 'pdf':
        return Icons.picture_as_pdf_outlined;
      case 'doc':
      case 'docx':
      case 'txt':
      case 'md':
        return Icons.description_outlined;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return Icons.table_chart_outlined;
      case 'zip':
      case 'tar':
      case 'gz':
        return Icons.folder_zip_outlined;
      default:
        return Icons.insert_drive_file_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final foreground = onFilledBubble
        ? colors.primaryForeground
        : colors.foreground;
    final hint = onFilledBubble
        ? colors.primaryForeground.withValues(alpha: 0.7)
        : colors.mutedForeground;
    final accent = onFilledBubble ? colors.primaryForeground : colors.primary;

    return Material(
      color: onFilledBubble
          ? Colors.black.withValues(alpha: 0.15)
          : colors.mutedForeground.withValues(alpha: 0.12),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap == null ? null : () => onTap!(attachment),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(_iconFor(attachment.name), color: accent),
              ),
              const SizedBox(width: 10),
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      attachment.name,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textStyle.copyWith(
                        color: foreground,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    if (attachment.size != null)
                      Text(
                        _formatChatBytes(attachment.size!),
                        style: theme.textStyle.copyWith(
                          color: hint,
                          fontSize: 12,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Icon(Icons.download_outlined, color: hint, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _AudioRow extends StatelessWidget {
  final RefractionChatAttachment attachment;
  final RefractionChatAttachmentTap? onTap;
  final bool onFilledBubble;

  const _AudioRow({
    required this.attachment,
    required this.onTap,
    required this.onFilledBubble,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;
    final hint = onFilledBubble
        ? colors.primaryForeground.withValues(alpha: 0.7)
        : colors.mutedForeground;

    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: onTap == null ? null : () => onTap!(attachment),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: onFilledBubble
                    ? colors.primaryForeground.withValues(alpha: 0.2)
                    : colors.primary.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.play_arrow_rounded,
                color: onFilledBubble
                    ? colors.primaryForeground
                    : colors.primary,
              ),
            ),
            const SizedBox(width: 10),
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    height: 4,
                    constraints: const BoxConstraints(minWidth: 120),
                    decoration: BoxDecoration(
                      color: hint.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    attachment.size != null
                        ? _formatChatBytes(attachment.size!)
                        : attachment.name,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textStyle.copyWith(
                      color: hint,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(Icons.graphic_eq, color: hint, size: 18),
          ],
        ),
      ),
    );
  }
}

/// Byte formatting shared by the file card / audio row / video chip.
String _formatChatBytes(int bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  var value = bytes.toDouble();
  var unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return '${value.toStringAsFixed(value >= 10 || unit == 0 ? 0 : 1)} '
      '${units[unit]}';
}
