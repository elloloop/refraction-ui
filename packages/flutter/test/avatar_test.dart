import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/theme/hsl_color.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionAvatar displays fallback text when imageUrl is null', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      buildTestApp(const RefractionAvatar(fallbackText: 'JD')),
    );

    expect(find.text('JD'), findsOneWidget);
  });

  testWidgets(
    'RefractionAvatarGroup displays max avatars and remaining count',
    (WidgetTester tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionAvatarGroup(
            max: 2,
            avatars: [
              RefractionAvatar(fallbackText: 'A'),
              RefractionAvatar(fallbackText: 'B'),
              RefractionAvatar(fallbackText: 'C'),
            ],
          ),
        ),
      );

      expect(find.text('A'), findsOneWidget);
      expect(find.text('B'), findsOneWidget);
      expect(find.text('C'), findsNothing);
      expect(find.text('+1'), findsOneWidget);
    },
  );

  group('RefractionAvatar.initialsFor', () {
    test('takes the first letter of the first and last words', () {
      expect(RefractionAvatar.initialsFor('Jane Doe'), 'JD');
      expect(RefractionAvatar.initialsFor('Mary Jane Watson'), 'MW');
      expect(RefractionAvatar.initialsFor('  jane   doe '), 'JD');
    });

    test('takes one letter from a single word', () {
      expect(RefractionAvatar.initialsFor('Jane'), 'J');
      expect(RefractionAvatar.initialsFor('design'), 'D');
    });

    test('keeps short upper-case initials the caller computed', () {
      expect(RefractionAvatar.initialsFor('JD'), 'JD');
      expect(RefractionAvatar.initialsFor('A'), 'A');
    });

    test('never splits a grapheme', () {
      expect(RefractionAvatar.initialsFor('Émile Zola'), 'ÉZ');
      expect(RefractionAvatar.initialsFor('👩‍💻 Dev'), '👩‍💻D');
    });

    test('falls back to ? for a blank name', () {
      expect(RefractionAvatar.initialsFor('   '), '?');
    });
  });

  group('RefractionAvatar tint', () {
    test('is deterministic and ignores case and padding', () {
      final a = RefractionAvatar.tintIndexFor('Jane Doe');
      expect(RefractionAvatar.tintIndexFor('Jane Doe'), a);
      expect(RefractionAvatar.tintIndexFor(' jane doe '), a);
    });

    test('spreads names across the ramp', () {
      final names = [
        'Ana',
        'Ben',
        'Cy',
        'Dee',
        'Eli',
        'Fay',
        'Gus',
        'Hal',
        'Ivy',
        'Jo',
        'Kai',
        'Lu',
        'Mo',
        'Ned',
        'Oz',
        'Pia',
      ];
      final used = names.map(RefractionAvatar.tintIndexFor).toSet();
      expect(used.length, greaterThanOrEqualTo(5));
      expect(
        used.every((i) => i >= 0 && i < RefractionAvatar.tintCount),
        isTrue,
      );
    });

    test('separates short look-alike names', () {
      final used = [
        'AB',
        'CD',
        'EF',
        'GH',
      ].map(RefractionAvatar.tintIndexFor).toSet();
      expect(used.length, greaterThanOrEqualTo(3));
    });

    for (final theme in [
      RefractionThemeData.minimalLight(),
      RefractionThemeData.minimalDark(),
      RefractionThemeData.productivityLight(),
      RefractionThemeData.productivityDark(),
    ]) {
      test(
        'initials read at AA on every tint (${theme.colors.background})',
        () {
          for (var i = 0; i < RefractionAvatar.tintCount * 4; i++) {
            final (fill, ink) = RefractionAvatar.tintFor('user-$i', theme);
            expect(
              ColorMath.contrastRatio(fill, ink),
              greaterThanOrEqualTo(ColorMath.aaTextContrast),
            );
          }
        },
      );
    }

    testWidgets('fills the fallback with the tint for the name', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildTestApp(const RefractionAvatar(fallbackText: 'Jane Doe')),
      );
      final (fill, ink) = RefractionAvatar.tintFor(
        'Jane Doe',
        RefractionThemeData.minimalLight(),
      );
      final text = tester.widget<Text>(find.text('JD'));
      expect(text.style!.color, ink);
      final box = tester.widget<ColoredBox>(
        find
            .ancestor(of: find.text('JD'), matching: find.byType(ColoredBox))
            .first,
      );
      expect(box.color, fill);
    });

    testWidgets('colorSeed keeps the color across a rename', (tester) async {
      Color fillFor(WidgetTester t) => t
          .widget<ColoredBox>(
            find.descendant(
              of: find.byType(RefractionAvatar),
              matching: find.byType(ColoredBox),
            ),
          )
          .color;
      await tester.pumpWidget(
        buildTestApp(
          const RefractionAvatar(fallbackText: 'Jane Doe', colorSeed: 'u_42'),
        ),
      );
      final before = fillFor(tester);
      await tester.pumpWidget(
        buildTestApp(
          const RefractionAvatar(fallbackText: 'Jane Smith', colorSeed: 'u_42'),
        ),
      );
      expect(fillFor(tester), before);
    });
  });

  group('RefractionAvatar presence and semantics', () {
    testWidgets('overlays a ringed presence dot', (tester) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionAvatar(
            fallbackText: 'Jane Doe',
            presence: RefractionPresenceStatus.online,
          ),
        ),
      );
      final dot = tester.widget<RefractionPresenceIndicator>(
        find.byType(RefractionPresenceIndicator),
      );
      expect(
        dot.ringColor,
        RefractionThemeData.minimalLight().colors.background,
      );
      expect(dot.diameter, 40 * 0.28);
    });

    testWidgets('announces the name and presence as one image', (tester) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        buildTestApp(
          const RefractionAvatar(
            fallbackText: 'Jane Doe',
            presence: RefractionPresenceStatus.away,
          ),
        ),
      );
      expect(find.bySemanticsLabel('Jane Doe, Away'), findsOneWidget);
      expect(find.bySemanticsLabel('JD'), findsNothing);
      handle.dispose();
    });
  });

  group('RefractionAvatarGroup', () {
    test('describe summarises names', () {
      expect(RefractionAvatarGroup.describe(['Ana']), 'Ana');
      expect(RefractionAvatarGroup.describe(['Ana', 'Ben']), 'Ana and Ben');
      expect(
        RefractionAvatarGroup.describe(['Ana', 'Ben', 'Cy']),
        'Ana, Ben and Cy',
      );
      expect(
        RefractionAvatarGroup.describe(['Ana', 'Ben', 'Cy', 'Dee']),
        'Ana, Ben, Cy and 1 other',
      );
      expect(
        RefractionAvatarGroup.describe([
          'Ana',
          'Ben',
          'Cy',
          'Dee',
          'Eli',
        ], shown: 2),
        'Ana, Ben and 3 others',
      );
    });

    testWidgets('keeps each member\'s presence and sizes them uniformly', (
      tester,
    ) async {
      await tester.pumpWidget(
        buildTestApp(
          const RefractionAvatarGroup(
            size: 32,
            avatars: [
              RefractionAvatar(
                fallbackText: 'Ana Lee',
                presence: RefractionPresenceStatus.online,
              ),
              RefractionAvatar(fallbackText: 'Ben Ode', size: 80),
            ],
          ),
        ),
      );
      expect(find.byType(RefractionPresenceIndicator), findsOneWidget);
      final sizes = tester
          .widgetList<RefractionAvatar>(find.byType(RefractionAvatar))
          .map((a) => a.size);
      expect(sizes, everyElement(32));
    });

    testWidgets('is one element to a screen reader', (tester) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        buildTestApp(
          const RefractionAvatarGroup(
            max: 2,
            avatars: [
              RefractionAvatar(fallbackText: 'Ana'),
              RefractionAvatar(fallbackText: 'Ben'),
              RefractionAvatar(fallbackText: 'Cy'),
            ],
          ),
        ),
      );
      expect(find.bySemanticsLabel('Ana, Ben and 1 other'), findsOneWidget);
      handle.dispose();
    });
  });
}
