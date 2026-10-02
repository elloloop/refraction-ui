// Isolated real-engine harness for browser and native software-keyboard checks.
// No network or host app is needed: the public composer is the only editor.
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ComposerInputHarness());
}

class ComposerInputHarness extends StatefulWidget {
  const ComposerInputHarness({super.key});

  @override
  State<ComposerInputHarness> createState() => _ComposerInputHarnessState();
}

class _ComposerInputHarnessState extends State<ComposerInputHarness> {
  late final SemanticsHandle _semantics;
  final _controller = RefractionComposerController();

  @override
  void initState() {
    super.initState();
    _semantics = SemanticsBinding.instance.ensureSemantics();
  }

  @override
  void dispose() {
    _controller.dispose();
    _semantics.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => MaterialApp(
    home: RefractionTheme(
      data: RefractionThemeData.light(),
      child: Scaffold(
        body: SafeArea(
          child: Directionality(
            textDirection: Uri.base.queryParameters['rtl'] == 'true'
                ? TextDirection.rtl
                : TextDirection.ltr,
            child: Align(
              alignment: Alignment.bottomCenter,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Local clipboard fixture · no message transport',
                    ),
                    const SizedBox(height: 8),
                    RefractionComposer(
                      controller: _controller,
                      onImagesPasted: (images) {
                        for (final image in images) {
                          _controller.addAttachment(
                            ComposerAttachment(
                              kind: ComposerAttachmentKind.image,
                              name: image.name,
                              sizeBytes: image.bytes.length,
                              mimeType: image.contentType,
                            ),
                          );
                        }
                      },
                      onSubmit: (_) {},
                      onAttachRequested: () {},
                      trailingBuilder: (_, _) => IconButton(
                        tooltip: 'Emoji',
                        onPressed: () {},
                        icon: const Icon(Icons.mood),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
