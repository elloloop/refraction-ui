import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget _app(Widget child, {RefractionThemeData? theme}) {
  return MaterialApp(
    home: RefractionTheme(
      data: theme ?? RefractionThemeData.light(),
      child: Scaffold(
        body: Padding(
          padding: const EdgeInsets.only(top: 80),
          child: Align(alignment: Alignment.topCenter, child: child),
        ),
      ),
    ),
  );
}

RefractionMessageRow _row({
  bool continuation = false,
  List<RefractionMessageAction> actions = const [],
  VoidCallback? onLongPress,
  String? editedLabel,
  Widget? quote,
  Widget body = const Text('Shipping the fix now'),
  bool highlighted = false,
  String? semanticLabel,
}) {
  return RefractionMessageRow(
    authorName: 'Dev Patel',
    avatar: const RefractionAvatar(fallbackText: 'DP', size: 36),
    timestamp: '10:42',
    body: body,
    continuation: continuation,
    actions: actions,
    onLongPress: onLongPress,
    editedLabel: editedLabel,
    quote: quote,
    highlighted: highlighted,
    semanticLabel: semanticLabel,
  );
}

Future<TestGesture> _hover(WidgetTester tester, Finder finder) async {
  final gesture = await tester.createGesture(kind: PointerDeviceKind.mouse);
  await gesture.addPointer(location: Offset.zero);
  await gesture.moveTo(tester.getCenter(finder));
  await tester.pumpAndSettle();
  return gesture;
}

void main() {
  group('RefractionMessageRow layout', () {
    testWidgets('a run start shows avatar, name and time', (tester) async {
      await tester.pumpWidget(_app(_row()));
      expect(find.text('Dev Patel'), findsOneWidget);
      expect(find.text('10:42'), findsOneWidget);
      expect(find.byType(RefractionAvatar), findsOneWidget);
      expect(find.text('Shipping the fix now'), findsOneWidget);
    });

    testWidgets('a continuation hides avatar and name; time only on hover', (
      tester,
    ) async {
      await tester.pumpWidget(_app(_row(continuation: true)));
      expect(find.text('Dev Patel'), findsNothing);
      expect(find.byType(RefractionAvatar), findsNothing);
      double opacity() => tester
          .widget<AnimatedOpacity>(
            find.ancestor(
              of: find.text('10:42'),
              matching: find.byType(AnimatedOpacity),
            ),
          )
          .opacity;
      expect(opacity(), 0);
      await _hover(tester, find.byType(RefractionMessageRow));
      expect(opacity(), 1);
    });

    testWidgets('edited label renders after the body', (tester) async {
      await tester.pumpWidget(_app(_row(editedLabel: '(edited)')));
      expect(find.text('(edited)'), findsOneWidget);
    });

    testWidgets('highlighted rows paint the soft brand fill', (tester) async {
      final theme = RefractionThemeData.light();
      await tester.pumpWidget(_app(_row(highlighted: true), theme: theme));
      final container = tester.widget<AnimatedContainer>(
        find.byType(AnimatedContainer).first,
      );
      expect(
        (container.decoration! as BoxDecoration).color,
        theme.colors.primarySoft,
      );
    });

    testWidgets('renders in every dark palette without overflow', (
      tester,
    ) async {
      for (final theme in [
        RefractionThemeData.minimalDark(),
        RefractionThemeData.refractionDark(),
        RefractionThemeData.monoDark(),
      ]) {
        await tester.pumpWidget(
          _app(
            _row(
              quote: const RefractionMessageQuote(
                author: 'Ana',
                text: 'Can we ship today?',
              ),
              editedLabel: '(edited)',
            ),
            theme: theme,
          ),
        );
        expect(tester.takeException(), isNull);
      }
    });
  });

  group('RefractionMessageRow actions', () {
    testWidgets('hover shows a toolbar whose buttons are tappable', (
      tester,
    ) async {
      var replied = 0;
      await tester.pumpWidget(
        _app(
          _row(
            actions: [
              RefractionMessageAction(
                icon: Icons.reply,
                label: 'Reply',
                onSelected: () => replied++,
              ),
            ],
          ),
        ),
      );
      expect(find.byType(RefractionMessageToolbar), findsNothing);
      final gesture = await _hover(tester, find.byType(RefractionMessageRow));
      expect(find.byType(RefractionMessageToolbar), findsOneWidget);

      // The toolbar straddles the row's top edge; it lives in the overlay so
      // its upper half is hit-testable too. Move onto it and click there.
      final icon = find.byIcon(Icons.reply);
      final top = tester.getRect(icon).topCenter + const Offset(0, 1);
      await gesture.moveTo(top);
      await tester.pumpAndSettle();
      expect(find.byType(RefractionMessageToolbar), findsOneWidget);
      await tester.tapAt(top);
      await tester.pumpAndSettle();
      expect(replied, 1);
    });

    testWidgets('toolbar sits over the top edge of the row', (tester) async {
      await tester.pumpWidget(
        _app(
          _row(
            actions: [
              RefractionMessageAction(
                icon: Icons.reply,
                label: 'Reply',
                onSelected: () {},
              ),
            ],
          ),
        ),
      );
      await _hover(tester, find.byType(RefractionMessageRow));
      final row = tester.getRect(find.byType(RefractionMessageRow));
      final toolbar = tester.getRect(find.byType(RefractionMessageToolbar));
      expect(toolbar.center.dy, closeTo(row.top, 1));
      expect(toolbar.right, lessThan(row.right));
    });

    testWidgets('leaving the row hides the toolbar', (tester) async {
      await tester.pumpWidget(
        _app(
          _row(
            actions: [
              RefractionMessageAction(
                icon: Icons.reply,
                label: 'Reply',
                onSelected: () {},
              ),
            ],
          ),
        ),
      );
      final gesture = await _hover(tester, find.byType(RefractionMessageRow));
      await gesture.moveTo(const Offset(5, 500));
      await tester.pumpAndSettle();
      expect(find.byType(RefractionMessageToolbar), findsNothing);
    });

    testWidgets('Tab focuses the row, shows the toolbar, then walks it', (
      tester,
    ) async {
      var edited = 0;
      await tester.pumpWidget(
        _app(
          _row(
            actions: [
              RefractionMessageAction(
                icon: Icons.reply,
                label: 'Reply',
                onSelected: () {},
              ),
              RefractionMessageAction(
                icon: Icons.edit,
                label: 'Edit',
                onSelected: () => edited++,
              ),
            ],
          ),
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();
      expect(find.byType(RefractionMessageToolbar), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.tab); // Reply
      await tester.sendKeyEvent(LogicalKeyboardKey.tab); // Edit
      await tester.pumpAndSettle();
      expect(find.byType(RefractionMessageToolbar), findsOneWidget);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();
      expect(edited, 1);
    });

    testWidgets('a row without actions is not a keyboard stop', (tester) async {
      await tester.pumpWidget(_app(_row()));
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();
      expect(find.byType(RefractionMessageToolbar), findsNothing);
    });

    testWidgets('long-press and secondary click ask for actions', (
      tester,
    ) async {
      var asked = 0;
      await tester.pumpWidget(_app(_row(onLongPress: () => asked++)));
      await tester.longPress(find.text('Shipping the fix now'));
      expect(asked, 1);
      await tester.tap(
        find.text('Shipping the fix now'),
        buttons: kSecondaryButton,
      );
      expect(asked, 2);
    });

    testWidgets('Shift+F10 on a focused row asks for actions', (tester) async {
      var asked = 0;
      await tester.pumpWidget(
        _app(
          _row(
            onLongPress: () => asked++,
            actions: [
              RefractionMessageAction(
                icon: Icons.reply,
                label: 'Reply',
                onSelected: () {},
              ),
            ],
          ),
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
      await tester.sendKeyEvent(LogicalKeyboardKey.f10);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
      expect(asked, 1);
    });
  });

  group('RefractionMessageRow semantics', () {
    testWidgets('announces author and time, and exposes custom actions', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var replied = 0;
      await tester.pumpWidget(
        _app(
          _row(
            actions: [
              RefractionMessageAction(
                icon: Icons.reply,
                label: 'Reply',
                onSelected: () => replied++,
              ),
            ],
          ),
        ),
      );
      final node = tester.getSemantics(
        find.bySemanticsLabel('Dev Patel, 10:42'),
      );
      final ids = node.getSemanticsData().customSemanticsActionIds!;
      expect(ids, hasLength(1));
      final action = CustomSemanticsAction.getAction(ids.single)!;
      expect(action.label, 'Reply');
      node.owner!.performAction(
        node.id,
        SemanticsAction.customAction,
        ids.single,
      );
      expect(replied, 1);
      handle.dispose();
    });

    testWidgets('semanticLabel overrides the default', (tester) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        _app(_row(semanticLabel: 'Dev Patel said at 10:42')),
      );
      expect(find.bySemanticsLabel('Dev Patel said at 10:42'), findsOneWidget);
      handle.dispose();
    });
  });

  group('RefractionMessageQuote', () {
    testWidgets('renders author and text, and taps through', (tester) async {
      final handle = tester.ensureSemantics();
      var jumped = 0;
      await tester.pumpWidget(
        _app(
          RefractionMessageQuote(
            author: 'Ana',
            text: 'Can we ship today?',
            onTap: () => jumped++,
          ),
        ),
      );
      expect(
        find.bySemanticsLabel('Replying to Ana: Can we ship today?'),
        findsOneWidget,
      );
      await tester.tap(find.byType(RefractionMessageQuote));
      expect(jumped, 1);
      handle.dispose();
    });

    testWidgets('long quotes ellipsize at maxLines', (tester) async {
      await tester.pumpWidget(
        _app(
          SizedBox(
            width: 200,
            child: RefractionMessageQuote(text: 'word ' * 200, maxLines: 2),
          ),
        ),
      );
      final text = tester.widget<Text>(
        find.descendant(
          of: find.byType(RefractionMessageQuote),
          matching: find.byType(Text),
        ),
      );
      expect(text.maxLines, 2);
      expect(text.overflow, TextOverflow.ellipsis);
    });
  });

  group('RefractionMessageTombstone', () {
    testWidgets('renders the default note in italics', (tester) async {
      await tester.pumpWidget(_app(const RefractionMessageTombstone()));
      final text = tester.widget<Text>(find.text('This message was deleted.'));
      expect(text.style!.fontStyle, FontStyle.italic);
    });
  });
}
