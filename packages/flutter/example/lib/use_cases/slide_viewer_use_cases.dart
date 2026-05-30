import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionSlideViewer)
Widget defaultSlideViewer(BuildContext context) {
  return SizedBox(
    height: 400,
    width: 600,
    child: const RefractionSlideViewer(
      slides: [
        SlideData(
          id: '1',
          type: SlideType.intro,
          content: 'Welcome to the course.',
        ),
        SlideData(
          id: '2',
          type: SlideType.lesson,
          content: 'This is the first lesson.',
        ),
        SlideData(
          id: '3',
          type: SlideType.quiz,
          content: 'Time for a quick quiz!',
        ),
      ],
    ),
  );
}

@widgetbook.UseCase(name: 'Custom Renderer', type: RefractionSlideViewer)
Widget customRendererSlideViewer(BuildContext context) {
  return SizedBox(
    height: 400,
    width: 600,
    child: RefractionSlideViewer(
      slides: const [
        SlideData(
          id: '1',
          type: SlideType.exercise,
          content: 'Custom Rendered Exercise',
        ),
      ],
      renderSlide: (context, slide, index) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.fitness_center, size: 48),
              const SizedBox(height: 16),
              Text(
                slide.content,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        );
      },
    ),
  );
}
