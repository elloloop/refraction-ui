import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';

class ReactionBarPage extends StatefulWidget {
  const ReactionBarPage({super.key});

  @override
  State<ReactionBarPage> createState() => _ReactionBarPageState();
}

class _ReactionBarPageState extends State<ReactionBarPage> {
  List<RefractionReaction> _reactions = [
    const RefractionReaction(id: 'thumbs_up', icon: Text('👍'), count: 12),
    const RefractionReaction(id: 'heart', icon: Text('❤️'), count: 4, isActive: true),
    const RefractionReaction(id: 'laugh', icon: Text('😂'), count: 0),
    const RefractionReaction(id: 'rocket', icon: Text('🚀'), count: 1),
    const RefractionReaction(id: 'eyes', icon: Text('👀'), count: 0),
  ];

  void _handleReaction(String id) {
    setState(() {
      _reactions = _reactions.map((r) {
        if (r.id == id) {
          final newIsActive = !r.isActive;
          return r.copyWith(
            isActive: newIsActive,
            count: r.count + (newIsActive ? 1 : -1),
          );
        }
        return r;
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reaction Bar'),
      ),
      body: Center(
        child: RefractionReactionBar(
          reactions: _reactions,
          onReactionTapped: _handleReaction,
        ),
      ),
    );
  }
}
