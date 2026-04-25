import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class MenusPage extends StatelessWidget {
  const MenusPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Dropdown Menu",
      description: "Displays a menu to the user.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Basic Dropdown",
                style: RefractionTheme.of(context).data.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              RefractionDropdownMenu(
                trigger: RefractionButton(
                  onPressed: () {},
                  variant: RefractionButtonVariant.outline,
                  child: const Text("Open Menu"),
                ),
                items: [
                  RefractionMenuItem(
                    label: "Profile",
                    shortcut: "⇧⌘P",
                    onSelected: () {},
                  ),
                  RefractionMenuItem(
                    label: "Billing",
                    shortcut: "⌘B",
                    onSelected: () {},
                  ),
                  RefractionMenuItem(
                    label: "Settings",
                    shortcut: "⌘S",
                    onSelected: () {},
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
