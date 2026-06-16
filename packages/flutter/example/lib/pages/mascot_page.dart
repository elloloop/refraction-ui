import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class MascotPage extends StatelessWidget {
  const MascotPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const PreviewCanvas(
      title: "Mascot",
      description:
          "Tobi the tortoise mascot with different moods and toggleable animations.",
      child: Center(
        child: Wrap(
          spacing: 32,
          runSpacing: 32,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Column(
              children: [
                Text("Happy (Default)"),
                SizedBox(height: 16),
                RefractionMascot(
                  size: 160.0,
                  mood: MascotMood.happy,
                ),
              ],
            ),
            Column(
              children: [
                Text("Wave"),
                SizedBox(height: 16),
                RefractionMascot(
                  size: 160.0,
                  mood: MascotMood.wave,
                ),
              ],
            ),
            Column(
              children: [
                Text("Think"),
                SizedBox(height: 16),
                RefractionMascot(
                  size: 160.0,
                  mood: MascotMood.think,
                ),
              ],
            ),
            Column(
              children: [
                Text("Static (No Animation)"),
                SizedBox(height: 16),
                RefractionMascot(
                  size: 160.0,
                  mood: MascotMood.happy,
                  animate: false,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
