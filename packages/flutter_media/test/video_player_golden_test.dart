import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:golden_toolkit/golden_toolkit.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui_media/refraction_ui_media.dart';
import 'package:video_player/video_player.dart';

import 'golden_test_helper.dart';

/// The default `RefractionVideoPlayer` scenario rendered by the golden below.
///
/// Mirrors the widgetbook use case the core example used to host, inlined here
/// so the media package's golden has no dependency on the core example app.
Widget _defaultVideoPlayer(BuildContext context) {
  return RefractionVideoPlayer(
    controller: VideoPlayerController.networkUrl(
      Uri.parse('https://example.com/video.mp4'),
    ),
    showControls: false,
  );
}

void main() {
  group('RefractionVideoPlayer Golden Tests', () {
    testGoldens('Video Player Use Cases', tags: ['golden'], (tester) async {
      final builder = GoldenBuilder.column()
        ..addScenario(
          'Default',
          Builder(
            builder: (ctx) => ExcludeSemantics(child: _defaultVideoPlayer(ctx)),
          ),
        );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.light(),
          RefractionThemeData.light(),
        ),
        surfaceSize: const Size(600, 800),
      );

      await screenMatchesGolden(
        tester,
        'video_player_use_cases_light',
        autoHeight: false,
        customPump: (tester) async {
          await tester.pump(const Duration(milliseconds: 500));
        },
      );

      await tester.pumpWidgetBuilder(
        builder.build(),
        wrapper: (child) => buildThemedChild(
          child,
          ThemeData.dark(),
          RefractionThemeData.dark(),
        ),
        surfaceSize: const Size(600, 800),
      );

      await screenMatchesGolden(
        tester,
        'video_player_use_cases_dark',
        autoHeight: false,
        customPump: (tester) async {
          await tester.pump(const Duration(milliseconds: 500));
        },
      );
    });
  });
}
