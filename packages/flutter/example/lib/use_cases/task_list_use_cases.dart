import 'package:flutter/material.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:widgetbook_annotation/widgetbook_annotation.dart' as widgetbook;

/// A fixed "now" keeps the demo (and its screenshots) deterministic.
final DateTime _now = DateTime(2026, 9, 25, 10);

class _Todo {
  final String id;
  final String title;
  final String owner;
  final String? source;
  final DateTime? due;
  final (String, RefractionStatusType) status;
  final bool done;

  const _Todo({
    required this.id,
    required this.title,
    required this.owner,
    required this.status,
    this.source,
    this.due,
    this.done = false,
  });

  _Todo copyWith({bool? done, (String, RefractionStatusType)? status}) => _Todo(
    id: id,
    title: title,
    owner: owner,
    source: source,
    due: due,
    status: status ?? this.status,
    done: done ?? this.done,
  );
}

const _notStarted = ('Not started', RefractionStatusType.neutral);
const _working = ('Working on it', RefractionStatusType.pending);
const _stuck = ('Stuck', RefractionStatusType.error);
const _doneStatus = ('Done', RefractionStatusType.success);

List<_Todo> _seed() => [
  _Todo(
    id: '1',
    title: 'Send the revised quote to Northwind',
    owner: 'AS',
    source: '#sales',
    due: _now.subtract(const Duration(days: 2)),
    status: _stuck,
  ),
  _Todo(
    id: '2',
    title: 'Review onboarding copy for the Android release',
    owner: 'PR',
    source: 'Priya Raman',
    due: _now.subtract(const Duration(days: 1)),
    status: _working,
  ),
  _Todo(
    id: '3',
    title: 'Book venue for the October offsite',
    owner: 'JD',
    source: '#team-ops',
    due: _now,
    status: _working,
  ),
  _Todo(
    id: '4',
    title: 'Reply to the accessibility audit findings',
    owner: 'AS',
    source: 'Design review',
    due: _now,
    status: _notStarted,
  ),
  _Todo(
    id: '5',
    title: 'Draft Q4 hiring plan',
    owner: 'MK',
    due: _now.add(const Duration(days: 3)),
    status: _notStarted,
  ),
  _Todo(
    id: '6',
    title: 'Renew the code-signing certificate before it expires',
    owner: 'JD',
    source: '#eng-infra',
    due: _now.add(const Duration(days: 12)),
    status: _notStarted,
  ),
  _Todo(
    id: '7',
    title: 'Publish the September changelog',
    owner: 'PR',
    source: '#product',
    due: _now.subtract(const Duration(days: 1)),
    status: _doneStatus,
    done: true,
  ),
];

@widgetbook.UseCase(name: 'Grouped to-dos', type: RefractionTaskList)
Widget groupedTaskListUseCase(BuildContext context) {
  return const _GroupedTodos();
}

class _GroupedTodos extends StatefulWidget {
  const _GroupedTodos();

  @override
  State<_GroupedTodos> createState() => _GroupedTodosState();
}

class _GroupedTodosState extends State<_GroupedTodos> {
  List<_Todo> _todos = _seed();

  static const Map<RefractionDueBucket, String> _titles = {
    RefractionDueBucket.overdue: 'Overdue',
    RefractionDueBucket.today: 'Today',
    RefractionDueBucket.upcoming: 'Upcoming',
    RefractionDueBucket.noDate: 'No date',
    RefractionDueBucket.done: 'Done',
  };

  void _setDone(_Todo todo, bool done) => setState(() {
    _todos = [
      for (final t in _todos)
        t.id == todo.id
            ? t.copyWith(done: done, status: done ? _doneStatus : _notStarted)
            : t,
    ];
  });

  void _cycleStatus(_Todo todo) {
    const order = [_notStarted, _working, _stuck, _doneStatus];
    final next = order[(order.indexOf(todo.status) + 1) % order.length];
    setState(() {
      _todos = [
        for (final t in _todos)
          t.id == todo.id
              ? t.copyWith(status: next, done: next == _doneStatus)
              : t,
      ];
    });
  }

  Color _groupColor(RefractionColors colors, RefractionDueBucket bucket) =>
      switch (bucket) {
        RefractionDueBucket.overdue => colors.destructive,
        RefractionDueBucket.today => colors.caution,
        RefractionDueBucket.upcoming => colors.info,
        RefractionDueBucket.noDate => colors.neutral,
        RefractionDueBucket.done => colors.done,
      };

  @override
  Widget build(BuildContext context) {
    final colors = RefractionTheme.of(context).data.colors;
    final groups = RefractionDueDates.group(
      _todos,
      now: _now,
      dueOf: (t) => t.due,
      isDone: (t) => t.done,
    );
    return SingleChildScrollView(
      child: RefractionTaskList(
        semanticLabel: 'My to-dos',
        children: [
          for (final entry in groups.entries)
            if (entry.value.isNotEmpty)
              RefractionTaskGroup(
                key: ValueKey(entry.key),
                title: _titles[entry.key]!,
                color: _groupColor(colors, entry.key),
                initiallyExpanded: entry.key != RefractionDueBucket.done,
                children: [for (final todo in entry.value) _row(todo)],
              ),
        ],
      ),
    );
  }

  Widget _row(_Todo todo) {
    final due = todo.due == null
        ? null
        : RefractionDueDates.describe(todo.due!, now: _now);
    final (label, type) = todo.status;
    return RefractionTaskRow(
      key: ValueKey(todo.id),
      title: todo.title,
      completed: todo.done,
      onCompletedChanged: (v) => _setDone(todo, v),
      onTap: () {},
      owner: RefractionAvatar(fallbackText: todo.owner, size: 26),
      sourceLabel: todo.source,
      onSourceTap: todo.source == null ? null : () {},
      dueLabel: due?.$1,
      dueTone: due?.$2 ?? RefractionDueTone.normal,
      status: RefractionStatusPill(
        label: label,
        type: type,
        size: RefractionStatusPillSize.sm,
        expand: true,
        semanticLabel: 'Status: $label',
        onPressed: () => _cycleStatus(todo),
      ),
    );
  }
}
