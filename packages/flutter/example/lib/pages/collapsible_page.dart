import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class CollapsiblePage extends StatefulWidget {
  const CollapsiblePage({super.key});

  @override
  State<CollapsiblePage> createState() => _CollapsiblePageState();
}

class _CollapsiblePageState extends State<CollapsiblePage> {
  bool _isOpen = false;

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;

    return PreviewCanvas(
      title: "Collapsible",
      description: "An interactive component which expands/collapses a panel.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                "Uncontrolled",
                style: theme.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              RefractionCollapsible(
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: theme.colors.border),
                    borderRadius: BorderRadius.circular(theme.borderRadius),
                  ),
                  child: Column(
                    children: [
                      RefractionCollapsibleTrigger(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "@elloloop starred 3 repositories",
                                style: theme.textStyle.copyWith(
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Icon(
                                Icons.unfold_more,
                                size: 20,
                                color: theme.colors.mutedForeground,
                              ),
                            ],
                          ),
                        ),
                      ),
                      RefractionCollapsibleContent(
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            border: Border(
                              top: BorderSide(color: theme.colors.border),
                            ),
                          ),
                          child: Text(
                            "refraction-ui/refraction-ui\nrefraction-ui/shadcn\nrefraction-ui/radix",
                            style: theme.textStyle.copyWith(
                              height: 1.8,
                              color: theme.colors.mutedForeground,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 48),
              Text(
                "Controlled",
                style: theme.textStyle.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),
              RefractionCollapsible(
                isOpen: _isOpen,
                onOpenChange: (open) => setState(() => _isOpen = open),
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: theme.colors.border),
                    borderRadius: BorderRadius.circular(theme.borderRadius),
                  ),
                  child: Column(
                    children: [
                      RefractionCollapsibleTrigger(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "Toggle me via state",
                                style: theme.textStyle.copyWith(
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Icon(
                                _isOpen ? Icons.expand_less : Icons.expand_more,
                                size: 20,
                                color: theme.colors.mutedForeground,
                              ),
                            ],
                          ),
                        ),
                      ),
                      RefractionCollapsibleContent(
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            border: Border(
                              top: BorderSide(color: theme.colors.border),
                            ),
                          ),
                          child: Text(
                            "This panel's open state is managed by the parent widget's state.",
                            style: theme.textStyle.copyWith(
                              color: theme.colors.mutedForeground,
                            ),
                          ),
                        ),
                      ),
                    ],
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
