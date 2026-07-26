import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

void main() {
  group('RefractionColors status tokens', () {
    test('every curated palette exposes the shared status hues', () {
      // Components historically hardcoded these hues regardless of palette;
      // the tokens keep that behavior so re-theming a palette never shifts
      // status colors under an existing app.
      const expectedSuccess = Color(0xFF22C55E);
      const expectedWarning = Color(0xFFF59E0B);
      const expectedInfo = Color(0xFF2196F3);

      final palettes = <RefractionColors>[
        RefractionColors.minimalLight,
        RefractionColors.minimalDark,
        RefractionColors.fintechLight,
        RefractionColors.fintechDark,
        RefractionColors.wellnessLight,
        RefractionColors.wellnessDark,
        RefractionColors.creativeLight,
        RefractionColors.creativeDark,
        RefractionColors.productivityLight,
        RefractionColors.productivityDark,
        RefractionColors.refractionLight,
        RefractionColors.refractionDark,
        RefractionColors.luxeLight,
        RefractionColors.luxeDark,
        RefractionColors.warmLight,
        RefractionColors.warmDark,
        RefractionColors.signalLight,
        RefractionColors.signalDark,
        RefractionColors.pulseLight,
        RefractionColors.pulseDark,
        RefractionColors.monoLight,
        RefractionColors.monoDark,
      ];

      for (final palette in palettes) {
        expect(palette.success, expectedSuccess);
        expect(palette.warning, expectedWarning);
        expect(palette.info, expectedInfo);
      }
    });

    test('copyWith overrides a status token and keeps the rest', () {
      const override = Color(0xFF123456);
      final palette =
          RefractionColors.minimalLight.copyWith(success: override)
              as RefractionColors;

      expect(palette.success, override);
      expect(palette.warning, RefractionColors.minimalLight.warning);
      expect(palette.info, RefractionColors.minimalLight.info);
      expect(palette.primary, RefractionColors.minimalLight.primary);
    });

    test('lerp interpolates status tokens between palettes', () {
      final other = RefractionColors.minimalLight.copyWith(
        success: const Color(0xFF000000),
      );
      final halfway =
          RefractionColors.minimalLight.lerp(other, 0.5) as RefractionColors;

      expect(
        halfway.success,
        Color.lerp(
          RefractionColors.minimalLight.success,
          const Color(0xFF000000),
          0.5,
        ),
      );
      // Untouched tokens land on the shared value.
      expect(halfway.warning, RefractionColors.minimalLight.warning);
    });
  });
}
