import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

/// The usual per-message actions of a work chat. The gallery wires them to
/// no-ops; an app passes its own callbacks.
List<RefractionMessageAction> _actions({bool mine = false}) => [
  RefractionMessageAction(
    icon: Icons.add_reaction_outlined,
    label: 'Add reaction',
    onSelected: () {},
  ),
  RefractionMessageAction(
    icon: Icons.reply_outlined,
    label: 'Reply',
    onSelected: () {},
  ),
  RefractionMessageAction(
    icon: Icons.copy_outlined,
    label: 'Copy text',
    onSelected: () {},
  ),
  if (mine) ...[
    RefractionMessageAction(
      icon: Icons.edit_outlined,
      label: 'Edit',
      onSelected: () {},
    ),
    RefractionMessageAction(
      icon: Icons.delete_outline,
      label: 'Delete',
      destructive: true,
      onSelected: () {},
    ),
  ],
];

Widget _avatar(String name) => RefractionAvatar(fallbackText: name, size: 36);

Widget _surface(BuildContext context, Widget child) {
  final colors = RefractionTheme.of(context).colors;
  return ConstrainedBox(
    constraints: const BoxConstraints(maxWidth: 720),
    child: Container(
      decoration: BoxDecoration(
        color: colors.background,
        border: Border.all(color: colors.border),
      ),
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: child,
    ),
  );
}

@widgetbook.UseCase(name: 'Thread', type: RefractionMessageRow)
Widget threadMessageRowUseCase(BuildContext context) {
  return _surface(
    context,
    Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        RefractionMessageRow(
          authorName: 'Ana Ruiz',
          avatar: _avatar('AR'),
          timestamp: '9:58 AM',
          body: const Text(
            'Morning! The release checklist is in the pinned doc. '
            'Can someone own the store screenshots today?',
          ),
          actions: _actions(),
        ),
        RefractionMessageRow(
          authorName: 'Ana Ruiz',
          avatar: _avatar('AR'),
          timestamp: '9:59 AM',
          continuation: true,
          body: const Text('Ideally before the 2pm sync.'),
          actions: _actions(),
        ),
        RefractionMessageRow(
          authorName: 'Dev Patel',
          avatar: _avatar('DP'),
          timestamp: '10:04 AM',
          quote: RefractionMessageQuote(
            author: 'Ana Ruiz',
            text: 'Can someone own the store screenshots today?',
            onTap: () {},
          ),
          body: const Text("I'll take them — iPad sizes too."),
          editedLabel: '(edited)',
          footer: RefractionReactionBar(
            reactions: const [
              RefractionReaction(id: 'thumbs', icon: Text('👍'), count: 3),
              RefractionReaction(
                id: 'eyes',
                icon: Text('👀'),
                count: 1,
                isActive: true,
              ),
            ],
            onReactionTapped: (_) {},
          ),
          actions: _actions(mine: true),
        ),
        RefractionMessageRow(
          authorName: 'Dev Patel',
          avatar: _avatar('DP'),
          timestamp: '10:05 AM',
          continuation: true,
          body: const RefractionMessageTombstone(),
        ),
        RefractionMessageRow(
          authorName: 'Sam Okafor',
          avatar: _avatar('SO'),
          timestamp: '10:12 AM',
          highlighted: true,
          body: const Text(
            'Heads up: the build for 2.4 is green. Linked this message from '
            'the to-do so it lands highlighted.',
          ),
          actions: _actions(),
        ),
      ],
    ),
  );
}

@widgetbook.UseCase(name: 'Hover toolbar', type: RefractionMessageRow)
Widget toolbarMessageRowUseCase(BuildContext context) {
  return _surface(
    context,
    Padding(
      padding: const EdgeInsets.only(top: 24),
      child: RefractionMessageToolbar(actions: _actions(mine: true)),
    ),
  );
}

@widgetbook.UseCase(name: 'Reply quote', type: RefractionMessageQuote)
Widget replyQuoteUseCase(BuildContext context) {
  return _surface(
    context,
    Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          RefractionMessageQuote(
            author: 'Ana Ruiz',
            text: 'Can someone own the store screenshots today?',
            onTap: () {},
          ),
          const RefractionMessageQuote(
            text:
                'A long quoted message that keeps going well past the width '
                'of the column so that it has to wrap onto a second line and '
                'then ellipsize rather than pushing the reply down the page.',
          ),
        ],
      ),
    ),
  );
}
