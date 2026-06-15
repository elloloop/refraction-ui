import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/pre_call_lobby.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionPreCallLobby renders camera, mic controls and triggers callbacks', (
    WidgetTester tester,
  ) async {
    bool cameraToggled = false;
    bool micToggled = false;
    bool joinTapped = false;
    RefractionDeviceKind? changedKind;
    String? changedDeviceId;

    await tester.pumpWidget(
      buildTestApp(
        RefractionPreCallLobby(
          cameraOn: true,
          micOn: true,
          micLevel: 0.5,
          cameras: const [
            RefractionMediaDeviceOption(id: 'c1', label: 'FaceTime Cam'),
          ],
          microphones: const [
            RefractionMediaDeviceOption(id: 'm1', label: 'Internal Mic'),
          ],
          selectedCamera: 'c1',
          selectedMicrophone: 'm1',
          onToggleCamera: () {
            cameraToggled = true;
          },
          onToggleMic: () {
            micToggled = true;
          },
          onJoin: () {
            joinTapped = true;
          },
          onDeviceChange: (kind, id) {
            changedKind = kind;
            changedDeviceId = id;
          },
          previewSlot: const Text('Live Camera Preview'),
        ),
      ),
    );

    // Verify camera preview slot renders
    expect(find.text('Live Camera Preview'), findsOneWidget);

    // Verify mic level meter text is present
    expect(find.text('Mic'), findsOneWidget);

    // Verify Dropdowns render FaceTime Cam and Internal Mic
    expect(find.text('FaceTime Cam'), findsOneWidget);
    expect(find.text('Internal Mic'), findsOneWidget);

    // Tap toggle camera button
    final cameraToggleFinder = find.bySemanticsLabel('Camera Toggle');
    expect(cameraToggleFinder, findsOneWidget);
    await tester.ensureVisible(cameraToggleFinder);
    await tester.tap(cameraToggleFinder);
    expect(cameraToggled, isTrue);

    // Tap toggle mic button
    final micToggleFinder = find.bySemanticsLabel('Mic Toggle');
    expect(micToggleFinder, findsOneWidget);
    await tester.ensureVisible(micToggleFinder);
    await tester.tap(micToggleFinder);
    expect(micToggled, isTrue);

    // Tap Join button
    final joinButtonFinder = find.text('Join');
    await tester.ensureVisible(joinButtonFinder);
    await tester.tap(joinButtonFinder);
    expect(joinTapped, isTrue);
  });
}
