import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

/// Every (foreground, background, minimum ratio) pair an accessible role
/// promises to meet, read off a palette.
List<(String, Color, Color, double)> _promisedPairs(RefractionColors c) => [
  ('successForeground/success', c.successForeground, c.success, 4.5),
  ('warningForeground/warning', c.warningForeground, c.warning, 4.5),
  ('infoForeground/info', c.infoForeground, c.info, 4.5),
  (
    'successSoftForeground/successSoft',
    c.successSoftForeground,
    c.successSoft,
    4.5,
  ),
  (
    'warningSoftForeground/warningSoft',
    c.warningSoftForeground,
    c.warningSoft,
    4.5,
  ),
  ('infoSoftForeground/infoSoft', c.infoSoftForeground, c.infoSoft, 4.5),
  (
    'destructiveSoftForeground/destructiveSoft',
    c.destructiveSoftForeground,
    c.destructiveSoft,
    4.5,
  ),
  ('mentionForeground/mention', c.mentionForeground, c.mention, 4.5),
  (
    'mentionSelfForeground/mentionSelf',
    c.mentionSelfForeground,
    c.mentionSelf,
    4.5,
  ),
  ('highlightForeground/highlight', c.highlightForeground, c.highlight, 4.5),
  ('selectionForeground/selection', c.selectionForeground, c.selection, 4.5),
  ('focusRing/background', c.focusRing, c.background, 3.0),
];

void main() {
  group('RefractionContrast', () {
    test('ratio spans 1:1 to 21:1 and is symmetric', () {
      expect(
        RefractionContrast.ratio(Colors.black, Colors.white),
        closeTo(21, 0.01),
      );
      expect(
        RefractionContrast.ratio(Colors.white, Colors.black),
        closeTo(21, 0.01),
      );
      expect(
        RefractionContrast.ratio(
          const Color(0xFF777777),
          const Color(0xFF777777),
        ),
        closeTo(1, 0.001),
      );
    });

    test('a translucent foreground is measured as painted', () {
      final half = Colors.black.withValues(alpha: 0.5);
      final painted = Color.alphaBlend(half, Colors.white);
      expect(
        RefractionContrast.ratio(half, Colors.white),
        closeTo(RefractionContrast.ratio(painted, Colors.white), 0.001),
      );
    });

    test('onColor picks dark ink on amber and white ink on navy', () {
      expect(
        RefractionContrast.onColor(const Color(0xFFF59E0B)),
        RefractionContrast.defaultDarkInk,
      );
      expect(
        RefractionContrast.onColor(const Color(0xFF1E3A8A)),
        RefractionContrast.defaultLightInk,
      );
    });

    test('ensure leaves a passing color untouched', () {
      const ink = Color(0xFF111111);
      expect(RefractionContrast.ensure(ink, Colors.white), ink);
    });

    test('ensure darkens on light surfaces and lightens on dark ones', () {
      const amber = Color(0xFFF59E0B);
      final onLight = RefractionContrast.ensure(amber, Colors.white);
      final onDark = RefractionContrast.ensure(
        const Color(0xFF7F1D1D),
        const Color(0xFF09090B),
      );
      expect(RefractionContrast.meets(onLight, Colors.white), isTrue);
      expect(onLight.computeLuminance(), lessThan(amber.computeLuminance()));
      // Hue is preserved so the status still reads as amber.
      expect(
        HSLColor.fromColor(onLight).hue,
        closeTo(HSLColor.fromColor(amber).hue, 1),
      );
      expect(RefractionContrast.meets(onDark, const Color(0xFF09090B)), isTrue);
    });

    test('ensure honours a non-text minimum', () {
      final ring = RefractionContrast.ensure(
        const Color(0xFFD1D1D6),
        Colors.white,
        minRatio: RefractionContrast.aaNonText,
      );
      expect(
        RefractionContrast.ratio(ring, Colors.white),
        greaterThanOrEqualTo(3),
      );
      expect(RefractionContrast.ratio(ring, Colors.white), lessThan(4.5));
    });
  });

  group('accessible roles meet WCAG AA on every curated palette', () {
    for (final entry in RefractionColors.curated.entries) {
      test(entry.key, () {
        for (final (name, fg, bg, min) in _promisedPairs(entry.value)) {
          final ratio = RefractionContrast.ratio(fg, bg);
          expect(
            ratio,
            greaterThanOrEqualTo(min),
            reason: '${entry.key} $name = ${ratio.toStringAsFixed(2)}',
          );
        }
      });
    }
  });

  group('curated palettes: base text pairs meet WCAG AA', () {
    for (final entry in RefractionColors.curated.entries) {
      test(entry.key, () {
        final c = entry.value;
        final pairs = <(String, Color, Color)>[
          ('foreground/background', c.foreground, c.background),
          ('cardForeground/card', c.cardForeground, c.card),
          ('popoverForeground/popover', c.popoverForeground, c.popover),
          ('primaryForeground/primary', c.primaryForeground, c.primary),
          ('secondaryForeground/secondary', c.secondaryForeground, c.secondary),
          (
            'destructiveForeground/destructive',
            c.destructiveForeground,
            c.destructive,
          ),
          ('accentForeground/accent', c.accentForeground, c.accent),
          ('mutedForeground/background', c.mutedForeground, c.background),
          ('mutedForeground/muted', c.mutedForeground, c.muted),
          ('mutedForeground/card', c.mutedForeground, c.card),
          ('positiveForeground/positive', c.positiveForeground, c.positive),
          ('cautionForeground/caution', c.cautionForeground, c.caution),
          ('pendingForeground/pending', c.pendingForeground, c.pending),
        ];
        for (final (name, fg, bg) in pairs) {
          final ratio = RefractionContrast.ratio(fg, bg);
          expect(
            ratio,
            greaterThanOrEqualTo(RefractionContrast.aaText),
            reason: '${entry.key} $name = ${ratio.toStringAsFixed(2)}',
          );
        }
      });
    }
  });

  group('accessible roles — derivation and overrides', () {
    final base = RefractionColors.productivityLight;

    test('soft status fills are tints of the background, not the raw hue', () {
      for (final soft in [
        base.successSoft,
        base.warningSoft,
        base.infoSoft,
        base.destructiveSoft,
      ]) {
        // A tint stays close to the background: a large-text contrast gap
        // would mean it is a fill, not a wash.
        expect(RefractionContrast.ratio(soft, base.background), lessThan(1.5));
      }
    });

    test('surfaces and mention default to existing tokens', () {
      expect(base.surfaceRaised, base.card);
      expect(base.surfaceOverlay, base.popover);
      expect(base.surfaceSunken, base.surfaceSubtle);
      expect(base.mention, base.primarySoft);
    });

    test('scrim is heavier on dark palettes', () {
      expect(
        RefractionColors.minimalDark.scrim.a,
        greaterThan(RefractionColors.minimalLight.scrim.a),
      );
    });

    test('an override wins and survives copyWith of an unrelated token', () {
      const custom = Color(0xFFFFF4D6);
      final palette = base.copyWith(mentionSelf: custom) as RefractionColors;
      expect(palette.mentionSelf, custom);
      final recolored =
          palette.copyWith(primary: const Color(0xFF7C3AED))
              as RefractionColors;
      expect(recolored.mentionSelf, custom);
      // An un-overridden role keeps deriving from the new base token.
      expect(recolored.mention, recolored.primarySoft);
    });

    test('lerp interpolates the resolved roles', () {
      final a = RefractionColors.minimalLight;
      final b = RefractionColors.minimalDark;
      final mid = a.lerp(b, 0.5) as RefractionColors;
      expect(mid.successSoft, Color.lerp(a.successSoft, b.successSoft, 0.5));
      expect(mid.focusRing, Color.lerp(a.focusRing, b.focusRing, 0.5));
    });
  });

  group('RefractionThemeData focus + motion tokens', () {
    test('defaults', () {
      final data = RefractionThemeData.light();
      expect(data.focusRingWidth, 2);
      expect(data.focusRingOffset, 2);
      expect(data.motionFast, const Duration(milliseconds: 120));
      expect(data.motionMedium, const Duration(milliseconds: 200));
      expect(data.motionSlow, const Duration(milliseconds: 300));
    });

    test('copyWith overrides and preserves', () {
      final data = RefractionThemeData.light().copyWith(
        focusRingWidth: 3,
        motionMedium: const Duration(milliseconds: 250),
      );
      expect(data.focusRingWidth, 3);
      expect(data.motionMedium, const Duration(milliseconds: 250));
      final again = data.copyWith(borderRadius: 4);
      expect(again.focusRingWidth, 3);
      expect(again.motionMedium, const Duration(milliseconds: 250));
    });
  });

  group('RefractionMotion', () {
    Future<Duration> resolve(
      WidgetTester tester, {
      required bool reduce,
    }) async {
      late Duration resolved;
      await tester.pumpWidget(
        MediaQuery(
          data: MediaQueryData(disableAnimations: reduce),
          child: Builder(
            builder: (context) {
              resolved = RefractionMotion.duration(
                context,
                const Duration(milliseconds: 200),
              );
              return const SizedBox();
            },
          ),
        ),
      );
      return resolved;
    }

    testWidgets('keeps the duration normally', (tester) async {
      expect(
        await resolve(tester, reduce: false),
        const Duration(milliseconds: 200),
      );
    });

    testWidgets('collapses to zero under reduced motion', (tester) async {
      expect(await resolve(tester, reduce: true), Duration.zero);
    });
  });

  group('RefractionFocusRing', () {
    Widget host({required bool visible}) => RefractionTheme(
      data: RefractionThemeData.light(),
      child: Directionality(
        textDirection: TextDirection.ltr,
        child: Center(
          child: RefractionFocusRing(
            visible: visible,
            borderRadius: BorderRadius.circular(8),
            child: const SizedBox(key: Key('control'), width: 40, height: 20),
          ),
        ),
      ),
    );

    testWidgets('paints only while visible and never changes layout', (
      tester,
    ) async {
      await tester.pumpWidget(host(visible: false));
      final restingSize = tester.getSize(find.byKey(const Key('control')));
      expect(
        find.descendant(
          of: find.byType(RefractionFocusRing),
          matching: find.byType(CustomPaint),
        ),
        findsNothing,
      );

      await tester.pumpWidget(host(visible: true));
      expect(
        find.descendant(
          of: find.byType(RefractionFocusRing),
          matching: find.byType(CustomPaint),
        ),
        findsOneWidget,
      );
      expect(tester.getSize(find.byKey(const Key('control'))), restingSize);
    });
  });
}
