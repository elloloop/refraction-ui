import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class MarkdownRendererPage extends StatelessWidget {
  const MarkdownRendererPage({super.key});

  @override
  Widget build(BuildContext context) {
    const String sampleMarkdown = """
# Heading 1

This is a **markdown** renderer designed for *Refraction UI*.

## Features

- Fully responsive.
- Matches standard Refraction themes.
- Out-of-the-box support for [links](https://elloloop.github.io/refraction-ui).

### Typography

> "Good design is obvious. Great design is transparent." — Joe Sparano

1. Item One
2. Item Two
3. Item Three

```dart
// Code snippets are styled nicely.
final hello = 'world';
print(hello);
```

---

*This concludes the markdown example.*
""";

    return PreviewCanvas(
      title: "Markdown Renderer",
      description:
          "A component that parses and renders Markdown using Refraction UI's typography system.",
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 700),
          child: RefractionCard(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: RefractionMarkdownRenderer(
                content: sampleMarkdown,
                onTapLink: (text, href, title) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Tapped link: \$href')),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}
