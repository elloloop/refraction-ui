import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';
import 'chat_bubble.dart';

class RefractionThreadMessageAuthor {
  final String id;
  final String name;
  final String? avatarUrl;

  const RefractionThreadMessageAuthor({
    required this.id,
    required this.name,
    this.avatarUrl,
  });
}

class RefractionThreadMessageReaction {
  final String emoji;
  final int count;
  final bool userReacted;

  const RefractionThreadMessageReaction({
    required this.emoji,
    required this.count,
    required this.userReacted,
  });
}

class RefractionThreadMessageAttachment {
  final String id;
  final String name;
  final String url;
  final String type;
  final int? size;

  const RefractionThreadMessageAttachment({
    required this.id,
    required this.name,
    required this.url,
    required this.type,
    this.size,
  });
}

class RefractionThreadMessageData {
  final String id;
  final RefractionThreadMessageAuthor author;
  final String content;
  final DateTime timestamp;
  final List<RefractionThreadMessageReaction>? reactions;
  final List<RefractionThreadMessageData>? replies;
  final List<RefractionThreadMessageAttachment>? attachments;
  final bool edited;

  const RefractionThreadMessageData({
    required this.id,
    required this.author,
    required this.content,
    required this.timestamp,
    this.reactions,
    this.replies,
    this.attachments,
    this.edited = false,
  });
}

typedef ThreadReplyCallback = void Function(String messageId);
typedef ThreadReactionCallback = void Function(String messageId, String emoji);

class RefractionThreadView extends StatelessWidget {
  final List<RefractionThreadMessageData> messages;
  final ThreadReplyCallback? onReply;
  final ThreadReactionCallback? onReact;
  final String? currentUserId;

  const RefractionThreadView({
    super.key,
    required this.messages,
    this.onReply,
    this.onReact,
    this.currentUserId,
  });

  @override
  Widget build(BuildContext context) {
    if (messages.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: messages
          .map(
            (m) => _ThreadMessageNode(
              key: ValueKey(m.id),
              message: m,
              onReply: onReply,
              onReact: onReact,
              currentUserId: currentUserId,
            ),
          )
          .toList(),
    );
  }
}

class _ThreadMessageNode extends StatefulWidget {
  final RefractionThreadMessageData message;
  final ThreadReplyCallback? onReply;
  final ThreadReactionCallback? onReact;
  final String? currentUserId;
  final int depth;

  const _ThreadMessageNode({
    super.key,
    required this.message,
    this.onReply,
    this.onReact,
    this.currentUserId,
    this.depth = 0,
  });

  @override
  State<_ThreadMessageNode> createState() => _ThreadMessageNodeState();
}

class _ThreadMessageNodeState extends State<_ThreadMessageNode> {
  bool _expanded = false;
  bool _hovered = false;

  String _formatTimestamp(DateTime date) {
    final hours = date.hour;
    final minutes = date.minute;
    final ampm = hours >= 12 ? 'PM' : 'AM';
    final displayHours = hours % 12 == 0 ? 12 : hours % 12;
    final displayMinutes = minutes < 10 ? '0$minutes' : '$minutes';
    return '$displayHours:$displayMinutes $ampm';
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final leftPadding = widget.depth > 0 ? 32.0 : 0.0;
    final hasReplies =
        widget.message.replies != null && widget.message.replies!.isNotEmpty;

    return Padding(
      padding: EdgeInsets.only(left: leftPadding, top: 4, bottom: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          MouseRegion(
            onEnter: (_) => setState(() => _hovered = true),
            onExit: (_) => setState(() => _hovered = false),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: _hovered
                    ? theme.colors.accent.withValues(alpha: 0.5)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(theme.borderRadius),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatar
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: theme.colors.muted,
                      shape: BoxShape.circle,
                    ),
                    clipBehavior: Clip.antiAlias,
                    alignment: Alignment.center,
                    child: widget.message.author.avatarUrl != null
                        ? Image.network(
                            widget.message.author.avatarUrl!,
                            width: 36,
                            height: 36,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                _buildAvatarFallback(theme),
                          )
                        : _buildAvatarFallback(theme),
                  ),
                  const SizedBox(width: 12),
                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Header
                        Wrap(
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Text(
                              widget.message.author.name,
                              style: theme.textStyle.copyWith(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _formatTimestamp(widget.message.timestamp),
                              style: theme.textStyle.copyWith(
                                fontSize: 12,
                                color: theme.colors.mutedForeground,
                              ),
                            ),
                            if (widget.message.edited) ...[
                              const SizedBox(width: 4),
                              Text(
                                '(edited)',
                                style: theme.textStyle.copyWith(
                                  fontSize: 12,
                                  color: theme.colors.mutedForeground,
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 2),
                        // Body
                        Text(
                          widget.message.content,
                          style: theme.textStyle.copyWith(fontSize: 14),
                        ),
                        // Reactions
                        if (widget.message.reactions != null &&
                            widget.message.reactions!.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Wrap(
                            spacing: 4,
                            runSpacing: 4,
                            children: widget.message.reactions!.map((reaction) {
                              return MouseRegion(
                                cursor: SystemMouseCursors.click,
                                child: GestureDetector(
                                  onTap: () {
                                    if (widget.onReact != null) {
                                      widget.onReact!(
                                        widget.message.id,
                                        reaction.emoji,
                                      );
                                    }
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: reaction.userReacted
                                          ? theme.colors.primary.withValues(alpha: 
                                              0.1,
                                            )
                                          : Colors.transparent,
                                      border: Border.all(
                                        color: reaction.userReacted
                                            ? theme.colors.primary
                                            : theme.colors.border,
                                      ),
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Text(
                                      '${reaction.emoji} ${reaction.count}',
                                      style: theme.textStyle.copyWith(
                                        fontSize: 12,
                                        color: reaction.userReacted
                                            ? theme.colors.primary
                                            : theme.colors.foreground,
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                        // Attachments
                        if (widget.message.attachments != null &&
                            widget.message.attachments!.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          ...widget.message.attachments!.map((attachment) {
                            return Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: RefractionChatAttachmentView(
                                attachment: RefractionChatAttachment(
                                  id: attachment.id,
                                  name: attachment.name,
                                  url: attachment.url,
                                  type: attachment.type,
                                  size: attachment.size,
                                ),
                              ),
                            );
                          }),
                        ],
                        // Reply indicator & Actions
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            if (hasReplies) ...[
                              MouseRegion(
                                cursor: SystemMouseCursors.click,
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _expanded = !_expanded;
                                    });
                                  },
                                  child: Text(
                                    '${widget.message.replies!.length} ${widget.message.replies!.length == 1 ? 'reply' : 'replies'}',
                                    style: theme.textStyle.copyWith(
                                      fontSize: 12,
                                      color: theme.colors.primary,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                            if (hasReplies && widget.onReply != null)
                              const SizedBox(width: 12),
                            if (widget.onReply != null)
                              AnimatedOpacity(
                                opacity: _hovered ? 1.0 : 0.0,
                                duration: const Duration(milliseconds: 150),
                                child: MouseRegion(
                                  cursor: SystemMouseCursors.click,
                                  child: GestureDetector(
                                    onTap: () {
                                      widget.onReply!(widget.message.id);
                                    },
                                    child: Text(
                                      'Reply',
                                      style: theme.textStyle.copyWith(
                                        fontSize: 12,
                                        color: theme.colors.mutedForeground,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (_expanded && hasReplies)
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: widget.message.replies!
                  .map(
                    (reply) => _ThreadMessageNode(
                      key: ValueKey(reply.id),
                      message: reply,
                      onReply: widget.onReply,
                      onReact: widget.onReact,
                      currentUserId: widget.currentUserId,
                      depth: widget.depth + 1,
                    ),
                  )
                  .toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildAvatarFallback(RefractionThemeData theme) {
    return Text(
      widget.message.author.name.isNotEmpty
          ? widget.message.author.name[0].toUpperCase()
          : '?',
      style: theme.textStyle.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: theme.colors.foreground,
      ),
    );
  }
}
