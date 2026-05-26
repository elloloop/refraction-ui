import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class RichEditorPage extends StatefulWidget {
  const RichEditorPage({super.key});

  @override
  State<RichEditorPage> createState() => _RichEditorPageState();
}

class _RichEditorPageState extends State<RichEditorPage> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    
    return Scaffold(
      backgroundColor: theme.colors.background,
      appBar: AppBar(
        title: const Text('Rich Editor'),
        backgroundColor: theme.colors.background,
        foregroundColor: theme.colors.foreground,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            color: theme.colors.border,
            height: 1,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Rich Editor',
              style: theme.textStyle.copyWith(
                fontSize: 24,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'A rich text editor with formatting toolbar and markdown shortcuts.',
              style: theme.textStyle.copyWith(
                color: theme.colors.mutedForeground,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 32),

            Text(
              'Default Example',
              style: theme.textStyle.copyWith(
                fontSize: 18,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 16),
            RefractionRichEditor(
              controller: _controller,
              placeholder: 'Type your message here...',
              minLines: 5,
              maxLines: 15,
            ),

            const SizedBox(height: 32),
            Text(
              'Output Preview',
              style: theme.textStyle.copyWith(
                fontSize: 18,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: theme.colors.border),
                borderRadius: BorderRadius.circular(theme.borderRadius),
                color: theme.colors.muted.withValues(alpha: 0.2),
              ),
              child: ValueListenableBuilder(
                valueListenable: _controller,
                builder: (context, value, child) {
                  return Text(
                    value.text.isEmpty ? 'No content yet...' : value.text,
                    style: theme.textStyle.copyWith(
                      color: value.text.isEmpty ? theme.colors.mutedForeground : theme.colors.foreground,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
