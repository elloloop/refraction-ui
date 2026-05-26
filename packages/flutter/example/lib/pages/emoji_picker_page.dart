import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class EmojiPickerPage extends StatefulWidget {
  const EmojiPickerPage({super.key});

  @override
  State<EmojiPickerPage> createState() => _EmojiPickerPageState();
}

class _EmojiPickerPageState extends State<EmojiPickerPage> {
  String? _selectedEmoji;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);

    return Scaffold(
      backgroundColor: theme.colors.background,
      appBar: AppBar(
        title: Text('Emoji Picker', style: theme.data.textStyle),
        backgroundColor: theme.colors.background,
        elevation: 0,
        iconTheme: IconThemeData(color: theme.colors.foreground),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_selectedEmoji != null) ...[
              Text(
                'Selected: $_selectedEmoji',
                style: theme.data.textStyle.copyWith(fontSize: 24),
              ),
              const SizedBox(height: 24),
            ],
            RefractionEmojiPicker(
              onSelect: (emoji) {
                setState(() {
                  _selectedEmoji = '${emoji.emoji} (${emoji.name})';
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}
