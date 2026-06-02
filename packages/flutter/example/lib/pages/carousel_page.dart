import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

import '../dev_tools/preview_canvas.dart';

class CarouselPage extends StatelessWidget {
  const CarouselPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PreviewCanvas(
      title: 'Carousel',
      description:
          'A carousel with motion and swipe to navigate through images or items.',
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: RefractionTheme.of(context).colors.border,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.all(24),
                child: RefractionCarousel(
                  height: 200,
                  children: [
                    Container(
                      color: RefractionTheme.of(
                        context,
                      ).colors.primary.withValues(alpha: 0.1),
                      child: const Center(child: Text('Slide 1')),
                    ),
                    Container(
                      color: RefractionTheme.of(
                        context,
                      ).colors.secondary.withValues(alpha: 0.1),
                      child: const Center(child: Text('Slide 2')),
                    ),
                    Container(
                      color: RefractionTheme.of(
                        context,
                      ).colors.destructive.withValues(alpha: 0.1),
                      child: const Center(child: Text('Slide 3')),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
