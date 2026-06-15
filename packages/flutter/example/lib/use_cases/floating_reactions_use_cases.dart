import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/floating_reactions.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

@widgetbook.UseCase(name: 'Default Burst', type: RefractionFloatingReactions)
Widget floatingReactionsDefaultUseCase(BuildContext context) {
  return const Stack(
    children: [
      Positioned.fill(
        child: ColoredBox(color: Colors.black12),
      ),
      RefractionFloatingReactions(
        reactions: [
          RefractionFloatingReaction(id: '1', emoji: '👋', lane: 0),
          RefractionFloatingReaction(id: '2', emoji: '❤️', lane: 2),
          RefractionFloatingReaction(id: '3', emoji: '🔥', lane: 4),
        ],
      ),
    ],
  );
}
