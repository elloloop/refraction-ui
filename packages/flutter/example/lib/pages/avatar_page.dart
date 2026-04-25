import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import '../dev_tools/preview_canvas.dart';

class AvatarPage extends StatelessWidget {
  const AvatarPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: "Avatar",
      description: "An image element with a fallback for representing the user.",
      child: Center(
        child: Wrap(
          spacing: 32,
          runSpacing: 32,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            const Column(
              children: [
                Text("Standard"),
                SizedBox(height: 16),
                RefractionAvatar(
                  imageUrl: 'https://i.pravatar.cc/150?img=1',
                  fallbackText: 'JD',
                ),
              ],
            ),
            const Column(
              children: [
                Text("Fallback"),
                SizedBox(height: 16),
                RefractionAvatar(
                  fallbackText: 'JD',
                ),
              ],
            ),
            const Column(
              children: [
                Text("Error Fallback"),
                SizedBox(height: 16),
                RefractionAvatar(
                  imageUrl: 'https://invalid-url.com/image.png',
                  fallbackText: 'ER',
                ),
              ],
            ),
            Column(
              children: [
                const Text("Avatar Group"),
                const SizedBox(height: 16),
                RefractionAvatarGroup(
                  avatars: const [
                    RefractionAvatar(imageUrl: 'https://i.pravatar.cc/150?img=2', fallbackText: 'A'),
                    RefractionAvatar(imageUrl: 'https://i.pravatar.cc/150?img=3', fallbackText: 'B'),
                    RefractionAvatar(imageUrl: 'https://i.pravatar.cc/150?img=4', fallbackText: 'C'),
                    RefractionAvatar(imageUrl: 'https://i.pravatar.cc/150?img=5', fallbackText: 'D'),
                    RefractionAvatar(imageUrl: 'https://i.pravatar.cc/150?img=6', fallbackText: 'E'),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
