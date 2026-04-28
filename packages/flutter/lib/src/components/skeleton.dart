import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// The visual primitive a [RefractionSkeleton] should mimic.
enum SkeletonShape {
  /// A short rounded rectangle suitable for placeholder text.
  ///
  /// Defaults the height to `16` if not supplied and uses a small corner
  /// radius.
  text,

  /// A circle. When only one of width/height is supplied the other is
  /// matched automatically so the shape stays round.
  circular,

  /// A generic rounded rectangle. The default value.
  rectangular,
}

/// A pulsing placeholder block used while real content is loading.
///
/// `RefractionSkeleton` is the Flutter version of the `RefractionSkeleton`
/// component shipped with the React, Angular and Astro Refraction UI
/// packages (a shadcn-equivalent pattern). Its color is sourced from
/// [RefractionColors.muted] and its opacity oscillates while [animate] is
/// `true`.
///
/// Pick a [shape] to match the content being replaced and supply [width]
/// and/or [height] explicitly:
///
/// ```dart
/// Row(children: [
///   RefractionSkeleton(shape: SkeletonShape.circular, width: 40),
///   const SizedBox(width: 12),
///   Expanded(
///     child: Column(
///       crossAxisAlignment: CrossAxisAlignment.start,
///       children: const [
///         RefractionSkeleton(shape: SkeletonShape.text, width: 120),
///         SizedBox(height: 6),
///         RefractionSkeleton(shape: SkeletonShape.text, width: 200),
///       ],
///     ),
///   ),
/// ]);
/// ```
///
/// See also:
///
///  * [RefractionSkeletonText], a convenience that builds a paragraph of
///    text-shaped skeletons.
class RefractionSkeleton extends StatefulWidget {
  /// The visual primitive to render. Defaults to [SkeletonShape.rectangular].
  final SkeletonShape shape;

  /// Optional fixed width. When omitted the skeleton expands to fill its
  /// parent constraints.
  final double? width;

  /// Optional fixed height. When omitted the skeleton expands to fill its
  /// parent constraints, except for [SkeletonShape.text] which defaults to
  /// `16`.
  final double? height;

  /// When `true`, the opacity pulses to communicate loading. Set to `false`
  /// for static placeholders (for example, in golden tests).
  final bool animate;

  /// Creates a skeleton placeholder.
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

/// A column of [RefractionSkeleton]s sized like a paragraph of text.
///
/// Each line uses an organic, varied width so the placeholder block does
/// not look unnaturally rectangular while loading.
///
/// ```dart
/// const RefractionSkeletonText(lines: 4);
/// ```
class RefractionSkeletonText extends StatelessWidget {
  /// The number of skeleton lines to render. Defaults to `3`.
  final int lines;

  /// When `true`, each line pulses; see [RefractionSkeleton.animate].
  final bool animate;

  /// Creates a paragraph of text-shaped skeletons.
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
