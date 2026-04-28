import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

/// A vertically stacked set of expandable sections.
///
/// Each section is provided as a [RefractionAccordionItem] and toggles open
/// or closed when its header is tapped. By default only one item can be open
/// at a time; set [allowMultiple] to `true` to allow several open simultaneously.
///
/// Mirrors the `Accordion` primitive from the React, Angular, and Astro
/// Refraction UI packages (which wrap shadcn-ui's `Accordion`).
///
/// ```dart
/// RefractionAccordion(
///   allowMultiple: false,
///   children: const [
///     RefractionAccordionItem(
///       title: Text('Is it accessible?'),
///       content: Text('Yes. It uses keyboard focus and ARIA labels.'),
///     ),
///     RefractionAccordionItem(
///       title: Text('Is it themeable?'),
///       content: Text('Yes. It reads tokens from RefractionTheme.'),
///     ),
///   ],
/// )
/// ```
///
/// Visual styling — borders, hover background, and chevron color — comes from
/// [RefractionTheme.of] tokens such as [RefractionColors.border] and
/// [RefractionColors.mutedForeground].
class RefractionAccordion extends StatefulWidget {
  /// The collapsible sections to display in order.
  final List<RefractionAccordionItem> children;

  /// Whether multiple items may be expanded at once.
  ///
  /// When `false` (the default), opening one item collapses any other open
  /// item. When `true`, items expand and collapse independently.
  final bool allowMultiple;

  /// Creates a [RefractionAccordion].
  ///
  /// [children] is required and provides each collapsible section.
  const RefractionAccordion({
    super.key,
    required this.children,
    this.allowMultiple = false,
  });

  @override
  State<RefractionAccordion> createState() => _RefractionAccordionState();
}

class _RefractionAccordionState extends State<RefractionAccordion> {
  final Set<int> _openIndexes = {};

  void _toggle(int index) {
    setState(() {
      if (_openIndexes.contains(index)) {
        _openIndexes.remove(index);
      } else {
        if (!widget.allowMultiple) {
          _openIndexes.clear();
        }
        _openIndexes.add(index);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(widget.children.length, (index) {
        final item = widget.children[index];
        final isOpen = _openIndexes.contains(index);
        
        return _AccordionItemView(
          item: item,
          isOpen: isOpen,
          onToggle: () => _toggle(index),
          isLast: index == widget.children.length - 1,
        );
      }),
    );
  }
}

/// A single collapsible section displayed inside a [RefractionAccordion].
///
/// Holds the [title] shown in the always-visible header row and the [content]
/// revealed when the section is expanded.
class RefractionAccordionItem {
  /// The widget rendered in the header row, typically a [Text] label.
  final Widget title;

  /// The widget rendered in the expanded body of the item.
  final Widget content;

  /// Creates a [RefractionAccordionItem] with the supplied [title] and [content].
  const RefractionAccordionItem({
    required this.title,
    required this.content,
  });
}

class _AccordionItemView extends StatelessWidget {
  final RefractionAccordionItem item;
  final bool isOpen;
  final VoidCallback onToggle;
  final bool isLast;

  const _AccordionItemView({
    required this.item,
    required this.isOpen,
    required this.onToggle,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    final theme = RefractionTheme.of(context).data;
    
    return Container(
      decoration: BoxDecoration(
        border: isLast ? null : Border(bottom: BorderSide(color: theme.colors.border)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InkWell(
            onTap: onToggle,
            hoverColor: theme.colors.accent.withValues(alpha: 0.5),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  DefaultTextStyle(
                    style: theme.textStyle.copyWith(
                      fontWeight: FontWeight.w600,
                      color: theme.colors.foreground,
                    ),
                    child: item.title,
                  ),
                  AnimatedRotation(
                    turns: isOpen ? 0.5 : 0.0,
                    duration: const Duration(milliseconds: 200),
                    child: Icon(
                      Icons.keyboard_arrow_down,
                      color: theme.colors.mutedForeground,
                      size: 20,
                    ),
                  ),
                ],
              ),
            ),
          ),
          AnimatedCrossFade(
            firstChild: const SizedBox(width: double.infinity, height: 0),
            secondChild: Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: DefaultTextStyle(
                style: theme.textStyle.copyWith(
                  color: theme.colors.mutedForeground,
                  height: 1.5,
                ),
                child: item.content,
              ),
            ),
            crossFadeState: isOpen ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 200),
            sizeCurve: Curves.easeInOut,
          ),
        ],
      ),
    );
  }
}
