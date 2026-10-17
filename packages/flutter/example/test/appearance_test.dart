import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';

import 'package:example/main.dart';

void main() {
  test(
    'preview appearance and existing palettes accept only supported values',
    () {
      for (final mode in ThemeMode.values) {
        expect(
          previewAppearance(Uri(queryParameters: {'appearance': mode.name})),
          mode,
        );
      }
      expect(previewAppearance(Uri()), ThemeMode.system);
      expect(
        previewAppearance(Uri(queryParameters: {'appearance': 'invented'})),
        ThemeMode.system,
      );
      expect(
        previewPalette(Uri(queryParameters: {'theme': 'Wellness Dark'})),
        'Wellness',
      );
      expect(
        previewPalette(Uri(queryParameters: {'theme': 'unrecognized'})),
        'Minimal',
      );
    },
  );

  testWidgets(
    'System follows OS, manual override holds, System remains available',
    (tester) async {
      tester.view.physicalSize = const Size(1440, 960);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.light;
      addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);
      final container = ProviderContainer();
      addTearDown(container.dispose);
      // The actual shared host is under test; avoid unrelated gallery content.
      container.read(appRouteProvider.notifier).update('/appearance-test');
      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: container,
          child: const RefractionDemoApp(),
        ),
      );
      Color background() => tester
          .widget<RefractionTheme>(find.byType(RefractionTheme).first)
          .data
          .colors
          .background;
      expect(
        background(),
        RefractionThemeData.minimalLight().colors.background,
      );
      expect(
        tester.getRect(find.byKey(const ValueKey('gallery-appearance'))).bottom,
        lessThanOrEqualTo(64),
      );
      expect(tester.getRect(find.text('GitHub')).bottom, lessThanOrEqualTo(64));
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.dark;
      await tester.pump();
      expect(background(), RefractionThemeData.minimalDark().colors.background);
      await tester.tap(find.byKey(const ValueKey('gallery-appearance')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Light').last);
      await tester.pumpAndSettle();
      expect(
        background(),
        RefractionThemeData.minimalLight().colors.background,
      );
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.light;
      await tester.pump();
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.dark;
      await tester.pump();
      expect(
        background(),
        RefractionThemeData.minimalLight().colors.background,
      );
      await tester.tap(find.byKey(const ValueKey('gallery-appearance')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('System').last);
      await tester.pumpAndSettle();
      expect(background(), RefractionThemeData.minimalDark().colors.background);
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.light;
      await tester.pump();
      expect(
        background(),
        RefractionThemeData.minimalLight().colors.background,
      );
      expect(tester.takeException(), isNull);
      await tester.pumpWidget(const SizedBox.shrink());
      // Removing the actual observer must leave no stale setState recipient.
      tester.platformDispatcher.platformBrightnessTestValue = Brightness.dark;
      await tester.pump();
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets('appearance selector does not overflow the actual phone header', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    final container = ProviderContainer();
    addTearDown(container.dispose);
    container.read(appRouteProvider.notifier).update('/appearance-test');
    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: const RefractionDemoApp(),
      ),
    );
    final selector = find.byKey(const ValueKey('gallery-appearance'));
    final bounds = tester.getRect(selector);
    expect(bounds.left, greaterThanOrEqualTo(0));
    expect(bounds.right, lessThanOrEqualTo(390));
    expect(bounds.bottom, lessThanOrEqualTo(168));
    expect(tester.getRect(find.text('GitHub')).bottom, lessThanOrEqualTo(168));
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox.shrink());
  });
}
