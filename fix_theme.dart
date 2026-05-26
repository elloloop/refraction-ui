import 'dart:io';

void main() {
  final file = File('packages/flutter/lib/src/components/emoji_picker.dart');
  var content = file.readAsStringSync();
  
  content = content.replaceAll('theme.popover,', 'theme.colors.popover,');
  content = content.replaceAll('theme.border)', 'theme.colors.border)');
  content = content.replaceAll('theme.popoverForeground,', 'theme.colors.popoverForeground,');
  content = content.replaceAll('theme.mutedForeground)', 'theme.colors.mutedForeground)');
  content = content.replaceAll('theme.mutedForeground,', 'theme.colors.mutedForeground,');
  content = content.replaceAll('theme.accent ', 'theme.colors.accent ');
  content = content.replaceAll('theme.accent,', 'theme.colors.accent,');
  content = content.replaceAll('theme.radiusLg)', '(theme.borderRadius + 4))');
  content = content.replaceAll('theme.radiusMd)', 'theme.borderRadius)');
  content = content.replaceAll('_buildEmojiButton(filteredEmojis[index], theme)', '_buildEmojiButton(filteredEmojis[index], theme)');
  content = content.replaceAll('RefractionThemeData theme', 'RefractionTheme theme');
  
  file.writeAsStringSync(content);
}
