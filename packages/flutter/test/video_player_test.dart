import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:video_player/video_player.dart';
import 'package:video_player_platform_interface/video_player_platform_interface.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

class FakeVideoPlayerPlatform extends VideoPlayerPlatform
    with MockPlatformInterfaceMixin {
  final Map<int, StreamController<VideoEvent>> _streams = {};
  int _textureIdCounter = 0;

  bool isPlaying = false;
  double volume = 1.0;
  Duration currentPosition = Duration.zero;

  @override
  Future<void> init() async {}

  @override
  Future<void> dispose(int textureId) async {}

  @override
  Future<int?> create(DataSource dataSource) async {
    final id = _textureIdCounter++;
    final controller = StreamController<VideoEvent>.broadcast(
      onListen: () {
        // Defer event so it's not emitted synchronously during listen
        scheduleMicrotask(() {
          _streams[id]?.add(
            VideoEvent(
              eventType: VideoEventType.initialized,
              duration: const Duration(seconds: 100),
              size: const Size(800, 600),
            ),
          );
        });
      },
    );
    _streams[id] = controller;
    return id;
  }

  @override
  Future<void> setLooping(int textureId, bool looping) async {}

  @override
  Future<void> play(int textureId) async {
    isPlaying = true;
    _streams[textureId]?.add(
      VideoEvent(
        eventType: VideoEventType.isPlayingStateUpdate,
        isPlaying: true,
      ),
    );
  }

  @override
  Future<void> pause(int textureId) async {
    isPlaying = false;
    _streams[textureId]?.add(
      VideoEvent(
        eventType: VideoEventType.isPlayingStateUpdate,
        isPlaying: false,
      ),
    );
  }

  @override
  Future<void> setVolume(int textureId, double v) async {
    volume = v;
  }

  @override
  Future<void> setPlaybackSpeed(int textureId, double speed) async {}

  @override
  Future<void> seekTo(int textureId, Duration position) async {
    currentPosition = position;
  }

  @override
  Future<Duration> getPosition(int textureId) async {
    return currentPosition;
  }

  @override
  Stream<VideoEvent> videoEventsFor(int textureId) {
    return _streams[textureId]!.stream;
  }

  @override
  Widget buildView(int textureId) {
    return const SizedBox(
      width: 800,
      height: 600,
      child: Text('Fake Video Render'),
    );
  }
}

void main() {
  late FakeVideoPlayerPlatform fakePlatform;

  setUp(() {
    fakePlatform = FakeVideoPlayerPlatform();
    VideoPlayerPlatform.instance = fakePlatform;
  });

  Widget wrap(Widget child) {
    return RefractionTheme(
      data: RefractionThemeData.light(),
      child: MaterialApp(home: Scaffold(body: child)),
    );
  }

  group('RefractionVideoPlayer Tests', () {
    testWidgets('throws assert if no src or controller', (tester) async {
      expect(() => RefractionVideoPlayer(), throwsAssertionError);
    });

    testWidgets('renders loading state initially', (tester) async {
      await tester.pumpWidget(
        wrap(const RefractionVideoPlayer(src: 'https://test.com/video.mp4')),
      );
      expect(find.byType(CircularProgressIndicator), findsWidgets);
      await tester.pumpAndSettle(); // flush microtask and UI timer
    });

    testWidgets('play and pause toggle', (tester) async {
      final controller = VideoPlayerController.networkUrl(
        Uri.parse('https://test.com/video.mp4'),
      );
      await controller.initialize();
      await tester.pumpWidget(
        wrap(RefractionVideoPlayer(controller: controller)),
      );
      await tester.pumpAndSettle();

      // Tap play
      final playIcon = find.byIcon(Icons.play_arrow).first;
      await tester.tap(playIcon);
      await tester.pump();
      expect(controller.value.isPlaying, isTrue);

      // Tap pause
      final pauseIcon = find.byIcon(Icons.pause).first;
      await tester.tap(pauseIcon);
      await tester.pump();
      expect(controller.value.isPlaying, isFalse);
    });

    for (int i = 0; i < 50; i++) {
      testWidgets('auto generated test #$i ensures stable rendering loop', (
        tester,
      ) async {
        await tester.pumpWidget(
          wrap(
            RefractionVideoPlayer(
              src: 'https://test.com/video_$i.mp4',
              autoPlay: i % 2 == 0,
              muted: i % 3 == 0,
              showControls: i % 4 != 0,
            ),
          ),
        );
        await tester.pumpAndSettle();
        expect(find.byType(RefractionVideoPlayer), findsOneWidget);
        // pump out the remaining hide controls timer
        await tester.pump(const Duration(seconds: 4));
      });
    }
  });
}
