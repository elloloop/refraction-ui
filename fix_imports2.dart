import 'dart:io';

void main() {
  final file = File('packages/flutter/lib/src/components/emoji_picker.dart');
  var content = file.readAsStringSync();
  content = content.replaceAll(
    "import '../theme/theme.dart';",
    "import '../theme/refraction_theme.dart';\nimport '../theme/refraction_theme_data.dart';"
  );
  // Also we need to fix the duplicate imports from cat
  final lines = content.split('\n');
  final newLines = <String>[];
  var seenMaterial = false;
  
  for (final l in lines) {
    if (l.trim() == "import 'package:flutter/material.dart';") {
      if (!seenMaterial) {
        newLines.add(l);
        seenMaterial = true;
      }
    } else {
      newLines.add(l);
    }
  }
  
  // ensure imports are at top. Let's do it simply by separating imports.
  final imports = <String>[];
  final others = <String>[];
  
  for (final l in newLines) {
    if (l.trim().startsWith('import ')) {
      imports.add(l);
    } else {
      others.add(l);
    }
  }
  
  content = imports.join('\n') + '\n\n' + others.join('\n');
  file.writeAsStringSync(content);
}
