import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// Lifetime of a floating reaction in milliseconds.
const int refractionReactionLifetimeMs = 3000;

/// Data class representing a single transient emoji reaction.
class RefractionFloatingReaction {
  /// Unique identifier for this reaction.
  final String id;

  /// The emoji character to display, e.g. '👋' or '❤️'.
  final String emoji;

  /// Horizontal offset bucket (0-indexed).
  final int lane;

  /// Creates a [RefractionFloatingReaction].
  const RefractionFloatingReaction({
    required this.id,
    required this.emoji,
    this.lane = 0,
  });
}

/// A controlled overlay that renders transient emoji reactions floating upward.
///
/// Intended to be positioned absolutely (e.g., in a [Stack]) over a video or meeting surface.
class RefractionFloatingReactions extends StatelessWidget {
  /// Controlled list of reactions currently visible in the overlay.
  final List<RefractionFloatingReaction> reactions;

  /// Total number of horizontal lane buckets used to spread reactions. Defaults to 5.
  final int lanes;

  /// Creates a [RefractionFloatingReactions] overlay.
  const RefractionFloatingReactions({
    super.key,
    required this.reactions,
    this.lanes = 5,
  });

  double _laneOffsetPercent(int lane, int lanes) {
    if (lanes <= 0) return 50.0;
    final clamped = lane.clamp(0, lanes - 1);
    final step = 100.0 / lanes;
    return step * clamped + step / 2;
  }

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Semantics(
        container: true,
        label: 'Reactions status',
        liveRegion: true,
        child: LayoutBuilder(
          builder: (context, constraints) {
            return Stack(
              clipBehavior: Clip.hardEdge,
              children: reactions.map((reaction) {
                final leftPercent = _laneOffsetPercent(reaction.lane, lanes);
                return _FloatingReactionItem(
                  key: ValueKey(reaction.id),
                  emoji: reaction.emoji,
                  leftPercent: leftPercent,
                  parentWidth: constraints.maxWidth,
                  parentHeight: constraints.maxHeight,
                );
              }).toList(),
            );
          },
        ),
      ),
    );
  }
}

class _FloatingReactionItem extends StatefulWidget {
  final String emoji;
  final double leftPercent;
  final double parentWidth;
  final double parentHeight;

  const _FloatingReactionItem({
    super.key,
    required this.emoji,
    required this.leftPercent,
    required this.parentWidth,
    required this.parentHeight,
  });

  @override
  State<_FloatingReactionItem> createState() => _FloatingReactionItemState();
}

class _FloatingReactionItemState extends State<_FloatingReactionItem>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: refractionReactionLifetimeMs),
    )..forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final floatDistance = widget.parentHeight > 0 ? widget.parentHeight * 0.8 : 200.0;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final double progress = _controller.value;
        final double y = -floatDistance * progress;

        // Fade out in the last 20% of the animation
        double opacity = 1.0;
        if (progress > 0.8) {
          opacity = 1.0 - (progress - 0.8) / 0.2;
        }

        // Approximate the center of the emoji item (width is around 32 logical pixels)
        final double leftPosition =
            (widget.parentWidth - 32.0) * (widget.leftPercent / 100.0);

        return Positioned(
          left: leftPosition.clamp(0.0, widget.parentWidth - 32.0),
          bottom: 16.0 - y,
          child: Opacity(
            opacity: opacity.clamp(0.0, 1.0),
            child: Text(
              widget.emoji,
              style: const TextStyle(
                fontSize: 32.0,
                height: 1.0,
              ),
            ),
          ),
        );
      },
    );
  }
}
