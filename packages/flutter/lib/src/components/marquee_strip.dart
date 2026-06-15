import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// RefractionMarqueeStrip — a full-width label + tag strip, optionally scrolling.
///
/// In static mode (scroll = false), items wrap naturally.
/// In scroll mode (scroll = true), items loop continuously.
///
/// Mirrors the react-marquee-strip / astro-marquee-strip equivalents.
class RefractionMarqueeStrip extends StatefulWidget {
  /// Eyebrow label shown before the items (static mode only).
  final String? label;

  /// List of text items to display.
  final List<String> items;

  /// When true, items scroll continuously.
  final bool scroll;

  /// Creates a [RefractionMarqueeStrip].
  const RefractionMarqueeStrip({
    super.key,
    this.label,
    required this.items,
    this.scroll = false,
  });

  @override
  State<RefractionMarqueeStrip> createState() => _RefractionMarqueeStripState();
}

class _RefractionMarqueeStripState extends State<RefractionMarqueeStrip> {
  late final ScrollController _scrollController;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    if (widget.scroll) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _startScrolling();
      });
    }
  }

  void _startScrolling() {
    _timer = Timer.periodic(const Duration(milliseconds: 16), (timer) {
      if (!mounted) return;
      if (_scrollController.hasClients) {
        final maxScroll = _scrollController.position.maxScrollExtent;
        if (maxScroll <= 0) return;
        final currentScroll = _scrollController.offset;
        double nextScroll = currentScroll + 0.5;
        if (nextScroll >= maxScroll) {
          nextScroll = 0.0;
        }
        _scrollController.jumpTo(nextScroll);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    final colors = theme.colors;

    final labelStyle = theme.textStyle.copyWith(
      fontSize: 11,
      fontWeight: FontWeight.bold,
      letterSpacing: 1.5,
      color: colors.mutedForeground,
    );

    final itemStyle = theme.textStyle.copyWith(
      fontSize: 14,
      color: colors.foreground,
    );

    Widget content;

    if (widget.scroll) {
      // Loop the items to ensure seamless marquee behavior
      final marqueeItems = [...widget.items, ...widget.items];
      content = SizedBox(
        height: 24,
        child: ListView.builder(
          controller: _scrollController,
          scrollDirection: Axis.horizontal,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: marqueeItems.length,
          itemBuilder: (context, index) {
            return Container(
              margin: const EdgeInsets.only(right: 24),
              alignment: Alignment.center,
              child: Text(
                marqueeItems[index],
                style: itemStyle,
              ),
            );
          },
        ),
      );
    } else {
      content = Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 16,
          runSpacing: 8,
          children: [
            if (widget.label != null)
              Text(
                widget.label!.toUpperCase(),
                style: labelStyle,
              ),
            ...widget.items.map((item) => Text(item, style: itemStyle)),
          ],
        ),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: colors.muted.withValues(alpha: 0.3),
        border: Border(
          top: BorderSide(color: colors.border),
          bottom: BorderSide(color: colors.border),
        ),
      ),
      child: content,
    );
  }
}
