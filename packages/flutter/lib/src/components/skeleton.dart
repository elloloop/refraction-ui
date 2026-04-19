import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

enum SkeletonShape { text, circular, rectangular }

class RefractionSkeleton extends StatefulWidget {
  final SkeletonShape shape;
  final double? width;
  final double? height;
  final bool animate;

  const RefractionSkeleton({
    super.key,
    this.shape = SkeletonShape.rectangular,
    this.width,
    this.height,
    this.animate = true,
  });

  @override
  State<RefractionSkeleton> createState() => _RefractionSkeletonState();
}

class _RefractionSkeletonState extends State<RefractionSkeleton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    );
    _opacity = Tween<double>(
      begin: 0.4,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));

    if (widget.animate) {
      _controller.repeat(reverse: true);
    } else {
      _controller.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(RefractionSkeleton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.animate != oldWidget.animate) {
      if (widget.animate) {
        _controller.repeat(reverse: true);
      } else {
        _controller.stop();
        _controller.value = 1.0;
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).colors;

    double? finalWidth = widget.width;
    double? finalHeight = widget.height;
    BorderRadius borderRadius = BorderRadius.circular(12);

    if (widget.shape == SkeletonShape.circular) {
      borderRadius = BorderRadius.circular(9999);
      if (finalWidth != null && finalHeight == null) finalHeight = finalWidth;
      if (finalHeight != null && finalWidth == null) finalWidth = finalHeight;
    } else if (widget.shape == SkeletonShape.text) {
      finalHeight ??= 16.0;
      borderRadius = BorderRadius.circular(6);
    }

    return FadeTransition(
      opacity: _opacity,
      child: Container(
        width: finalWidth,
        height: finalHeight,
        decoration: BoxDecoration(
          color: colors.muted,
          borderRadius: borderRadius,
        ),
      ),
    );
  }
}

class RefractionSkeletonText extends StatelessWidget {
  final int lines;
  final bool animate;

  const RefractionSkeletonText({
    super.key,
    this.lines = 3,
    this.animate = true,
  });

  @override
  Widget build(BuildContext context) {
    // Array of width fractions to make text wrap look organic
    final List<double> widthPercentages = [
      1.0,
      0.92,
      0.85,
      0.96,
      0.78,
      0.88,
      0.94,
      0.82,
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final availableWidth = constraints.maxWidth;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: List.generate(lines, (index) {
            final double fraction =
                widthPercentages[index % widthPercentages.length];
            final double w = availableWidth.isFinite
                ? availableWidth * fraction
                : 200 * fraction;

            return Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: RefractionSkeleton(
                shape: SkeletonShape.text,
                width: w,
                height: 16,
                animate: animate,
              ),
            );
          }),
        );
      },
    );
  }
}
