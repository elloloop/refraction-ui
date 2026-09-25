import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

/// A work-chat reaction row that toggles like the real thing: tap a chip to
/// add or remove your reaction (it pops and plays its Noto animation), hover
/// for who reacted, "+N" to see the rest, and the trailing button to add one.
class _LiveReactionBar extends StatefulWidget {
  const _LiveReactionBar({this.maxVisible});

  final int? maxVisible;

  @override
  State<_LiveReactionBar> createState() => _LiveReactionBarState();
}

class _LiveReactionBarState extends State<_LiveReactionBar> {
  static const String _me = 'You';

  List<RefractionReaction> _reactions = const [
    RefractionReaction(
      id: 'up',
      emoji: '👍',
      count: 3,
      reactors: ['Ana Ruiz', 'Dev Patel', 'Sam Okafor'],
    ),
    RefractionReaction(
      id: 'done',
      emoji: '✅',
      count: 2,
      isActive: true,
      reactors: [_me, 'Ana Ruiz'],
    ),
    RefractionReaction(id: 'eyes', emoji: '👀', count: 1, reactors: ['Lee']),
    RefractionReaction(
      id: 'rocket',
      emoji: '🚀',
      count: 4,
      reactors: ['Ana Ruiz', 'Dev Patel', 'Sam Okafor', 'Kim Tran'],
    ),
    RefractionReaction(id: 'idea', emoji: '💡', count: 1, reactors: ['Kim']),
    RefractionReaction(id: 'wait', emoji: '⏳', count: 2, reactors: ['A', 'B']),
  ];

  void _toggle(String id) {
    setState(() {
      _reactions = [
        for (final r in _reactions)
          if (r.id != id)
            r
          else if (r.isActive)
            r.copyWith(
              isActive: false,
              count: r.count - 1,
              reactors: [...r.reactors]..remove(_me),
            )
          else
            r.copyWith(
              isActive: true,
              count: r.count + 1,
              reactors: [_me, ...r.reactors],
            ),
      ];
    });
  }

  @override
  Widget build(BuildContext context) {
    return RefractionReactionBar(
      reactions: _reactions,
      maxVisible: widget.maxVisible,
      onReactionTapped: _toggle,
      onAddReaction: () {},
    );
  }
}

@widgetbook.UseCase(name: 'Work chat', type: RefractionReactionBar)
Widget workChatReactionBarUseCase(BuildContext context) {
  return const Padding(padding: EdgeInsets.all(24), child: _LiveReactionBar());
}

@widgetbook.UseCase(name: 'Overflow', type: RefractionReactionBar)
Widget overflowReactionBarUseCase(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(24),
    child: _LiveReactionBar(maxVisible: 3),
  );
}
