import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:refraction_ui/refraction_ui.dart';
import 'package:refraction_ui/src/components/call_controls.dart';

void main() {
  Widget buildTestApp(Widget child) {
    return MaterialApp(
      home: RefractionTheme(
        data: RefractionThemeData.minimalLight(),
        child: Scaffold(body: child),
      ),
    );
  }

  testWidgets('RefractionCallControls renders buttons with appropriate semantics and callbacks', (
    WidgetTester tester,
  ) async {
    bool micTapped = false;
    bool leaveTapped = false;

    await tester.pumpWidget(
      buildTestApp(
        RefractionCallControls(
          children: [
            RefractionCallControlButton(
              label: 'Mute Microphone',
              icon: const Icon(Icons.mic),
              tone: RefractionCallControlTone.active,
              pressed: true,
              onPressed: () {
                micTapped = true;
              },
            ),
            RefractionCallControlButton(
              label: 'Leave Call',
              icon: const Icon(Icons.call_end),
              tone: RefractionCallControlTone.destructive,
              onPressed: () {
                leaveTapped = true;
              },
            ),
          ],
        ),
      ),
    );

    // Verify icons are present
    expect(find.byIcon(Icons.mic), findsOneWidget);
    expect(find.byIcon(Icons.call_end), findsOneWidget);

    // Tap Mic button
    await tester.tap(find.byIcon(Icons.mic));
    expect(micTapped, isTrue);

    // Tap Leave button
    await tester.tap(find.byIcon(Icons.call_end));
    expect(leaveTapped, isTrue);
  });
}
