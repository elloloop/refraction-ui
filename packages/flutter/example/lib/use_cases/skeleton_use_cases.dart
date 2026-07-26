import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Shapes', type: RefractionSkeleton)
Widget shapeSkeletons(BuildContext context) {
  return const SizedBox(
    width: 360,
    child: Row(
      children: [
        RefractionSkeleton(shape: SkeletonShape.circular, width: 40),
        SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              RefractionSkeleton(shape: SkeletonShape.text, width: 120),
              SizedBox(height: 6),
              RefractionSkeleton(shape: SkeletonShape.text, width: 200),
            ],
          ),
        ),
      ],
    ),
  );
}

@widgetbook.UseCase(name: 'Text Block', type: RefractionSkeleton)
Widget textBlockSkeleton(BuildContext context) {
  return const SizedBox(width: 360, child: RefractionSkeletonText(lines: 4));
}
