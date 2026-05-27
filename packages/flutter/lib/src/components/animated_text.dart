import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// The type of animation to apply to the text.
enum RefractionTextAnimationType {
  /// Fades the text in.
  fade,

  /// Types the text out character by character.
  typewriter,

  /// Slides the text up while fading it in.
  slideUp,
}

/// A headless text component that provides customizable animations.
class RefractionAnimatedText extends StatefulWidget {
  /// The text to display and animate.
  final String text;

  /// The text style to apply. If null, the theme's default text style is used.
  final TextStyle? style;

  /// The duration of the animation.
  final Duration duration;

  /// The type of animation to play.
  final RefractionTextAnimationType type;

  /// Callback fired when the animation completes.
  final VoidCallback? onFinished;

  const RefractionAnimatedText({
    super.key,
    required this.text,
    this.style,
    this.duration = const Duration(milliseconds: 500),
    this.type = RefractionTextAnimationType.fade,
    this.onFinished,
  });

  @override
  State<RefractionAnimatedText> createState() => _RefractionAnimatedTextState();
}

class _RefractionAnimatedTextState extends State<RefractionAnimatedText>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _controller.addStatusListener(_handleStatusChange);
    _controller.forward();
  }

  @override
  void didUpdateWidget(covariant RefractionAnimatedText oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.duration != oldWidget.duration) {
      _controller.duration = widget.duration;
    }
    if (widget.text != oldWidget.text) {
      _controller.forward(from: 0.0);
    } else if (widget.type != oldWidget.type) {
      if (!_controller.isAnimating && !_controller.isCompleted) {
         _controller.forward();
      }
    }
  }

  void _handleStatusChange(AnimationStatus status) {
    if (status == AnimationStatus.completed) {
      widget.onFinished?.call();
    }
  }

  @override
  void dispose() {
    _controller.removeStatusListener(_handleStatusChange);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final textStyle = widget.style ?? theme.textStyle;

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        switch (widget.type) {
          case RefractionTextAnimationType.fade:
            return Opacity(
              opacity: _animation.value,
              child: Text(widget.text, style: textStyle),
            );
          case RefractionTextAnimationType.typewriter:
            final charCount = (widget.text.length * _animation.value).round();
            final visibleText = widget.text.substring(0, charCount);
            return Text(visibleText, style: textStyle);
          case RefractionTextAnimationType.slideUp:
            return Opacity(
              opacity: _animation.value,
              child: FractionalTranslation(
                translation: Offset(0, 0.5 * (1 - _animation.value)),
                child: Text(widget.text, style: textStyle),
              ),
            );
        }
      },
    );
  }
}
