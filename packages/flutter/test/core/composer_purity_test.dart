// I2: the composer core must stay pure Dart — zero package:flutter (or
// dart:ui) imports — so it remains constructible and testable without a
// widget tree and mirrors the TS core 1:1.
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  group('I. Core purity', () {
    test('I2 lib/src/core/* never imports package:flutter or dart:ui', () {
      final coreDir = Directory('lib/src/core');
      expect(
        coreDir.existsSync(),
        isTrue,
        reason: 'run from the package root (flutter test does)',
      );
      final dartFiles = coreDir
          .listSync(recursive: true)
          .whereType<File>()
          .where((f) => f.path.endsWith('.dart'))
          .toList();
      expect(dartFiles, isNotEmpty);
      // Only import/export directives count — doc comments legitimately
      // mention "package:flutter" when explaining the purity rule.
      final directive = RegExp(
        '''^\\s*(import|export)\\s+['"](package:flutter|dart:ui)''',
        multiLine: true,
      );
      for (final file in dartFiles) {
        final source = file.readAsStringSync();
        expect(
          directive.hasMatch(source),
          isFalse,
          reason: '${file.path} imports package:flutter or dart:ui',
        );
      }
    });
  });
}
