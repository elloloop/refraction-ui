import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/theme/hsl_color.dart';

void main() {
  Widget buildApp(Widget child, {RefractionThemeData? theme}) {
    return MaterialApp(
      home: RefractionTheme(
        data: theme ?? RefractionThemeData.light(),
        child: Scaffold(body: Center(child: child)),
      ),
    );
  }

  BoxDecoration fillOf(WidgetTester tester, Finder text) {
    final container = tester.widget<Container>(
      find.ancestor(of: text, matching: find.byType(Container)).first,
    );
    return container.decoration! as BoxDecoration;
  }

  group('RefractionBadge.formatCount', () {
    test('shows the number up to the cap', () {
      expect(RefractionBadge.formatCount(1), '1');
      expect(RefractionBadge.formatCount(99), '99');
    });

    test('caps at 99+ by default', () {
      expect(RefractionBadge.formatCount(100), '99+');
      expect(RefractionBadge.formatCount(12000), '99+');
    });

    test('honours a custom cap', () {
      expect(RefractionBadge.formatCount(10, max: 9), '9+');
      expect(RefractionBadge.formatCount(9, max: 9), '9');
    });
  });

  group('RefractionBadge.count', () {
    testWidgets('renders the capped count', (tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionBadge.count(count: 150)),
      );
      expect(find.text('99+'), findsOneWidget);
    });

    testWidgets('renders nothing at zero', (tester) async {
      await tester.pumpWidget(buildApp(const RefractionBadge.count(count: 0)));
      expect(find.text('0'), findsNothing);
      expect(tester.getSize(find.byType(RefractionBadge)), Size.zero);
    });

    testWidgets('renders zero when showZero', (tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionBadge.count(count: 0, showZero: true)),
      );
      expect(find.text('0'), findsOneWidget);
    });

    testWidgets('is at least as wide as it is tall', (tester) async {
      await tester.pumpWidget(buildApp(const RefractionBadge.count(count: 1)));
      final size = tester.getSize(find.byType(RefractionBadge));
      expect(size.width, greaterThanOrEqualTo(size.height));
      expect(size.height, 18);
    });

    testWidgets('sm is shorter than md', (tester) async {
      await tester.pumpWidget(
        buildApp(
          const RefractionBadge.count(count: 1, size: RefractionBadgeSize.sm),
        ),
      );
      expect(tester.getSize(find.byType(RefractionBadge)).height, 16);
    });

    testWidgets('announces the count, or the caller\'s label', (tester) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(buildApp(const RefractionBadge.count(count: 7)));
      expect(find.bySemanticsLabel('7'), findsOneWidget);

      await tester.pumpWidget(
        buildApp(
          const RefractionBadge.count(count: 7, semanticLabel: '7 unread'),
        ),
      );
      expect(find.bySemanticsLabel('7 unread'), findsOneWidget);
      handle.dispose();
    });

    testWidgets('keeps its numerals at AA contrast on a bright fill', (
      tester,
    ) async {
      // minimalLight's destructive (#FF3B30) with white text is ~3.5:1.
      final colors = RefractionThemeData.light().colors;
      expect(
        ColorMath.contrastRatio(
          colors.destructive,
          colors.destructiveForeground,
        ),
        lessThan(ColorMath.aaTextContrast),
      );

      await tester.pumpWidget(buildApp(const RefractionBadge.count(count: 3)));
      final fill = fillOf(tester, find.text('3')).color!;
      expect(
        ColorMath.contrastRatio(fill, colors.destructiveForeground),
        greaterThanOrEqualTo(ColorMath.aaTextContrast),
      );
      // Same hue — it still reads as the destructive token.
      expect(
        HSLColor.fromColor(fill).hue,
        closeTo(HSLColor.fromColor(colors.destructive).hue, 1),
      );
    });

    testWidgets('leaves an already-readable fill untouched', (tester) async {
      final colors = RefractionThemeData.light().colors;
      await tester.pumpWidget(
        buildApp(
          const RefractionBadge.count(
            count: 3,
            variant: RefractionBadgeVariant.primary,
          ),
        ),
      );
      expect(fillOf(tester, find.text('3')).color, colors.primary);
    });

    testWidgets('draws a ring in ringColor', (tester) async {
      const ring = Color(0xFF123456);
      await tester.pumpWidget(
        buildApp(const RefractionBadge.count(count: 3, ringColor: ring)),
      );
      final outer = tester.widget<Container>(
        find
            .descendant(
              of: find.byType(RefractionBadge),
              matching: find.byType(Container),
            )
            .first,
      );
      expect((outer.decoration! as BoxDecoration).color, ring);
      expect(tester.getSize(find.byType(RefractionBadge)).height, 18 + 4);
    });
  });

  group('RefractionBadge.dot', () {
    testWidgets('is a small circle with no text', (tester) async {
      await tester.pumpWidget(buildApp(const RefractionBadge.dot()));
      expect(find.byType(Text), findsNothing);
      expect(tester.getSize(find.byType(RefractionBadge)), const Size(8, 8));
    });

    testWidgets('is decorative without a label', (tester) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(buildApp(const RefractionBadge.dot()));
      expect(
        find.descendant(
          of: find.byType(RefractionBadge),
          matching: find.byType(ExcludeSemantics),
        ),
        findsOneWidget,
      );
      await tester.pumpWidget(
        buildApp(const RefractionBadge.dot(semanticLabel: 'New activity')),
      );
      expect(find.bySemanticsLabel('New activity'), findsOneWidget);
      handle.dispose();
    });
  });

  group('RefractionBadge (label)', () {
    testWidgets('still wraps an arbitrary child', (tester) async {
      await tester.pumpWidget(
        buildApp(const RefractionBadge(child: Text('Beta'))),
      );
      expect(find.text('Beta'), findsOneWidget);
    });
  });

  group('ColorMath contrast', () {
    test('black on white is 21:1', () {
      expect(
        ColorMath.contrastRatio(Colors.black, Colors.white),
        closeTo(21, 0.01),
      );
    });

    test('returns a passing background unchanged', () {
      expect(
        ColorMath.ensureContrast(Colors.black, Colors.white),
        Colors.black,
      );
    });

    test('darkens under a light foreground', () {
      const red = Color(0xFFFF3B30);
      final fixed = ColorMath.ensureContrast(red, Colors.white);
      expect(
        ColorMath.contrastRatio(fixed, Colors.white),
        greaterThanOrEqualTo(4.5),
      );
      expect(fixed.computeLuminance(), lessThan(red.computeLuminance()));
    });

    test('lightens under a dark foreground', () {
      const slate = Color(0xFF555555);
      final fixed = ColorMath.ensureContrast(slate, Colors.black);
      expect(
        ColorMath.contrastRatio(fixed, Colors.black),
        greaterThanOrEqualTo(4.5),
      );
      expect(fixed.computeLuminance(), greaterThan(slate.computeLuminance()));
    });
  });
}
