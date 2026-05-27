import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class CardGridPage extends StatelessWidget {
  const CardGridPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Card Grid",
      description:
          "A responsive grid layout designed specifically for laying out RefractionCard widgets.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1000),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Default Card Grid",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              RefractionCardGrid(
                minCardWidth: 250,
                children: List.generate(
                  6,
                  (index) => RefractionCard(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        RefractionCardTitle('Card \${index + 1}'),
                        const SizedBox(height: 8),
                        RefractionCardDescription(
                          'This is a description for card \${index + 1}. It explains the content inside.',
                        ),
                        const Spacer(),
                        RefractionButton(
                          onPressed: () {},
                          child: const Text('Action'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
