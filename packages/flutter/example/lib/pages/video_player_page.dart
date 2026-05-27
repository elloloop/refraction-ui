import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class VideoPlayerPage extends StatelessWidget {
  const VideoPlayerPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Video Player')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Video Player',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text('A highly customizable video player component with standard UI controls.'),
            const SizedBox(height: 32),
            const Text(
              'Default Video Player',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const RefractionVideoPlayer(
              src: 'https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4',
              poster: 'https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.jpg',
            ),
            const SizedBox(height: 32),
            const Text(
              'Autoplay & Muted',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const RefractionVideoPlayer(
              src: 'https://flutter.github.io/assets-for-api-docs/assets/videos/bee.mp4',
              autoPlay: true,
              muted: true,
            ),
          ],
        ),
      ),
    );
  }
}
