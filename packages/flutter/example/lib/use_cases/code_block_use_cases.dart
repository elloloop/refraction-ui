import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionCodeBlock)
Widget defaultCodeBlock(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(16.0),
    child: RefractionCodeBlock(code: 'console.log("Hello World");'),
  );
}

@widgetbook.UseCase(name: 'With Language', type: RefractionCodeBlock)
Widget languageCodeBlock(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(16.0),
    child: RefractionCodeBlock(
      language: 'javascript',
      code: '''function greet(name) {
  return `Hello \${name}!`;
}

console.log(greet("Refraction UI"));''',
    ),
  );
}

@widgetbook.UseCase(name: 'No Copy Button', type: RefractionCodeBlock)
Widget noCopyCodeBlock(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(16.0),
    child: RefractionCodeBlock(
      language: 'dart',
      showCopyButton: false,
      code: '''void main() {
  runApp(const MyApp());
}''',
    ),
  );
}
