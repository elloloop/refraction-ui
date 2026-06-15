import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

// Exporting types directly needed for cases
import 'package:refraction_ui/src/components/kanban_board.dart';

@widgetbook.UseCase(name: 'Default', type: RefractionKanbanBoard)
Widget defaultKanbanBoardUseCase(BuildContext context) {
  return const _KanbanBoardDemo();
}

class _Task {
  final String id;
  final String title;
  final String stageId;
  final String? accent;

  const _Task({
    required this.id,
    required this.title,
    required this.stageId,
    this.accent,
  });
}

class _KanbanBoardDemo extends StatefulWidget {
  const _KanbanBoardDemo();

  @override
  State<_KanbanBoardDemo> createState() => _KanbanBoardDemoState();
}

class _KanbanBoardDemoState extends State<_KanbanBoardDemo> {
  final List<KanbanColumnDef> _columns = const [
    KanbanColumnDef(
      id: 'todo',
      title: 'To Do',
      accent: '#FF3B30',
      note: 'Tasks waiting to start',
    ),
    KanbanColumnDef(
      id: 'progress',
      title: 'In Progress',
      accent: '#007AFF',
      note: 'Active development',
    ),
    KanbanColumnDef(
      id: 'done',
      title: 'Done',
      accent: '#34C759',
      note: 'Completed tasks',
    ),
  ];

  final List<_Task> _tasks = const [
    _Task(id: '1', title: 'Draft schema', stageId: 'todo', accent: '#FF3B30'),
    _Task(id: '2', title: 'Write tests', stageId: 'todo'),
    _Task(id: '3', title: 'Implement adapter', stageId: 'progress', accent: '#007AFF'),
    _Task(id: '4', title: 'Code review', stageId: 'progress'),
    _Task(id: '5', title: 'CI setup', stageId: 'progress'),
    _Task(id: '6', title: 'Setup repository', stageId: 'done', accent: '#34C759'),
    _Task(id: '7', title: 'Initial commit', stageId: 'done'),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: RefractionKanbanBoard<_Task>(
        columns: _columns,
        cards: _tasks,
        getCardColumnId: (task) => task.stageId,
        getCardKey: (task) => task.id,
        cardCap: 3,
        onShowMore: (columnId) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Show more clicked for column: $columnId')),
          );
        },
        renderCard: (task, colDef) {
          return RefractionKanbanCard(
            accent: task.accent,
            clickable: true,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Tapped task: ${task.title}')),
              );
            },
            child: Text(task.title),
          );
        },
      ),
    );
  }
}
