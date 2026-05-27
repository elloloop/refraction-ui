import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class SkipToContentPage extends StatefulWidget {
  const SkipToContentPage({super.key});

  @override
  State<SkipToContentPage> createState() => _SkipToContentPageState();
}

class _SkipToContentPageState extends State<SkipToContentPage> {
  final FocusNode _mainContentNode = FocusNode(debugLabel: 'MainContent');

  @override
  void dispose() {
    _mainContentNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);

    return Stack(
      children: [
        PreviewCanvas(
          title: "Skip To Content",
          description:
              "An accessibility-first widget that remains visually hidden until focused via keyboard navigation. Once focused, it appears at the top of the screen to allow users to skip repetitive navigation and jump straight to the main content.",
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 600),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Interactive Example",
                    style: theme.data.textStyle.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "1. Click the text field below to focus it.\n"
                    "2. Press 'Shift + Tab' to focus backwards.\n"
                    "3. The 'Skip to main content' button will appear at the top left.\n"
                    "4. Press 'Enter' to activate it, and focus will jump to the main content area below.",
                    style: theme.data.textStyle,
                  ),
                  const SizedBox(height: 24),
                  const TextField(
                    decoration: InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: "Focus me and press Shift+Tab",
                    ),
                  ),
                  const SizedBox(height: 48),
                  Focus(
                    focusNode: _mainContentNode,
                    child: Builder(
                      builder: (context) {
                        final isFocused = Focus.of(context).hasFocus;
                        return Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: isFocused
                                  ? theme.colors.primary
                                  : theme.colors.border,
                              width: isFocused ? 2 : 1,
                            ),
                            borderRadius: BorderRadius.circular(
                              theme.borderRadius,
                            ),
                          ),
                          child: Text(
                            "Main Content Area\n\n(This container receives focus when the skip button is activated.)",
                            style: theme.data.textStyle.copyWith(
                              color: isFocused
                                  ? theme.colors.primary
                                  : theme.colors.foreground,
                              fontWeight: isFocused
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        // Insert the SkipToContent widget here. Because it uses OverlayPortal,
        // it doesn't strictly matter where it is placed in the tree, but keeping it
        // high in the logical hierarchy ensures it's the first focusable element.
        RefractionSkipToContent(targetNode: _mainContentNode),
      ],
    );
  }
}
