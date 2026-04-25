import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class AccordionPage extends StatelessWidget {
  const AccordionPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Accordion",
      description: "A vertically stacked set of interactive headings that each reveal an associated section of content.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Single Expand (Default)",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              const RefractionAccordion(
                children: [
                  RefractionAccordionItem(
                    title: Text("Is it accessible?"),
                    content: Text("Yes. It adheres to the WAI-ARIA design pattern."),
                  ),
                  RefractionAccordionItem(
                    title: Text("Is it styled?"),
                    content: Text("Yes. It comes with default styles that matches the other components' aesthetic."),
                  ),
                  RefractionAccordionItem(
                    title: Text("Is it animated?"),
                    content: Text("Yes. It's animated by default, but you can disable it if you prefer."),
                  ),
                ],
              ),
              const SizedBox(height: 48),
              Text(
                "Multiple Expand",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              const RefractionAccordion(
                allowMultiple: true,
                children: [
                  RefractionAccordionItem(
                    title: Text("Can I open multiple panels?"),
                    content: Text("Yes! By passing allowMultiple: true, you can keep as many open as you like."),
                  ),
                  RefractionAccordionItem(
                    title: Text("What about mobile layout?"),
                    content: Text("The components are fully responsive and utilize intrinsic sizing to flex appropriately."),
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
