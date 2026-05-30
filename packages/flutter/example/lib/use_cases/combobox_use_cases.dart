import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default', type: RefractionCombobox)
Widget defaultComboboxUseCase(BuildContext context) {
  return const _ComboboxDemo();
}

@widgetbook.UseCase(name: 'Disabled', type: RefractionCombobox)
Widget disabledComboboxUseCase(BuildContext context) {
  return const RefractionCombobox<String>(
    disabled: true,
    value: null,
    items: [RefractionComboboxItem(value: '1', label: 'Item 1')],
  );
}

class _ComboboxDemo extends StatefulWidget {
  const _ComboboxDemo();

  @override
  State<_ComboboxDemo> createState() => _ComboboxDemoState();
}

class _ComboboxDemoState extends State<_ComboboxDemo> {
  String? _selectedValue;

  @override
  Widget build(BuildContext context) {
    return RefractionCombobox<String>(
      value: _selectedValue,
      onChanged: (val) => setState(() => _selectedValue = val),
      placeholder: 'Select framework...',
      items: const [
        RefractionComboboxItem(value: 'nextjs', label: 'Next.js'),
        RefractionComboboxItem(value: 'sveltekit', label: 'SvelteKit'),
        RefractionComboboxItem(value: 'nuxtjs', label: 'Nuxt.js'),
        RefractionComboboxItem(value: 'remix', label: 'Remix'),
        RefractionComboboxItem(value: 'astro', label: 'Astro'),
      ],
    );
  }
}
