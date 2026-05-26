import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class LocationSelectorPage extends StatefulWidget {
  const LocationSelectorPage({super.key});

  @override
  State<LocationSelectorPage> createState() => _LocationSelectorPageState();
}

class _LocationSelectorPageState extends State<LocationSelectorPage> {
  String _country = 'US';
  String _language = 'en';

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);

    return Scaffold(
      backgroundColor: theme.colors.background,
      appBar: AppBar(
        title: const Text('Location Selector'),
        backgroundColor: theme.colors.background,
        foregroundColor: theme.colors.foreground,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: theme.colors.border, height: 1),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Location Selector',
              style: theme.data.textStyle.copyWith(
                fontSize: 24,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'A component that combines country and language selection into a single row (or column on smaller screens).',
              style: theme.data.textStyle.copyWith(
                color: theme.colors.mutedForeground,
              ),
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                border: Border.all(color: theme.colors.border),
                borderRadius: BorderRadius.circular(theme.borderRadius),
              ),
              child: RefractionLocationSelector(
                defaultCountry: _country,
                defaultLanguage: _language,
                onCountryChange: (val) {
                  setState(() => _country = val);
                },
                onLanguageChange: (val) {
                  setState(() => _language = val);
                },
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Current Selection',
              style: theme.data.textStyle.copyWith(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            Text('Country Code: $_country', style: theme.data.textStyle),
            Text('Language Code: $_language', style: theme.data.textStyle),
          ],
        ),
      ),
    );
  }
}
