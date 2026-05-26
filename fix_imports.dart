import 'dart:io';

void main() {
  final file = File('packages/flutter/lib/src/components/emoji_picker.dart');
  final content = file.readAsStringSync();
  final lines = content.split('\n');
  
  final imports = <String>[];
  final others = <String>[];
  
  for (final line in lines) {
    if (line.trim().startsWith('import ')) {
      imports.add(line);
    } else {
      others.add(line);
    }
  }
  
  // replace withOpacity with withValues(alpha: ...)
  final fixedOthers = others.map((l) => l.replaceAll('.withOpacity(0.1)', '.withValues(alpha: 0.1)')).join('\n');
  
  file.writeAsStringSync(imports.join('\n') + '\n\n' + fixedOthers);
}
