import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class RadioGroupPage extends StatefulWidget {
  const RadioGroupPage({super.key});

  @override
  State<RadioGroupPage> createState() => _RadioGroupPageState();
}

class _RadioGroupPageState extends State<RadioGroupPage> {
  String? _selectedValue = 'default';

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Radio Group",
      description: "A set of mutually exclusive radio buttons.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Notify me about...",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 16),
              RefractionRadioGroup<String>(
                groupValue: _selectedValue,
                onChanged: (val) {
                  setState(() {
                    _selectedValue = val;
                  });
                },
                items: const [
                  RefractionRadioItem(
                    value: 'all',
                    label: 'All new messages',
                  ),
                  RefractionRadioItem(
                    value: 'direct',
                    label: 'Direct messages and mentions',
                  ),
                  RefractionRadioItem(
                    value: 'nothing',
                    label: 'Nothing',
                  ),
                  RefractionRadioItem(
                    value: 'disabled',
                    label: 'Disabled option',
                    description: 'This option cannot be selected',
                    disabled: true,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
