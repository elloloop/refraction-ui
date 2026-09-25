import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/theme/hsl_color.dart';

/// Every curated palette, light and dark — the pill must be legible on all.
final Map<String, RefractionThemeData> _themes = {
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
  'refractionLight': RefractionThemeData.refractionLight(),
  'refractionDark': RefractionThemeData.refractionDark(),
  'luxeLight': RefractionThemeData.luxeLight(),
  'luxeDark': RefractionThemeData.luxeDark(),
  'warmLight': RefractionThemeData.warmLight(),
  'warmDark': RefractionThemeData.warmDark(),
  'signalLight': RefractionThemeData.signalLight(),
  'signalDark': RefractionThemeData.signalDark(),
  'pulseLight': RefractionThemeData.pulseLight(),
  'pulseDark': RefractionThemeData.pulseDark(),
  'monoLight': RefractionThemeData.monoLight(),
  'monoDark': RefractionThemeData.monoDark(),
};

Widget _app(Widget child, {RefractionThemeData? theme}) {
  return MaterialApp(
    home: RefractionTheme(
      data: theme ?? RefractionThemeData.light(),
      child: Scaffold(body: Center(child: child)),
    ),
  );
}

void main() {
  group('ColorMath contrast', () {
    test('contrastRatio matches the WCAG endpoints', () {
      expect(
        ColorMath.contrastRatio(Colors.black, Colors.white),
        closeTo(21, 0.01),
      );
      expect(ColorMath.contrastRatio(Colors.red, Colors.red), 1);
    });

    test('readableOn keeps a preferred color that already passes', () {
      const navy = Color(0xFF0B1F44);
      expect(
        ColorMath.readableOn(navy, preferred: Colors.white),
        Colors.white,
      );
    });

    test('readableOn falls back when white fails on amber', () {
      const amber = Color(0xFFF59E0B);
      const ink = Color(0xFF111111);
      expect(
        ColorMath.contrastRatio(Colors.white, amber),
        lessThan(ColorMath.wcagAaText),
      );
      expect(
        ColorMath.readableOn(amber, preferred: Colors.white, candidates: [ink]),
        ink,
      );
    });

    test('readableOn uses black/white when no candidate passes', () {
      const amber = Color(0xFFF59E0B);
      expect(
        ColorMath.readableOn(amber, preferred: Colors.white),
        const Color(0xFF000000),
      );
    });
  });

  group('RefractionStatusPillColors', () {
    for (final entry in _themes.entries) {
      test('every tone × variant reaches WCAG AA on ${entry.key}', () {
        final colors = entry.value.colors;
        for (final tone in RefractionStatusTone.values) {
          for (final variant in RefractionStatusPillVariant.values) {
            final resolved = RefractionStatusPillColors.resolve(
              colors,
              tone: tone,
              variant: variant,
            );
            final surface = variant == RefractionStatusPillVariant.outline
                ? colors.background
                : resolved.background;
            expect(
              ColorMath.contrastRatio(resolved.foreground, surface),
              greaterThanOrEqualTo(ColorMath.wcagAaText),
              reason: '$tone/$variant on ${entry.key}',
            );
          }
        }
      });
    }

    test('solid fills come from the status tokens', () {
      final colors = RefractionThemeData.light().colors;
      RefractionStatusPillColors solid(RefractionStatusTone tone) =>
          RefractionStatusPillColors.resolve(
            colors,
            tone: tone,
            variant: RefractionStatusPillVariant.solid,
          );
      expect(solid(RefractionStatusTone.positive).background, colors.positive);
      expect(solid(RefractionStatusTone.caution).background, colors.caution);
      expect(solid(RefractionStatusTone.negative).background, colors.destructive);
      expect(solid(RefractionStatusTone.done).background, colors.done);
      expect(solid(RefractionStatusTone.pending).background, colors.pending);
      expect(solid(RefractionStatusTone.info).background, colors.info);
      expect(solid(RefractionStatusTone.neutral).background, colors.neutral);
      expect(solid(RefractionStatusTone.primary).background, colors.primary);
    });

    test('a custom color overrides the tone fill', () {
      const custom = Color(0xFF7C3AED);
      final resolved = RefractionStatusPillColors.resolve(
        RefractionThemeData.light().colors,
        tone: RefractionStatusTone.neutral,
        variant: RefractionStatusPillVariant.solid,
        color: custom,
      );
      expect(resolved.background, custom);
    });

    test('outline is transparent with a status border', () {
      final colors = RefractionThemeData.light().colors;
      final resolved = RefractionStatusPillColors.resolve(
        colors,
        tone: RefractionStatusTone.positive,
        variant: RefractionStatusPillVariant.outline,
      );
      expect(resolved.background, Colors.transparent);
      expect(resolved.border, colors.positive);
    });
  });

  group('RefractionStatusPill', () {
    testWidgets('renders the label and a status semantics name', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        _app(
          const RefractionStatusPill(
            label: 'Stuck',
            tone: RefractionStatusTone.negative,
          ),
        ),
      );
      expect(find.text('Stuck'), findsOneWidget);
      expect(find.bySemanticsLabel('Status: Stuck'), findsOneWidget);
      final node = tester.getSemantics(find.bySemanticsLabel('Status: Stuck'));
      expect(node.flagsCollection.isButton, isFalse);
      handle.dispose();
    });

    testWidgets('custom semanticLabel wins', (tester) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        _app(
          const RefractionStatusPill(
            label: 'Done',
            semanticLabel: 'Task status: Done',
          ),
        ),
      );
      expect(find.bySemanticsLabel('Task status: Done'), findsOneWidget);
      handle.dispose();
    });

    testWidgets('interactive pill is a tappable button', (tester) async {
      final handle = tester.ensureSemantics();
      var taps = 0;
      await tester.pumpWidget(
        _app(RefractionStatusPill(label: 'Working on it', onPressed: () => taps++)),
      );
      await tester.tap(find.text('Working on it'));
      expect(taps, 1);
      final node = tester.getSemantics(
        find.bySemanticsLabel('Status: Working on it'),
      );
      expect(node.flagsCollection.isButton, isTrue);
      handle.dispose();
    });

    testWidgets('interactive pill activates from the keyboard', (tester) async {
      var taps = 0;
      await tester.pumpWidget(
        _app(RefractionStatusPill(label: 'Review', onPressed: () => taps++)),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(taps, 1);
      await tester.sendKeyEvent(LogicalKeyboardKey.space);
      await tester.pump();
      expect(taps, 2);
    });

    testWidgets('keyboard focus paints the theme ring', (tester) async {
      final theme = RefractionThemeData.light();
      await tester.pumpWidget(
        _app(
          RefractionStatusPill(label: 'Review', onPressed: () {}),
          theme: theme,
        ),
      );
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      final decoration = tester
          .widget<Container>(
            find
                .descendant(
                  of: find.byType(RefractionStatusPill),
                  matching: find.byType(Container),
                )
                .first,
          )
          .decoration! as BoxDecoration;
      expect((decoration.border! as Border).top.color, theme.colors.ring);
    });

    testWidgets('expand stretches to the available width', (tester) async {
      await tester.pumpWidget(
        _app(
          const SizedBox(
            width: 200,
            child: RefractionStatusPill(label: 'Done', expand: true),
          ),
        ),
      );
      expect(tester.getSize(find.byType(RefractionStatusPill)).width, 200);
    });

    testWidgets('long labels ellipsize instead of overflowing', (tester) async {
      await tester.pumpWidget(
        _app(
          const SizedBox(
            width: 80,
            child: RefractionStatusPill(
              label: 'Waiting on the design review from marketing',
            ),
          ),
        ),
      );
      expect(tester.takeException(), isNull);
    });

    testWidgets('label color is the contrast-checked token color', (
      tester,
    ) async {
      final theme = RefractionThemeData.light();
      await tester.pumpWidget(
        _app(
          const RefractionStatusPill(
            label: 'At risk',
            tone: RefractionStatusTone.caution,
          ),
          theme: theme,
        ),
      );
      final text = tester.widget<Text>(find.text('At risk'));
      final expected = RefractionStatusPillColors.resolve(
        theme.colors,
        tone: RefractionStatusTone.caution,
        variant: RefractionStatusPillVariant.solid,
      ).foreground;
      expect(text.style!.color, expected);
    });
  });
}
