import 'package:flutter/material.dart';
import '../theme/refraction_theme.dart';

class RefractionAccordion extends StatefulWidget {
  final List<RefractionAccordionItem> children;
  final bool allowMultiple;

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

class RefractionAccordionItem {
  final Widget title;
  final Widget content;

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
