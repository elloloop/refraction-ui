import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class SheetPage extends StatelessWidget {
  const SheetPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Sheet",
      description:
          "Extends the Dialog component to display content that complements the main viewport.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Directions",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  for (final side in RefractionSheetSide.values)
                    RefractionButton(
                      variant: RefractionButtonVariant.outline,
                      onPressed: () {
                        RefractionSheet.show(
                          context: context,
                          side: side,
                          title: Text("Edit profile"),
                          description: Text(
                            "Make changes to your profile here. Click save when you're done.",
                          ),
                          content: const Text(
                            "This is the content of the sheet. You can place any widget here, like forms, lists, or custom layouts.",
                          ),
                          showDragHandle: side == RefractionSheetSide.bottom || side == RefractionSheetSide.top,
                          actions: [
                            RefractionButton(
                              onPressed: () => Navigator.of(context).pop(),
                              child: const Text('Save changes'),
                            ),
                          ],
                        );
                      },
                      child: Text(side.name.toUpperCase()),
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
