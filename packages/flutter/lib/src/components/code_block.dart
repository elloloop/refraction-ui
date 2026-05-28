import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_theme.dart';
import 'button.dart';

/// A component that renders a block of code with a monospaced font,
/// a slightly darker background, and an optional copy button.
class RefractionCodeBlock extends StatefulWidget {
  /// The string of code to display.
  final String code;

  /// The language identifier, displayed at the top left of the block.
  final String? language;

  /// Whether to show the copy button at the top right of the block.
  /// Defaults to true.
  final bool showCopyButton;

  /// Creates a [RefractionCodeBlock].
  const RefractionCodeBlock({
    super.key,
    required this.code,
    this.language,
    this.showCopyButton = true,
  });

  @override
  State<RefractionCodeBlock> createState() => _RefractionCodeBlockState();
}

class _RefractionCodeBlockState extends State<RefractionCodeBlock> {
  bool _copied = false;

  Future<void> _handleCopy() async {
    await Clipboard.setData(ClipboardData(text: widget.code));
    if (mounted) {
      setState(() => _copied = true);
    }
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _copied = false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    final hasHeader = widget.language != null || widget.showCopyButton;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: colors.muted,
        borderRadius: BorderRadius.circular(theme.borderRadius),
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (hasHeader)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: colors.border)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (widget.language != null)
                    Text(
                      widget.language!,
                      style: theme.data.textStyle.copyWith(
                        fontSize: 12,
                        color: colors.mutedForeground,
                        fontWeight: FontWeight.w500,
                      ),
                    )
                  else
                    const SizedBox.shrink(),
                  if (widget.showCopyButton)
                    RefractionButton(
                      variant: RefractionButtonVariant.ghost,
                      size: RefractionButtonSize.sm,
                      onPressed: _handleCopy,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _copied ? Icons.check : Icons.copy,
                            size: 14,
                            color: _copied
                                ? colors.primary
                                : colors.mutedForeground,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _copied ? 'Copied' : 'Copy',
                            style: theme.data.textStyle.copyWith(
                              fontSize: 12,
                              color: _copied
                                  ? colors.primary
                                  : colors.mutedForeground,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Text(
                widget.code,
                style: theme.data.textStyle.copyWith(
                  fontFamily: 'monospace',
                  fontSize: 14,
                  height: 1.5,
                  color: colors.foreground,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
