import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lottie/lottie.dart';
import 'package:refraction_ui/refraction_ui.dart';

Widget _app(Widget child, {bool reduceMotion = false}) {
  return MaterialApp(
    home: MediaQuery(
      data: MediaQueryData(disableAnimations: reduceMotion),
      child: RefractionTheme(
        data: RefractionThemeData.light(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

void main() {
  group('EmojiData.lookup', () {
    test('finds entries with or without U+FE0F', () {
      expect(EmojiData.lookup('👍')!.name, isNotEmpty);
      expect(EmojiData.lookup('❤'), isNotNull);
      expect(EmojiData.lookup('❤️'), isNotNull);
      expect(EmojiData.lookup('not an emoji'), isNull);
    });
  });

  group('RefractionReaction labels', () {
    test('label wins, then the Unicode name, then the id', () {
      expect(
        const RefractionReaction(
          id: 'x',
          emoji: '👍',
          label: 'Agree',
        ).resolvedLabel,
        'Agree',
      );
      expect(
        const RefractionReaction(id: 'x', emoji: '🚀').resolvedLabel,
        EmojiData.lookup('🚀')!.name,
      );
      expect(
        const RefractionReaction(
          id: 'custom',
          icon: Icon(Icons.star),
        ).resolvedLabel,
        'custom',
      );
    });
  });

  group('RefractionReactionBar work-chat behaviour', () {
    testWidgets('emoji render through the bundled Twemoji, not a font', (
      tester,
    ) async {
      await tester.pumpWidget(
        _app(
          const RefractionReactionBar(
            reactions: [RefractionReaction(id: 'up', emoji: '👍', count: 2)],
          ),
        ),
      );
      expect(find.byType(SvgPicture), findsOneWidget);
      expect(find.text('👍'), findsNothing);
      expect(find.text('2'), findsOneWidget);
    });

    testWidgets('chips are toggle buttons with a descriptive label', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        _app(
          RefractionReactionBar(
            reactions: const [
              RefractionReaction(
                id: 'up',
                emoji: '👍',
                label: 'thumbs up',
                count: 3,
                isActive: true,
              ),
            ],
            onReactionTapped: (_) {},
          ),
        ),
      );
      final node = tester.getSemantics(
        find.bySemanticsLabel('thumbs up: 3 reactions, including you'),
      );
      final data = node.getSemanticsData();
      expect(data.flagsCollection.isButton, isTrue);
      expect(data.flagsCollection.isToggled, isNotNull);
      handle.dispose();
    });

    testWidgets('keyboard: Tab then Enter/Space toggles', (tester) async {
      final tapped = <String>[];
      await tester.pumpWidget(
        _app(
          RefractionReactionBar(
            reactions: const [RefractionReaction(id: 'up', emoji: '👍')],
            onReactionTapped: tapped.add,
          ),
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      expect(tapped, ['up', 'up']);
    });

    testWidgets('who reacted is a tooltip on the chip', (tester) async {
      await tester.pumpWidget(
        _app(
          const RefractionReactionBar(
            reactions: [
              RefractionReaction(
                id: 'up',
                emoji: '👍',
                label: 'thumbs up',
                count: 5,
                reactors: ['Ana', 'Dev', 'Sam', 'Lee', 'Kim'],
              ),
            ],
          ),
        ),
      );
      expect(find.byType(RefractionTooltip), findsOneWidget);
      final tooltip = tester.widget<RefractionTooltip>(
        find.byType(RefractionTooltip),
      );
      expect(
        (tooltip.message as Text).data,
        'Ana, Dev, Sam and 2 others reacted with thumbs up',
      );
    });

    testWidgets('no reactors, no tooltip', (tester) async {
      await tester.pumpWidget(
        _app(
          const RefractionReactionBar(
            reactions: [RefractionReaction(id: 'up', emoji: '👍', count: 1)],
          ),
        ),
      );
      expect(find.byType(RefractionTooltip), findsNothing);
    });

    test('reactor phrasing for one, few and many', () {
      const strings = RefractionReactionBarStrings();
      expect(strings.reactorsTooltip(['Ana'], 'eyes'), 'Ana reacted with eyes');
      expect(
        strings.reactorsTooltip(['Ana', 'Dev'], 'eyes'),
        'Ana and Dev reacted with eyes',
      );
      expect(
        strings.reactorsTooltip(['Ana', 'Dev', 'Sam', 'Lee'], 'eyes'),
        'Ana, Dev, Sam and 1 other reacted with eyes',
      );
    });

    testWidgets('overflow chip expands and collapses', (tester) async {
      await tester.pumpWidget(
        _app(
          const RefractionReactionBar(
            maxVisible: 2,
            reactions: [
              RefractionReaction(id: 'a', emoji: '👍', count: 1),
              RefractionReaction(id: 'b', emoji: '🎉', count: 1),
              RefractionReaction(id: 'c', emoji: '🚀', count: 1),
              RefractionReaction(id: 'd', emoji: '👀', count: 1),
            ],
          ),
        ),
      );
      expect(find.byKey(const ValueKey('c')), findsNothing);
      // The overflow pill hugs its label instead of filling the row.
      expect(tester.getSize(find.text('+2')).width, lessThan(60));
      expect(
        tester
            .getSize(
              find
                  .ancestor(
                    of: find.text('+2'),
                    matching: find.byType(Container),
                  )
                  .first,
            )
            .width,
        lessThan(80),
      );
      await tester.tap(find.text('+2'));
      await tester.pump();
      expect(find.byKey(const ValueKey('c')), findsOneWidget);
      expect(find.byKey(const ValueKey('d')), findsOneWidget);
      await tester.tap(find.text('Show less'));
      await tester.pump();
      expect(find.byKey(const ValueKey('c')), findsNothing);
    });

    testWidgets('add-reaction button calls back and is labelled', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var asked = 0;
      await tester.pumpWidget(
        _app(
          RefractionReactionBar(
            reactions: const [],
            onAddReaction: () => asked++,
          ),
        ),
      );
      expect(find.bySemanticsLabel('Add reaction'), findsOneWidget);
      await tester.tap(find.byIcon(Icons.add_reaction_outlined));
      expect(asked, 1);
      handle.dispose();
    });

    testWidgets('reacting plays the Noto animation once, then goes still', (
      tester,
    ) async {
      Widget bar(bool mine) => _app(
        RefractionReactionBar(
          reactions: [
            RefractionReaction(
              id: 'party',
              emoji: '🎉',
              count: mine ? 1 : 0,
              isActive: mine,
            ),
          ],
        ),
      );
      await tester.pumpWidget(bar(false));
      expect(find.byType(Lottie), findsNothing);
      await tester.pumpWidget(bar(true));
      await tester.pump();
      expect(find.byType(Lottie), findsOneWidget);
      // Let the asset load, then run past the longest bundled animation.
      await tester.runAsync(
        () => Future<void>.delayed(const Duration(seconds: 1)),
      );
      await tester.pump();
      await tester.pump(const Duration(seconds: 10));
      expect(find.byType(Lottie), findsNothing);
      expect(find.byType(SvgPicture), findsOneWidget);
    });

    testWidgets('reduced motion skips the animation', (tester) async {
      Widget bar(bool mine) => _app(
        RefractionReactionBar(
          reactions: [
            RefractionReaction(id: 'party', emoji: '🎉', isActive: mine),
          ],
        ),
        reduceMotion: true,
      );
      await tester.pumpWidget(bar(false));
      await tester.pumpWidget(bar(true));
      await tester.pump();
      expect(find.byType(Lottie), findsNothing);
    });

    testWidgets('custom icons are never animated', (tester) async {
      Widget bar(bool mine) => _app(
        RefractionReactionBar(
          reactions: [
            RefractionReaction(
              id: 'star',
              icon: const Icon(Icons.star),
              isActive: mine,
            ),
          ],
        ),
      );
      await tester.pumpWidget(bar(false));
      await tester.pumpWidget(bar(true));
      await tester.pump();
      expect(find.byType(Lottie), findsNothing);
      expect(find.byIcon(Icons.star), findsOneWidget);
    });
  });
}
