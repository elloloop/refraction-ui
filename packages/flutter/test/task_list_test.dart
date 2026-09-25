import 'dart:ui' show CheckedState, Tristate;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget _host(Widget child, {double width = 1000, bool reduceMotion = false}) {
  return MaterialApp(
    home: MediaQuery(
      data: MediaQueryData(
        size: Size(width, 800),
        disableAnimations: reduceMotion,
      ),
      child: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(
          body: SingleChildScrollView(
            child: Center(
              child: SizedBox(width: width, child: child),
            ),
          ),
        ),
      ),
    ),
  );
}

void main() {
  final now = DateTime(2026, 9, 25, 10);

  group('RefractionDueDates', () {
    test('bucketOf', () {
      expect(
        RefractionDueDates.bucketOf(DateTime(2026, 9, 24, 23), now: now),
        RefractionDueBucket.overdue,
      );
      expect(
        RefractionDueDates.bucketOf(DateTime(2026, 9, 25, 23, 59), now: now),
        RefractionDueBucket.today,
      );
      expect(
        RefractionDueDates.bucketOf(DateTime(2026, 9, 26), now: now),
        RefractionDueBucket.upcoming,
      );
      expect(
        RefractionDueDates.bucketOf(null, now: now),
        RefractionDueBucket.noDate,
      );
      expect(
        RefractionDueDates.bucketOf(DateTime(2026, 9, 1), now: now, done: true),
        RefractionDueBucket.done,
      );
    });

    test('group keeps every bucket in order and items in input order', () {
      final items = [
        (id: 'a', due: DateTime(2026, 9, 30), done: false),
        (id: 'b', due: DateTime(2026, 9, 20), done: false),
        (id: 'c', due: DateTime(2026, 9, 26), done: false),
        (id: 'd', due: DateTime(2026, 9, 20), done: true),
      ];
      final grouped = RefractionDueDates.group(
        items,
        now: now,
        dueOf: (i) => i.due,
        isDone: (i) => i.done,
      );
      expect(grouped.keys.toList(), RefractionDueBucket.values);
      expect(grouped[RefractionDueBucket.overdue]!.map((i) => i.id), ['b']);
      expect(grouped[RefractionDueBucket.today], isEmpty);
      expect(grouped[RefractionDueBucket.upcoming]!.map((i) => i.id), [
        'a',
        'c',
      ]);
      expect(grouped[RefractionDueBucket.done]!.map((i) => i.id), ['d']);
    });

    test('describe', () {
      String label(DateTime d) => RefractionDueDates.describe(d, now: now).$1;
      RefractionDueTone tone(DateTime d) =>
          RefractionDueDates.describe(d, now: now).$2;
      expect(label(DateTime(2026, 9, 25, 18)), 'Today');
      expect(tone(DateTime(2026, 9, 25)), RefractionDueTone.soon);
      expect(label(DateTime(2026, 9, 26)), 'Tomorrow');
      expect(label(DateTime(2026, 9, 24)), 'Yesterday');
      expect(label(DateTime(2026, 9, 21)), '4d overdue');
      expect(tone(DateTime(2026, 9, 21)), RefractionDueTone.overdue);
      expect(label(DateTime(2026, 9, 29)), 'in 4d');
      expect(label(DateTime(2026, 10, 9)), 'Oct 9');
    });
  });

  group('RefractionCompletionCheck', () {
    testWidgets('exposes checkbox semantics and toggles', (tester) async {
      final handle = tester.ensureSemantics();
      bool? requested;
      await tester.pumpWidget(
        _host(
          RefractionCompletionCheck(
            value: false,
            semanticLabel: 'Complete Pay invoice',
            onChanged: (v) => requested = v,
          ),
        ),
      );
      final node = tester.getSemantics(find.byType(RefractionCompletionCheck));
      expect(node.label, 'Complete Pay invoice');
      expect(node.flagsCollection.isChecked, CheckedState.isFalse);
      await tester.tap(find.byType(RefractionCompletionCheck));
      expect(requested, isTrue);
      handle.dispose();
    });

    testWidgets('pointer target is at least 32px', (tester) async {
      await tester.pumpWidget(
        _host(RefractionCompletionCheck(value: false, onChanged: (_) {})),
      );
      final size = tester.getSize(find.byType(RefractionCompletionCheck));
      expect(size.width, greaterThanOrEqualTo(32));
      expect(size.height, greaterThanOrEqualTo(32));
    });
  });

  group('RefractionTaskRow', () {
    testWidgets('wide layout shows title, source, due and status', (
      tester,
    ) async {
      await tester.pumpWidget(
        _host(
          const RefractionTaskRow(
            title: 'Send the quote',
            sourceLabel: '#sales',
            dueLabel: '2d overdue',
            dueTone: RefractionDueTone.overdue,
            status: RefractionStatusPill(label: 'Stuck'),
            owner: RefractionAvatar(fallbackText: 'AS', size: 26),
          ),
        ),
      );
      expect(find.text('Send the quote'), findsOneWidget);
      expect(find.text('#sales'), findsOneWidget);
      expect(find.text('2d overdue'), findsOneWidget);
      expect(find.text('Stuck'), findsOneWidget);
      // One line: title and status share a baseline row.
      expect(
        tester.getCenter(find.text('Send the quote')).dy,
        closeTo(tester.getCenter(find.text('Stuck')).dy, 2),
      );
      expect(tester.takeException(), isNull);
    });

    testWidgets('compact layout puts source and due under the title', (
      tester,
    ) async {
      await tester.pumpWidget(
        _host(
          const RefractionTaskRow(
            title: 'Send the quote',
            sourceLabel: '#sales',
            dueLabel: 'Today',
            status: RefractionStatusPill(label: 'Working on it'),
          ),
          width: 360,
        ),
      );
      expect(
        tester.getTopLeft(find.text('#sales')).dy,
        greaterThan(tester.getBottomLeft(find.text('Send the quote')).dy - 1),
      );
      expect(tester.takeException(), isNull);
    });

    testWidgets('completion animates first, then reports after settle', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      final reports = <bool>[];
      await tester.pumpWidget(
        _host(
          RefractionTaskRow(
            title: 'Pay invoice',
            onCompletedChanged: reports.add,
          ),
        ),
      );
      await tester.tap(find.byType(RefractionCompletionCheck));
      await tester.pump();
      expect(reports, isEmpty);
      // Visually complete straight away.
      expect(
        tester
            .getSemantics(find.byType(RefractionCompletionCheck))
            .flagsCollection
            .isChecked,
        CheckedState.isTrue,
      );
      await tester.pump(const Duration(milliseconds: 700));
      expect(reports, [true]);
      await tester.pumpAndSettle();
      handle.dispose();
    });

    testWidgets('reduced motion reports completion immediately', (
      tester,
    ) async {
      final reports = <bool>[];
      await tester.pumpWidget(
        _host(
          RefractionTaskRow(title: 'Pay', onCompletedChanged: reports.add),
          reduceMotion: true,
        ),
      );
      await tester.tap(find.byType(RefractionCompletionCheck));
      expect(reports, [true]);
    });

    testWidgets('un-completing reports immediately', (tester) async {
      final reports = <bool>[];
      await tester.pumpWidget(
        _host(
          RefractionTaskRow(
            title: 'Pay',
            completed: true,
            onCompletedChanged: reports.add,
          ),
        ),
      );
      await tester.tap(find.byType(RefractionCompletionCheck));
      expect(reports, [false]);
    });

    testWidgets('a row removed mid-settle still reports completion', (
      tester,
    ) async {
      final reports = <bool>[];
      await tester.pumpWidget(
        _host(RefractionTaskRow(title: 'Pay', onCompletedChanged: reports.add)),
      );
      await tester.tap(find.byType(RefractionCompletionCheck));
      await tester.pump();
      await tester.pumpWidget(_host(const SizedBox()));
      await tester.pump();
      expect(reports, [true]);
    });

    testWidgets('Space completes and Enter opens the focused row', (
      tester,
    ) async {
      final reports = <bool>[];
      var opened = 0;
      await tester.pumpWidget(
        _host(
          RefractionTaskList(
            children: [
              RefractionTaskRow(
                title: 'Pay',
                onCompletedChanged: reports.add,
                onTap: () => opened++,
              ),
            ],
          ),
          reduceMotion: true,
        ),
      );
      // First Tab stop is the row itself.
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      expect(opened, 1);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      expect(reports, [true]);
    });

    testWidgets('row semantics summarise title, due and source', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        _host(
          RefractionTaskRow(
            title: 'Pay',
            dueLabel: 'Today',
            sourceLabel: '#ops',
            onTap: () {},
          ),
        ),
      );
      expect(
        find.bySemanticsLabel('Pay, due Today, from #ops'),
        findsOneWidget,
      );
      handle.dispose();
    });
  });

  group('RefractionTaskGroup', () {
    testWidgets('header shows title + count and collapses its rows', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        _host(
          const RefractionTaskGroup(
            title: 'Today',
            children: [
              RefractionTaskRow(title: 'One'),
              RefractionTaskRow(title: 'Two'),
            ],
          ),
        ),
      );
      expect(find.text('Today'), findsOneWidget);
      expect(find.text('2'), findsOneWidget);
      final header = find.bySemanticsLabel('Today, 2');
      expect(header, findsOneWidget);
      expect(
        tester.getSemantics(header).flagsCollection.isExpanded,
        Tristate.isTrue,
      );

      await tester.tap(find.text('Today'));
      await tester.pumpAndSettle();
      expect(find.text('One'), findsNothing);
      expect(
        tester.getSemantics(header).flagsCollection.isExpanded,
        Tristate.isFalse,
      );
      handle.dispose();
    });

    testWidgets('collapsed rows are not in the focus order', (tester) async {
      await tester.pumpWidget(
        _host(
          RefractionTaskGroup(
            title: 'Done',
            initiallyExpanded: false,
            children: [
              RefractionTaskRow(title: 'Hidden', onCompletedChanged: (_) {}),
            ],
          ),
        ),
      );
      expect(find.text('Hidden'), findsNothing);
      expect(find.byType(RefractionCompletionCheck), findsNothing);
    });

    testWidgets('controlled mode reports and follows the host', (tester) async {
      bool? requested;
      await tester.pumpWidget(
        _host(
          RefractionTaskGroup(
            title: 'Today',
            expanded: true,
            onExpandedChanged: (v) => requested = v,
            children: const [RefractionTaskRow(title: 'One')],
          ),
        ),
      );
      await tester.tap(find.text('Today'));
      await tester.pumpAndSettle();
      expect(requested, isFalse);
      expect(find.text('One'), findsOneWidget); // host did not change it
    });

    testWidgets('empty group shows its empty label', (tester) async {
      await tester.pumpWidget(
        _host(
          const RefractionTaskGroup(
            title: 'Overdue',
            emptyLabel: 'Nothing overdue',
            children: [],
          ),
        ),
      );
      expect(find.text('Nothing overdue'), findsOneWidget);
      expect(find.text('0'), findsOneWidget);
    });
  });

  group('RefractionTaskList keyboard navigation', () {
    testWidgets('arrows move between rows and headers across groups', (
      tester,
    ) async {
      await tester.pumpWidget(
        _host(
          const RefractionTaskList(
            children: [
              RefractionTaskGroup(
                title: 'Overdue',
                children: [RefractionTaskRow(title: 'A')],
              ),
              RefractionTaskGroup(
                title: 'Today',
                children: [RefractionTaskRow(title: 'B')],
              ),
            ],
          ),
        ),
      );
      FocusNode focused() => FocusManager.instance.primaryFocus!;
      String? focusedText() {
        final ctx = focused().context!;
        final texts = <String>[];
        void visit(Element e) {
          final w = e.widget;
          if (w is Text && w.data != null) texts.add(w.data!);
          e.visitChildren(visit);
        }

        (ctx as Element).visitChildren(visit);
        return texts.isEmpty ? null : texts.first;
      }

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(focusedText(), 'Overdue');
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      expect(focusedText(), 'A');
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      expect(focusedText(), 'Today');
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      expect(focusedText(), 'B');
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      expect(focusedText(), 'B'); // clamps at the end
      await tester.sendKeyEvent(LogicalKeyboardKey.home);
      await tester.pump();
      expect(focusedText(), 'Overdue');
      await tester.sendKeyEvent(LogicalKeyboardKey.end);
      await tester.pump();
      expect(focusedText(), 'B');
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await tester.pump();
      expect(focusedText(), 'Today');
    });
  });
}
