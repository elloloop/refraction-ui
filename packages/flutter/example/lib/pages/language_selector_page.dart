import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class LanguageSelectorPage extends StatefulWidget {
  const LanguageSelectorPage({super.key});

  @override
  State<LanguageSelectorPage> createState() => _LanguageSelectorPageState();
}

class _LanguageSelectorPageState extends State<LanguageSelectorPage> {
  List<String> _singleValue = [];
  List<String> _multiValue = ['en'];

  final _options = const [
    LanguageOption(value: 'en', label: 'English', group: 'Common'),
    LanguageOption(value: 'es', label: 'Spanish', group: 'Common'),
    LanguageOption(value: 'fr', label: 'French', group: 'Common'),
    LanguageOption(value: 'de', label: 'German', group: 'Other'),
    LanguageOption(value: 'it', label: 'Italian', group: 'Other'),
    LanguageOption(value: 'ja', label: 'Japanese', group: 'Other'),
    LanguageOption(value: 'ko', label: 'Korean', group: 'Other'),
    LanguageOption(value: 'zh', label: 'Chinese', group: 'Other'),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    
    return Scaffold(
      appBar: RefractionNavbar(logo: Text('Language Selector', style: theme.data.textStyle.copyWith(fontWeight: FontWeight.bold))),
      backgroundColor: theme.colors.background,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Language Selector',
              style: theme.data.textStyle.copyWith(
                fontSize: 24,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'A dedicated dropdown for choosing languages, supporting both single and multiple selection with grouped options.',
              style: theme.data.textStyle.copyWith(
                color: theme.colors.mutedForeground,
              ),
            ),
            const SizedBox(height: 32),
            Text('Single Selection', style: theme.data.textStyle.copyWith(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            RefractionLanguageSelector(
              options: _options,
              value: _singleValue,
              onChanged: (val) => setState(() => _singleValue = val),
              placeholder: 'Select a language...',
            ),
            const SizedBox(height: 32),
            Text('Multiple Selection', style: theme.data.textStyle.copyWith(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            RefractionLanguageSelector(
              options: _options,
              value: _multiValue,
              onChanged: (val) => setState(() => _multiValue = val),
              multiple: true,
              placeholder: 'Select languages...',
            ),
          ],
        ),
      ),
    );
  }
}
