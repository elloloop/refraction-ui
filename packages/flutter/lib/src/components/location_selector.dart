import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';
import 'select.dart';

class RefractionLocationOption {
  final String code;
  final String name;

  const RefractionLocationOption({required this.code, required this.name});
}

class RefractionLocationSelector extends StatefulWidget {
  final String defaultCountry;
  final String defaultLanguage;
  final ValueChanged<String>? onCountryChange;
  final ValueChanged<String>? onLanguageChange;
  final List<RefractionLocationOption>? countries;
  final List<RefractionLocationOption>? languages;

  const RefractionLocationSelector({
    super.key,
    this.defaultCountry = 'US',
    this.defaultLanguage = 'en',
    this.onCountryChange,
    this.onLanguageChange,
    this.countries,
    this.languages,
  });

  @override
  State<RefractionLocationSelector> createState() =>
      _RefractionLocationSelectorState();
}

class _RefractionLocationSelectorState
    extends State<RefractionLocationSelector> {
  late String _country;
  late String _language;

  @override
  void initState() {
    super.initState();
    _country = widget.defaultCountry;
    _language = widget.defaultLanguage;
  }

  @override
  void didUpdateWidget(RefractionLocationSelector oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.defaultCountry != widget.defaultCountry &&
        !_countryOptions.any((o) => o.code == _country)) {
      _country = widget.defaultCountry;
    }
    if (oldWidget.defaultLanguage != widget.defaultLanguage &&
        !_languageOptions.any((o) => o.code == _language)) {
      _language = widget.defaultLanguage;
    }
  }

  static const _defaultCountries = [
    RefractionLocationOption(code: 'US', name: 'United States'),
    RefractionLocationOption(code: 'CA', name: 'Canada'),
  ];

  static const _defaultLanguages = [
    RefractionLocationOption(code: 'en', name: 'English'),
    RefractionLocationOption(code: 'es', name: 'Spanish'),
  ];

  List<RefractionLocationOption> get _countryOptions =>
      widget.countries ?? _defaultCountries;

  List<RefractionLocationOption> get _languageOptions =>
      widget.languages ?? _defaultLanguages;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final countries = _countryOptions;
    final languages = _languageOptions;

    final validCountry = countries.any((c) => c.code == _country)
        ? _country
        : countries.first.code;
    final validLanguage = languages.any((l) => l.code == _language)
        ? _language
        : languages.first.code;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isSmall = constraints.maxWidth < 400;

        Widget countryWidget = Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Country',
              style: theme.data.textStyle.copyWith(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 6),
            RefractionSelect<String>(
              value: validCountry,
              items: countries
                  .map(
                    (c) => DropdownMenuItem(value: c.code, child: Text(c.name)),
                  )
                  .toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() => _country = val);
                  widget.onCountryChange?.call(val);
                }
              },
            ),
          ],
        );

        Widget languageWidget = Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Language',
              style: theme.data.textStyle.copyWith(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 6),
            RefractionSelect<String>(
              value: validLanguage,
              items: languages
                  .map(
                    (l) => DropdownMenuItem(value: l.code, child: Text(l.name)),
                  )
                  .toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() => _language = val);
                  widget.onLanguageChange?.call(val);
                }
              },
            ),
          ],
        );

        if (isSmall) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              countryWidget,
              const SizedBox(height: 16),
              languageWidget,
            ],
          );
        } else {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: countryWidget),
              const SizedBox(width: 16),
              Expanded(child: languageWidget),
            ],
          );
        }
      },
    );
  }
}
