import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:markdown/markdown.dart' as md;
import '../theme/refraction_theme.dart';

/// A component that renders Markdown content using Refraction's typography
/// and colors, making it fit seamlessly into the design system.
///
/// It uses [MarkdownBody] under the hood, meaning it does not inject its
/// own scrolling by default, allowing it to be easily placed inside any layout.
class RefractionMarkdownRenderer extends StatelessWidget {
  /// The raw markdown content to render.
  final String content;

  /// Whether the markdown should shrink-wrap its contents.
  /// True by default for embedding in scrollable views.
  final bool shrinkWrap;

  /// Callback when a link is tapped.
  final void Function(String text, String? href, String title)? onTapLink;

  /// Creates a [RefractionMarkdownRenderer].
  const RefractionMarkdownRenderer({
    super.key,
    required this.content,
    this.shrinkWrap = true,
    this.onTapLink,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    final baseStyle = theme.textStyle;

    final styleSheet = MarkdownStyleSheet(
      p: baseStyle.copyWith(
        fontSize: 16,
        height: 1.5,
        color: colors.foreground,
      ),
      pPadding: const EdgeInsets.only(bottom: 16),
      h1: baseStyle.copyWith(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        height: 1.2,
        color: colors.foreground,
      ),
      h1Padding: const EdgeInsets.only(top: 24, bottom: 16),
      h2: baseStyle.copyWith(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        height: 1.3,
        color: colors.foreground,
      ),
      h2Padding: const EdgeInsets.only(top: 24, bottom: 16),
      h3: baseStyle.copyWith(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 1.4,
        color: colors.foreground,
      ),
      h3Padding: const EdgeInsets.only(top: 16, bottom: 12),
      h4: baseStyle.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        height: 1.4,
        color: colors.foreground,
      ),
      h4Padding: const EdgeInsets.only(top: 16, bottom: 12),
      h5: baseStyle.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        height: 1.5,
        color: colors.foreground,
      ),
      h5Padding: const EdgeInsets.only(top: 16, bottom: 12),
      h6: baseStyle.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        height: 1.5,
        color: colors.foreground,
      ),
      h6Padding: const EdgeInsets.only(top: 16, bottom: 12),
      a: baseStyle.copyWith(
        color: colors.primary,
        decoration: TextDecoration.underline,
      ),
      code: baseStyle.copyWith(
        fontFamily: 'monospace',
        fontSize: 14,
        color: colors.foreground,
        backgroundColor: colors.muted,
      ),
      codeblockDecoration: BoxDecoration(
        color: colors.muted,
        borderRadius: BorderRadius.circular(theme.borderRadius),
      ),
      codeblockPadding: const EdgeInsets.all(16),
      blockquoteDecoration: BoxDecoration(
        color: colors.muted.withValues(alpha: 0.5),
        border: Border(
          left: BorderSide(
            color: colors.border,
            width: 4,
          ),
        ),
      ),
      blockquotePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      blockquote: baseStyle.copyWith(
        color: colors.mutedForeground,
        fontStyle: FontStyle.italic,
      ),
      horizontalRuleDecoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: colors.border,
            width: 1,
          ),
        ),
      ),
      listBullet: baseStyle.copyWith(
        fontSize: 16,
        color: colors.foreground,
      ),
      listIndent: 24,
      strong: baseStyle.copyWith(
        fontWeight: FontWeight.bold,
      ),
      em: baseStyle.copyWith(
        fontStyle: FontStyle.italic,
      ),
    );

    return Semantics(
      label: 'Rendered markdown content',
      child: MarkdownBody(
        data: content,
        styleSheet: styleSheet,
        onTapLink: onTapLink,
        shrinkWrap: shrinkWrap,
        extensionSet: md.ExtensionSet.gitHubFlavored,
      ),
    );
  }
}
