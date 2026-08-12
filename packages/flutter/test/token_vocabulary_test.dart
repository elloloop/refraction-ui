import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

/// A palette that sets only the original base tokens, used to prove the
/// extended roles derive sensible defaults with no explicit values supplied.
final RefractionColors _bare = RefractionColors.productivityLight;

void main() {
  group('RefractionColors extended roles — derived defaults', () {
    test('brand depth derives darker hover/active steps from primary', () {
      // A bare palette exposes hover/active without supplying them; each step
      // is progressively darker than the brand primary.
      expect(
        _bare.primaryHover.computeLuminance(),
        lessThan(_bare.primary.computeLuminance()),
      );
      expect(
        _bare.primaryActive.computeLuminance(),
        lessThan(_bare.primaryHover.computeLuminance()),
      );
    });

    test('soft brand fill blends primary ~12% over background', () {
      expect(
        _bare.primarySoft,
        Color.lerp(_bare.background, _bare.primary, 0.12),
      );
      expect(_bare.primarySoftForeground, _bare.primary);
    });

    test('primaryGradient defaults to a flat [primary, primary]', () {
      expect(_bare.primaryGradient, <Color>[_bare.primary, _bare.primary]);
    });

    test('tertiary falls back to the secondary hue and its soft tint', () {
      expect(_bare.tertiary, _bare.secondary);
      expect(_bare.tertiaryForeground, _bare.secondaryForeground);
      expect(
        _bare.tertiarySoft,
        Color.lerp(_bare.background, _bare.secondary, 0.12),
      );
      expect(_bare.tertiarySoftForeground, _bare.secondary);
    });

    test('ink/surface roles fall back to muted tokens', () {
      expect(_bare.placeholder, _bare.mutedForeground);
      expect(_bare.surfaceSubtle, _bare.muted);
    });

    test('borderSubtle is the border pulled halfway to the background', () {
      expect(
        _bare.borderSubtle,
        Color.lerp(_bare.border, _bare.background, 0.5),
      );
    });

    test('status roles derive from success/warning with white foregrounds', () {
      const white = Color(0xFFFFFFFF);
      expect(_bare.positive, _bare.success);
      expect(_bare.positiveForeground, white);
      expect(_bare.caution, _bare.warning);
      expect(_bare.cautionForeground, white);
      expect(_bare.done, _bare.success);
      expect(_bare.pending, _bare.warning);
      expect(_bare.pendingForeground, white);
    });

    test('neutral role derives a hue-independent gray', () {
      expect(_bare.neutral, _bare.mutedForeground);
      expect(_bare.neutralForeground, _bare.foreground);
    });

    test('chart ramp seeds five distinct categorical colors from primary', () {
      expect(_bare.chart1, _bare.primary);
      final ramp = <Color>[
        _bare.chart1,
        _bare.chart2,
        _bare.chart3,
        _bare.chart4,
        _bare.chart5,
      ];
      expect(ramp.toSet().length, 5, reason: 'all five chart colors differ');
    });
  });

  group('RefractionColors extended roles — overrides', () {
    test('constructor override wins over the derived default', () {
      const override = Color(0xFF010203);
      final palette = RefractionColors.productivityLight.copyWith(
        primaryHover: override,
      );
      expect((palette as RefractionColors).primaryHover, override);
      // Untouched roles keep deriving.
      expect(palette.primaryActive, isNot(override));
    });

    test('copyWith without an argument keeps a role deriving', () {
      final copy =
          RefractionColors.productivityLight.copyWith() as RefractionColors;
      // Still derives from primary rather than being frozen to a value.
      expect(copy.primaryHover, _bare.primaryHover);
    });

    test('changing primary re-derives an unset hover step', () {
      const newPrimary = Color(0xFF884400);
      final palette =
          RefractionColors.productivityLight.copyWith(primary: newPrimary)
              as RefractionColors;
      expect(
        palette.primaryHover.computeLuminance(),
        lessThan(newPrimary.computeLuminance()),
      );
    });
  });

  group('RefractionColors extended roles — lerp', () {
    test('interpolates a derived role between two palettes', () {
      final a = RefractionColors.productivityLight;
      final b = RefractionColors.productivityDark;
      final mid = a.lerp(b, 0.5) as RefractionColors;
      expect(mid.primaryHover, Color.lerp(a.primaryHover, b.primaryHover, 0.5));
      expect(mid.tertiarySoft, Color.lerp(a.tertiarySoft, b.tertiarySoft, 0.5));
    });

    test('interpolates an explicitly overridden role', () {
      const override = Color(0xFF00FF00);
      final a = RefractionColors.productivityLight;
      final b = a.copyWith(pending: override) as RefractionColors;
      final mid = a.lerp(b, 0.5) as RefractionColors;
      expect(mid.pending, Color.lerp(a.pending, override, 0.5));
    });

    test('gradient stops lerp pairwise when lengths match', () {
      final a = RefractionColors.productivityLight.copyWith(
        primaryGradient: const [Color(0xFF000000), Color(0xFF000000)],
      );
      final b = RefractionColors.productivityLight.copyWith(
        primaryGradient: const [Color(0xFFFFFFFF), Color(0xFFFFFFFF)],
      );
      final mid = a.lerp(b, 0.5) as RefractionColors;
      expect(mid.primaryGradient.length, 2);
      expect(
        mid.primaryGradient.first,
        Color.lerp(const Color(0xFF000000), const Color(0xFFFFFFFF), 0.5),
      );
    });
  });

  group('RefractionThemeData scale tokens', () {
    test('radius scale derives from the base borderRadius', () {
      final theme = RefractionThemeData(
        colors: RefractionColors.light,
        borderRadius: 6,
      );
      expect(theme.radiusSm, 6);
      expect(theme.radiusMd, 6);
      expect(theme.radiusLg, 6);
      expect(theme.radiusPill, 999);
      expect(theme.radiusSheet, 6 * 3.5);
    });

    test('spacing and control-height scales expose sensible defaults', () {
      final theme = RefractionThemeData(colors: RefractionColors.light);
      expect(
        [
          theme.spacingXs,
          theme.spacingSm,
          theme.spacingMd,
          theme.spacingLg,
          theme.spacingXl,
          theme.gutter,
        ],
        [4, 8, 12, 16, 24, 16],
      );
      expect(theme.controlHeightSm, 32);
      expect(theme.controlHeightMd, 36);
      expect(theme.controlHeightLg, 44);
    });

    test('shadowTint defaults to the foreground color', () {
      final theme = RefractionThemeData(colors: RefractionColors.light);
      expect(theme.shadowTint, RefractionColors.light.foreground);
    });

    test('elevation aliases resolve both directions for back-compat', () {
      const soft = [BoxShadow(blurRadius: 1)];
      const heavy = [BoxShadow(blurRadius: 9)];

      final fromLegacy = RefractionThemeData(
        colors: RefractionColors.light,
        softShadow: soft,
        heavyShadow: heavy,
      );
      expect(fromLegacy.elevationSm, soft);
      expect(fromLegacy.elevationLg, heavy);
      expect(fromLegacy.elevationMd, heavy);

      final fromScale = RefractionThemeData(
        colors: RefractionColors.light,
        elevationSm: soft,
        elevationLg: heavy,
      );
      expect(fromScale.softShadow, soft);
      expect(fromScale.heavyShadow, heavy);
    });

    test('copyWith overrides a tier and leaves the rest deriving', () {
      final base = RefractionThemeData(
        colors: RefractionColors.light,
        borderRadius: 8,
      );
      final tweaked = base.copyWith(radiusLg: 20, spacingXl: 40);
      expect(tweaked.radiusLg, 20);
      expect(tweaked.spacingXl, 40);
      // Untouched tiers still derive from the base.
      expect(tweaked.radiusMd, 8);
      expect(tweaked.spacingSm, 8);
    });
  });

  group('RefractionTypography', () {
    test('default instance exposes a complete role scale', () {
      const typography = RefractionTypography();
      expect(typography.textScale, 1.0);
      expect(typography.display.fontSize, 32);
      expect(typography.title.fontSize, 20);
      expect(typography.body.fontSize, 14);
      expect(typography.caption.fontSize, 12);
    });

    test('textScale multiplies every role size', () {
      const typography = RefractionTypography(textScale: 2);
      expect(typography.title.fontSize, 40);
      expect(typography.body.fontSize, 28);
    });

    test('variableWeight drives the wght axis on every role', () {
      const typography = RefractionTypography(variableWeight: 650);
      expect(typography.body.fontVariations!.single.value, 650);
    });

    test('resolveFontFamily folds a base family into every role', () {
      final theme = RefractionThemeData(
        colors: RefractionColors.light,
        fontFamily: 'Inter',
      );
      expect(theme.resolvedTypography.body.fontFamily, 'Inter');
      expect(theme.resolvedTypography.display.fontFamily, 'Inter');
    });
  });
}
