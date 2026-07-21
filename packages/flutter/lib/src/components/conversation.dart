import 'package:flutter/material.dart';
import 'dart:async';
import '../theme/refraction_theme.dart';
import '../theme/refraction_theme_data.dart';
import 'chat_bubble.dart';

/// The role of a message in a conversation.
enum RefractionMessageRole { user, assistant, system }

/// A model representing a single message in a conversation.
class RefractionMessage {
  final String id;
  final String content;
  final RefractionMessageRole role;
  final DateTime? createdAt;
  final Widget? avatar;
  final String? authorName;
  final Widget? customContent;

  /// Optional attachments rendered below the content via the shared
  /// [RefractionChatAttachmentView] renderer (ignored when [customContent]
  /// is set — the host owns that layout).
  final List<RefractionChatAttachment>? attachments;

  const RefractionMessage({
    required this.id,
    this.content = '',
    required this.role,
    this.createdAt,
    this.avatar,
    this.authorName,
    this.customContent,
    this.attachments,
  });
}

/// A headless-inspired conversation stream component.
///
/// Renders a sequential list of [RefractionMessage]s, handling alignment
/// (user messages on the right, assistant/system on the left) and styling.
class RefractionConversation extends StatelessWidget {
  final List<RefractionMessage> messages;
  final Widget? emptyState;
  final Widget Function(BuildContext context, RefractionMessage message)?
  messageBuilder;
  final bool isLoading;
  final Widget? typingIndicator;
  final EdgeInsetsGeometry padding;

  const RefractionConversation({
    super.key,
    required this.messages,
    this.emptyState,
    this.messageBuilder,
    this.isLoading = false,
    this.typingIndicator,
    this.padding = const EdgeInsets.all(16.0),
  });

  @override
  Widget build(BuildContext context) {
    if (messages.isEmpty && emptyState != null && !isLoading) {
      return emptyState!;
    }

    final itemCount = messages.length + (isLoading ? 1 : 0);

    return ListView.separated(
      padding: padding,
      itemCount: itemCount,
      separatorBuilder: (context, index) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        if (index == messages.length && isLoading) {
          return typingIndicator ?? const _DefaultTypingIndicator();
        }

        final message = messages[index];
        if (messageBuilder != null) {
          return messageBuilder!(context, message);
        }

        return _RefractionMessageBubble(message: message);
      },
    );
  }
}

class _RefractionMessageBubble extends StatelessWidget {
  final RefractionMessage message;

  const _RefractionMessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final isUser = message.role == RefractionMessageRole.user;
    final isSystem = message.role == RefractionMessageRole.system;

    if (isSystem) {
      return Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: theme.colors.muted,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Text(
            message.content,
            style: theme.textStyle.copyWith(
              color: theme.colors.mutedForeground,
              fontSize: 12,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return Row(
      mainAxisAlignment: isUser
          ? MainAxisAlignment.end
          : MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        if (!isUser && message.avatar != null) ...[
          message.avatar!,
          const SizedBox(width: 8),
        ],
        Flexible(
          child: Column(
            crossAxisAlignment: isUser
                ? CrossAxisAlignment.end
                : CrossAxisAlignment.start,
            children: [
              if (message.authorName != null) ...[
                Padding(
                  padding: const EdgeInsets.only(bottom: 4, left: 4, right: 4),
                  child: Text(
                    message.authorName!,
                    style: theme.textStyle.copyWith(
                      color: theme.colors.mutedForeground,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: isUser ? theme.colors.primary : theme.colors.muted,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(16),
                    topRight: const Radius.circular(16),
                    bottomLeft: Radius.circular(isUser ? 16 : 4),
                    bottomRight: Radius.circular(isUser ? 4 : 16),
                  ),
                ),
                child:
                    message.customContent ??
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (message.content.isNotEmpty)
                          Text(
                            message.content,
                            style: theme.textStyle.copyWith(
                              color: isUser
                                  ? theme.colors.primaryForeground
                                  : theme.colors.foreground,
                            ),
                          ),
                        if (message.attachments != null)
                          for (final attachment in message.attachments!)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: RefractionChatAttachmentView(
                                attachment: attachment,
                                onFilledBubble: isUser,
                              ),
                            ),
                      ],
                    ),
              ),
              if (message.createdAt != null) ...[
                Padding(
                  padding: const EdgeInsets.only(top: 4, left: 4, right: 4),
                  child: Text(
                    _formatTime(message.createdAt!),
                    style: theme.textStyle.copyWith(
                      color: theme.colors.mutedForeground,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
        if (isUser && message.avatar != null) ...[
          const SizedBox(width: 8),
          message.avatar!,
        ],
      ],
    );
  }

  String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }
}

class _DefaultTypingIndicator extends StatelessWidget {
  const _DefaultTypingIndicator();

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: theme.colors.muted,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
            bottomLeft: Radius.circular(4),
            bottomRight: Radius.circular(16),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _Dot(theme: theme, delay: 0),
            const SizedBox(width: 4),
            _Dot(theme: theme, delay: 200),
            const SizedBox(width: 4),
            _Dot(theme: theme, delay: 400),
          ],
        ),
      ),
    );
  }
}

class _Dot extends StatefulWidget {
  final RefractionThemeData theme;
  final int delay;

  const _Dot({required this.theme, required this.delay});

  @override
  State<_Dot> createState() => _DotState();
}

class _DotState extends State<_Dot> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _animation = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.easeInOut),
      ),
    );

    _timer = Timer(Duration(milliseconds: widget.delay), () {
      if (mounted) {
        _controller.repeat(reverse: true);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _animation,
      child: Container(
        width: 6,
        height: 6,
        decoration: BoxDecoration(
          color: widget.theme.colors.mutedForeground,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}
