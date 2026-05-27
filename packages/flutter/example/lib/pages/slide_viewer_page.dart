import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class SlideViewerPage extends StatelessWidget {
  const SlideViewerPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Slide Viewer')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 800),
            child: RefractionSlideViewer(
              slides: const [
                SlideData(
                  id: 's1',
                  type: SlideType.intro,
                  content: 'Welcome to the RefractionUI Slide Viewer component. This component supports keyboard navigation and gestures.',
                ),
                SlideData(
                  id: 's2',
                  type: SlideType.lesson,
                  content: 'Here you can present formatted content, images, or interactive elements. The viewer keeps track of the current progress automatically.',
                ),
                SlideData(
                  id: 's3',
                  type: SlideType.quiz,
                  content: 'Question 1: What is the answer to the ultimate question of life, the universe, and everything?',
                ),
                SlideData(
                  id: 's4',
                  type: SlideType.summary,
                  content: 'You reached the end! Great job learning about the RefractionSlideViewer.',
                ),
              ],
              onComplete: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Completed!')),
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
