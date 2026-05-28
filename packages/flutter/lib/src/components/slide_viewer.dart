import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/refraction_theme.dart';

enum SlideType { lesson, quiz, exercise, intro, summary }

enum BookmarkType { important, difficult, toRevise }

class SlideData {
  final String id;
  final SlideType type;
  final String content;

  const SlideData({
    required this.id,
    required this.type,
    required this.content,
  });
}

class RefractionSlideViewer extends StatefulWidget {
  final List<SlideData> slides;
  final int initialSlide;
  final ValueChanged<int>? onSlideChange;
  final VoidCallback? onComplete;

  /// Custom renderer for slide content.
  final Widget Function(BuildContext context, SlideData slide, int index)?
  renderSlide;

  const RefractionSlideViewer({
    super.key,
    required this.slides,
    this.initialSlide = 0,
    this.onSlideChange,
    this.onComplete,
    this.renderSlide,
  });

  @override
  State<RefractionSlideViewer> createState() => _RefractionSlideViewerState();
}

class _RefractionSlideViewerState extends State<RefractionSlideViewer> {
  late PageController _controller;
  late int _currentSlide;
  final Map<int, BookmarkType> _bookmarks = {};
  late FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    if (widget.slides.isEmpty) {
      _currentSlide = 0;
    } else {
      _currentSlide = widget.initialSlide.clamp(0, widget.slides.length - 1);
    }
    _controller = PageController(initialPage: _currentSlide);
    _focusNode = FocusNode();
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(RefractionSlideViewer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.slides.isEmpty) {
      _currentSlide = 0;
      return;
    }
    if (oldWidget.initialSlide != widget.initialSlide &&
        widget.initialSlide != _currentSlide) {
      _currentSlide = widget.initialSlide.clamp(0, widget.slides.length - 1);
      _controller.jumpToPage(_currentSlide);
    }
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentSlide = index;
    });
    widget.onSlideChange?.call(index);
  }

  void _next() {
    if (_currentSlide < widget.slides.length - 1) {
      _controller.animateToPage(
        _currentSlide + 1,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      widget.onComplete?.call();
    }
  }

  void _prev() {
    if (_currentSlide > 0) {
      _controller.animateToPage(
        _currentSlide - 1,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _toggleBookmark(BookmarkType type) {
    setState(() {
      if (_bookmarks[_currentSlide] == type) {
        _bookmarks.remove(_currentSlide);
      } else {
        _bookmarks[_currentSlide] = type;
      }
    });
  }

  double get _progress {
    if (widget.slides.length <= 1) return 1.0;
    return _currentSlide / (widget.slides.length - 1);
  }

  Widget _buildTypeBadge(SlideType type, RefractionTheme theme) {
    Color bgColor;
    Color textColor;

    switch (type) {
      case SlideType.lesson:
        bgColor = Colors.blue.shade100;
        textColor = Colors.blue.shade900;
        break;
      case SlideType.quiz:
        bgColor = Colors.purple.shade100;
        textColor = Colors.purple.shade900;
        break;
      case SlideType.exercise:
        bgColor = Colors.green.shade100;
        textColor = Colors.green.shade900;
        break;
      case SlideType.intro:
        bgColor = Colors.orange.shade100;
        textColor = Colors.orange.shade900;
        break;
      case SlideType.summary:
        bgColor = Colors.teal.shade100;
        textColor = Colors.teal.shade900;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        type.name,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.slides.isEmpty) {
      return const SizedBox.shrink();
    }

    final theme = RefractionTheme.of(context);
    final currentSlideData = widget.slides[_currentSlide];
    final isBookmarked = _bookmarks.containsKey(_currentSlide);

    return Focus(
      focusNode: _focusNode,
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent) {
          if (event.logicalKey == LogicalKeyboardKey.arrowRight) {
            _next();
            return KeyEventResult.handled;
          } else if (event.logicalKey == LogicalKeyboardKey.arrowLeft) {
            _prev();
            return KeyEventResult.handled;
          }
        }
        return KeyEventResult.ignored;
      },
      child: GestureDetector(
        onTap: () {
          if (!_focusNode.hasFocus) {
            _focusNode.requestFocus();
          }
        },
        child: Container(
          decoration: BoxDecoration(
            color: theme.colors.card,
            border: Border.all(color: theme.colors.border),
            borderRadius: BorderRadius.circular(theme.borderRadius),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Progress Bar
              LayoutBuilder(
                builder: (context, constraints) {
                  return Container(
                    height: 4,
                    color: theme.colors.muted,
                    alignment: Alignment.centerLeft,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: constraints.maxWidth * _progress,
                      height: 4,
                      color: theme.colors.primary,
                    ),
                  );
                },
              ),

              // Header
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: theme.colors.border),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        _buildTypeBadge(currentSlideData.type, theme),
                        const SizedBox(width: 8),
                        Text(
                          '${_currentSlide + 1} / ${widget.slides.length}',
                          style: TextStyle(
                            fontSize: 14,
                            color: theme.colors.mutedForeground,
                          ),
                        ),
                      ],
                    ),
                    InkWell(
                      onTap: () => _toggleBookmark(BookmarkType.important),
                      borderRadius: BorderRadius.circular(4),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: isBookmarked
                              ? Colors.amber.shade100
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          isBookmarked ? 'Bookmarked' : 'Bookmark',
                          style: TextStyle(
                            fontSize: 12,
                            color: isBookmarked
                                ? Colors.amber.shade900
                                : theme.colors.mutedForeground,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Content
              Expanded(
                child: PageView.builder(
                  controller: _controller,
                  onPageChanged: _onPageChanged,
                  itemCount: widget.slides.length,
                  itemBuilder: (context, index) {
                    final slide = widget.slides[index];
                    if (widget.renderSlide != null) {
                      return widget.renderSlide!(context, slide, index);
                    }
                    return Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Text(slide.content),
                    );
                  },
                ),
              ),

              // Footer Navigation
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  border: Border(top: BorderSide(color: theme.colors.border)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    TextButton(
                      onPressed: _currentSlide == 0 ? null : _prev,
                      style: TextButton.styleFrom(
                        foregroundColor: theme.colors.foreground,
                        disabledForegroundColor: theme.colors.mutedForeground,
                      ),
                      child: const Text('Previous'),
                    ),
                    ElevatedButton(
                      onPressed: _next,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.colors.primary,
                        foregroundColor: theme.colors.primaryForeground,
                      ),
                      child: Text(
                        _currentSlide == widget.slides.length - 1
                            ? 'Complete'
                            : 'Next',
                      ),
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
