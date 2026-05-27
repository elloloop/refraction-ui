import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class FeedbackDialogPage extends StatelessWidget {
  const FeedbackDialogPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Feedback Dialog",
      description: "A modal dialog designed to collect user feedback.",
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            RefractionButton(
              onPressed: () {
                RefractionFeedbackDialog.show(
                  context: context,
                  title: 'Send Feedback',
                  description:
                      'We would love to hear your thoughts on our new feature.',
                  onSubmit: (data) async {
                    await Future.delayed(
                      const Duration(seconds: 1),
                    ); // Simulate network request
                  },
                );
              },
              child: const Text('Open General Feedback'),
            ),
            const SizedBox(height: 16),
            RefractionButton(
              onPressed: () {
                RefractionFeedbackDialog.show(
                  context: context,
                  title: 'Report Video Issue',
                  type: RefractionFeedbackType.video,
                  onSubmit: (data) async {
                    await Future.delayed(const Duration(seconds: 1));
                  },
                );
              },
              child: const Text('Open Video Feedback'),
            ),
          ],
        ),
      ),
    );
  }
}
