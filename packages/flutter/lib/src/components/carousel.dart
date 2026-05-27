import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A carousel widget for swiping through a list of items.
///
/// Under the hood, this uses a [PageView] and provides built-in arrow controls
/// and dot indicators.
class RefractionCarousel extends StatefulWidget {
  /// The widgets to display in the carousel.
  final List<Widget> children;

  /// Optional controller to manage the page state externally.
  final PageController? controller;

  /// Called whenever the page changes.
  final ValueChanged<int>? onPageChanged;

  /// Whether to show the dot indicators. Defaults to true.
  final bool showIndicators;

  /// Whether to show the navigation arrows. Defaults to true.
  final bool showArrows;

  /// Whether the carousel should automatically scroll to the next page.
  final bool autoPlay;

  /// The duration to wait before scrolling to the next page when [autoPlay] is true.
  final Duration autoPlayInterval;

  /// The duration of the page transition animation.
  final Duration animationDuration;

  /// The curve of the page transition animation.
  final Curve animationCurve;

  /// Optional fixed height for the carousel. If null, takes up available space or intrinsic size of children.
  final double? height;

  /// The alignment of the dot indicators.
  final Alignment indicatorAlignment;

  /// Creates a [RefractionCarousel].
  const RefractionCarousel({
    super.key,
    required this.children,
    this.controller,
    this.onPageChanged,
    this.showIndicators = true,
    this.showArrows = true,
    this.autoPlay = false,
    this.autoPlayInterval = const Duration(seconds: 4),
    this.animationDuration = const Duration(milliseconds: 300),
    this.animationCurve = Curves.easeInOut,
    this.height,
    this.indicatorAlignment = Alignment.bottomCenter,
  });

  @override
  State<RefractionCarousel> createState() => _RefractionCarouselState();
}

class _RefractionCarouselState extends State<RefractionCarousel> {
  late PageController _controller;
  int _currentPage = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? PageController();
    _currentPage = _controller.initialPage;
    if (widget.autoPlay) {
      _startTimer();
    }
  }

  @override
  void didUpdateWidget(RefractionCarousel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller != oldWidget.controller) {
      _controller = widget.controller ?? PageController(initialPage: _currentPage);
    }
    if (widget.autoPlay != oldWidget.autoPlay || widget.autoPlayInterval != oldWidget.autoPlayInterval) {
      _stopTimer();
      if (widget.autoPlay) {
        _startTimer();
      }
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(widget.autoPlayInterval, (timer) {
      if (!mounted) return;
      if (widget.children.isEmpty) return;
      
      if (_currentPage < widget.children.length - 1) {
        _controller.nextPage(duration: widget.animationDuration, curve: widget.animationCurve);
      } else {
        _controller.animateToPage(0, duration: widget.animationDuration, curve: widget.animationCurve);
      }
    });
  }

  void _stopTimer() {
    _timer?.cancel();
    _timer = null;
  }

  @override
  void dispose() {
    _stopTimer();
    if (widget.controller == null) {
      _controller.dispose();
    }
    super.dispose();
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentPage = index;
    });
    widget.onPageChanged?.call(index);
  }

  void _goToPage(int index) {
    _controller.animateToPage(
      index,
      duration: widget.animationDuration,
      curve: widget.animationCurve,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context);
    final colors = theme.colors;

    Widget content = PageView.builder(
      controller: _controller,
      onPageChanged: _onPageChanged,
      itemCount: widget.children.length,
      itemBuilder: (context, index) {
        return widget.children[index];
      },
    );

    if (widget.height != null) {
      content = SizedBox(height: widget.height, child: content);
    }

    return Stack(
      alignment: Alignment.center,
      children: [
        content,
        if (widget.showArrows)
          Positioned.fill(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildArrow(
                  icon: Icons.chevron_left,
                  onPressed: _currentPage > 0 ? () => _goToPage(_currentPage - 1) : null,
                  backgroundColor: colors.background,
                  foregroundColor: colors.foreground,
                  mutedForegroundColor: colors.mutedForeground,
                ),
                _buildArrow(
                  icon: Icons.chevron_right,
                  onPressed: _currentPage < widget.children.length - 1 ? () => _goToPage(_currentPage + 1) : null,
                  backgroundColor: colors.background,
                  foregroundColor: colors.foreground,
                  mutedForegroundColor: colors.mutedForeground,
                ),
              ],
            ),
          ),
        if (widget.showIndicators)
          Positioned(
            bottom: widget.indicatorAlignment == Alignment.bottomCenter ? 16.0 : null,
            top: widget.indicatorAlignment == Alignment.topCenter ? 16.0 : null,
            left: 0,
            right: 0,
            child: Align(
              alignment: widget.indicatorAlignment,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(widget.children.length, (index) {
                  final isActive = _currentPage == index;
                  return GestureDetector(
                    onTap: () => _goToPage(index),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.symmetric(horizontal: 4.0),
                      width: isActive ? 24.0 : 8.0,
                      height: 8.0,
                      decoration: BoxDecoration(
                        color: isActive ? colors.primary : colors.mutedForeground.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(4.0),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildArrow({
    required IconData icon,
    VoidCallback? onPressed,
    required Color backgroundColor,
    required Color foregroundColor,
    required Color mutedForegroundColor,
  }) {
    final isDisabled = onPressed == null;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: Material(
        type: MaterialType.circle,
        color: isDisabled ? backgroundColor.withValues(alpha: 0.4) : backgroundColor.withValues(alpha: 0.8),
        clipBehavior: Clip.antiAlias,
        child: IconButton(
          icon: Icon(icon),
          color: isDisabled ? mutedForegroundColor : foregroundColor,
          onPressed: onPressed,
        ),
      ),
    );
  }
}
