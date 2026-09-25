import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

/// WCAG contrast ratio, computed independently of the implementation.
double _contrast(Color a, Color b) {
  final la = a.computeLuminance();
  final lb = b.computeLuminance();
  final hi = la > lb ? la : lb;
  final lo = la > lb ? lb : la;
  return (hi + 0.05) / (lo + 0.05);
}

final Map<String, RefractionThemeData> _palettes = {
  'minimalLight': RefractionThemeData.minimalLight(),
  'minimalDark': RefractionThemeData.minimalDark(),
  'fintechLight': RefractionThemeData.fintechLight(),
  'fintechDark': RefractionThemeData.fintechDark(),
  'wellnessLight': RefractionThemeData.wellnessLight(),
  'wellnessDark': RefractionThemeData.wellnessDark(),
  'creativeLight': RefractionThemeData.creativeLight(),
  'creativeDark': RefractionThemeData.creativeDark(),
  'productivityLight': RefractionThemeData.productivityLight(),
  'productivityDark': RefractionThemeData.productivityDark(),
};

Widget _host(
  Widget child, {
  RefractionThemeData? data,
  bool reduceMotion = false,
}) {
  return MediaQuery(
    data: MediaQueryData(disableAnimations: reduceMotion),
    child: MaterialApp(
      home: RefractionTheme(
        data: data ?? RefractionThemeData.minimalLight(),
        child: Scaffold(body: Center(child: child)),
      ),
    ),
  );
}

BoxDecoration _pillDecoration(WidgetTester tester) {
  final container = tester.widget<AnimatedContainer>(
    find.descendant(
      of: find.byType(RefractionStatusPill),
      matching: find.byType(AnimatedContainer),
    ),
  );
  return container.decoration! as BoxDecoration;
}

void main() {
  group('RefractionStatusPillColors.resolve', () {
    for (final entry in _palettes.entries) {
      for (final type in RefractionStatusType.values) {
        for (final variant in RefractionStatusPillVariant.values) {
          test('${entry.key} ${type.name} ${variant.name} label meets AA', () {
            final colors = entry.value.colors;
            final resolved = RefractionStatusPillColors.resolve(
              hue: type.colorIn(colors),
              background: colors.background,
              variant: variant,
            );
            expect(
              _contrast(resolved.ink, resolved.fill),
              greaterThanOrEqualTo(4.5),
            );
            expect(
              _contrast(resolved.dot, resolved.fill),
              greaterThanOrEqualTo(3.0),
            );
          });
        }
      }
    }

    test('solid keeps the token hue when an ink already passes', () {
      const hue = Color(0xFF1D4ED8); // blue-700: white ink passes
      final resolved = RefractionStatusPillColors.resolve(
        hue: hue,
        background: const Color(0xFFFFFFFF),
        variant: RefractionStatusPillVariant.solid,
      );
      expect(resolved.fill, hue);
      expect(resolved.ink, const Color(0xFFFFFFFF));
    });

    test('solid deepens a bright hue so white ink passes', () {
      const green500 = Color(0xFF22C55E); // white on it is 2.3:1
      final resolved = RefractionStatusPillColors.resolve(
        hue: green500,
        background: const Color(0xFFFFFFFF),
        variant: RefractionStatusPillVariant.solid,
      );
      expect(resolved.ink, const Color(0xFFFFFFFF));
      expect(
        HSLColor.fromColor(resolved.fill).hue,
        closeTo(HSLColor.fromColor(green500).hue, 1),
      );
      expect(
        HSLColor.fromColor(resolved.fill).lightness,
        lessThan(HSLColor.fromColor(green500).lightness),
      );
    });

    test(
      'solid keeps a light hue and uses dark ink rather than going muddy',
      () {
        const yellow400 = Color(0xFFFACC15);
        final resolved = RefractionStatusPillColors.resolve(
          hue: yellow400,
          background: const Color(0xFFFFFFFF),
          variant: RefractionStatusPillVariant.solid,
        );
        expect(resolved.fill, yellow400);
        expect(resolved.ink.computeLuminance(), lessThan(0.05));
      },
    );
  });

  group('RefractionStatusPill', () {
    testWidgets('renders its label with the resolved status token fill', (
      tester,
    ) async {
      final data = RefractionThemeData.minimalLight();
      await tester.pumpWidget(
        _host(
          const RefractionStatusPill(
            label: 'Stuck',
            type: RefractionStatusType.error,
          ),
          data: data,
        ),
      );
      expect(find.text('Stuck'), findsOneWidget);
      final expected = RefractionStatusPillColors.resolve(
        hue: data.colors.destructive,
        background: data.colors.background,
        variant: RefractionStatusPillVariant.solid,
      );
      expect(_pillDecoration(tester).color, expected.fill);
    });

    testWidgets('hugs its label unless expand is set', (tester) async {
      await tester.pumpWidget(
        _host(
          const SizedBox(
            width: 400,
            child: Wrap(children: [RefractionStatusPill(label: 'Done')]),
          ),
        ),
      );
      expect(
        tester.getSize(find.byType(AnimatedContainer)).width,
        lessThan(120),
      );
    });

    testWidgets('a custom colour overrides the type token', (tester) async {
      const custom = Color(0xFF7C3AED); // violet-600: white already passes
      await tester.pumpWidget(
        _host(const RefractionStatusPill(label: 'Review', color: custom)),
      );
      expect(_pillDecoration(tester).color, custom);
    });

    testWidgets('soft variant tints the fill and draws a leading dot', (
      tester,
    ) async {
      final data = RefractionThemeData.minimalLight();
      await tester.pumpWidget(
        _host(
          const RefractionStatusPill(
            label: 'Done',
            type: RefractionStatusType.success,
            variant: RefractionStatusPillVariant.soft,
          ),
          data: data,
        ),
      );
      final fill = _pillDecoration(tester).color!;
      expect(fill, isNot(data.colors.positive));
      final dot = find.descendant(
        of: find.byType(RefractionStatusPill),
        matching: find.byWidgetPredicate(
          (w) =>
              w is Container &&
              w.decoration is BoxDecoration &&
              (w.decoration! as BoxDecoration).shape == BoxShape.circle,
        ),
      );
      expect(dot, findsOneWidget);
    });

    testWidgets('static pill exposes its label but no button semantics', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        _host(
          const RefractionStatusPill(
            label: 'Done',
            semanticLabel: 'Status: Done',
          ),
        ),
      );
      final node = tester.getSemantics(find.byType(RefractionStatusPill));
      expect(node.label, 'Status: Done');
      expect(node.flagsCollection.isButton, isFalse);
      expect(find.byIcon(Icons.expand_more_rounded), findsNothing);
      handle.dispose();
    });

    testWidgets('interactive pill is a button: tap, Enter and Space', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var presses = 0;
      await tester.pumpWidget(
        _host(
          RefractionStatusPill(
            label: 'Working on it',
            type: RefractionStatusType.pending,
            onPressed: () => presses++,
          ),
        ),
      );
      final node = tester.getSemantics(find.byType(RefractionStatusPill));
      expect(node.flagsCollection.isButton, isTrue);
      expect(find.byIcon(Icons.expand_more_rounded), findsOneWidget);

      await tester.tap(find.byType(RefractionStatusPill));
      expect(presses, 1);

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      expect(presses, 2);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      expect(presses, 3);
      handle.dispose();
    });

    testWidgets('keyboard focus paints a focus ring', (tester) async {
      await tester.pumpWidget(
        _host(RefractionStatusPill(label: 'Open', onPressed: () {})),
      );
      final ringFinder = find.descendant(
        of: find.byType(RefractionStatusPill),
        matching: find.byWidgetPredicate(
          (w) => w is CustomPaint && w.foregroundPainter != null,
        ),
      );
      expect(ringFinder, findsNothing);
      FocusManager.instance.highlightStrategy =
          FocusHighlightStrategy.alwaysTraditional;
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      expect(ringFinder, findsOneWidget);
      FocusManager.instance.highlightStrategy =
          FocusHighlightStrategy.automatic;
    });

    testWidgets('status changes animate, and snap under reduced motion', (
      tester,
    ) async {
      await tester.pumpWidget(_host(const RefractionStatusPill(label: 'Done')));
      final animated = tester.widget<AnimatedContainer>(
        find.byType(AnimatedContainer),
      );
      expect(animated.duration, greaterThan(Duration.zero));

      await tester.pumpWidget(
        _host(const RefractionStatusPill(label: 'Done'), reduceMotion: true),
      );
      final snapped = tester.widget<AnimatedContainer>(
        find.byType(AnimatedContainer),
      );
      expect(snapped.duration, Duration.zero);
    });

    testWidgets('expand stretches to the available width', (tester) async {
      await tester.pumpWidget(
        _host(
          const SizedBox(
            width: 200,
            child: RefractionStatusPill(label: 'Done', expand: true),
          ),
        ),
      );
      expect(tester.getSize(find.byType(AnimatedContainer)).width, 200);
    });

    testWidgets('long labels ellipsize instead of overflowing', (tester) async {
      await tester.pumpWidget(
        _host(
          const SizedBox(
            width: 90,
            child: RefractionStatusPill(
              label: 'Waiting for the vendor to reply',
              expand: true,
            ),
          ),
        ),
      );
      expect(tester.takeException(), isNull);
    });
  });
}
