import 'package:flutter/material.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;
import 'package:refraction_ui/refraction_ui.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionRatingScale)
Widget defaultRatingScale(BuildContext context) {
  return const _RatingScaleDemo();
}

@widgetbook.UseCase(name: 'Small Size', type: RefractionRatingScale)
Widget smallRatingScale(BuildContext context) {
  return const _RatingScaleDemo(
    size: RefractionRatingScaleSize.sm,
    minLabel: Text('Disagree'),
    maxLabel: Text('Agree'),
  );
}

@widgetbook.UseCase(name: 'Custom Points', type: RefractionRatingScale)
Widget customPointsRatingScale(BuildContext context) {
  return const _RatingScaleDemo(
    points: [
      RefractionRatingScalePoint(value: 1, label: '★'),
      RefractionRatingScalePoint(value: 2, label: '★★'),
      RefractionRatingScalePoint(value: 3, label: '★★★'),
      RefractionRatingScalePoint(value: 4, label: '★★★★'),
      RefractionRatingScalePoint(value: 5, label: '★★★★★'),
    ],
  );
}

class _RatingScaleDemo extends StatefulWidget {
  final RefractionRatingScaleSize size;
  final Widget? minLabel;
  final Widget? maxLabel;
  final List<RefractionRatingScalePoint>? points;

  const _RatingScaleDemo({
    this.size = RefractionRatingScaleSize.md,
    this.minLabel,
    this.maxLabel,
    this.points,
  });

  @override
  State<_RatingScaleDemo> createState() => _RatingScaleDemoState();
}

class _RatingScaleDemoState extends State<_RatingScaleDemo> {
  int? _value;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: RefractionRatingScale(
        value: _value,
        size: widget.size,
        minLabel: widget.minLabel,
        maxLabel: widget.maxLabel,
        points: widget.points,
        onValueChange: (val) {
          setState(() {
            _value = val;
          });
        },
      ),
    );
  }
}
