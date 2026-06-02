import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../dev_tools/preview_canvas.dart';

class AnimatedTextPage extends StatefulWidget {
  const AnimatedTextPage({super.key});

  @override
  State<AnimatedTextPage> createState() => _AnimatedTextPageState();
}

class _AnimatedTextPageState extends State<AnimatedTextPage> {
  int _refreshKey = 0;

  void _refresh() {
    setState(() {
      _refreshKey++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Animated Text",
      description: "Text that animates in on mount.",
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          RefractionButton(
            variant: RefractionButtonVariant.outline,
            onPressed: _refresh,
            child: const Text("Replay Animations"),
          ),
          const SizedBox(height: 32),
          Wrap(
            spacing: 32,
            runSpacing: 32,
            alignment: WrapAlignment.center,
            children: [
              _buildDemo(
                "Fade",
                RefractionAnimatedText(
                  key: ValueKey('fade_$_refreshKey'),
                  text: "Hello Refraction!",
                  type: RefractionTextAnimationType.fade,
                  duration: const Duration(seconds: 1),
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              _buildDemo(
                "Typewriter",
                RefractionAnimatedText(
                  key: ValueKey('type_$_refreshKey'),
                  text: "Typing out a sentence...",
                  type: RefractionTextAnimationType.typewriter,
                  duration: const Duration(seconds: 2),
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              _buildDemo(
                "Slide Up",
                RefractionAnimatedText(
                  key: ValueKey('slide_$_refreshKey'),
                  text: "Sliding into view",
                  type: RefractionTextAnimationType.slideUp,
                  duration: const Duration(milliseconds: 800),
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDemo(String label, Widget child) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          height: 100,
          width: 300,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade200),
            borderRadius: BorderRadius.circular(8),
          ),
          child: child,
        ),
      ],
    );
  }
}
